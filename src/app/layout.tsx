import Providers from "../components/Providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Kiddospot",
  description: "Little spots, big smiles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className="h-full">
      <body
        className="h-full text-brand-ink dark:bg-[#1F1A17] dark:text-white antialiased"
      >
        <Toaster position="top-center" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
