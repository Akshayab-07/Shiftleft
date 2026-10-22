"use client"

import React, { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("shiftlab-theme")
    if (stored) {
      const active = stored === "dark"
      setIsDark(active)
      document.documentElement.classList.toggle("dark", active)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(prefersDark)
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("shiftlab-theme", next ? "dark" : "light")
  }

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-full border border-secondary-300 bg-secondary-100 opacity-60" />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-secondary-300 bg-secondary-100 text-text-700 transition-all hover:border-primary-400 hover:bg-secondary-200 hover:text-text-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:scale-95"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-primary-400 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-primary-600 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  )
}
