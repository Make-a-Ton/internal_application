import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const coolvetica = localFont({
  src: "./fonts/CoolveticaRg.otf",
  variable: "--font-coolvetica",
  display: "swap",
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
        className={`${coolvetica.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}


