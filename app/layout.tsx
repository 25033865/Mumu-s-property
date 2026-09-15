import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "MUMUS Property & Projects",
  description: "Industrial supplies, engineering consumables, PPE and accommodation solutions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}