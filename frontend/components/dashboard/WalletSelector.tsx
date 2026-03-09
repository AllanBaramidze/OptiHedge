"use client";

import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { getAllWallets } from "@/app/upload/actions"; 

interface Wallet {
  id: string;
  name: string;
}

interface WalletSelectorProps {
  onWalletChange?: (walletId: string) => void;
}

export function WalletSelector({ onWalletChange }: WalletSelectorProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWalletId, setCurrentWalletId] = useState<string>("");

  useEffect(() => {
    async function loadWallets() {
      try {
        const data = await getAllWallets();
        setWallets(data);
        
        // Only trigger the initial change if we haven't set a wallet yet
        if (data.length > 0 && !currentWalletId) {
          const firstId = data[0].id;
          setCurrentWalletId(firstId);
          onWalletChange?.(firstId);
        }
      } catch (error) {
        console.error("Failed to load wallets:", error);
      } finally {
        setLoading(false);
      }
    }
    loadWallets();
    // Now that onWalletChange is memoized, this won't loop
  }, [onWalletChange, currentWalletId]);

  const handleValueChange = (value: string) => {
    setCurrentWalletId(value);
    onWalletChange?.(value);
  };

  if (loading) {
    return (
      <div className="h-10 w-48 flex items-center justify-center bg-[#121214] border border-zinc-800 rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <Select value={currentWalletId} onValueChange={handleValueChange}>
      <SelectTrigger className="w-48 bg-[#121214] border-zinc-800 text-zinc-300 hover:text-white transition-colors">
        <div className="flex items-center gap-2 truncate">
          <WalletIcon className="h-4 w-4 text-zinc-500" />
          <SelectValue placeholder="Select Wallet" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
        {wallets.length === 0 ? (
          <div className="p-2 text-xs text-zinc-500 text-center italic">No wallets found</div>
        ) : (
          wallets.map((wallet) => (
            <SelectItem 
              key={wallet.id} 
              value={wallet.id}
              className="focus:bg-zinc-800 focus:text-white"
            >
              {wallet.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}