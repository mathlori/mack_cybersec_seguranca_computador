import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caso prático | Segurança digital",
  description:
    "Apresentação interativa para reconhecer e agir diante de alertas fraudulentos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
