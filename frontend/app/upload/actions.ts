"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface Holding {
  symbol: string;
  quantity: number;
  avgCost: number;
}

export async function savePortfolio(name: string, holdings: Holding[]) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
      },
    }
  );

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to save a wallet");

  // 2. Insert the main Portfolio record
  const { data: portfolio, error: pError } = await supabase
    .from("portfolios")
    .insert([{ name, user_id: user.id }])
    .select()
    .single();

  if (pError) throw pError;

  // 3. Prepare and insert the individual assets (linked to the portfolio ID)
  const itemsToInsert = holdings.map((item) => ({
    portfolio_id: portfolio.id,
    symbol: item.symbol,
    quantity: item.quantity,
    avg_cost: item.avgCost,
  }));

  const { error: iError } = await supabase.from("portfolio_items").insert(itemsToInsert);
  if (iError) throw iError;

  // 4. Refresh the cache so the user sees their new wallet immediately
  revalidatePath("/dashboard");
  return { success: true, portfolioId: portfolio.id };
}

export async function getLatestPortfolio() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch the most recent portfolio and its items
  const { data, error } = await supabase
    .from("portfolios")
    .select(`
      id,
      name,
      portfolio_items (
        symbol,
        quantity,
        avg_cost
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return data;
}