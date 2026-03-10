"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Types ---
interface Holding {
  symbol: string;
  description: string; // Included to fix the blank name bug
  quantity: number;
  avgCost: number;
}

/**
 * Saves a new portfolio and its associated items.
 */
export async function savePortfolio(name: string, holdings: Holding[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to save a wallet");

  // 1. Insert main Portfolio record
  const { data: portfolio, error: pError } = await supabase
    .from("portfolios")
    .insert([{ name, user_id: user.id }])
    .select()
    .single();

  if (pError) throw pError;

  // 2. Insert items including the description field
  const itemsToInsert = holdings.map((item) => ({
    portfolio_id: portfolio.id,
    symbol: item.symbol,
    description: item.description,
    quantity: item.quantity,
    avg_cost: item.avgCost,
  }));

  const { error: iError } = await supabase.from("portfolio_items").insert(itemsToInsert);
  if (iError) throw iError;

  revalidatePath("/dashboard");
  revalidatePath("/upload");
  return { success: true, portfolioId: portfolio.id };
}

/**
 * Fetches the most recently created portfolio for the user.
 */
export async function getLatestPortfolio() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("portfolios")
    .select(`
      id,
      name,
      portfolio_items (
        symbol,
        description,
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

/**
 * Fetches all wallet names and IDs for the selector.
 */
export async function getAllWallets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("portfolios")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return error ? [] : data;
}

/**
 * Fetches a specific portfolio by its UUID.
 */
export async function getPortfolioById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select(`
      id,
      name,
      portfolio_items (
        symbol,
        description,
        quantity,
        avg_cost
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes a portfolio (Cascade handles the items).
 */
export async function deletePortfolio(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("portfolios").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/upload");
  return { success: true };
}