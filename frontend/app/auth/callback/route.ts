import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // Grab the URL and the secure 'code' Google sent back
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Optional: If you passed a 'next' parameter to redirect them somewhere specific
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // Initialize the Supabase Server Client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    // Exchange the Google code for a Supabase session (sets the cookie)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Success! Redirect the user to the homepage (or dashboard)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error("Supabase Auth Error:", error.message)
    }
  }

  // If something went wrong, redirect them back home with an error flag
  return NextResponse.redirect(`${origin}/?error=auth-failed`)
}