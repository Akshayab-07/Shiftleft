"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  Binary,
  Cpu,
  Layers,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sliders,
  Zap,
  Terminal,
  Activity,
  Compass,
} from "lucide-react"
import { ShardBackdrop } from "@/components/ShardBackdrop"
import { DisplayHeading } from "@/components/DisplayHeading"
import { computeShift, toBinary8, toHex8 } from "@/lib/bitOps"

const TIMELINE_ERAS = [
  {
    year: "1971",
    name: "Sequential Shift Registers",
    cycles: "k Clock Cycles",
    delay: "k × t_FF",
    desc: "Early sequential 4-bit and 8-bit processors relied on iterative clock ticking to shift data one wire at a time, resulting in variable-latency ALU operations.",
  },
  {
    year: "1982",
    name: "Logarithmic MUX Trees",
    cycles: "1 Clock Cycle",
    delay: "3 × t_MUX",
    desc: "The transition to cascaded 2:1 multiplexers enabled O(1) combinational shifting, decoupling data movement from cycle count and enabling single-cycle multipliers.",
  },
  {
    year: "2003",
    name: "Superscalar 64-Bit ALUs",
    cycles: "1 Clock Cycle",
    delay: "6 × t_MUX",
    desc: "64-bit architectures scaled logarithmic trees to 6 cascaded stages, routing 64 data lines with dynamic sign preservation and barrel rotation bypass.",
  },
  {
    year: "2024+",
    name: "Vector & SIMD Shifters",
    cycles: "1 Clock Cycle",
    delay: "Parallel SIMD",
    desc: "Modern RISC-V Vector Extensions and ARM SVE compute 256-bit to 512-bit cross-lane barrel rotations simultaneously across specialized vector execution units.",
  },
]

