import { Kaisei_Opti, Kodchasan } from "next/font/google"; 
import "./globals.css";


const kaiseiOpti = Kaisei_Opti({
  variable: "--font-kaisei-opti",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const kodchasan = Kodchasan({
  variable: "--font-kodchasan", 
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Fact Checker",
  description: "Fact Checker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${kaiseiOpti.variable} ${kodchasan.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
