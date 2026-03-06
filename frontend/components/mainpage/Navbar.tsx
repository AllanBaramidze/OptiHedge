import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { redirect } from "next/navigation";
import GoogleLoginButton from "./GoogleLoginButton";
import Image from "next/image";
import NavbarVisibilityWrapper from "./NavbarVisibilityWrapper";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";

export default async function Navbar() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) },
        },
      }
    );
    await supabase.auth.signOut();
    return redirect("/");
  }

  return (
    <NavbarVisibilityWrapper>
      {/* Glassmorphism Classes: bg-black/40, backdrop-blur-xl, border-white/5 */}
      <nav className="w-full border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-70 transition-opacity">
            OptiHedge
          </Link>
          
          {user && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
              <Link href="/upload" className="hover:text-white transition-colors">Wallet</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/hedge" className="hover:text-white transition-colors">Hedging</Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium leading-none text-white">{user.user_metadata.full_name}</p>
                  </div>
                  {user.user_metadata.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      width={36} 
                      height={36} 
                      className="rounded-full border border-white/10"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <User className="h-5 w-5 text-white/60" />
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-black/80 backdrop-blur-xl border-white/10 text-white">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="cursor-not-allowed opacity-50">
                  <User className="mr-2 h-4 w-4" /> <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-not-allowed opacity-50">
                  <Settings className="mr-2 h-4 w-4" /> <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <form action={signOut}>
                  <button type="submit" className="w-full text-left">
                    <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer focus:bg-red-400/10">
                      <LogOut className="mr-2 h-4 w-4" /> <span>Sign out</span>
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <GoogleLoginButton />
          )}
        </div>
      </nav>
    </NavbarVisibilityWrapper>
  );
}