import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import SessionProvider from "../components/SessionProvider";
import ConditionalLayout from "../components/ConditionalLayout";
import "./globals.css";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Website Bán Cân Điện Tử",
  description: "Cung cấp các loại cân điện tử chất lượng cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning={true}>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
      >
        <SessionProvider session={null}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
