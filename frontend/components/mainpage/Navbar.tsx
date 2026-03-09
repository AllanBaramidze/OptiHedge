import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from '@supabase/ssr'
import { redirect } from "next/navigation";
import GoogleLoginButton from "./GoogleLoginButton";
import NavbarVisibilityWrapper from "./NavbarVisibilityWrapper";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          }
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
          getAll() {
            return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  );
    await supabase.auth.signOut();
    return redirect("/");
  }

  return (
    <NavbarVisibilityWrapper>
      <nav className="w-full h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 flex items-center justify-between shadow-2xl fixed top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-70 transition-opacity">
            OptiHedge
          </Link>
          
          {user && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
              <Link href="/upload" className="hover:text-white transition-colors">Wallets</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/risk" className="hover:text-white transition-colors">Hedging</Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <NavbarClient user={user} signOutAction={signOut} />
          ) : (
            <GoogleLoginButton />
          )}
        </div>
      </nav>
    </NavbarVisibilityWrapper>
  );
}