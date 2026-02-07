import type { Metadata } from "next";
import { Playwrite_NZ } from "next/font/google";
import "./globals.css";

const playwriteNZ = Playwrite_NZ({
  variable: "--font-playwrite-nz",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Make-A-Ton 8.0",
  description: "Internal Application for Make-A-Ton 8.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playwriteNZ.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
