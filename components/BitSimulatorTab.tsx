"use client"

import React, { useState, useEffect, useRef } from "react"
import { animate, stagger } from "animejs"
import {
  Play,
  RotateCcw,
  MoveLeft,
  MoveRight,
  ChevronsRight,
  RotateCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import {
  type ShiftOperation,
  clamp8,
  toBinary8,
  toHex8,
  computeShift,
  analyzeBitMovement,
  type AnalysisResult,
} from "@/lib/bitOps"
import "./ShiftLabTheme.css"

interface BitSimulatorTabProps {
  currentValue: number
  onValueChange: (val: number) => void
  onNotify: (text: string, type?: "info" | "success") => void
}

const OPERATIONS: {
  id: ShiftOperation
  label: string
  shortDesc: string
  icon: React.ElementType
}[] = [
  { id: "LSL", label: "LSL", shortDesc: "Logical Shift Left (<<): Discards bit 7, inserts 0 at bit 0. Multiplies by 2ⁿ.", icon: MoveLeft },
  { id: "LSR", label: "LSR", shortDesc: "Logical Shift Right (>>>): Discards bit 0, inserts 0 at bit 7. Divides by 2ⁿ.", icon: MoveRight },
  { id: "ASR", label: "ASR", shortDesc: "Arithmetic Shift Right (>>): Preserves bit 7 sign bit for signed two's-complement division.", icon: ChevronsRight },
  { id: "ROL", label: "ROL", shortDesc: "Rotate Left: Bits shifted off MSB wrap around to fill LSB — nothing lost.", icon: RotateCcw },
  { id: "ROR", label: "ROR", shortDesc: "Rotate Right: Bits shifted off LSB wrap around to fill MSB — nothing lost.", icon: RotateCw },
]

const PRESETS = [
  { label: "13 LSL 1 (26)",     val: 13,  op: "LSL" as ShiftOperation, amt: 1 },
  { label: "13 LSR 1 (6)",      val: 13,  op: "LSR" as ShiftOperation, amt: 1 },
  { label: "0x81 ROL 1 (3)",    val: 129, op: "ROL" as ShiftOperation, amt: 1 },
  { label: "0x80 ASR 1 (0xC0)", val: 128, op: "ASR" as ShiftOperation, amt: 1 },
]

function getFormula(operation: ShiftOperation, k: number, X: number, Y: number): string {
  const sup = (n: number) => (n === 1 ? "¹" : n === 2 ? "²" : n === 3 ? "³" : `^${n}`)
  if (k === 0) return `Y = X = ${X}  (No shift applied)`
  if (operation === "LSL") return `Y = (X ≪ ${k}) & 0xFF = (${X} × 2${sup(k)}) = ${Y}`
  if (operation === "LSR") return `Y = (X ≫ ${k}) & 0xFF = ⌊${X} / 2${sup(k)}⌋ = ${Y}`
  if (operation === "ASR") {
    const sx = X >= 128 ? X - 256 : X
    const sy = Y >= 128 ? Y - 256 : Y
    return `Y = (X ≫ ${k}) [sign-ext] = ⌊${sx} / 2${sup(k)}⌋ = ${sy}`
  }
  if (operation === "ROL") return `Y = ((X ≪ ${k}) | (X ≫ (8 − ${k}))) & 0xFF = ${Y}`
  if (operation === "ROR") return `Y = ((X ≫ ${k}) | (X ≪ (8 − ${k}))) & 0xFF = ${Y}`
  return `Y = ${Y}`
}

export function BitSimulatorTab({ currentValue, onValueChange, onNotify }: BitSimulatorTabProps) {
  const [operation, setOperation] = useState<ShiftOperation>("LSL")
  const [shiftAmount, setShiftAmount] = useState(1)
  const [analysis, setAnalysis] = useState<AnalysisResult>(() => analyzeBitMovement(currentValue, "LSL", 1))
  const [binaryText, setBinaryText] = useState(() => toBinary8(currentValue))
  const [isSimulating, setIsSimulating] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    setBinaryText(toBinary8(currentValue))
    setAnalysis(analyzeBitMovement(currentValue, operation, shiftAmount))
  }, [currentValue, operation, shiftAmount])

  const s0 = shiftAmount & 1 ? 1 : 0
  const s1 = shiftAmount & 2 ? 1 : 0
  const s2 = shiftAmount & 4 ? 1 : 0

  const handleToggleBit = (bitIndex: number) => onValueChange(currentValue ^ (1 << bitIndex))

  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10)
    if (!isNaN(raw)) onValueChange(clamp8(raw))
  }

  const handleBinaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^01]/g, "").slice(0, 8)
    setBinaryText(clean)
    if (clean.length === 8) onValueChange(clamp8(parseInt(clean, 2)))
  }

  const runSimulation = () => {
    setIsSimulating(true)
    const result = analyzeBitMovement(currentValue, operation, shiftAmount)
    setAnalysis(result)

    const reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!reducedMotion) {
      try {
        animate(".bssim-mapping-line", {
          strokeDashoffset: [200, 0],
          opacity: [0.2, 1],
          duration: 380,
          ease: "outQuad",
          delay: stagger(35),
        })
        animate(".bssim-output-cell", {
          scale: [0.88, 1],
          opacity: [0.5, 1],
          duration: 320,
          ease: "outQuad",
          delay: stagger(30),
        })
      } catch (err) {
        console.error("AnimeJS error:", err)
      }
    }

    onNotify(
      `Simulated ${operation} ${shiftAmount}: ${toBinary8(currentValue)} → ${result.outBin} (${result.outVal})`,
      "success"
    )
    setTimeout(() => setIsSimulating(false), 400)
  }

  const handleReset = () => {
    onValueChange(13)
    setOperation("LSL")
    setShiftAmount(1)
    onNotify("Bit simulator reset to default (13 LSL 1)", "info")
  }

  const inBin = toBinary8(currentValue)
  const outBin = analysis.outBin

  return (
    <div className="sl-tab">
      {/* ── Header ── */}
      <div className="sl-section-header">
        <div>
          <h2 className="sl-section-title">8-Bit Bit Manipulation Simulator</h2>
          <p className="sl-section-sub">
            Inspect exact bit transitions, sign extension, discarded overflow, and inserted padding bits.
          </p>
        </div>
        <div className="sl-presets">
          <span className="sl-presets__label">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { onValueChange(p.val); setOperation(p.op); setShiftAmount(p.amt); onNotify(`Applied: ${p.label}`, "info") }}
              className="sl-preset-btn"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main two-column grid ── */}
      <div className="sl-main-grid" style={{ "--sl-grid-left": "4fr", "--sl-grid-right": "7fr" } as React.CSSProperties}>

        {/* ── Left: controls ── */}
        <div className="sl-panel">
          <div className="sl-panel-header">Input Parameters</div>

          {/* Decimal + binary text inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            <div className="sl-field">
              <label htmlFor="bssim-dec" className="sl-field__label">Decimal (0 – 255)</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="bssim-dec"
                  type="number"
                  min="0"
                  max="255"
                  value={currentValue}
                  onChange={handleDecimalChange}
                  className="sl-field__input"
                />
                <div style={{ position: "absolute", right: "0.25rem", display: "flex", flexDirection: "column" }}>
                  <button
                    type="button"
                    onClick={() => onValueChange(clamp8(currentValue + 1))}
                    style={{ border: "none", background: "transparent", padding: "0.15rem", color: "var(--sl-muted)", cursor: "pointer" }}
                    title="Increment"
                  >
                    <ChevronUp style={{ width: "0.75rem", height: "0.75rem" }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onValueChange(clamp8(currentValue - 1))}
                    style={{ border: "none", background: "transparent", padding: "0.15rem", color: "var(--sl-muted)", cursor: "pointer" }}
                    title="Decrement"
                  >
                    <ChevronDown style={{ width: "0.75rem", height: "0.75rem" }} />
                  </button>
                </div>
              </div>
            </div>
            <div className="sl-field">
              <label htmlFor="bssim-bin" className="sl-field__label">8-Bit Binary</label>
              <input
                id="bssim-bin"
                type="text"
                maxLength={8}
                value={binaryText}
                onChange={handleBinaryChange}
                className="sl-field__input"
                placeholder="00000000"
              />
            </div>
          </div>

          {/* Operation selector */}
          <div>
            <div className="sl-field__label" style={{ marginBottom: "0.4rem" }}>Operation</div>
            <div className="sl-op-grid">
              {OPERATIONS.map((op) => {
                const Icon = op.icon
                return (
                  <button
                    key={op.id}
                    type="button"
                    aria-pressed={operation === op.id}
                    onClick={() => setOperation(op.id)}
                    className={`sl-op-btn${operation === op.id ? " sl-op-btn--active" : ""}`}
                  >
                    <Icon className="sl-op-btn__icon" />
                    {op.label}
                  </button>
                )
              })}
            </div>
            <p className="sl-op-desc">
              {OPERATIONS.find((op) => op.id === operation)?.shortDesc}
            </p>
          </div>

          {/* Shift amount */}
          <div className="sl-shift-area">
            <div className="sl-shift-area__header">
              <span className="sl-shift-area__label">Shift Amount (0 – 7)</span>
              <span className="sl-shift-area__k">
                k = {shiftAmount} &nbsp;·&nbsp; S₂S₁S₀ = {s2}{s1}{s0}
              </span>
            </div>
            <input
              id="bssim-shift-slider"
              type="range"
              min="0"
              max="7"
              value={shiftAmount}
              onChange={(e) => setShiftAmount(parseInt(e.target.value, 10))}
              className="sl-slider"
            />
            <div className="sl-k-grid">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setShiftAmount(n)}
                  className={`sl-k-btn${shiftAmount === n ? " sl-k-btn--active" : ""}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Simulate / Reset */}
          <div className="sl-action-bar">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="sl-btn-primary"
            >
              <Play style={{ width: "0.875rem", height: "0.875rem" }} />
              Simulate
            </button>
            <button onClick={handleReset} className="sl-btn-secondary">
              <RotateCcw style={{ width: "0.875rem", height: "0.875rem" }} />
              Reset
            </button>
          </div>
        </div>

        {/* ── Right: hero visualizer ── */}
        <div className="sl-panel sl-panel--deep">

          {/* Result readout */}
          <div className="sl-readout">
            <div className="sl-readout__grid">
              <div className="sl-readout__cell">
                <div className="sl-readout__label">Binary Output</div>
                <div className="sl-readout__value sl-readout__value--binary">{outBin}</div>
                <div className="sl-readout__sub">Was: {inBin}</div>
              </div>
              <div className="sl-readout__cell">
                <div className="sl-readout__label">Decimal</div>
                <div className="sl-readout__value sl-readout__value--decimal">{analysis.outVal}</div>
                <div className="sl-readout__sub">Was: {currentValue}</div>
              </div>
              <div className="sl-readout__cell">
                <div className="sl-readout__label">Hexadecimal</div>
                <div className="sl-readout__value sl-readout__value--hex">{toHex8(analysis.outVal)}</div>
                <div className="sl-readout__sub">Was: {toHex8(currentValue)}</div>
              </div>
            </div>
            <div className="sl-readout__formula">
              <span style={{ fontFamily: "var(--sl-font-mono)", fontSize: "0.7rem" }}>
                {getFormula(operation, shiftAmount, currentValue, analysis.outVal)}
              </span>
              <span className="sl-readout__formula-badge">8-bit unsigned [0..255]</span>
            </div>
          </div>

          {/* Interactive bit toggles */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span className="sl-field__label">Interactive Input Word</span>
              <span style={{ fontFamily: "var(--sl-font-mono)", fontSize: "0.62rem", color: "var(--sl-muted)" }}>
                MSB: Bit 7 &nbsp;·&nbsp; LSB: Bit 0 &nbsp;·&nbsp; Click to toggle
              </span>
            </div>
            <div className="sl-bit-row">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                const bitVal = inBin[7 - bitIdx]
                const isOne = bitVal === "1"
                const weight = 1 << bitIdx
                return (
                  <button
                    key={bitIdx}
                    type="button"
                    onClick={() => handleToggleBit(bitIdx)}
                    className={`sl-bit-cell${isOne ? " sl-bit-cell--on" : ""}`}
                  >
                    <span className="sl-bit-cell__index">B{bitIdx}</span>
                    <span className="sl-bit-cell__val">{bitVal}</span>
                    <span className="sl-bit-cell__weight">{weight}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bit-flow mapping canvas */}
          <div className="sl-flow-canvas">
            <div className="sl-flow-canvas__header">
              <span className="sl-flow-canvas__title">Bit Position Shift &amp; Boundary Mapping</span>
              <div className="sl-flow-legend">
                <span className="sl-flow-legend__item">
                  <span className="sl-flow-legend__dot sl-flow-legend__dot--preserved" />
                  Preserved / Wrapped
                </span>
                <span className="sl-flow-legend__item">
                  <span className="sl-flow-legend__dot sl-flow-legend__dot--inserted" />
                  Inserted (0 / sign)
                </span>
                <span className="sl-flow-legend__item">
                  <span className="sl-flow-legend__dot sl-flow-legend__dot--discarded" />
                  Discarded
                </span>
              </div>
            </div>

            {/* Source word row */}
            <div className="sl-bit-row">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                const val = inBin[7 - bitIdx]
                const isDiscarded = analysis.mappings[bitIdx] === -1
                return (
                  <div
                    key={bitIdx}
                    className={`sl-bit-cell${
                      isDiscarded
                        ? " sl-bit-cell--discarded"
                        : val === "1"
                        ? " sl-bit-cell--preserved"
                        : ""
                    }`}
                    style={{ cursor: "default", minHeight: "2.5rem" }}
                  >
                    <span className="sl-bit-cell__index">B{bitIdx}</span>
                    <span className="sl-bit-cell__val" style={{ fontSize: "1rem" }}>{val}</span>
                  </div>
                )
              })}
            </div>

            {/* SVG wires */}
            <div style={{ position: "relative", height: "5.5rem", width: "100%", margin: "0.5rem 0" }}>
              <svg
                ref={svgRef}
                style={{ width: "100%", height: "100%" }}
                viewBox="0 0 800 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="bssim-preservedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--sl-preserved)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--sl-preserved)" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="bssim-insertedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--sl-inserted)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--sl-inserted)" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="bssim-discardedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--sl-discarded)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--sl-discarded)" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {[7, 6, 5, 4, 3, 2, 1, 0].map((fromBit) => {
                  const toBit = analysis.mappings[fromBit]
                  const fromCol = 7 - fromBit
                  const startX = fromCol * 100 + 50
                  if (toBit === -1) {
                    const isLeft = operation === "LSL"
                    const endX = isLeft ? Math.max(0, startX - 80) : Math.min(800, startX + 80)
                    return (
                      <g key={`disc-${fromBit}`}>
                        <path
                          d={`M ${startX} 0 C ${startX} 40, ${endX} 60, ${endX} 95`}
                          fill="none"
                          stroke="url(#bssim-discardedGrad)"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                          className="bssim-mapping-line"
                        />
                        <circle cx={endX} cy={95} r="3" fill="var(--sl-discarded)" />
                      </g>
                    )
                  }
                  const toCol = 7 - toBit
                  const endX = toCol * 100 + 50
                  const isWrapped =
                    (operation === "ROL" && toBit < fromBit) ||
                    (operation === "ROR" && toBit > fromBit)
                  return (
                    <path
                      key={`map-${fromBit}-${toBit}`}
                      d={
                        isWrapped
                          ? `M ${startX} 0 C ${startX} 70, ${endX} 30, ${endX} 100`
                          : `M ${startX} 0 C ${startX} 50, ${endX} 50, ${endX} 100`
                      }
                      fill="none"
                      stroke="var(--sl-preserved)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="bssim-mapping-line"
                      style={{ opacity: 0.8 }}
                    />
                  )
                })}

                {analysis.insertedBits.map((ins) => {
                  const toCol = 7 - ins.bitIndex
                  const endX = toCol * 100 + 50
                  const startX = operation === "LSL" ? 780 : 20
                  return (
                    <g key={`ins-${ins.bitIndex}`}>
                      <path
                        d={`M ${startX} 15 C ${startX} 60, ${endX} 40, ${endX} 100`}
                        fill="none"
                        stroke="url(#bssim-insertedGrad)"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="bssim-mapping-line"
                      />
                      <circle cx={endX} cy={100} r="3" fill="var(--sl-inserted)" />
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Destination word row */}
            <div className="sl-bit-row">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                const val = outBin[7 - bitIdx]
                const isInserted = analysis.insertedIndices.includes(bitIdx)
                return (
                  <div
                    key={bitIdx}
                    className={`bssim-output-cell sl-bit-cell${
                      isInserted
                        ? " sl-bit-cell--inserted"
                        : val === "1"
                        ? " sl-bit-cell--preserved"
                        : ""
                    }`}
                    style={{ cursor: "default", minHeight: "2.5rem" }}
                  >
                    <span className="sl-bit-cell__index">B{bitIdx}</span>
                    <span className="sl-bit-cell__val" style={{ fontSize: "1rem" }}>{val}</span>
                  </div>
                )
              })}
            </div>

            {/* Chip row */}
            <div className="sl-chip-row">
              <span className="sl-chip-row__label">Inserted:</span>
              {analysis.insertedBits.length === 0
                ? <span className="sl-chip sl-chip--none">None</span>
                : analysis.insertedBits.map((b) => (
                    <span key={b.bitIndex} className="sl-chip sl-chip--inserted">
                      Bit {b.bitIndex} = {b.value} ({b.type})
                    </span>
                  ))}
              <span style={{ color: "var(--sl-border)" }}>•</span>
              <span className="sl-chip-row__label">Discarded:</span>
              {analysis.discardedBits.length === 0
                ? <span className="sl-chip sl-chip--none">None</span>
                : analysis.discardedBits.map((b) => (
                    <span key={b.bitIndex} className="sl-chip sl-chip--discarded">
                      Bit {b.bitIndex} ({b.value})
                    </span>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
