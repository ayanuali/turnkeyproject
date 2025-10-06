import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "sBTC P2P Swap",
  description: "peer to peer sbtc marketplace with embedded wallets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
