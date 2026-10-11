import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AirVision Intelligence",
  description:
    "Agentic environmental digital twin with multimodal AI, predictive ML, and health-aware route decision support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
