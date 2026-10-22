"use client"

import React from "react"

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-secondary-300 bg-background-50 overflow-hidden text-text-800">
      {/* Decorative top angled divider bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />

      {/* Main Footer Body */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div>
          {/* Brand & Architectural Statement */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-primary-50 font-mono font-bold text-sm shadow-md">
                &gt;&gt;
              </div>
              <span className="text-xl font-black tracking-tight text-text-950">
                Shift<span className="text-primary-500">Lab</span>
              </span>
            </div>

            <p className="text-sm text-text-700 leading-relaxed max-w-md">
              An interactive hardware architecture and digital systems lab. Accelerating computer engineering learning, combinational shifter emulation, and firmware mastery.
            </p>

            {/* Live Hardware Telemetry Strip */}
            <div className="rounded-2xl border border-secondary-300 bg-secondary-100 p-4 font-mono text-xs space-y-2 max-w-md">
              <div className="flex items-center justify-between text-text-700">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary-500 animate-ping" />
                  <span>Emulation Engine</span>
                </span>
                <span className="text-text-950 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-600 border-t border-secondary-200 pt-1.5">
                <span>Multiplexer Array</span>
                <span className="text-text-900">3 Stages (8×3 Muxes)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-600">
                <span>Cycle Determinism</span>
                <span className="text-text-900">1 Clock Cycle O(1)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="relative mt-16 border-t border-secondary-200 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-600 font-mono">
            <div>
              &copy; {new Date().getFullYear()} ShiftLab. Combinational Logic &amp; Computer Organization and Architecture.
            </div>
            <div className="flex items-center gap-4">
              <span>All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
