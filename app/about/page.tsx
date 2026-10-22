"use client"

import React from "react"
import Link from "next/link"
import { DisplayHeading } from "@/components/DisplayHeading"
import { Cpu, Layers, Binary, ShieldCheck, Terminal, Compass, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-24">
      {/* Header Section */}
      <div className="max-w-3xl space-y-4">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary-600 block">
          Origin &amp; Philosophy
        </span>
        <DisplayHeading
          text="Hardware Architecture Made Visual"
          as="h1"
          fontSize={48}
          subtitle="We founded ShiftLab to solve a pervasive problem in computer organization education: complex combinational circuits are taught in abstract Boolean algebra rather than intuitive spatial silicon physics."
        />
      </div>

      {/* Asymmetric Core Narrative Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        {/* Left Column (7 cols): The Silicon Problem */}
        <div className="lg:col-span-7 space-y-6 text-sm text-text-700 leading-relaxed">
          <h2 className="text-2xl font-black tracking-tight text-text-950">
            The Latency Gap Between Theory and Silicon
          </h2>
          <p>
            When students and engineers learn about bit shifting in introductory programming, they write operators like <code className="font-mono text-primary-600 bg-secondary-200 px-1.5 py-0.5 rounded">x &lt;&lt; 3</code> or <code className="font-mono text-primary-600 bg-secondary-200 px-1.5 py-0.5 rounded">x &gt;&gt; 2</code> without realizing that the underlying silicon does not simply &quot;move numbers over.&quot;
          </p>
          <p>
            In physical integrated circuits, shifting data arbitrarily requires a choice between two diametrically opposed architectural paradigms:
          </p>
          <ul className="space-y-3 pl-4 border-l-2 border-primary-500 font-medium text-text-900">
            <li>
              <strong>1. Sequential Shift Registers:</strong> Space-efficient flip-flops that tick one bit per clock cycle, creating unacceptable variable-latency execution stalls in modern pipelined microprocessors.
            </li>
            <li>
              <strong>2. Logarithmic Combinational Barrel Shifters:</strong> Cascaded arrays of 2:1 multiplexers that route any shift count k through ⌈log₂ N⌉ stages in a single combinational propagation window (O(1) clock cycle).
            </li>
          </ul>
          <p>
            ShiftLab simulates this physical reality directly in the browser with cycle-accurate timing, interactive multiplexer inspection, and dynamic dataflow tracking.
          </p>
        </div>

        {/* Right Column (5 cols): Live Telemetry Card */}
        <div className="lg:col-span-5 rounded-3xl border border-secondary-300 bg-secondary-100/70 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-secondary-300 pb-3">
            <Cpu className="h-5 w-5 text-primary-500" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-text-950">
              ShiftLab Core Tenets
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="font-mono font-bold text-text-950 block">01 / Gate-Level Observability</span>
              <p className="text-text-700 leading-relaxed">
                Every single 2:1 multiplexer, control bus wire (S₂, S₁, S₀), and intermediate bus state is exposed for real-time inspection.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono font-bold text-text-950 block">02 / Constant Combinational Delay</span>
              <p className="text-text-700 leading-relaxed">
                Propagating arbitrary shifts within a single clock cycle through 3 cascaded stages (3 × t_MUX).
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono font-bold text-text-950 block">03 / Firmware Co-Design</span>
              <p className="text-text-700 leading-relaxed">
                Directly mapping Boolean arithmetic to hardware registers like AVR PORTB and ARM Cortex GPIO_ODR with real virtual LEDs.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/lab"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-xs font-bold text-primary-50 shadow-md transition-all hover:bg-primary-600 active:scale-95"
            >
              <span>Explore Interactive Lab</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Architectural Comparison Matrix */}
      <div className="space-y-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary-600 block">
            COMPARATIVE ANALYSIS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-950 mt-1">
            Sequential Registers vs. Logarithmic Shifters
          </h2>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-secondary-300 bg-secondary-100/60 p-6 shadow-sm">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-secondary-300 text-text-600 uppercase tracking-wider text-[11px]">
                <th className="pb-3">Architectural Metric</th>
                <th className="pb-3 text-text-700">Sequential Shift Register</th>
                <th className="pb-3 text-primary-600 font-bold">Logarithmic Barrel Shifter (ShiftLab)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 text-text-800">
              <tr>
                <td className="py-3 font-bold text-text-950">Clock Latency</td>
                <td className="py-3 text-text-600">k Clock Cycles (Variable: 0 to 7)</td>
                <td className="py-3 font-bold text-primary-600">1 Clock Cycle O(1) Constant</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-text-950">Combinational Delay</td>
                <td className="py-3 text-text-600">k × t_flipflop</td>
                <td className="py-3 font-bold text-primary-600">⌈log₂ N⌉ × t_MUX (3 × t_MUX)</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-text-950">Multiplexer Gates</td>
                <td className="py-3 text-text-600">0 MUXes (Flip-flop daisy chain)</td>
                <td className="py-3 font-bold text-primary-600">N × ⌈log₂ N⌉ = 24 MUXes</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-text-950">Microprocessor Pipeline Impact</td>
                <td className="py-3 text-text-600">Introduces variable execution bubbles &amp; stalls</td>
                <td className="py-3 font-bold text-primary-600">Zero stalls; deterministic single-cycle execution</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-text-950">Operations Supported</td>
                <td className="py-3 text-text-600">Single direction shift only</td>
                <td className="py-3 font-bold text-primary-600">LSL, LSR, ASR, ROL, ROR seamlessly</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
