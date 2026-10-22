"use client"

import React, { useState } from "react"
import { animate, stagger } from "animejs"
import {
  MoveLeft,
  MoveRight,
  ChevronsRight,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { toBinary8, toHex8, computeShift, type ShiftOperation } from "@/lib/bitOps"
import "./ShiftLabTheme.css"

interface EmbeddedRegisterTabProps {
  regValue: number
  simValue: number
  onRegValueChange: (val: number) => void
  onNotify: (text: string, type?: "info" | "success") => void
}

const PRESETS = [
  { label: "LED Chaser (0x01)", val: 0x01 },
  { label: "CPU Flags (0x85)",  val: 0x85 },
  { label: "Alternating (0xAA)", val: 0xaa },
  { label: "All High (0xFF)",   val: 0xff },
]

const SHIFT_OPS: { op: ShiftOperation; label: string; icon: React.ElementType }[] = [
  { op: "LSL", label: "LSL (1)", icon: MoveLeft },
  { op: "LSR", label: "LSR (1)", icon: MoveRight },
  { op: "ASR", label: "ASR (1)", icon: ChevronsRight },
  { op: "ROL", label: "ROL (1)", icon: RotateCcw },
  { op: "ROR", label: "ROR (1)", icon: RotateCw },
]

export function EmbeddedRegisterTab({
  regValue,
  simValue,
  onRegValueChange,
  onNotify,
}: EmbeddedRegisterTabProps) {
  const inBin = toBinary8(regValue)
  const activePinsCount = inBin.split("").filter((b) => b === "1").length

  /* ── LED ripple animation ── */
  const triggerRipple = (direction: "left" | "right") => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    try {
      const targets =
        direction === "left"
          ? ".ert-led-dome"
          : Array.from(document.querySelectorAll(".ert-led-dome")).reverse()
      animate(targets, { scale: [1, 1.14, 1], duration: 240, delay: stagger(28), ease: "outQuad" })
    } catch (e) {
      console.error(e)
    }
  }

  const handleStep = (op: ShiftOperation) => {
    const next = computeShift(regValue, op, 1)
    onRegValueChange(next)
    triggerRipple(op === "LSL" || op === "ROL" ? "left" : "right")
    onNotify(`${op} (1): ${toHex8(regValue)} → ${toHex8(next)}`, "info")
  }

  const handleNot   = () => { const n = (~regValue) & 0xff; onRegValueChange(n); onNotify(`NOT: ${toHex8(regValue)} → ${toHex8(n)}`, "info") }
  const handleClear = () => { onRegValueChange(0x00); onNotify("CLR → 0x00", "info") }
  const handleSync  = () => { onRegValueChange(simValue); onNotify(`Synced from Simulator (${toHex8(simValue)})`, "success") }
  const handleToggle = (bit: number) => onRegValueChange(regValue ^ (1 << bit))

  return (
    <div className="sl-tab">

      {/* ── Header ── */}
      <div className="sl-section-header">
        <div>
          <h2 className="sl-section-title">Embedded Register &amp; Virtual LEDs</h2>
          <p className="sl-section-sub">
            8-bit microcontroller GPIO port simulation — AVR PORTB / ARM GPIO_ODR style register with real-time pin state control.
          </p>
        </div>
        <div className="sl-presets">
          <span className="sl-presets__label">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { onRegValueChange(p.val); onNotify(`Loaded: ${p.label}`, "info") }}
              className="sl-preset-btn"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="sl-main-grid" style={{ "--sl-grid-left": "7fr", "--sl-grid-right": "5fr" } as React.CSSProperties}>

        {/* ── Left: hardware board ── */}
        <div className="sl-panel">

          {/* PCB header bar */}
          <div className="sl-board-header">
            <div className="sl-board-id">
              <span className="sl-board-id__dot" />
              DEV-BOARD · GPIO PORTB (0x0025)
            </div>
            <span className="sl-vcc-badge">
              <span className="sl-vcc-badge__pulse" />
              VCC 3.3 V ACTIVE
            </span>
          </div>

          {/* LED array */}
          <div className="sl-led-array">
            <div className="sl-led-array__header">
              <span className="sl-led-array__title">Virtual LED Array</span>
              <span className="sl-led-array__hint">Click any LED to toggle pin state</span>
            </div>
            <div className="sl-led-grid">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                const isHigh = inBin[7 - bit] === "1"
                return (
                  <div key={bit} className="sl-led-col">
                    <span className="sl-led-col__label">LED {bit}</span>

                    <button
                      type="button"
                      onClick={() => handleToggle(bit)}
                      title={`Toggle LED ${bit}`}
                      className="sl-led-btn"
                    >
                      <div className="sl-led-bezel" />
                      <div className={`ert-led-dome sl-led-dome${isHigh ? " sl-led-dome--on" : ""}`}>
                        <div className="sl-led-dome__glare" />
                        {!isHigh && <div className="sl-led-dome__cathode" />}
                      </div>
                    </button>

                    <span className={`sl-led-col__bit${isHigh ? " sl-led-col__bit--on" : ""}`}>
                      {isHigh ? "1" : "0"}
                    </span>
                    <span className="sl-led-col__weight">{1 << bit}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Register readout */}
          <div className="sl-gpio-readout">
            <div className="sl-gpio-readout__cell">
              <div className="sl-gpio-readout__label">Binary [b7..b0]</div>
              <div className="sl-gpio-readout__value sl-gpio-readout__value--binary">{inBin}</div>
            </div>
            <div className="sl-gpio-readout__cell">
              <div className="sl-gpio-readout__label">Decimal</div>
              <div className="sl-gpio-readout__value sl-gpio-readout__value--decimal">{regValue}</div>
            </div>
            <div className="sl-gpio-readout__cell">
              <div className="sl-gpio-readout__label">Hex</div>
              <div className="sl-gpio-readout__value sl-gpio-readout__value--hex">{toHex8(regValue)}</div>
            </div>
            <div className="sl-gpio-readout__cell">
              <div className="sl-gpio-readout__label">Pins High</div>
              <div className="sl-gpio-readout__value">{activePinsCount} <span style={{ fontSize: "0.65rem", color: "var(--sl-muted)" }}>of 8</span></div>
            </div>
          </div>

          {/* Operation toolbar */}
          <div className="sl-toolbar">
            <div>
              <div className="sl-toolbar__label">Single-Step Shift &amp; Rotate</div>
              <div className="sl-toolbar__row sl-toolbar__row--5">
                {SHIFT_OPS.map(({ op, label, icon: Icon }) => (
                  <button key={op} onClick={() => handleStep(op)}>
                    <Icon style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="sl-toolbar__label">Register Utilities</div>
              <div className="sl-toolbar__row sl-toolbar__row--3">
                <button onClick={handleNot}>
                  <span style={{ fontFamily: "var(--sl-font-mono)", color: "var(--sl-preserved)", fontWeight: 800 }}>~</span>
                  NOT (Invert)
                </button>
                <button onClick={handleClear}>
                  <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                  CLR (0x00)
                </button>
                <button onClick={handleSync} className="sl-toolbar__sync">
                  <RefreshCw style={{ width: "0.875rem", height: "0.875rem" }} />
                  Sync Simulator
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: firmware panel ── */}
        <div className="sl-panel sl-panel--deep">
          <div className="sl-panel-header">Why Bit Manipulation Matters in Firmware</div>

          <div className="sl-firmware-points">
            <div className="sl-firmware-point">
              <div className="sl-firmware-point__num sl-firmware-point__num--1">1</div>
              <div>
                <strong className="sl-firmware-point__title">Hardware Control &amp; CPU Status Flags</strong>
                <p className="sl-firmware-point__body">
                  Microcontroller status registers (AVR SREG, ARM CCR) map single-bit flags for Zero (Z),
                  Negative (N), Carry (C). Shifts allow O(1) bit testing without branch-prediction stalls.
                </p>
              </div>
            </div>

            <div className="sl-firmware-point">
              <div className="sl-firmware-point__num sl-firmware-point__num--2">2</div>
              <div>
                <strong className="sl-firmware-point__title">Efficient Arithmetic by Powers of Two</strong>
                <p className="sl-firmware-point__body">
                  Logical Left Shift by n computes x × 2ⁿ. Arithmetic Right Shift computes ⌊x / 2ⁿ⌋
                  while preserving signed two's-complement values — in a single cycle, without ALU multiplier silicon.
                </p>
              </div>
            </div>

            <div className="sl-firmware-point">
              <div className="sl-firmware-point__num sl-firmware-point__num--3">3</div>
              <div>
                <strong className="sl-firmware-point__title">GPIO Pin Masking in C / Assembly</strong>
                <p className="sl-firmware-point__body">
                  Direct hardware register access uses bitwise shifts and masks to alter specific peripheral
                  output pins without disrupting neighboring lines.
                </p>
              </div>
            </div>
          </div>

          {/* Syntax-highlighted C code block */}
          <div className="sl-code-block">
            <div className="sl-code-block__bar">Embedded C · GPIO Port Operation</div>
            <pre>
              <code>
                <span className="c-comment">{"// Set Pin 3 High (atomic bit set)\n"}</span>
                <span className="c-reg">{"PORTB"}</span>
                <span className="c-op">{" |= ("}</span>
                <span className="c-num">{"1"}</span>
                <span className="c-op">{" << "}</span>
                <span className="c-num">{"3"}</span>
                <span className="c-op">{")"}</span>
                {";\n\n"}
                <span className="c-comment">{"// Clear Pin 3 Low (atomic bit clear)\n"}</span>
                <span className="c-reg">{"PORTB"}</span>
                <span className="c-op">{" &= ~("}</span>
                <span className="c-num">{"1"}</span>
                <span className="c-op">{" << "}</span>
                <span className="c-num">{"3"}</span>
                <span className="c-op">{")"}</span>
                {";\n\n"}
                <span className="c-comment">{"// Circular chaser rotate step\n"}</span>
                <span className="c-reg">{"PORTB"}</span>
                <span className="c-op">{" = ("}</span>
                <span className="c-reg">{"PORTB"}</span>
                <span className="c-op">{" << "}</span>
                <span className="c-num">{"1"}</span>
                <span className="c-op">{")"}</span>
                {" | ("}
                <span className="c-reg">{"PORTB"}</span>
                <span className="c-op">{" >> "}</span>
                <span className="c-num">{"7"}</span>
                <span className="c-op">{")"}</span>
                {";"}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
