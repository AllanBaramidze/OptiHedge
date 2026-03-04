"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { X, Loader2, Save, CheckCircle2, ArrowRight } from "lucide-react";
import debounce from "lodash.debounce";
import { savePortfolio, getLatestPortfolio } from "./actions"; 

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

// Interface to fix the "any" lint error in the load callback
interface DBPortfolioItem {
  symbol: string;
  quantity: number;
  avg_cost: number;
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
  const [walletName, setWalletName] = useState("My New Portfolio");
  
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

  // RESTORED: This useEffect was missing in your previous draft, causing "fetchSuggestions" to be unused.
  useEffect(() => {
    if (!selectedStock) {
      fetchSuggestions(searchTerm);
    }
    return () => {
      fetchSuggestions.cancel();
    };
  }, [searchTerm, selectedStock, fetchSuggestions]);

  // LOAD DATA ON MOUNT
  useEffect(() => {
    const loadExistingWallet = async () => {
      const latest = await getLatestPortfolio();
      if (latest && latest.portfolio_items) {
        // FIXED: Using DBPortfolioItem interface to avoid "any" error
        const formattedItems = latest.portfolio_items.map((item: DBPortfolioItem) => ({
          symbol: item.symbol,
          description: "", 
          quantity: item.quantity,
          avgCost: item.avg_cost,
        }));
        
        setPortfolio(formattedItems);
        setWalletName(latest.name);
      }
    };

    loadExistingWallet();
  }, []);

  // --- Handlers ---
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
        alert(`Successfully saved "${walletName}" to your account!`);
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving to database. Are you logged in?");
    } finally {
      setIsSaving(false);
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
      
      // FIXED: Removed "const data =" to satisfy unused variable linting
      await res.json();
      alert("Analysis complete! Check console for results.");
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Logic ---
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
              {/* RESTORED: The logic using "loading" and "suggestions" now functions correctly */}
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Your Wallet</CardTitle>
              <CardDescription>Construct your portfolio before saving.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                className="w-48 h-9" 
                value={walletName} 
                onChange={(e) => setWalletName(e.target.value)} 
                placeholder="Wallet Name"
              />
              <Button variant="outline" size="sm" onClick={handleSaveToDatabase} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Wallet
              </Button>
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
                      {/* FIXED: Changed max-w-[200px] to max-w-50 to satisfy Tailwind linting */}
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