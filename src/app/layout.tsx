import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@/components/Providers/ThemeProvider";
import Providers from "@/lib/providers/Providers";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agro Connect - From Fields to Tables",
  description:
    "Agricultural platform in Ivory Coast connecting certified local producers directly with buyers and reliable delivery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo9.png" />
      </head>

      <body className={`${sansFont.variable} ${serifFont.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ToastContainer position="top-right" autoClose={3000} />
            <Toaster richColors position="top-right" />

            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
