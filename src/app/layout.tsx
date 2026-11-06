import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdminFlow | Gestão de Usuários",
  description: "Sistema de cadastro e gerenciamento de usuários",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
