import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { redirect } from "next/navigation";
import GoogleLoginButton from "./GoogleLoginButton";
import Image from "next/image";
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

  // --- Sign Out Server Action ---
  async function signOut() {
    "use server";
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) { // Changed 'any' to 'CookieOptions'
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) { // Changed 'any' to 'CookieOptions'
          cookieStore.delete({ name, ...options })
        },
      },
    }
    );
    await supabase.auth.signOut();
    return redirect("/");
  }

  return (
    <nav className="w-full border-b border-border bg-background px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          OptiHedge
        </Link>
        
        {user && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/upload" className="hover:text-foreground transition-colors">Wallet</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user.user_metadata.full_name}</p>
                </div>
                {user.user_metadata.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    width={36} 
                    height={36} 
                    className="rounded-full border border-border"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Placeholders for your future features */}
              <DropdownMenuItem className="cursor-not-allowed opacity-50">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-not-allowed opacity-50">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Sign Out Triggering the Server Action */}
              <form action={signOut}>
                <button type="submit" className="w-full text-left">
                  <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
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
  );
}