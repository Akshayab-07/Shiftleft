"use client"

import React from "react"
import { BookOpen, Cpu, Binary, Layers, CheckCircle2 } from "lucide-react"

export function GuideTab() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Computer Organization &amp; Architecture: Barrel Shifter Theory
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Theoretical foundations, logarithmic multiplexer scaling, and combinational timing analysis.
        </p>
      </div>

      {/* Grid of clean scannable panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Section 1: What is a Barrel Shifter? */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0a0f14]/90 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 mb-3">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              1. What is a Barrel Shifter?
            </h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            A <strong>barrel shifter</strong> is a combinational digital logic circuit capable of shifting or rotating a computer data word by any arbitrary number of bit positions within a <strong>single processor clock cycle</strong>.
          </p>
          <div className="mt-3 rounded-lg border border-white/[0.06] bg-[#05080c] p-3 text-xs text-zinc-400">
            <div className="flex justify-between font-mono text-[11px] text-zinc-300 border-b border-white/[0.06] pb-1.5 mb-1.5">
              <span>Metric</span>
              <span>Sequential Register</span>
              <span className="text-emerald-400">Barrel Shifter</span>
            </div>
            <div className="flex justify-between font-mono text-[11px] py-0.5">
              <span>Clock Cycles</span>
              <span className="text-red-400">k cycles</span>
              <span className="text-emerald-400">1 cycle (O(1))</span>
            </div>
            <div className="flex justify-between font-mono text-[11px] py-0.5">
              <span>Gate Delay</span>
              <span>k × t_FF</span>
              <span className="text-cyan-400">⌈log₂ N⌉ × t_MUX</span>
            </div>
          </div>
        </div>

        {/* Section 2: 3-Stage Logarithmic Architecture */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0a0f14]/90 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 mb-3">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              2. 3-Stage Logarithmic Array
            </h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            For an 8-bit word (N = 8), any shift count k (0 ≤ k ≤ 7) decomposes into a 3-bit binary control vector:
          </p>
          <div className="mt-2 text-center rounded-lg border border-white/[0.06] bg-[#05080c] py-2 font-mono text-sm text-cyan-400 font-bold">
            k = 4·S₂ + 2·S₁ + 1·S₀
          </div>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Each cascaded column conditionally shifts the intermediate bus by 2ˢᵗᵃᵍᵉ bit positions or passes it unchanged through 2:1 multiplexers.
          </p>
        </div>
      </div>

      {/* Stage Routing Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0a0f14]/90 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Binary className="h-4 w-4 text-emerald-400" />
          <span>Stage Control &amp; Multiplexer Routing Truth Table</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-zinc-500 uppercase tracking-wider text-[10px]">
                <th className="pb-2">Stage</th>
                <th className="pb-2">Control Signal</th>
                <th className="pb-2">When Sₙ = 0</th>
                <th className="pb-2 text-emerald-400">When Sₙ = 1</th>
                <th className="pb-2">Hardware Displacement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              <tr>
                <td className="py-2.5 font-bold text-white">Stage 0</td>
                <td className="py-2.5 text-cyan-400">S₀ (Bit 0)</td>
                <td className="py-2.5 text-zinc-400">Pass-through (0 bits)</td>
                <td className="py-2.5 text-emerald-400 font-bold">Shift by 1 bit</td>
                <td className="py-2.5 text-zinc-400">2⁰ = 1 bit position</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Stage 1</td>
                <td className="py-2.5 text-cyan-400">S₁ (Bit 1)</td>
                <td className="py-2.5 text-zinc-400">Pass-through (0 bits)</td>
                <td className="py-2.5 text-emerald-400 font-bold">Shift by 2 bits</td>
                <td className="py-2.5 text-zinc-400">2¹ = 2 bit positions</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Stage 2</td>
                <td className="py-2.5 text-cyan-400">S₂ (Bit 2)</td>
                <td className="py-2.5 text-zinc-400">Pass-through (0 bits)</td>
                <td className="py-2.5 text-emerald-400 font-bold">Shift by 4 bits</td>
                <td className="py-2.5 text-zinc-400">2² = 4 bit positions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary of Bit Operations */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0a0f14]/90 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-white mb-3">
          3. Summary of Supported Operations
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-white/[0.06] bg-[#05080c] p-3 text-xs">
            <div className="font-mono font-bold text-cyan-400 mb-1">
              LSL (Logical Shift Left)
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Bits move left toward MSB. Discarded MSBs are lost. Zeroes are inserted at LSB. Computes x × 2ⁿ.
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#05080c] p-3 text-xs">
            <div className="font-mono font-bold text-cyan-400 mb-1">
              LSR (Logical Shift Right)
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Bits move right toward LSB. Discarded LSBs are lost. Zeroes are inserted at MSB. Computes ⌊x / 2ⁿ⌋ (unsigned).
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#05080c] p-3 text-xs">
            <div className="font-mono font-bold text-cyan-400 mb-1">
              ASR (Arithmetic Shift Right)
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Bits move right. Bit 7 (sign bit) is replicated into opened positions. Preserves two&apos;s-complement signed values.
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#05080c] p-3 text-xs">
            <div className="font-mono font-bold text-emerald-400 mb-1">
              ROL (Circular Rotate Left)
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Bits shifted off MSB (Bit 7) wrap around to fill LSB positions. Total bit entropy is conserved; zero loss.
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#05080c] p-3 text-xs">
            <div className="font-mono font-bold text-emerald-400 mb-1">
              ROR (Circular Rotate Right)
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Bits shifted off LSB (Bit 0) wrap around to fill MSB positions. Total bit entropy is conserved; zero loss.
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#05080c] p-3 text-xs">
            <div className="font-mono font-bold text-white mb-1">
              Bitwise Inversion &amp; Mask
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Complement (~X) flips all 8 bits. Used in embedded firmware to generate bit clear masks (~(1 &lt;&lt; n)).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
