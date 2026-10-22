import assert from "node:assert/strict"
import { test } from "node:test"
import { simulate, toBinary8, type ShiftOperation } from "@/lib/bitOps"

const operations: ShiftOperation[] = ["LSL", "LSR", "ASR", "ROL", "ROR"]

function reference(input: number, operation: ShiftOperation, k: number): number {
  const value = input & 0xff
  if (k === 0) return value
  if (operation === "LSL") return (value << k) & 0xff
  if (operation === "LSR") return value >>> k
  if (operation === "ASR") return (value & 0x80 ? value - 256 : value) >> k & 0xff
  if (operation === "ROL") return ((value << k) | (value >>> (8 - k))) & 0xff
  return ((value >>> k) | (value << (8 - k))) & 0xff
}

test("regression vectors match the three-stage MUX trace", () => {
  const vectors: [string, ShiftOperation, number, string][] = [
    ["10110010", "LSL", 0, "10110010"], ["10110010", "LSL", 1, "01100100"],
    ["10110010", "LSL", 2, "11001000"], ["10110010", "LSL", 5, "01000000"],
    ["10110010", "LSR", 1, "01011001"], ["10110010", "LSR", 2, "00101100"],
    ["10110010", "ASR", 1, "11011001"], ["10110010", "ASR", 2, "11101100"],
    ["00110010", "ASR", 2, "00001100"], ["10110010", "ROL", 1, "01100101"],
    ["10110010", "ROL", 2, "11001010"], ["10110011", "ROR", 1, "11011001"],
    ["10110010", "ROR", 2, "10101100"], ["11111111", "LSL", 1, "11111110"],
    ["11111111", "LSR", 1, "01111111"], ["00000001", "LSL", 7, "10000000"],
    ["10000000", "LSR", 7, "00000001"], ["10000000", "ASR", 7, "11111111"],
    ["00000001", "ROL", 1, "00000010"], ["10000000", "ROL", 1, "00000001"],
    ["00000001", "ROR", 1, "10000000"], ["00000000", "ROR", 7, "00000000"],
  ]
  for (const [binary, operation, k, expected] of vectors) assert.equal(toBinary8(simulate(parseInt(binary, 2), operation, k).finalOutput), expected)
})

test("all 10,240 inputs match an independent arithmetic reference and preserve stage invariants", () => {
  for (let input = 0; input < 256; input += 1) for (const operation of operations) for (let k = 0; k < 8; k += 1) {
    const trace = simulate(input, operation, k)
    assert.equal(trace.finalOutput, reference(input, operation, k))
    assert.deepEqual(trace.controls, { s0: k & 1 ? 1 : 0, s1: k & 2 ? 1 : 0, s2: k & 4 ? 1 : 0 })
    assert.equal(trace.stages[0].inputBus, input)
    assert.equal(trace.stages[1].inputBus, trace.stages[0].outputBus)
    assert.equal(trace.stages[2].inputBus, trace.stages[1].outputBus)
    assert.equal(trace.stages[2].outputBus, trace.finalOutput)
    for (const stage of trace.stages) {
      assert.equal(stage.muxes.reduce((sum, mux) => sum | (mux.output << mux.bit), 0), stage.outputBus)
      if (stage.select === 0) assert.equal(stage.outputBus, stage.inputBus)
    }
    if (operation === "ROL" || operation === "ROR") assert.equal(trace.finalOutput.toString(2).split("1").length, input.toString(2).split("1").length)
  }
})

test("invalid shift amounts are rejected", () => {
  for (const k of [-1, 8, Number.NaN, 1.5]) assert.throws(() => simulate(0, "LSL", k), RangeError)
})