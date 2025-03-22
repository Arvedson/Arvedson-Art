// src/app/api/auth/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // Validar credenciales usando variables de entorno
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin-token", process.env.ADMIN_SECRET!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/", 
      });
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}