import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a clean medical look
import "./globals.css";
import { AuthProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CallDoc - Telemedicine",
  description: "Book your online consultation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
