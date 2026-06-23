import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NeoTravel V2",
  description: "Assistant voyage - devis, chat et relances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}