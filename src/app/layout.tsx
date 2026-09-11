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
          <h1 className="font-display text-xl">Moving to NYC</h1>
        </header>
        <main className="px-6 py-8 max-w-3xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
