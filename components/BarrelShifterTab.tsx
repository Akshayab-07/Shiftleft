"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play, RotateCcw, Shuffle, StepBack, StepForward } from "lucide-react"
import {
  type ShiftOperation,
  type SimulationStage,
  type SimulationTrace,
  clamp8,
  simulate,
  toBinary8,
  toHex8,
} from "@/lib/bitOps"
import "./ShiftLabTheme.css"
import "./BarrelShifterTab.css"

/* ─────────────────────────────────────── types ── */
interface BarrelShifterTabProps {
  currentValue: number
  onValueChange: (value: number) => void
  onNotify: (text: string, type?: "info" | "success") => void
}
type InputKind = "binary" | "hex" | "unsigned" | "signed"
type HistoryEntry = { input: number; operation: ShiftOperation; k: number; output: number }
type LabTheme = "bench" | "datasheet" | "blueprint"

const OPERATIONS: ShiftOperation[] = ["LSL", "LSR", "ASR", "ROL", "ROR"]

/* ─────────────────────────────────────── helpers ── */
function signed8(value: number) {
  return value >= 128 ? value - 256 : value
}
function values(value: number) {
  return {
    binary: toBinary8(value),
    hex: toHex8(value),
    unsigned: String(value),
    signed: String(signed8(value)),
  }
}
function parseInput(kind: InputKind, raw: string): number | null {
  if (!raw.trim()) return null
  if (kind === "binary") return /^[01]{8}$/.test(raw) ? parseInt(raw, 2) : null
  if (kind === "hex")
    return /^(?:0x)?[0-9a-fA-F]{1,2}$/.test(raw)
      ? parseInt(raw.replace(/^0x/i, ""), 16)
      : null
  if (!/^-?\d+$/.test(raw)) return null
  const value = Number(raw)
  if (kind === "signed") return value >= -128 && value <= 127 ? (value < 0 ? value + 256 : value) : null
  return value >= 0 && value <= 255 ? value : null
}

/* ─────────────────────────────────────── sub-components ── */

function Bus({ value, label }: { value: number; label: string }) {
  return (
    <div className="bst-bus">
      <div className="bst-bus__label">{label}</div>
      <div className="bst-bus__binary">{toBinary8(value)}</div>
      <div className="bst-bus__meta">
        {toHex8(value)} &nbsp;/&nbsp; {value}u &nbsp;/&nbsp; {signed8(value)}s
      </div>
    </div>
  )
}

function MuxCell({
  bit,
  stage,
  highlighted,
}: {
  bit: number
  stage: SimulationStage
  highlighted: boolean
}) {
  const mux = stage.muxes[bit]
  return (
    <div className={`bst-mux-cell${highlighted ? " bst-mux-cell--active" : ""}`}>
      <div className="bst-mux-cell__title">MUX {bit}</div>
      <div className="bst-mux-cell__row">
        <span className="bst-mux-cell__label">in</span>
        <span className="bst-mux-cell__val">{mux.unchanged}</span>
      </div>
      <div className="bst-mux-cell__row">
        <span className="bst-mux-cell__label">sh</span>
        <span className="bst-mux-cell__val">{mux.shifted}</span>
      </div>
      <div className="bst-mux-cell__select">
        S{stage.index}={mux.select} → <strong>{mux.output}</strong>
      </div>
      <div className="bst-mux-cell__source">
        {mux.sourceBit === null ? "fill" : `from b${mux.sourceBit}`}
      </div>
    </div>
  )
}

