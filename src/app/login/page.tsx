"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dados = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(dados.erro || "Falha ao entrar.");
      router.replace("/usuarios");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao entrar.");
      setEnviando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="panel login-card">
        <div className="brand" style={{ margin: "0 0 8px" }}>Bancos<span>Regulados</span></div>
        <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>Entre com seu e-mail e senha.</p>
        <form onSubmit={entrar}>
          <label className="field" style={{ marginBottom: 16 }}>
            <span>E-mail</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@exemplo.com" required autoFocus />
          </label>
          <label className="field" style={{ marginBottom: 16 }}>
            <span>Senha</span>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Sua senha" required />
          </label>
          {erro && <div className="alert error" role="alert">{erro}</div>}
          <button type="submit" className="primary-button" style={{ width: "100%" }} disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
