import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samelony — Custom Furniture, Made to Order",
  description:
    "Describe the furniture you want, get an AI-assisted design brief, and we'll manufacture it through our Vietnam partners.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Samelony
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/design" className="hover:underline">
                Submit a design
              </Link>
              <Link href="/track" className="hover:underline">
                Track an order
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500">
          Samelony — custom furniture, manufactured through vetted Vietnam
          partners.
        </footer>
      </body>
    </html>
  );
}
