"use client";

import React, { useSyncExternalStore } from 'react';
import Image from "next/image";
// Removed 'Link' import to resolve @typescript-eslint/no-unused-vars
import { User as UserIcon, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the User interface to resolve @typescript-eslint/no-explicit-any
interface NavbarUser {
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface NavbarClientProps {
  user: NavbarUser;
  signOutAction: () => void;
}

// Hydration helpers
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function NavbarClient({ user, signOutAction }: NavbarClientProps) {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isClient) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="h-4 w-24 bg-white/5 rounded" />
        <div className="h-8 w-8 rounded-full bg-white/5" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none group">
        <div className="flex items-center gap-3 group-hover:opacity-80 transition-opacity cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none text-white">
              {user.user_metadata?.full_name || "User"}
            </p>
          </div>
          {user.user_metadata?.avatar_url ? (
            <Image 
              src={user.user_metadata.avatar_url} 
              alt="Profile" 
              width={32} 
              height={32} 
              className="rounded-full border border-white/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <UserIcon className="h-4 w-4 text-white/60" />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 mt-2 bg-black/90 backdrop-blur-xl border-white/10 text-white shadow-2xl"
      >
        <DropdownMenuLabel className="font-semibold text-white/70">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem className="cursor-not-allowed opacity-50 focus:bg-white/5">
          <UserIcon className="mr-2 h-4 w-4" /> <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-not-allowed opacity-50 focus:bg-white/5">
          <Settings className="mr-2 h-4 w-4" /> <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <form action={signOutAction}>
          <button type="submit" className="w-full text-left outline-none">
            <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer focus:bg-red-400/10">
              <LogOut className="mr-2 h-4 w-4" /> <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}