import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes qui nécessitent une authentification
const protectedRoutes = ["/demande", "/profile"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si la route actuelle nécessite une authentification
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Vérifier si l'utilisateur est connecté
    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie?.value) {
      // Rediriger vers la page de connexion avec l'URL de redirection
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Appliquer le middleware à toutes les routes sauf les routes statiques et API
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}
