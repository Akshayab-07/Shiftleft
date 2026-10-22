"use client"

import React, { useEffect, useRef } from "react"

interface DotFieldProps {
  className?: string
  dotRadius?: number
  dotSpacing?: number
  opacity?: number
}

/**
 * High-performance canvas-based interactive DotField background
 * Inspired by React Bits DotField: subtle emerald/cyan matrix with gentle cursor interaction
 */
export function DotField({
  className = "",
  dotRadius = 1.25,
  dotSpacing = 24,
  opacity = 0.22,
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let mouseX = -1000
    let mouseY = -1000
    let targetMouseX = -1000
    let targetMouseY = -1000
    let time = 0

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const handleResize = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetMouseX = e.clientX - rect.left
      targetMouseY = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      targetMouseX = -1000
      targetMouseY = -1000
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)

    handleResize()

    const render = () => {
      time += prefersReducedMotion ? 0 : 0.015

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.1
      mouseY += (targetMouseY - mouseY) * 0.1

      ctx.clearRect(0, 0, width, height)

      const cols = Math.ceil(width / dotSpacing) + 1
      const rows = Math.ceil(height / dotSpacing) + 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const originX = c * dotSpacing
          const originY = r * dotSpacing

          // Subtle wave displacement
          const wave = prefersReducedMotion
            ? 0
            : Math.sin(time + originX * 0.01 + originY * 0.01) * 1.5

          let posX = originX
          let posY = originY + wave

          // Interactive cursor reaction (bulge effect)
          const dx = posX - mouseX
          const dy = posY - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 180

          let scale = 1
          let alpha = 0.25

          if (dist < maxDist && !prefersReducedMotion) {
            const factor = (1 - dist / maxDist)
            // Push slightly away
            posX += (dx / dist) * factor * 8
            posY += (dy / dist) * factor * 8
            scale = 1 + factor * 1.2
            alpha = 0.25 + factor * 0.55
          }

          // Emerald / cyan color gradient across the field
          const colorRatio = (originX / Math.max(1, width)) * 0.6 + (originY / Math.max(1, height)) * 0.4
          // 0 = emerald (34, 197, 94), 1 = cyan (34, 211, 238)
          const redVal = 34
          const greenVal = Math.round(197 + colorRatio * 14)
          const blueVal = Math.round(94 + colorRatio * 144)

          ctx.beginPath()
          ctx.arc(posX, posY, dotRadius * scale, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${redVal}, ${greenVal}, ${blueVal}, ${alpha * opacity})`
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [dotRadius, dotSpacing, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  )
}
