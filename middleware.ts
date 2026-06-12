import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/register'
  const isApiAuthRoute = pathname.startsWith('/api/auth')
  const isAuthCallback = pathname.startsWith('/auth')
  const isStaticFile =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.')

  // Perfiles públicos: /<username> (un solo segmento que no sea ruta de la app)
  const RESERVED_PATHS = [
    'dashboard',
    'plants',
    'germinations',
    'cemetery',
    'new-plant',
    'login',
    'register',
    'profile',
    'api',
    'p',
  ]
  const profileMatch = pathname.match(/^\/([A-Za-z0-9_]+)\/?$/)
  const isPublicProfile =
    !!profileMatch && !RESERVED_PATHS.includes(profileMatch[1].toLowerCase())

  // Plantas compartidas: /p/<slug> es público (solo muestra generalidades;
  // RLS limita el acceso a plantas de perfiles públicos)
  const isPublicPlant = pathname === '/p' || pathname.startsWith('/p/')

  if (isStaticFile || isApiAuthRoute || isAuthCallback || isPublicProfile || isPublicPlant) {
    return supabaseResponse
  }

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.).*)',
  ],
}
