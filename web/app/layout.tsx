import { Raleway } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Agentic Trust - AI Agent Infrastructure Platform",
  description: "Build, deploy, and govern AI agents at scale",
  icons: {
    icon: [{ url: "/logo/dark-favicon.png" }, { url: "/logo/dark-favicon.png", type: "image/png" }],
    shortcut: "/logo/dark-favicon.png",
    apple: "/logo/dark-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${raleway.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
