// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;

  // Verificar si el token es válido
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token || token !== process.env.ADMIN_SECRET) {
      // Redirigir al login si no está autenticado
      return NextResponse.redirect(new URL("/loggin", request.url));
    }
  }

  return NextResponse.next();
}

// Aplicar el middleware solo a las rutas necesarias
export const config = {
  matcher: ["/admin(/.*)?"], // Intercepta todas las rutas bajo /admin
};