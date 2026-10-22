"use client"

import React, { useEffect, useState, Suspense } from "react"
import dynamic from "next/dynamic"

// Lazy-load the WebGL/VGPU AeroShards component
const AeroShardsLazy = dynamic(() => import("./AeroShards"), {
  ssr: false,
  loading: () => null,
})

interface ShardBackdropProps {
  className?: string
  placement?: "full" | "left" | "right" | "center"
  flow?: "stream" | "vortex" | "ribbon"
  material?: "pearl" | "chrome" | "satin"
  speed?: number
  density?: number
  opacity?: number
  interactive?: boolean
  children?: React.ReactNode
}

export function ShardBackdrop({
  className = "",
  placement = "full",
  flow = "stream",
  material = "pearl",
  speed = 0.8,
  density = 1.0,
  opacity = 0.55,
  interactive = true,
  children,
}: ShardBackdropProps) {
  const [canRenderGpu, setCanRenderGpu] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Detect prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener("change", handleMotionChange)

    // Detect theme class on <html>
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    checkDark()

    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // Test WebGL / VGPU support
    try {
      const testCanvas = document.createElement("canvas")
      const gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl")
      if (gl && !mq.matches) {
        setCanRenderGpu(true)
      }
    } catch {
      setCanRenderGpu(false)
    }

    return () => {
      mq.removeEventListener("change", handleMotionChange)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Dynamic AeroShards or Static Gradient Fallback */}
      {canRenderGpu && !reducedMotion ? (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{ opacity }}
        >
          <Suspense fallback={null}>
            <AeroShardsLazy
              placement={placement}
              flow={flow}
              material={material}
              speed={speed}
              density={density}
              interaction={interactive ? "repel" : "none"}
              onError={() => setCanRenderGpu(false)}
              className="h-full w-full"
            />
          </Suspense>
        </div>
      ) : (
        /* Reduced motion / Static Gradient Fallback utilizing theme tokens */
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--primary-700)_0%,_transparent_65%),_radial-gradient(ellipse_at_bottom_right,_var(--accent-700)_0%,_transparent_60%)] opacity-35"
        />
      )}

      {/* Legibility Vignette Mask: Ensures text contrast is never compromised */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background-50/40 via-transparent to-background-50/90" />
      <div className="absolute inset-0 pointer-events-none backdrop-blur-[1px]" />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
