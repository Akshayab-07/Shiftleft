"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/lab", label: "Interactive Lab" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-4 z-50 w-full px-3 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full border border-secondary-300 bg-background-50/80 px-4 sm:px-5 shadow-xl shadow-background-950/15 backdrop-blur-xl transition-all">
        {/* Brand Logo Left */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-primary-50 font-mono font-bold text-xs shadow-md shadow-primary-950/20">
            &gt;&gt;
          </div>
          <span className="font-extrabold tracking-tight text-text-950 text-sm sm:text-base">
            Shift<span className="text-primary-500">Lab</span>
          </span>
        </Link>

        {/* Desktop Nav Links Center */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  isActive
                    ? "text-primary-50"
                    : "text-text-700 hover:text-text-950"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="pill-active-indicator"
                    className="absolute inset-0 rounded-full bg-primary-500 shadow-sm"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Actions: Theme Toggle + Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile navigation menu"
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-secondary-300 bg-secondary-100 text-text-700 transition-colors hover:text-text-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto mx-auto mt-2 max-w-sm rounded-2xl border border-secondary-300 bg-background-50/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-primary-500 text-primary-50"
                        : "text-text-700 hover:bg-secondary-100 hover:text-text-950"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
