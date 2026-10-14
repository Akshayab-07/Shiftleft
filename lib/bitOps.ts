/**
 * Pure 8-bit bit manipulation operations for ShiftLab
 * MSB-first convention: Bit 7 is MSB (weight 128), Bit 0 is LSB (weight 1).
 */

export type ShiftOperation = 'LSL' | 'LSR' | 'ASR' | 'ROL' | 'ROR';

export interface BitMapping {
  fromBit: number; // 0..7
  toBit: number;   // 0..7, or -1 if discarded
  type: 'preserved' | 'wrapped' | 'discarded';
  val: '0' | '1';
}

export interface InsertedBit {
  bitIndex: number;
  value: '0' | '1';
  type: string;
}

export interface DiscardedBit {
  bitIndex: number;
  value: '0' | '1';
}

export interface AnalysisResult {
  outVal: number;
  outBin: string;
  mappings: number[]; // array of 8: mappings[i] is where bit i went (-1 if discarded)
  insertedIndices: number[];
  discardedBits: DiscardedBit[];
  insertedBits: InsertedBit[];
}

export interface HardwareStageComputation {
  s0: number; // 0 or 1
  s1: number; // 0 or 1
  s2: number; // 0 or 1
  inputBus: number;
  bus0: number;
  bus1: number;
  bus2: number;
  outputBus: number;
}

/**
 * Clamps any integer to valid 8-bit range [0, 255].
 */
export function clamp8(n: number): number {
  return ((n % 256) + 256) % 256;
}

/**
 * Converts an 8-bit value to an 8-character binary string (MSB at index 0, LSB at index 7).
 */
export function toBinary8(val: number): string {
  return clamp8(val).toString(2).padStart(8, '0');
}

/**
 * Converts an 8-bit value to 2-character hexadecimal format (e.g. 0x0D).
 */
export function toHex8(val: number): string {
  return '0x' + clamp8(val).toString(16).toUpperCase().padStart(2, '0');
}

/**
 * Pure 8-bit shift / rotate logic.
 */
export function computeShift(val: number, op: ShiftOperation, amt: number): number {
  const v = clamp8(val);
  const k = amt % 8;
  if (k === 0) return v;

  switch (op) {
    case 'LSL':
      // Logical Left Shift: Discard MSBs, insert 0 at LSB
      return (v << k) & 0xFF;

    case 'LSR':
      // Logical Right Shift: Discard LSBs, insert 0 at MSB
      return (v >>> k) & 0xFF;

    case 'ASR': {
      // Arithmetic Right Shift: Preserves Bit 7 (sign bit)
      // Javascript 32-bit sign extension by shifting left 24 then right arithmetic (24 + k)
      return ((v << 24) >> (24 + k)) & 0xFF;
    }

    case 'ROL':
      // Circular Left Rotation: Bits rotated off MSB re-enter LSB
      return ((v << k) | (v >>> (8 - k))) & 0xFF;

    case 'ROR':
      // Circular Right Rotation: Bits rotated off LSB re-enter MSB
      return ((v >>> k) | (v << (8 - k))) & 0xFF;

    default:
      return v;
  }
}

/**
 * Detailed bit movement analysis for animations and boundary tagging.
 */
export function analyzeBitMovement(val: number, op: ShiftOperation, amt: number): AnalysisResult {
  const v = clamp8(val);
  const k = amt % 8;
  const inBin = toBinary8(v);
  const outVal = computeShift(v, op, k);
  const outBin = toBinary8(outVal);

  const mappings: number[] = Array(8).fill(-1);
  const insertedIndices: number[] = [];
  const discardedBits: DiscardedBit[] = [];
  const insertedBits: InsertedBit[] = [];

  const getBit = (str: string, bitIdx: number): '0' | '1' => (str.charAt(7 - bitIdx) as '0' | '1');

  if (k === 0) {
    for (let i = 0; i < 8; i++) {
      mappings[i] = i;
    }
    return { outVal, outBin, mappings, insertedIndices, discardedBits, insertedBits };
  }

  if (op === 'LSL') {
    // Bits move from i to i + k
    for (let i = 0; i < 8; i++) {
      const dest = i + k;
      if (dest < 8) {
        mappings[i] = dest;
      } else {
        discardedBits.push({ bitIndex: i, value: getBit(inBin, i) });
      }
    }
    for (let j = 0; j < k; j++) {
      insertedIndices.push(j);
      insertedBits.push({ bitIndex: j, value: '0', type: 'Zero Pad' });
    }
  } else if (op === 'LSR') {
    // Bits move from i to i - k
    for (let i = 0; i < 8; i++) {
      const dest = i - k;
      if (dest >= 0) {
        mappings[i] = dest;
      } else {
        discardedBits.push({ bitIndex: i, value: getBit(inBin, i) });
      }
    }
    for (let j = 7; j >= 8 - k; j--) {
      insertedIndices.push(j);
      insertedBits.push({ bitIndex: j, value: '0', type: 'Zero Pad' });
    }
  } else if (op === 'ASR') {
    const signBit = getBit(inBin, 7);
    for (let i = 0; i < 8; i++) {
      const dest = i - k;
      if (dest >= 0) {
        mappings[i] = dest;
      } else {
        discardedBits.push({ bitIndex: i, value: getBit(inBin, i) });
      }
    }
    for (let j = 7; j >= 8 - k; j--) {
      insertedIndices.push(j);
      insertedBits.push({ bitIndex: j, value: signBit, type: 'Sign Bit (B7)' });
    }
  } else if (op === 'ROL') {
    // Circular Left: bit i moves to (i + k) % 8
    for (let i = 0; i < 8; i++) {
      mappings[i] = (i + k) % 8;
    }
    for (let j = 0; j < k; j++) {
      const sourceBit = 7 - (k - 1 - j);
      insertedBits.push({ bitIndex: j, value: getBit(inBin, sourceBit), type: `Wrapped from B${sourceBit}` });
    }
  } else if (op === 'ROR') {
    // Circular Right: bit i moves to (i - k + 8) % 8
    for (let i = 0; i < 8; i++) {
      mappings[i] = (i - k + 8) % 8;
    }
    for (let j = 7; j >= 8 - k; j--) {
      const sourceBit = 7 - j;
      insertedBits.push({ bitIndex: j, value: getBit(inBin, sourceBit), type: `Wrapped from B${sourceBit}` });
    }
  }

  return { outVal, outBin, mappings, insertedIndices, discardedBits, insertedBits };
}

/**
 * Computes 3-stage logarithmic barrel shifter intermediate states.
 * Shift count k = S2*4 + S1*2 + S0*1
 */
export function computeHardwareStages(val: number, op: ShiftOperation, amt: number): HardwareStageComputation {
  const k = amt % 8;
  const s0 = (k & 1) ? 1 : 0;
  const s1 = (k & 2) ? 1 : 0;
  const s2 = (k & 4) ? 1 : 0;

  // Stage 0: Shift by 1 if s0 active
  const bus0 = s0 ? computeShift(val, op, 1) : val;

  // Stage 1: Shift by 2 if s1 active
  const bus1 = s1 ? computeShift(bus0, op, 2) : bus0;

  // Stage 2: Shift by 4 if s2 active
  const bus2 = s2 ? computeShift(bus1, op, 4) : bus1;

  return {
    s0,
    s1,
    s2,
    inputBus: val,
    bus0,
    bus1,
    bus2,
    outputBus: bus2
  };
}
