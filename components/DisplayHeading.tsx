"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Lazy-load WarpText WebGL renderer from react-bits
const WarpTextLazy = dynamic(() => import("./WarpText"), {
  ssr: false,
  loading: () => null,
})

interface DisplayHeadingProps {
  text: string
  as?: "h1" | "h2"
  className?: string
  warpStrength?: number
  fontSize?: number
  subtitle?: string
}

/**
 * DisplayHeading wraps React Bits WarpText (noted in prompt as 'Waptext').
 * Used for all main page H1s and major section titles.
 * Falls back to accessible semantic typography under prefers-reduced-motion or SSR.
 */
export function DisplayHeading({
  text,
  as: Component = "h1",
  className = "",
  warpStrength = 0.8,
  fontSize = 44,
  subtitle,
}: DisplayHeadingProps) {
  const [canRenderGl, setCanRenderGl] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [textColor, setTextColor] = useState("#f8eafb")

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)

    // Check theme to feed appropriate contrast color to WebGL text rasterizer
    const updateColor = () => {
      const isDark = document.documentElement.classList.contains("dark")
      setTextColor(isDark ? "#f8eafb" : "#24082b")
    }
    updateColor()

    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
      if (gl && !mq.matches) {
        setCanRenderGl(true)
      }
    } catch {
      setCanRenderGl(false)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Semantic accessible heading (visually hidden when interactive WebGL is active) */}
      <Component
        className={`${
          canRenderGl && !reducedMotion ? "sr-only" : "block"
        } font-black tracking-tight text-text-950 transition-colors ${
          Component === "h1"
            ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]"
            : "text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight"
        }`}
      >
        {text}
      </Component>

      {/* Interactive WebGL WarpText from React Bits */}
      {canRenderGl && !reducedMotion && (
        <div
          className="relative w-full overflow-visible py-1 pointer-events-auto select-none"
          style={{ minHeight: `${fontSize * 1.35}px` }}
          aria-hidden="true"
        >
          <WarpTextLazy
            text={text}
            color={textColor}
            fontSize={`${fontSize}px`}
            fontWeight={900}
            fontFamily="inherit"
            warpStrength={warpStrength}
            warpScale={1.5}
            speed={0.7}
            pointerInfluence={0.4}
            style={{}}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Optional supporting subtitle */}
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base text-text-700 font-medium max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
