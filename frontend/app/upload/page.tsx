"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X, Loader2, Save, CheckCircle2, ArrowRight, Trash2 } from "lucide-react";
import debounce from "lodash.debounce";
import { 
  savePortfolio, 
  getLatestPortfolio, 
  getAllWallets, 
  getPortfolioById, 
  deletePortfolio 
} from "./actions"; 

// --- Types & Interfaces ---
interface StockSuggestion {
  symbol: string;
  description: string;
}

interface PortfolioItem {
  symbol: string;
  description: string;
  quantity: number;
  avgCost: number;
}

interface DBPortfolioItem {
  symbol: string;
  quantity: number;
  avg_cost: number;
}

interface Wallet {
  id: string;
  name: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function PortfolioBuilder() {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Wallet Selection State
  const [walletName, setWalletName] = useState("My New Portfolio");
  const [allWallets, setAllWallets] = useState<Wallet[]>([]);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);
  
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockSuggestion | null>(null);
  
  const [quantity, setQuantity] = useState<string>("");
  const [avgCost, setAvgCost] = useState<string>("");

  // --- API Search Logic ---
  const fetchSuggestions = useMemo(
    () =>
      debounce(async (term: string) => {
        if (!term || term.trim().length < 2) {
          setSuggestions([]);
          return;
        }
        setLoading(true);
        try {
          const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
          const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(term)}&token=${apiKey}`);
          const data = await res.json();
          const validResults = (data.result || [])
            .filter((item: StockSuggestion) => item.symbol && !item.symbol.includes('.'))
            .filter((item: StockSuggestion, index: number, self: StockSuggestion[]) => 
              index === self.findIndex((t) => t.symbol === item.symbol)
            ).slice(0, 8);
          setSuggestions(validResults);
        } catch (err) {
          console.error("Stock search failed:", err);
        } finally {
          setLoading(false);
        }
      }, 400),
    []
  );

  useEffect(() => {
    if (!selectedStock) {
      fetchSuggestions(searchTerm);
    }
    return () => {
      fetchSuggestions.cancel();
    };
  }, [searchTerm, selectedStock, fetchSuggestions]);

  // LOAD ALL WALLETS AND LATEST ON MOUNT
  useEffect(() => {
    const init = async () => {
      const wallets = await getAllWallets();
      setAllWallets(wallets);

      const latest = await getLatestPortfolio();
      if (latest && latest.portfolio_items) {
        const formattedItems = latest.portfolio_items.map((item: DBPortfolioItem) => ({
          symbol: item.symbol,
          description: "", 
          quantity: item.quantity,
          avgCost: item.avg_cost,
        }));
        
        setPortfolio(formattedItems);
        setWalletName(latest.name);
        setCurrentWalletId(latest.id);
      }
    };

    init();
  }, []);

  // --- Handlers ---
  const handleSelectWallet = async (id: string) => {
    try {
      const data = await getPortfolioById(id);
      if (data && data.portfolio_items) {
        const formattedItems = data.portfolio_items.map((item: DBPortfolioItem) => ({
          symbol: item.symbol,
          description: "",
          quantity: item.quantity,
          avgCost: item.avg_cost,
        }));
        setPortfolio(formattedItems);
        setWalletName(data.name);
        setCurrentWalletId(data.id);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    }
  };

  const handleSelectStock = (stock: StockSuggestion) => {
    setSelectedStock(stock);
    setSearchTerm(`${stock.symbol} - ${stock.description}`);
    setSuggestions([]);
  };

  const clearSelection = () => {
    setSelectedStock(null);
    setSearchTerm("");
    setQuantity("");
    setAvgCost("");
  };

  const handleAddToPortfolio = () => {
    const qty = Number(quantity);
    const cost = Number(avgCost);
    if (!selectedStock || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) return;

    setPortfolio((prev) => [
      ...prev,
      {
        symbol: selectedStock.symbol,
        description: selectedStock.description,
        quantity: qty,
        avgCost: cost,
      },
    ]);
    clearSelection();
  };

  const handleRemoveItem = (symbol: string) => {
    setPortfolio((prev) => prev.filter((item) => item.symbol !== symbol));
  };

  const handleSaveToDatabase = async () => {
    if (portfolio.length === 0) return;
    setIsSaving(true);
    try {
      const result = await savePortfolio(walletName, portfolio);
      if (result.success) {
        const updatedWallets = await getAllWallets();
        setAllWallets(updatedWallets);
        setCurrentWalletId(result.portfolioId); // Set the new ID
        alert(`Successfully saved "${walletName}"!`);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWallet = async () => {
  if (!currentWalletId || !confirm(`Delete "${walletName}"? This cannot be undone.`)) return;
  
  try {
    await deletePortfolio(currentWalletId);
    
    // 1. Fetch the updated list of wallets first
    const updatedWallets = await getAllWallets();
    setAllWallets(updatedWallets);

    if (updatedWallets.length > 0) {
      // 2. If there are wallets left, pick the first one and load it
      const nextWallet = updatedWallets[0];
      handleSelectWallet(nextWallet.id);
    } else {
      // 3. Only if everything is gone, reset to the empty state
      setPortfolio([]);
      setWalletName("My New Portfolio");
      setCurrentWalletId(null);
    }
    
    alert("Wallet deleted successfully.");
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Could not delete the wallet. Please try again.");
  }
};

  const handleSubmitAnalysis = async () => {
    if (portfolio.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/analyze-portfolio/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: portfolio }),
      });
      if (!res.ok) throw new Error("Backend analysis failed");
      await res.json();
      alert("Analysis complete! Check console for results.");
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAddDisabled = !selectedStock || !quantity || !avgCost || Number(quantity) <= 0 || Number(avgCost) <= 0;
  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + item.quantity * item.avgCost, 0);

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <Card className="max-w-4xl mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Build Your Portfolio</CardTitle>
          <CardDescription>Search for an asset and add it to your modular wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-5 relative">
              <Input
                placeholder="Search ticker (e.g. AAPL)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedStock) setSelectedStock(null);
                }}
                className={selectedStock ? "pr-10 border-primary bg-primary/5" : ""}
              />
              {selectedStock && (
                <button onClick={clearSelection} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              {loading && !selectedStock && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                  {suggestions.map((s, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-accent cursor-pointer border-b" onClick={() => handleSelectStock(s)}>
                      <div className="font-semibold">{s.symbol}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Input className="md:col-span-2" type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={!selectedStock} />
            <Input className="md:col-span-2" type="number" placeholder="Avg Cost" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} disabled={!selectedStock} />
            <Button className="md:col-span-3 w-full" onClick={handleAddToPortfolio} disabled={isAddDisabled}>
              {selectedStock ? <CheckCircle2 className="w-4 h-4 mr-2" /> : null}
              Add Position
            </Button>
          </div>
        </CardContent>
      </Card>

      {portfolio.length > 0 ? (
        <Card className="max-w-4xl mx-auto shadow-sm">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-6">
            <div>
              <CardTitle>Your Wallet</CardTitle>
              <CardDescription>Construct and manage your modular portfolios.</CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select onValueChange={handleSelectWallet} value={currentWalletId || undefined}>
                <SelectTrigger className="w-[180px] h-9 bg-background">
                  <SelectValue placeholder="Switch Wallet" />
                </SelectTrigger>
                <SelectContent>
                  {allWallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input 
                className="w-48 h-9" 
                value={walletName} 
                onChange={(e) => setWalletName(e.target.value)} 
                placeholder="Wallet Name"
              />
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveToDatabase} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>

                {currentWalletId && (
                  <Button variant="destructive" size="icon" className="h-9 w-9" onClick={handleDeleteWallet}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Avg Cost</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell className="max-w-50 truncate">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.avgCost)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.avgCost)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.symbol)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4} className="text-right">Total:</TableCell>
                    <TableCell className="text-right text-primary">{formatCurrency(totalPortfolioValue)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="mt-6">
              <Button onClick={handleSubmitAnalysis} disabled={isSubmitting} size="lg" className="w-full">
                {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                ) : (
                    <>Run OptiHedge Analysis <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto text-center border-2 border-dashed rounded-lg p-12 text-muted-foreground bg-muted/10">
          <p>Your wallet is empty. Search and add stocks to begin.</p>
        </div>
      )}
    </main>
  );
}