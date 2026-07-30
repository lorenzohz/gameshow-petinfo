import { ReactNode } from "react";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";
import { GameProvider } from "../context/GameContext";

export const metadata = {
  title: "Show do Quem Sabe Faz Ao Vivo",
};

interface RootLayoutProps {
  children: ReactNode;
}

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-br" className={`${anton.variable} ${montserrat.variable}`}>
      <body className="min-h-screen w-full bg-offwhite text-ink antialiased">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
