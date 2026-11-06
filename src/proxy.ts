// Proxy (antigo "middleware" no Next 15): roda ANTES de cada página.
// Se não houver token válido, redireciona para /login.
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verificarToken } from "./lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const autenticado = !!verificarToken(request.cookies.get(COOKIE_NAME)?.value);

  // Já logado tentando abrir /login -> manda para o sistema
  if (pathname === "/login") {
    return autenticado
      ? NextResponse.redirect(new URL("/usuarios", request.url))
      : NextResponse.next();
  }

  // Rota protegida sem token válido -> /login (e limpa token ruim/expirado)
  if (!autenticado) {
    const resposta = NextResponse.redirect(new URL("/login", request.url));
    if (request.cookies.has(COOKIE_NAME)) resposta.cookies.delete(COOKIE_NAME);
    return resposta;
  }

  return NextResponse.next();
}

export const config = {
  // Tudo, exceto /api, arquivos internos do Next e arquivos estáticos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
