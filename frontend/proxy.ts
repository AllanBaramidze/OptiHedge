import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- FAST PATH: BYPASS AUTH ---
  if (
    pathname === '/' || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api') ||
    (!pathname.startsWith('/upload') && !pathname.startsWith('/dashboard'))
  ) {
    return NextResponse.next();
  }

  // --- PROTECTED ROUTE LOGIC ---
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // FIXED: Removed 'options' from destructuring here as it was unused
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
  
          response = NextResponse.next({
            request: { headers: request.headers },
          })

          // This loop is fine because options is used in the .set() call
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}