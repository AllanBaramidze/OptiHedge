"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Save, ArrowRight, Trash2, LayoutDashboard } from "lucide-react";
import debounce from "lodash.debounce";
import { savePortfolio, getLatestPortfolio, getAllWallets, getPortfolioById, deletePortfolio } from "./actions"; 

// --- Types & Interfaces ---
interface StockSuggestion {
  symbol: string;
  description: string;
}

interface DbPortfolioItem {
  symbol: string;
  description?: string;
  quantity: number;
  avg_cost: number; // Matches Supabase snake_case
  asset_type?: 'STOCK' | 'OPTION';
  option_type?: 'CALL' | 'PUT';
  strike?: number;
  expiry?: string;
}

interface PortfolioItem {
  symbol: string;
  description: string;
  quantity: number;
  avgCost: number;
  asset_type: 'STOCK' | 'OPTION';
  option_type?: 'CALL' | 'PUT';
  strike?: number;
  expiry?: string;
}

interface Wallet {
  id: string;
  name: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function PortfolioBuilder() {
  const router = useRouter();
  
  // Search & Basic State
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Wallet Selection
  const [walletName, setWalletName] = useState("My New Portfolio");
  const [allWallets, setAllWallets] = useState<Wallet[]>([]);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  // Form State
  const [selectedStock, setSelectedStock] = useState<StockSuggestion | null>(null);
  const [assetType, setAssetType] = useState<'STOCK' | 'OPTION'>('STOCK');
  const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('CALL');
  const [quantity, setQuantity] = useState<string>("");
  const [avgCost, setAvgCost] = useState<string>("");
  const [strike, setStrike] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");

  // --- API Search Logic ---
  const fetchSuggestions = useMemo(
    () =>
      debounce(async (term: string) => {
        if (!term || term.trim().length < 2) {
          setSuggestions([]);
          return;
        }
        setIsSearching(true);
        try {
          const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
          const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(term)}&token=${apiKey}`);
          const data = await res.json();
          const validResults = (data.result || [])
            .filter((item: StockSuggestion) => item.symbol && !item.symbol.includes('.'))
            .slice(0, 8);
          setSuggestions(validResults);
        } catch (err) { console.error(err); } finally { setIsSearching(false); }
      }, 400),
    []
  );

  useEffect(() => {
    if (!selectedStock) fetchSuggestions(searchTerm);
    return () => fetchSuggestions.cancel();
  }, [searchTerm, selectedStock, fetchSuggestions]);

  // Unified data mapper for DB -> State
  const mapDbToState = (items: DbPortfolioItem[]): PortfolioItem[] => {
    return items.map((item) => ({
      symbol: item.symbol,
      description: item.description || "",
      quantity: item.quantity,
      avgCost: item.avg_cost, // Map snake_case to camelCase
      asset_type: item.asset_type || 'STOCK',
      option_type: item.option_type,
      strike: item.strike,
      expiry: item.expiry,
    }));
  };

  useEffect(() => {
    const init = async () => {
      const wallets = await getAllWallets();
      setAllWallets(wallets);
      const latest = await getLatestPortfolio();
      if (latest) {
        setPortfolio(mapDbToState(latest.portfolio_items));
        setWalletName(latest.name);
        setCurrentWalletId(latest.id);
      }
    };
    init();
  }, []);

  // --- Handlers ---
  const handleAddToPortfolio = () => {
    const qty = Number(quantity);
    const cost = Number(avgCost);
    if (!selectedStock || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) return;

    const newItem: PortfolioItem = {
      symbol: selectedStock.symbol,
      description: selectedStock.description,
      quantity: qty,
      avgCost: cost,
      asset_type: assetType,
      ...(assetType === 'OPTION' && { 
        option_type: optionType, 
        strike: Number(strike), 
        expiry 
      })
    };

    setPortfolio((prev) => [...prev, newItem]);
    clearSelection();
  };

  const clearSelection = () => {
    setSelectedStock(null);
    setSearchTerm("");
    setQuantity("");
    setAvgCost("");
    setStrike("");
    setExpiry("");
    setAssetType('STOCK');
  };

  const handleSaveToDatabase = async () => {
    if (portfolio.length === 0) return;
    setIsSaving(true);
    try {
      const result = await savePortfolio(walletName, portfolio);
      if (result.success) {
        setAllWallets(await getAllWallets());
        setCurrentWalletId(result.portfolioId);
        alert(`Saved "${walletName}"`);
      }
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleSelectWallet = async (id: string) => {
    const data = await getPortfolioById(id);
    if (data) {
      setPortfolio(mapDbToState(data.portfolio_items));
      setWalletName(data.name);
      setCurrentWalletId(data.id);
    }
  };

  const handleDeleteWallet = async () => {
    if (!currentWalletId || !confirm(`Delete "${walletName}"?`)) return;
    await deletePortfolio(currentWalletId);
    const updated = await getAllWallets();
    setAllWallets(updated);
    if (updated.length > 0) handleSelectWallet(updated[0].id);
    else { setPortfolio([]); setWalletName("My New Portfolio"); setCurrentWalletId(null); }
  };

  const handleSubmitAnalysis = () => {
    if (portfolio.length === 0) return;
    setIsSubmitting(true);
    router.push(`/hedge?id=${currentWalletId}`);
  };

  const totalPortfolioValue = portfolio.reduce((sum, item) => {
      const multiplier = item.asset_type === 'OPTION' ? 100 : 1;
      return sum + (item.quantity * item.avgCost * multiplier);
  }, 0);

  return (
    <main className="pt-24 px-6 md:px-10 space-y-8 pb-20 max-w-6xl mx-auto">
      <Card className="shadow-sm border-white/5 bg-zinc-900/10">
        <CardHeader>
          <CardTitle>Asset Configurator</CardTitle>
          <CardDescription>Add stocks or options to your hedge strategy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 relative">
              <Input
                placeholder="Search Ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={selectedStock ? "border-emerald-500/50 bg-emerald-500/5" : ""}
              />
              {isSearching && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-zinc-500" />}
              {suggestions.length > 0 && !selectedStock && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-white/10 rounded-md shadow-xl overflow-hidden">
                  {suggestions.map((s, i) => (
                    <div key={i} className="px-4 py-2 hover:bg-white/5 cursor-pointer border-b border-white/5" onClick={() => {setSelectedStock(s); setSearchTerm(s.symbol)}}>
                      <div className="font-bold text-sm text-white">{s.symbol}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{s.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Select value={assetType} onValueChange={(v: 'STOCK' | 'OPTION') => setAssetType(v)}>
              <SelectTrigger className="md:col-span-2">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK">Equity</SelectItem>
                <SelectItem value="OPTION">Option</SelectItem>
              </SelectContent>
            </Select>

            <Input className="md:col-span-2" type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Input className="md:col-span-2" type="number" placeholder="Avg Cost" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} />

            <Button className="md:col-span-2" onClick={handleAddToPortfolio} disabled={!selectedStock || !quantity}>
              Add Position
            </Button>
          </div>

          {assetType === 'OPTION' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 animate-in fade-in slide-in-from-top-2">
               <Select value={optionType} onValueChange={(v: 'CALL' | 'PUT') => setOptionType(v)}>
                <SelectTrigger><SelectValue placeholder="Side" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CALL">Call Contract</SelectItem>
                  <SelectItem value="PUT">Put Contract</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Strike Price" value={strike} onChange={e => setStrike(e.target.value)} />
              <Input type="date" placeholder="Expiry" value={expiry} onChange={e => setExpiry(e.target.value)} />
              <div className="flex items-center text-[10px] text-blue-400 font-mono uppercase tracking-tighter">
                * 100 Share Multiplier Applied
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {portfolio.length > 0 && (
        <Card className="shadow-lg border-white/5 bg-zinc-900/5">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
               <Input className="w-64 h-9 font-bold bg-transparent border-none px-2 focus-visible:ring-0 text-xl leading-9 tracking-tighter" value={walletName} onChange={(e) => setWalletName(e.target.value)} />
               <Select onValueChange={handleSelectWallet} value={currentWalletId || undefined}>
                  <SelectTrigger className="w-auto h-9 min-w-10 max-w-45 px-3  gap-2 items-center transition-all border-none bg-zinc-800"><SelectValue /></SelectTrigger>
                  <SelectContent>{allWallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
               </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveToDatabase} disabled={isSaving} className="border-white/10">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
              </Button>
              {currentWalletId && <Button variant="destructive" size="icon" className="h-9 w-9" onClick={handleDeleteWallet}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((item, idx) => (
                  <TableRow key={idx} className="border-white/5">
                    <TableCell>
                      <div className="font-bold">{item.symbol}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">{item.description}</div>
                    </TableCell>
                    <TableCell>
                      {item.asset_type === 'STOCK' ? (
                        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">EQUITY</span>
                      ) : (
                        <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded text-blue-400 font-bold">
                          {item.expiry} {item.strike} {item.option_type}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.avgCost)}</TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {formatCurrency(item.quantity * item.avgCost * (item.asset_type === 'OPTION' ? 100 : 1))}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setPortfolio(p => p.filter((_, i) => i !== idx))}><X className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-transparent border-t-2 border-white/5">
                <TableRow>
                  <TableCell colSpan={4} className="text-right text-zinc-500 uppercase text-[10px] font-bold">Total Portfolio Value</TableCell>
                  <TableCell className="text-right text-xl font-bold text-emerald-500 tracking-tighter">{formatCurrency(totalPortfolioValue)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>

            <div className="mt-8 flex gap-4">
               <Link href="/dashboard" className="flex-1">
                 <Button variant="secondary" className="w-full bg-zinc-800 text-white border-white/5"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Button>
               </Link>
               <Button onClick={handleSubmitAnalysis} disabled={isSubmitting || portfolio.length === 0} className="flex-2 bg-white text-black hover:bg-zinc-200">
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Run OptiHedge Analysis"} <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}