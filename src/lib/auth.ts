// Funções de autenticação.
import jwt from "jsonwebtoken";

export const COOKIE_NAME = "token";
export const DURACAO_SEGUNDOS = 60 * 60; // token vale 1 hora


const SECRET = process.env.JWT_SECRET || "segredo-didatico-troque-em-producao";

export type DadosToken = { sub: string; nome: string; email: string };

export function assinarToken(dados: DadosToken) {
  return jwt.sign(dados, SECRET, { expiresIn: DURACAO_SEGUNDOS });
}

// Retorna os dados se o token for válido, se não, null.
export function verificarToken(token?: string): DadosToken | null {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as DadosToken;
  } catch {
    return null; // inválido, adulterado ou expirado
  }
}
