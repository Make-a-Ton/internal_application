import type { Metadata } from "next";
import { Playwrite_NZ, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const playwriteNZ = Playwrite_NZ({
  variable: "--font-playwrite-nz",
  weight: "400",
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
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
        className={`${playwriteNZ.variable} ${robotoCondensed.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}


