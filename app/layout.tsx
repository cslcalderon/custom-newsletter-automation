import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newsletter Editor",
  description: "Custom newsletter editor for stock market application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