function StageCard({
  stage,
  highlightedBit,
}: {
  stage: SimulationStage
  highlightedBit: number | null
}) {
  const active = stage.select === 1
  return (
    <section className={`bst-stage${active ? " bst-stage--active" : ""}`}>
      {/* Stage header */}
      <div className="bst-stage__header">
        <div className="bst-stage__header-left">
          <span className="bst-stage__badge">Stage {stage.index}</span>
          <span className="bst-stage__distance">distance {stage.distance}</span>
        </div>
        <div className="bst-stage__header-right">
          <span className={`bst-stage__status${active ? " bst-stage__status--on" : ""}`}>
            S{stage.index} = {stage.select}&nbsp;
            {active ? "▶ shift" : "◼ pass"}
          </span>
          <span className="bst-stage__candidate">
            candidate&nbsp;
            <code>{toBinary8(stage.candidateBus)}</code>
          </span>
        </div>
      </div>

      {/* Bus row */}
      <div className="bst-stage__buses">
        <Bus value={stage.inputBus} label="Input bus" />
        <div className="bst-stage__arrow">→</div>
        <Bus value={stage.outputBus} label="Output bus" />
        <div className="bst-stage__mux-rule">
          <div className="bst-stage__mux-rule-label">MUX rule</div>
          <code>Y[i] = S ? shifted : input</code>
          <div className="bst-stage__mux-rule-sub">8 × 2:1 multiplexers</div>
        </div>
      </div>

      {/* MUX grid */}
      <div className="bst-mux-grid">
        {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => (
          <MuxCell
            key={bit}
            bit={bit}
            stage={stage}
            highlighted={highlightedBit === bit}
          />
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────── main tab ── */
export function BarrelShifterTab({
  currentValue,
  onValueChange,
  onNotify,
}: BarrelShifterTabProps) {
  const [operation, setOperation] = useState<ShiftOperation>("LSL")
  const [shiftAmount, setShiftAmount] = useState(1)
  const [drafts, setDrafts] = useState(() => values(currentValue))
  const [inputError, setInputError] = useState("")
  const [urlError, setUrlError] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activeStage, setActiveStage] = useState(-1)
  const [highlightedBit, setHighlightedBit] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [theme, setTheme] = useState<LabTheme>("bench")
  const lastHistoryKey = useRef("")

  const trace: SimulationTrace = simulate(currentValue, operation, shiftAmount)
  const output = trace.finalOutput
  const outputValues = values(output)

  /* ── URL state restore ── */
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const raw = params.get("v")
    const op = params.get("op") as ShiftOperation | null
    const rawK = params.get("k")
    if (raw === null && op === null && rawK === null) return
    const parsed = raw && /^[01]{8}$/.test(raw) ? parseInt(raw, 2) : null
    const parsedK = rawK === null ? null : Number(rawK)
    if (
      parsed === null ||
      (op !== null && !OPERATIONS.includes(op)) ||
      parsedK === null ||
      !Number.isInteger(parsedK) ||
      parsedK < 0 ||
      parsedK > 7
    ) {
      window.setTimeout(() => setUrlError("The URL state is invalid; the current valid input was kept."), 0)
      return
    }
    window.setTimeout(() => {
      onValueChange(parsed)
      if (op) setOperation(op)
      setShiftAmount(parsedK)
    }, 0)
  }, [onValueChange])

  /* ── history + URL sync ── */
  useEffect(() => {
    const key = `${currentValue}:${operation}:${shiftAmount}`
    if (lastHistoryKey.current === key) return
    lastHistoryKey.current = key
    setHistory((previous) =>
      [{ input: currentValue, operation, k: shiftAmount, output }, ...previous].slice(0, 12)
    )
    if (typeof window !== "undefined") {
      const params = new URLSearchParams({
        v: toBinary8(currentValue),
        op: operation,
        k: String(shiftAmount),
      })
      window.history.replaceState(null, "", `${window.location.pathname}?${params}`)
    }
  }, [currentValue, operation, shiftAmount, output])

  /* ── animation playback ── */
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(
      () => setActiveStage((stage) => (stage >= 2 ? -1 : stage + 1)),
      850
    )
    return () => window.clearInterval(timer)
  }, [playing])

  /* ── value helpers ── */
  const setValue = (value: number) => {
    const normalized = clamp8(value)
    setInputError("")
    setDrafts(values(normalized))
    onValueChange(normalized)
  }

  const updateInput = (kind: InputKind, raw: string) => {
    setDrafts((previous) => ({ ...previous, [kind]: raw }))
    const parsed = parseInput(kind, raw)
    if (parsed === null) {
      setInputError(
        kind === "binary"
          ? "Binary input must contain exactly 8 characters, only 0 or 1."
          : kind === "hex"
          ? "Hex input must be 00 through FF."
          : kind === "signed"
          ? "Signed decimal must be -128 through 127."
          : "Unsigned decimal must be 0 through 255."
      )
      return
    }
    setInputError("")
    setDrafts(values(parsed))
    onValueChange(parsed)
  }

  const reset = () => {
    setValue(0xb2)
    setOperation("LSL")
    setShiftAmount(1)
    setActiveStage(-1)
    onNotify("Barrel shifter reset", "info")
  }

  /* ─────────── render ─────────── */
  return (
    <div className="bst-lab" data-theme={theme} aria-live="polite">

      {/* ── Theme picker ── */}
      <div className="bst-theme-bar">
        <span className="bst-theme-bar__label">Panel finish</span>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as LabTheme)}
          aria-label="Panel finish"
          className="bst-theme-bar__select"
        >
          <option value="bench">Bench instrument</option>
          <option value="datasheet">Datasheet brutalist</option>
          <option value="blueprint">Blueprint schematic</option>
        </select>
      </div>

      {/* ── Page header ── */}
      <header className="bst-header">
        <div className="bst-header__text">
          <h2 className="bst-header__title">Interactive 8-Bit Barrel Shifter</h2>
          <p className="bst-header__sub">
            A logical MUX simulation: values computed combinationally,{" "}
            not measured as transistor propagation delays.
          </p>
        </div>
        <div className="bst-header__actions">
          <button type="button" onClick={() => setValue(Math.floor(Math.random() * 256))}>
            <Shuffle className="bst-icon" />
            Random
          </button>
          <button type="button" onClick={() => setValue(0)}>Clear</button>
          <button type="button" onClick={() => setValue(255)}>Fill</button>
          <button type="button" onClick={() => setValue(~currentValue)}>Invert</button>
          <button type="button" onClick={reset}>
            <RotateCcw className="bst-icon" />
            Reset
          </button>
        </div>
      </header>

      {/* ── Config panel (inputs + encoding) ── */}
      <div className="bst-config-panel">

        {/* Left: all inputs */}
        <div className="bst-config-panel__inputs">

          {/* Format inputs grid */}
          <div className="bst-input-grid">
            {(["binary", "hex", "unsigned", "signed"] as InputKind[]).map((kind) => (
              <label key={kind} className="bst-input-field">
                <span className="bst-input-field__label">
                  {kind === "binary"
                    ? "Binary (8 bits)"
                    : kind === "hex"
                    ? "Hex (00 – FF)"
                    : kind === "unsigned"
                    ? "Unsigned (0 – 255)"
                    : "Signed two's complement (−128..127)"}
                </span>
                <input
                  aria-label={kind}
                  value={drafts[kind]}
                  onChange={(e) => updateInput(kind, e.target.value)}
                  className="bst-input-field__control"
                />
              </label>
            ))}
          </div>

          {/* Bit toggles */}
          <div className="bst-bit-toggles" aria-label="Input bits">
            <span className="bst-bit-toggles__label">D[7:0]</span>
            <div className="bst-bit-toggles__row">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                const on = ((currentValue >>> bit) & 1) === 1
                return (
                  <button
                    key={bit}
                    type="button"
                    aria-label={`Toggle input bit ${bit}`}
                    aria-pressed={on}
                    onClick={() => setValue(currentValue ^ (1 << bit))}
                    className={`bst-bit-btn${on ? " bst-bit-btn--on" : ""}`}
                  >
                    <span className="bst-bit-btn__index">b{bit}</span>
                    <span className="bst-bit-btn__val">{on ? "1" : "0"}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Operation selector */}
          <div className="bst-op-row" role="group" aria-label="Operation">
            <span className="bst-op-row__label">Operation</span>
            {OPERATIONS.map((op) => (
              <button
                key={op}
                type="button"
                aria-pressed={operation === op}
                onClick={() => setOperation(op)}
                className={`bst-op-btn${operation === op ? " bst-op-btn--selected" : ""}`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Shift amount */}
          <div className="bst-shift-row">
            <label htmlFor="barrel-shift-slider" className="bst-shift-row__label">
              Shift amount &nbsp;<strong>k = {shiftAmount}</strong>
            </label>
            <div className="bst-shift-row__controls">
              <input
                id="barrel-shift-slider"
                type="range"
                min="0"
                max="7"
                value={shiftAmount}
                onChange={(e) => setShiftAmount(Number(e.target.value))}
                className="bst-slider"
              />
              <input
                aria-label="Shift amount number"
                type="number"
                min="0"
                max="7"
                value={shiftAmount}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  if (Number.isInteger(next) && next >= 0 && next <= 7) setShiftAmount(next)
                }}
                className="bst-shift-row__number"
              />
            </div>
          </div>

          {(inputError || urlError) && (
            <p role="alert" className="bst-error">
              {inputError || urlError}
            </p>
          )}
        </div>

        {/* Right: control encoding panel */}
        <div className="bst-encoding-panel">
          <div className="bst-encoding-panel__header">Control encoding</div>
          <div className="bst-encoding-panel__main">
            k = {trace.k} &nbsp;→&nbsp; S2 S1 S0
          </div>
          <div className="bst-encoding-panel__bits">
            {(["s2", "s1", "s0"] as const).map((s, i) => (
              <div
                key={s}
                className={`bst-encoding-bit${trace.controls[s] ? " bst-encoding-bit--active" : ""}`}
              >
                <span className="bst-encoding-bit__name">S{2 - i}</span>
                <span className="bst-encoding-bit__val">{trace.controls[s]}</span>
                <span className="bst-encoding-bit__dist">×{[4, 2, 1][i]}</span>
              </div>
            ))}
          </div>
          <p className="bst-encoding-panel__note">
            Stage order: S0 → S1 → S2. A disabled stage passes its bus unchanged.
          </p>
        </div>
      </div>

      {/* ── Signal flow + sidebar ── */}
      <div className="bst-lower">

        {/* Signal flow panel */}
        <div className="bst-flow-panel">

          {/* Flow header with playback */}
          <div className="bst-flow-panel__header">
            <h3 className="bst-flow-panel__title">Signal flow &nbsp; D[7:0] → Y[7:0]</h3>
            <div className="bst-playback">
              <button
                type="button"
                aria-label="Previous stage"
                onClick={() => setActiveStage((s) => (s <= -1 ? 2 : s - 1))}
              >
                <StepBack className="bst-icon" />
              </button>
              <button
                type="button"
                aria-label="Next stage"
                onClick={() => setActiveStage((s) => (s >= 2 ? -1 : s + 1))}
              >
                <StepForward className="bst-icon" />
              </button>
              <button
                type="button"
                onClick={() => { setActiveStage(-1); setPlaying(false) }}
              >
                Replay
              </button>
              <button
                type="button"
                aria-label={playing ? "Pause animation" : "Play animation"}
                onClick={() => setPlaying((v) => !v)}
                className={playing ? "bst-playback__btn--playing" : ""}
              >
                {playing ? <Pause className="bst-icon" /> : <Play className="bst-icon" />}
              </button>
            </div>
          </div>

          {/* D / Y overview */}
          <div className="bst-io-row">
            <Bus value={trace.input} label="D — input" />
            <div className="bst-io-row__arrow">⟶</div>
            <Bus value={output} label="Y — output" />
          </div>

          {/* Stage cards */}
          <div className="bst-stages">
            {trace.stages.map((stage) => (
              <div
                key={stage.index}
                className={
                  activeStage === -1 || activeStage === stage.index
                    ? "bst-stage-wrapper"
                    : "bst-stage-wrapper bst-stage-wrapper--dimmed"
                }
              >
                <StageCard stage={stage} highlightedBit={highlightedBit} />
              </div>
            ))}
          </div>

          {/* Bit-path highlight row */}
          <div className="bst-highlight-row" aria-label="Trace bit path selector">
            <span className="bst-highlight-row__label">Highlight path:</span>
            {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => (
              <button
                key={bit}
                type="button"
                onClick={() => setHighlightedBit(highlightedBit === bit ? null : bit)}
                className={`bst-highlight-btn${highlightedBit === bit ? " bst-highlight-btn--active" : ""}`}
              >
                B{bit}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="bst-sidebar">

          {/* Computed output */}
          <div className="bst-sidebar__card bst-sidebar__card--output">
            <h3 className="bst-sidebar__card-title">Computed output</h3>
            <div className="bst-output-binary">{outputValues.binary}</div>
            <div className="bst-output-meta">
              <span>{outputValues.hex}</span>
              <span>{outputValues.unsigned}u</span>
              <span>{outputValues.signed}s</span>
            </div>
            <button
              type="button"
              onClick={() => setValue(output)}
              className="bst-chain-btn"
            >
              Chain output → input
            </button>
          </div>

          {/* Virtual GPIO */}
          <div className="bst-sidebar__card">
            <h3 className="bst-sidebar__card-title">Virtual GPIO output</h3>
            <p className="bst-sidebar__card-sub">
              Browser-only register simulation, derived from Y[7:0].
            </p>
            <div className="bst-leds">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                const on = ((output >>> bit) & 1) === 1
                return (
                  <div key={bit} className="bst-led-col">
                    <div className={`bst-led${on ? " bst-led--on" : ""}`} />
                    <div className="bst-led-label">
                      P{bit}
                      <br />
                      {on ? "1" : "0"}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="bst-gpio-reg">
              GPIO_ODR = {toHex8(output)} ({toBinary8(output)})
            </div>
          </div>

          {/* Run history */}
          <div className="bst-sidebar__card">
            <h3 className="bst-sidebar__card-title">Run history</h3>
            <div className="bst-history">
              {history.length === 0 && (
                <p className="bst-history__empty">No history yet.</p>
              )}
              {history.map((entry, index) => (
                <button
                  key={`${entry.input}-${entry.operation}-${entry.k}-${index}`}
                  type="button"
                  onClick={() => {
                    setValue(entry.input)
                    setOperation(entry.operation)
                    setShiftAmount(entry.k)
                  }}
                  className="bst-history__entry"
                >
                  <span className="bst-history__entry-input">
                    {toBinary8(entry.input)} {entry.operation} {entry.k}
                  </span>
                  <span className="bst-history__entry-arrow">→</span>
                  <span className="bst-history__entry-output">
                    {toBinary8(entry.output)}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}