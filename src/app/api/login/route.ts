import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { COOKIE_NAME, DURACAO_SEGUNDOS, assinarToken } from "../../../lib/auth";

const API = process.env.API_URL || "http://localhost:3001";

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

function hashesIguais(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(request: Request) {
  const { email, senha } = await request.json().catch(() => ({}));
  const invalido = NextResponse.json({ erro: "E-mail ou senha inválidos." }, { status: 401 });

  if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) return invalido;

  let usuarios: Array<{ id: number | string; nome: string; email: string; senha?: string }>;
  try {
    const r = await fetch(`${API}/usuarios?email=${encodeURIComponent(email.trim())}`, { cache: "no-store" });
    if (!r.ok) throw new Error();
    usuarios = await r.json();
  } catch {
    return NextResponse.json({ erro: "Não foi possível consultar o JSON Server. Ele está rodando?" }, { status: 502 });
  }

  // o JSON Server compara parcialmente; garantimos igualdade exata do e-mail
  const usuario = usuarios.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!usuario?.senha || !hashesIguais(sha256(senha), usuario.senha)) return invalido;

  const token = assinarToken({ sub: String(usuario.id), nome: usuario.nome.trim(), email: usuario.email });

  const resposta = NextResponse.json({ nome: usuario.nome.trim() });
  resposta.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, // JS do navegador não consegue ler o token
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true", // ative apenas se o site usar HTTPS
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
  return resposta;
}
