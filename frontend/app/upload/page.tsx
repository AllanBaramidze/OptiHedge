"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";
import debounce from "lodash.debounce";

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

export default function PortfolioBuilder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [avgCost, setAvgCost] = useState<string>("");

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(async (term: string) => {
      if (!term || term.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!apiKey) {
          console.error("Finnhub API key missing — check .env.local");
          setSuggestions([]);
          return;
        }

        const res = await fetch(
          `https://finnhub.io/api/v1/search?q=${encodeURIComponent(term)}&token=${apiKey}`
        );

        if (!res.ok) {
          throw new Error(`Finnhub error: ${res.status} - ${res.statusText}`);
        }

        const data = await res.json();
        // Finnhub response: { count: number, result: [{ symbol, description, type, ... }] }
        setSuggestions((data.result || []).slice(0, 8)); // top 8
      } catch (err) {
        console.error("Search failed:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  const addToPortfolio = () => {
    if (!selectedSymbol || Number(quantity) <= 0 || Number(avgCost) <= 0) return;

    const selected = suggestions.find(s => s.symbol === selectedSymbol);
    if (!selected) return;

    setPortfolio(prev => [
      ...prev,
      {
        symbol: selected.symbol,
        description: selected.description,
        quantity: Number(quantity),
        avgCost: Number(avgCost),
      },
    ]);

    // Reset
    setSelectedSymbol(null);
    setSearchTerm("");
    setQuantity("");
    setAvgCost("");
    setSuggestions([]);
  };

  const removeItem = (symbol: string) => {
    setPortfolio(prev => prev.filter(item => item.symbol !== symbol));
  };

  const handleSubmit = async () => {
    if (portfolio.length === 0) return;

    try {
      const res = await fetch("http://localhost:8000/analyze-portfolio/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: portfolio }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      console.log("Analysis result:", data);
      // TODO: Show result in UI (new state, alert, etc.)
    } catch (err) {
      console.error("Submit failed:", err);
      // TODO: Show user error
    }
  };

  return (
    <main className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Build Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search + Add Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Input
                placeholder="Search stocks (e.g. AAPL, Tesla)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {loading && <div className="absolute right-3 top-3 text-sm text-muted-foreground">Loading...</div>}
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((s) => (
                    <div
                      key={s.symbol}
                      className="px-4 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setSelectedSymbol(s.symbol);
                        setSearchTerm(`${s.symbol} - ${s.description}`);
                        setSuggestions([]);
                      }}
                    >
                      <span className="font-medium">{s.symbol}</span> - {s.description}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
            <Input
              type="number"
              placeholder="Avg Cost ($)"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              min="0"
              step="0.01"
            />
            <Button
              onClick={addToPortfolio}
              disabled={!selectedSymbol || Number(quantity) <= 0 || Number(avgCost) <= 0}
            >
              Add
            </Button>
          </div>

          {/* Portfolio Table */}
          {portfolio.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Holdings</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Avg Cost</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${Number(item.avgCost).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.symbol)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6">
                <Button onClick={handleSubmit} className="w-full md:w-auto">
                  Run Analysis
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}