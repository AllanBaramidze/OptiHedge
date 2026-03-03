"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { X, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import debounce from "lodash.debounce";

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

// --- Helper Functions ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function PortfolioBuilder() {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockSuggestion | null>(null);
  
  const [quantity, setQuantity] = useState<string>("");
  const [avgCost, setAvgCost] = useState<string>("");

  // --- API Search Logic ---
  // Memoize the debounced function so it isn't recreated on every render
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
          if (!apiKey) {
            console.error("Finnhub API key missing from environment variables.");
            return;
          }

          const res = await fetch(
            `https://finnhub.io/api/v1/search?q=${encodeURIComponent(term)}&token=${apiKey}`
          );

          if (!res.ok) throw new Error(`API Error: ${res.status}`);

          const data = await res.json();
          // Filter out results without symbols and limit to top 8
          const validResults = (data.result || [])
            .filter((item: StockSuggestion) => item.symbol && !item.symbol.includes('.'))
            // Filter out duplicates by checking if we've already seen the symbol
            .filter((item: StockSuggestion, index: number, self: StockSuggestion[]) => 
            index === self.findIndex((t) => t.symbol === item.symbol)
          )
          .slice(0, 8);
            
          setSuggestions(validResults);
        } catch (err) {
          console.error("Stock search failed:", err);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 400),
    []
  );

  // Trigger search only if the user is typing and hasn't just selected a stock
  useEffect(() => {
    if (!selectedStock) {
      fetchSuggestions(searchTerm);
    }
    return () => {
      fetchSuggestions.cancel();
    };
  }, [searchTerm, selectedStock, fetchSuggestions]);

  // --- Handlers ---
  const handleSelectStock = (stock: StockSuggestion) => {
    setSelectedStock(stock);
    setSearchTerm(`${stock.symbol} - ${stock.description}`);
    setSuggestions([]); // Close dropdown
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

    // Double-check validation before adding
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

      const data = await res.json();
      console.log("Analysis result:", data);
      alert("Analysis complete! Check console for results.");
      
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to connect to OptiHedge analysis engine. Ensure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Derived State (Validation) ---
  const isAddDisabled =
    !selectedStock ||
    quantity === "" ||
    avgCost === "" ||
    Number(quantity) <= 0 ||
    Number(avgCost) <= 0 ||
    isNaN(Number(quantity)) ||
    isNaN(Number(avgCost));

  const totalPortfolioValue = portfolio.reduce(
    (sum, item) => sum + item.quantity * item.avgCost,
    0
  );

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Search & Entry Form */}
      <Card className="max-w-4xl mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Build Your Portfolio</CardTitle>
          <CardDescription>
            Search for an asset, enter your position details, and add it to your wallet for AI hedging analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* Search Input Area */}
            <div className="md:col-span-5 relative">
              <div className="relative">
                <Input
                  placeholder="Search ticker (e.g. AAPL)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedStock) setSelectedStock(null); // Reset if they start typing again
                  }}
                  className={selectedStock ? "pr-10 border-primary bg-primary/5" : ""}
                />
                
                {/* Visual Feedback for Selection */}
                {selectedStock && (
                  <button 
                    onClick={clearSelection}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Clear selection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                {/* Loading Indicator */}
                {loading && !selectedStock && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((s, index) => (
                    <div
                      key={`${s.symbol}-${index}`}
                      className="px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-0 transition-colors"
                      onClick={() => handleSelectStock(s)}
                    >
                      <div className="font-semibold">{s.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Position Inputs */}
            <Input
              className="md:col-span-2"
              type="number"
              placeholder="Qty"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              disabled={!selectedStock}
            />

            <Input
              className="md:col-span-2"
              type="number"
              placeholder="Avg Cost ($)"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              min="0.01"
              step="0.01"
              disabled={!selectedStock}
            />

            <Button
              className="md:col-span-3 w-full transition-all"
              onClick={handleAddToPortfolio}
              disabled={isAddDisabled}
            >
              {selectedStock ? <CheckCircle2 className="w-4 h-4 mr-2" /> : null}
              Add Position
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet / Portfolio Table */}
      {portfolio.length > 0 ? (
        <Card className="max-w-4xl mx-auto shadow-sm animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle>Your Wallet</CardTitle>
            <CardDescription>
              Current holdings ({portfolio.length} position{portfolio.length !== 1 ? "s" : ""}) ready for analysis.
            </CardDescription>
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
                  {portfolio.map((item) => {
                    const totalValue = item.quantity * item.avgCost;
                    return (
                      <TableRow key={item.symbol}>
                        <TableCell className="font-medium">{item.symbol}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={item.description}>
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.avgCost)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(totalValue)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => handleRemoveItem(item.symbol)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="font-bold text-right">
                      Total Portfolio Value:
                    </TableCell>
                    <TableCell className="font-bold text-right text-primary">
                      {formatCurrency(totalPortfolioValue)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSubmitAnalysis} 
                disabled={isSubmitting}
                size="lg"
                className="w-full md:w-auto shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Risk...
                  </>
                ) : (
                  <>
                    Run OptiHedge Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto text-center border-2 border-dashed rounded-lg p-12 text-muted-foreground bg-muted/10">
          <p>Your wallet is empty.</p>
          <p className="text-sm mt-2">Search and add stocks above to begin constructing your portfolio.</p>
        </div>
      )}
    </main>
  );
}