export default function HomePage() {
  // Interactive micro-preview state for hero right column
  const [heroVal, setHeroVal] = useState<number>(45) // 00101101
  const [heroShift, setHeroShift] = useState<number>(2)
  const heroOutVal = computeShift(heroVal, "LSL", heroShift)
  const heroBin = toBinary8(heroVal)
  const heroOutBin = toBinary8(heroOutVal)

  return (
    <div className="w-full space-y-24 sm:space-y-32">
      {/* ========================================================= */}
      {/* 1. HERO SECTION WITH AEROSHARDS BACKDROP & WAPTEXT (H1)   */}
      {/* ========================================================= */}
      <section className="relative min-h-[92vh] flex items-center pt-8 pb-16">
        <ShardBackdrop
          placement="center"
          flow="stream"
          material="pearl"
          speed={0.7}
          density={1.1}
          opacity={0.48}
          className="min-h-[92vh]"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
              {/* Left Column: Asymmetric Typography & Action (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Main Heading wrapped in DisplayHeading (WarpText) */}
                <DisplayHeading
                  text="ShiftLab Architecture"
                  as="h1"
                  fontSize={52}
                  warpStrength={0.75}
                  subtitle="Experience physical digital logic at gate-level transparency. Explore 3-stage logarithmic barrel shifters, cycle-accurate bitwise dataflow, and real-time microcontroller register simulation."
                />

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/lab"
                    className="flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 text-sm font-bold text-primary-50 shadow-xl shadow-primary-950/20 transition-all hover:bg-primary-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <Binary className="h-4 w-4" />
                    <span>Interactive Lab</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/about"
                    className="flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-100 px-5 py-3.5 text-sm font-semibold text-text-800 transition-colors hover:border-secondary-400 hover:bg-secondary-200 hover:text-text-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <Compass className="h-4 w-4 text-primary-500" />
                    <span>Lab Philosophy</span>
                  </Link>
                </div>

                {/* Telemetry metrics strip */}
                <div className="grid grid-cols-3 gap-4 border-t border-secondary-300/80 pt-6">
                  <div>
                    <span className="font-mono text-[11px] text-text-600 uppercase tracking-wider block">
                      Propagation Delay
                    </span>
                    <span className="font-mono text-base sm:text-lg font-black text-text-950">
                      3 × t_MUX
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] text-text-600 uppercase tracking-wider block">
                      Cycle Count
                    </span>
                    <span className="font-mono text-base sm:text-lg font-black text-primary-600">
                      O(1) Constant
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] text-text-600 uppercase tracking-wider block">
                      Word Length
                    </span>
                    <span className="font-mono text-base sm:text-lg font-black text-text-950">
                      8-Bit Bus [D7..D0]
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Overlapping Live Interactive Micro-Simulator Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-secondary-300 bg-background-50/90 p-6 shadow-2xl backdrop-blur-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                      <span className="font-mono text-xs font-bold text-text-950">
                        LIVE EMULATION PREVIEW
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-primary-600 font-bold">
                      k = {heroShift} (S₂S₁S₀ = {(heroShift & 4 ? "1" : "0") + (heroShift & 2 ? "1" : "0") + (heroShift & 1 ? "1" : "0")})
                    </span>
                  </div>

                  {/* Interactive Word Bits */}
                  <div>
                    <div className="flex justify-between text-xs text-text-600 mb-2 font-mono">
                      <span>Click bit to flip Input:</span>
                      <span className="text-text-900 font-bold">{heroVal} ({toHex8(heroVal)})</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1.5">
                      {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                        const isOne = heroBin[7 - bitIdx] === "1"
                        return (
                          <button
                            key={bitIdx}
                            type="button"
                            onClick={() => setHeroVal((prev) => prev ^ (1 << bitIdx))}
                            className={`flex flex-col items-center justify-center rounded-xl py-2.5 font-mono transition-all active:scale-95 border ${
                              isOne
                                ? "bg-primary-500 text-primary-50 border-primary-600 shadow-md"
                                : "bg-secondary-100 text-text-700 border-secondary-300 hover:border-secondary-400"
                            }`}
                          >
                            <span className="text-[9px] opacity-70">b{bitIdx}</span>
                            <span className="text-sm font-black">{isOne ? "1" : "0"}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shift Selector */}
                  <div>
                    <div className="flex justify-between text-xs text-text-600 mb-1.5 font-mono">
                      <span>Shift Amount (LSL):</span>
                      <span className="text-primary-600 font-bold">≪ {heroShift} bits</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setHeroShift(num)}
                          className={`rounded-lg py-1 font-mono text-xs font-bold transition-colors ${
                            heroShift === num
                              ? "bg-primary-500 text-primary-50"
                              : "bg-secondary-100 text-text-700 hover:bg-secondary-200"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Output Preview */}
                  <div className="rounded-2xl border border-secondary-300 bg-secondary-100 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-text-600">Simulated Output Y:</span>
                      <span className="font-bold text-text-950">
                        {heroOutVal} ({toHex8(heroOutVal)})
                      </span>
                    </div>
                    <div className="font-mono text-xl sm:text-2xl font-black text-primary-600 tracking-widest text-center">
                      {heroOutBin}
                    </div>
                  </div>

                  <Link
                    href="/lab"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-secondary-300 bg-secondary-200/80 py-2.5 text-xs font-bold text-text-950 transition-colors hover:bg-secondary-300"
                  >
                    <span>Inspect In 3-Stage Circuit Schematic</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ShardBackdrop>
      </section>

      {/* ========================================================= */}
      {/* 2. ASYMMETRIC BENTO GRID: HARDWARE ARCHITECTURE TENETS     */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary-600 block">
            01 / Hardware Architecture
          </span>
          <DisplayHeading
            text="Combinational Core Architecture"
            as="h2"
            fontSize={40}
            subtitle="How ShiftLab models physical hardware arrays with sub-nanosecond combinational determinism."
          />
        </div>

        {/* Varied Bento Tiles */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Tile 1: 2-column wide dominant block */}
          <div className="md:col-span-2 rounded-3xl border border-secondary-300 bg-secondary-100/70 p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-primary-50">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-text-950 tracking-tight">
                Logarithmic 3-Stage Cascaded MUX Tree
              </h3>
              <p className="text-sm text-text-700 leading-relaxed max-w-2xl">
                Iterative serial shift registers take <em>k</em> clock cycles to displace data. ShiftLab implements the full logarithmic 2:1 multiplexer matrix where any shift count $0 \le k \le 7$ decomposes into binary selection controls $S_2, S_1, S_0$, resolving arbitrary shifts in a single instruction cycle with constant $O(\log_2 N)$ propagation delay.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-secondary-300 pt-6 font-mono text-xs">
              <div>
                <span className="text-text-600 block">Stage 0</span>
                <span className="font-bold text-text-950">Shift by 1 (2⁰)</span>
              </div>
              <div>
                <span className="text-text-600 block">Stage 1</span>
                <span className="font-bold text-text-950">Shift by 2 (2¹)</span>
              </div>
              <div>
                <span className="text-text-600 block">Stage 2</span>
                <span className="font-bold text-text-950">Shift by 4 (2²)</span>
              </div>
            </div>
          </div>

          {/* Tile 2: Embedded Device Register & LEDs */}
          <div className="rounded-3xl border border-secondary-300 bg-secondary-100/70 p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-accent-50">
                <Sliders className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-text-950 tracking-tight">
                Embedded Microcontroller GPIO Emulation
              </h3>
              <p className="text-sm text-text-700 leading-relaxed">
                Connect algorithmic bit arithmetic directly to physical peripheral ports. Emulates AVR PORTB and ARM Cortex GPIO_ODR registers with real-time pin state toggles and single-step operations.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-secondary-300 bg-background-50 p-3 font-mono text-xs flex items-center justify-between">
              <span className="text-text-600">8 Virtual LEDs:</span>
              <span className="text-primary-600 font-bold">Active Radial Glow</span>
            </div>
          </div>

          {/* Tile 3: Operations Spectrum */}
          <div className="rounded-3xl border border-secondary-300 bg-secondary-100/70 p-8 shadow-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-300 text-text-950">
              <Binary className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black text-text-950 tracking-tight">
              Arithmetic, Logical &amp; Circular Modes
            </h3>
            <p className="text-sm text-text-700 leading-relaxed">
              Examine distinct boundary behaviors: zero-padding in LSL/LSR, sign-bit replication in two&apos;s-complement ASR, and full bit-conservation in ROL/ROR without data loss.
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs pt-2">
              <span className="rounded-lg bg-secondary-200 px-2 py-1 text-text-900 font-bold">LSL</span>
              <span className="rounded-lg bg-secondary-200 px-2 py-1 text-text-900 font-bold">LSR</span>
              <span className="rounded-lg bg-secondary-200 px-2 py-1 text-text-900 font-bold">ASR</span>
              <span className="rounded-lg bg-secondary-200 px-2 py-1 text-text-900 font-bold">ROL</span>
              <span className="rounded-lg bg-secondary-200 px-2 py-1 text-text-900 font-bold">ROR</span>
            </div>
          </div>

          {/* Tile 4: 2-column wide hardware delay comparison */}
          <div className="md:col-span-2 rounded-3xl border border-secondary-300 bg-secondary-100/70 p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-primary-50">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-text-950 tracking-tight">
                Single-Cycle Combinational Efficiency
              </h3>
              <p className="text-sm text-text-700 leading-relaxed max-w-2xl">
                Unlike sequential shift registers that tie clock cycles to shift distance, barrel shifters propagate signals continuously through passive multiplexer routing in a single clock cycle, enabling instant address calculations and floating-point normalization.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-secondary-300 bg-background-50 p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-text-700">Verification vectors confirmed:</span>
              <div className="flex items-center gap-3">
                <span className="rounded bg-primary-500/20 px-2 py-0.5 text-primary-600 font-bold border border-primary-500/30">
                  00111101 LSL 6 = 01000000
                </span>
                <span className="rounded bg-primary-500/20 px-2 py-0.5 text-primary-600 font-bold border border-primary-500/30">
                  10110011 ASR 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SPLIT-SCREEN STICKY RAIL SECTION                       */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Sticky Left Rail (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary-600 block">
                02 / Architectural Stages
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-text-950">
                How Signals Flow Through Cascaded Silicon
              </h2>
              <p className="text-sm text-text-700 leading-relaxed">
                Step by step breakdown of how 8 parallel digital signals travel from the raw input bus through conditional multiplexers to the final output pins.
              </p>
              <div className="pt-2">
                <Link
                  href="/lab"
                  className="inline-flex items-center gap-2 text-xs font-bold font-mono text-primary-600 hover:text-primary-700 underline"
                >
                  <span>Explore Live Signal Flow Animator</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Scrollable Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-secondary-300 bg-secondary-100/70 p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3 font-mono text-xs font-bold text-primary-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-primary-50">
                  01
                </span>
                <span>Stage 0 • Conditionally Shift by 1 Bit (S₀)</span>
              </div>
              <p className="text-sm text-text-700 leading-relaxed">
                The input bus D[7:0] enters the first column of 8 multiplexers. If control line S₀ = 1, each bit is displaced by exactly 1 position (2⁰). If S₀ = 0, the bus passes through unchanged to intermediate bus I⁽¹⁾.
              </p>
            </div>

            <div className="rounded-3xl border border-secondary-300 bg-secondary-100/70 p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3 font-mono text-xs font-bold text-primary-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-primary-50">
                  02
                </span>
                <span>Stage 1 • Conditionally Shift by 2 Bits (S₁)</span>
              </div>
              <p className="text-sm text-text-700 leading-relaxed">
                Intermediate bus I⁽¹⁾ feeds Stage 1. Controlled by S₁, this stage shifts data by 2 bit positions (2¹). This compound shifting allows combinations like 1 + 2 = 3 bit shifts without an extra clock cycle.
              </p>
            </div>

            <div className="rounded-3xl border border-secondary-300 bg-secondary-100/70 p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3 font-mono text-xs font-bold text-primary-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-primary-50">
                  03
                </span>
                <span>Stage 2 • Conditionally Shift by 4 Bits (S₂)</span>
              </div>
              <p className="text-sm text-text-700 leading-relaxed">
                Intermediate bus I⁽²⁾ feeds Stage 2. Controlled by S₂, this stage displaces bits by 4 positions (2²). The resultant signals resolve into the primary Output Bus Y[7:0] with total delay of 3 × t_MUX.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. HORIZONTAL SCROLL: ARCHITECTURAL BENCHMARK TIMELINE    */}
      {/* ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary-600 block">
            03 / Evolution of Data Shifting
          </span>
          <DisplayHeading
            text="Evolutionary Shifter Timeline"
            as="h2"
            fontSize={36}
            subtitle="From iterative clock-bound registers to modern superscalar vector barrel multiplexers."
          />
        </div>

        {/* Horizontal Scroll Track */}
        <div className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory">
          {TIMELINE_ERAS.map((era) => (
            <div
              key={era.year}
              className="min-w-[300px] sm:min-w-[360px] snap-center rounded-3xl border border-secondary-300 bg-secondary-100/70 p-6 flex flex-col justify-between shadow-sm space-y-4"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-text-600 mb-2">
                  <span className="rounded-full bg-primary-500/20 px-2.5 py-0.5 text-primary-600 font-bold border border-primary-500/30">
                    {era.year}
                  </span>
                  <span className="text-text-700">{era.cycles}</span>
                </div>
                <h3 className="text-lg font-black text-text-950">{era.name}</h3>
                <p className="mt-2 text-xs text-text-700 leading-relaxed">{era.desc}</p>
              </div>

              <div className="border-t border-secondary-300 pt-3 font-mono text-xs flex justify-between text-text-600">
                <span>Gate Delay:</span>
                <span className="font-bold text-text-950">{era.delay}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
