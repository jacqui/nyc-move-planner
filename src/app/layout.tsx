import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moving to NYC",
  description: "Our move planner and tracker.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">
        <header className="border-b border-line px-6 py-4">
          <h1 className="font-display text-xl mb-2">Moving to NYC</h1>
          <nav className="flex gap-4 text-sm text-route">
            <a href="/scenarios">Scenarios</a>
            <a href="/neighborhoods">Neighborhoods</a>
            <a href="/schools">Schools</a>
            <a href="/childcare">Childcare</a>
            <a href="/listings">Listings</a>
          </nav>
        </header>
        <main className="px-6 py-8 max-w-3xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
