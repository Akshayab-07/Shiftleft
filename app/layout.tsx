import type { Metadata } from "next"
import { Barlow_Condensed, Geist, Geist_Mono, Space_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const labLabel = Barlow_Condensed({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-lab-label",
})

const labMono = Space_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lab-mono",
})

export const metadata: Metadata = {
  title: "ShiftLab — Interactive Hardware Architecture & Digital Systems Lab",
  description:
    "Explore 8-bit barrel shifters, combinational multiplexer arrays, and embedded register manipulation with zero latency and cycle-accurate hardware simulation.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} ${labLabel.variable} ${labMono.variable} font-sans antialiased dark`}
    >
      <body className="min-h-screen flex flex-col bg-background-50 text-text-900 transition-colors duration-200">
        <Navbar />
        <div className="flex-1 w-full">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
