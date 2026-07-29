
import { ReactNode } from "react";
import { Montserrat } from "next/font/google"; 
import "./globals.css";
import { GameProvider } from "../context/GameContext";

export const metadata = {
  title: "Cassino Mágico",
};

interface RootLayoutProps {
  children: ReactNode;
}

const montserrat = Montserrat({
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-montserrat", 
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-br" className={montserrat.className}>
      <body className="w-[1920px] vsc-initialized">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
