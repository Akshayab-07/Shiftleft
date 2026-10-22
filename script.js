/**
 * ShiftLab — A Visual Barrel Shifter & Bit Manipulation Simulator
 * Computer Organization & Architecture Project
 * 
 * Features:
 * 1. Interactive 8-Bit Manipulation Simulator (LSL, LSR, ASR, ROL, ROR)
 * 2. 3-Stage Logarithmic Barrel Shifter Hardware Architecture Visualization
 * 3. Embedded-Device 8-Bit Register & Virtual LED Simulator
 */

'use strict';

// =====================================================================
// GLOBAL STATE & DATA STRUCTURES
// =====================================================================
const state = {
  // Simulator State
  simValue: 13,          // Default decimal 13 (00001101)
  simOperation: 'LSL',   // 'LSL', 'LSR', 'ASR', 'ROL', 'ROR'
  simShiftAmt: 1,        // 0 to 7
  
  // Register / Embedded State
  regValue: 13,          // Default synced to 13
  
  // Active Navigation Tab
  currentTab: 'section-simulator',

  // Animation Step tracker for Hardware
  hwStepCurrent: -1,
  hwStepInterval: null
};

// =====================================================================
// PURE BIT MANIPULATION LOGIC (8-BIT CONSTRAINED)
// =====================================================================

/**
 * Ensures a number stays strictly within the 8-bit unsigned range [0, 255].
 * @param {number} n 
 * @returns {number} 8-bit clamped integer
 */
function clamp8(n) {
  return ((n % 256) + 256) % 256;
}

/**
 * Converts an integer to an 8-character binary string (MSB to LSB).
 * @param {number} val 
 * @returns {string} 8-character string, e.g. "00001101"
 */
function toBinary8(val) {
  return clamp8(val).toString(2).padStart(8, '0');
}

/**
 * Converts an integer to a 2-character hex string prefixed with 0x.
 * @param {number} val 
 * @returns {string} e.g. "0x0D"
 */
function toHex8(val) {
  return '0x' + clamp8(val).toString(16).toUpperCase().padStart(2, '0');
}

/**
 * Executes an 8-bit shift or rotation.
 * 
 * Mathematical properties:
 * - LSL: (val << amt) & 0xFF
 * - LSR: (val >>> amt) & 0xFF
 * - ASR: sign-extended right shift preserving Bit 7
 * - ROL: circular left rotation
 * - ROR: circular right rotation
 * 
 * @param {number} val Input value (0-255)
 * @param {string} op Operation ('LSL', 'LSR', 'ASR', 'ROL', 'ROR')
 * @param {number} amt Shift amount (0-7)
 * @returns {number} Resulting 8-bit value (0-255)
 */
function computeShift(val, op, amt) {
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
 * Detailed breakdown of bit movements, insertions, and discards for visualization.
 * Returns an object with:
 * - mappings: array of 8 integers indicating where bit i goes (-1 if discarded)
 * - insertedIndices: array of output bit indices that received new/padded values
 * - discardedBits: array of objects { bitIndex, value } that were dropped
 * - insertedBits: array of objects { bitIndex, value, type }
 */
function analyzeBitMovement(val, op, amt) {
  const v = clamp8(val);
  const k = amt % 8;
  const inBin = toBinary8(v);
  const outVal = computeShift(v, op, k);
  const outBin = toBinary8(outVal);

  const mappings = Array(8).fill(-1);
  const insertedIndices = [];
  const discardedBits = [];
  const insertedBits = [];

  // Note: in 8-bit binary, index 7 is MSB (leftmost) and index 0 is LSB (rightmost)
  // in string inBin[0] = Bit 7, inBin[7] = Bit 0
  const getBit = (str, bitIdx) => str.charAt(7 - bitIdx);

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
      insertedBits.push({ bitIndex: j, value: signBit, type: 'Sign Bit (Bit 7)' });
    }
  } else if (op === 'ROL') {
    // Circular Left: bit i moves to (i + k) % 8
    for (let i = 0; i < 8; i++) {
      mappings[i] = (i + k) % 8;
    }
    // No bits discarded; wrapped bits marked for clarity
    for (let j = 0; j < k; j++) {
      const sourceBit = 7 - (k - 1 - j);
      insertedBits.push({ bitIndex: j, value: getBit(inBin, sourceBit), type: `Wrapped from Bit ${sourceBit}` });
    }
  } else if (op === 'ROR') {
    // Circular Right: bit i moves to (i - k + 8) % 8
    for (let i = 0; i < 8; i++) {
      mappings[i] = (i - k + 8) % 8;
    }
    for (let j = 7; j >= 8 - k; j--) {
      const sourceBit = 7 - j;
      insertedBits.push({ bitIndex: j, value: getBit(inBin, sourceBit), type: `Wrapped from Bit ${sourceBit}` });
    }
  }

  return { outVal, outBin, mappings, insertedIndices, discardedBits, insertedBits };
}

// =====================================================================
// UI LOGIC: FEATURE 1 (BIT MANIPULATION SIMULATOR)
// =====================================================================

function initSimulator() {
  const decInput = document.getElementById('decInput');
  const binInput = document.getElementById('binInput');
  const decIncBtn = document.getElementById('decIncBtn');
  const decDecBtn = document.getElementById('decDecBtn');
  const opSelect = document.getElementById('operationSelect');
  const shiftSlider = document.getElementById('shiftAmtSlider');
  const simulateBtn = document.getElementById('simulateBtn');
  const resetBtn = document.getElementById('resetSimBtn');
  const quickAmtBtns = document.querySelectorAll('.btn-amt');
  const presetPills = document.querySelectorAll('.quick-presets .preset-pill');

  // Decimal Input Handler
  decInput.addEventListener('input', () => {
    let raw = parseInt(decInput.value, 10);
    if (isNaN(raw)) raw = 0;
    if (raw < 0) raw = 0;
    if (raw > 255) raw = 255;
    state.simValue = raw;
    syncSimInputsFromVal();
    runSimulation();
  });

  decIncBtn.addEventListener('click', () => {
    state.simValue = (state.simValue + 1) % 256;
    syncSimInputsFromVal();
    runSimulation();
  });

  decDecBtn.addEventListener('click', () => {
    state.simValue = (state.simValue - 1 + 256) % 256;
    syncSimInputsFromVal();
    runSimulation();
  });

  // Binary Text Input Handler
  binInput.addEventListener('input', () => {
    let sanitized = binInput.value.replace(/[^01]/g, '').slice(0, 8);
    binInput.value = sanitized;
    if (sanitized.length === 8) {
      state.simValue = parseInt(sanitized, 2);
      syncSimInputsFromVal(true); // Don't overwrite the binary input cursor
      runSimulation();
    }
  });

  binInput.addEventListener('blur', () => {
    syncSimInputsFromVal();
  });

  // Operation Selector
  opSelect.addEventListener('change', () => {
    state.simOperation = opSelect.value;
    updateOperationSummary();
    runSimulation();
    updateHardwareSchematic();
  });

  // Shift Slider
  shiftSlider.addEventListener('input', () => {
    setShiftAmount(parseInt(shiftSlider.value, 10));
  });

  // Quick Amount Buttons (0 to 7)
  quickAmtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const amt = parseInt(btn.dataset.amt, 10);
      setShiftAmount(amt);
    });
  });

  // Simulate Button
  simulateBtn.addEventListener('click', () => {
    runSimulation(true);
    setStatus(`Simulation executed: ${state.simOperation} by ${state.simShiftAmt} positions.`);
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    resetSimulator();
  });

  // Presets
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      state.simValue = parseInt(pill.dataset.val, 10);
      state.simOperation = pill.dataset.op;
      state.simShiftAmt = parseInt(pill.dataset.amt, 10);

      opSelect.value = state.simOperation;
      syncSimInputsFromVal();
      setShiftAmount(state.simShiftAmt);
      updateOperationSummary();
      runSimulation(true);
      setStatus(`Applied Preset Test Vector: ${pill.textContent}`);
    });
  });

  // Render clickable bit strip
  renderInputBitStrip();
  syncSimInputsFromVal();
  updateOperationSummary();
  runSimulation();
}

function setShiftAmount(amt) {
  state.simShiftAmt = Math.max(0, Math.min(7, amt));
  document.getElementById('shiftAmtSlider').value = state.simShiftAmt;
  document.getElementById('shiftAmtDisplay').textContent = state.simShiftAmt;

  // Update control bits S2, S1, S0
  const s2 = (state.simShiftAmt & 4) ? 1 : 0;
  const s1 = (state.simShiftAmt & 2) ? 1 : 0;
  const s0 = (state.simShiftAmt & 1) ? 1 : 0;
  document.getElementById('shiftControlBits').textContent = `S₂S₁S₀ = ${s2}${s1}${s0}`;

  // Update quick buttons active state
  document.querySelectorAll('.btn-amt').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.amt, 10) === state.simShiftAmt);
  });

  runSimulation();
  updateHardwareSchematic();
}

function syncSimInputsFromVal(skipBinInput = false) {
  const decInput = document.getElementById('decInput');
  const binInput = document.getElementById('binInput');

  decInput.value = state.simValue;
  if (!skipBinInput) {
    binInput.value = toBinary8(state.simValue);
  }

  // Update Bit strip toggles
  const binStr = toBinary8(state.simValue);
  for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
    const bitCell = document.getElementById(`inputBitCell_${bitIdx}`);
    if (bitCell) {
      const isOne = binStr.charAt(7 - bitIdx) === '1';
      bitCell.classList.toggle('active', isOne);
      bitCell.querySelector('.bit-val').textContent = isOne ? '1' : '0';
    }
  }
}

function renderInputBitStrip() {
  const strip = document.getElementById('inputBitStrip');
  strip.innerHTML = '';

  // Render from Bit 7 (MSB) down to Bit 0 (LSB)
  for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
    const cell = document.createElement('div');
    cell.className = 'bit-toggle-cell';
    cell.id = `inputBitCell_${bitIdx}`;
    cell.title = `Click to toggle Bit ${bitIdx}`;

    cell.innerHTML = `
      <span class="bit-idx">B${bitIdx}</span>
      <span class="bit-val">0</span>
    `;

    cell.addEventListener('click', () => {
      // Toggle bit
      state.simValue ^= (1 << bitIdx);
      syncSimInputsFromVal();
      runSimulation();
    });

    strip.appendChild(cell);
  }
}

function updateOperationSummary() {
  const op = state.simOperation;
  const icon = document.getElementById('opIconTag');
  const desc = document.getElementById('opDescText');

  const summaries = {
    'LSL': {
      icon: '«',
      html: '<strong>Logical Left Shift (LSL):</strong> Bits move left towards MSB. Bit 7 overflows into discard. A <code>0</code> is inserted at Bit 0. Equivalent to multiplying by 2<sup>n</sup> (modulo 256).'
    },
    'LSR': {
      icon: '»',
      html: '<strong>Logical Right Shift (LSR):</strong> Bits move right towards LSB. Bit 0 drops off into discard. A <code>0</code> is inserted at Bit 7 (MSB). Equivalent to unsigned integer division by 2<sup>n</sup>.'
    },
    'ASR': {
      icon: '»ₛ',
      html: '<strong>Arithmetic Right Shift (ASR):</strong> Bits move right towards LSB. Bit 0 drops off. <strong>Crucial:</strong> Bit 7 (Sign bit) is duplicated into all vacated positions, preserving signed two\'s complement arithmetic.'
    },
    'ROL': {
      icon: '↺',
      html: '<strong>Circular Left Rotation (ROL):</strong> Bits shift left. Bits rotated off Bit 7 wrap directly around to Bit 0. No data bits are discarded or destroyed.'
    },
    'ROR': {
      icon: '↻',
      html: '<strong>Circular Right Rotation (ROR):</strong> Bits shift right. Bits rotated off Bit 0 wrap directly around to Bit 7. No data bits are discarded or destroyed.'
    }
  };

  const item = summaries[op] || summaries['LSL'];
  icon.textContent = item.icon;
  desc.innerHTML = item.html;
}

function runSimulation(animate = false) {
  const analysis = analyzeBitMovement(state.simValue, state.simOperation, state.simShiftAmt);

  // Update Triad Result Displays
  document.getElementById('resultBin').textContent = analysis.outBin;
  document.getElementById('resultDec').textContent = analysis.outVal;
  document.getElementById('resultHex').textContent = toHex8(analysis.outVal);

  document.getElementById('originalBinSub').textContent = `Initial: ${toBinary8(state.simValue)}`;
  document.getElementById('originalDecSub').textContent = `Initial: ${state.simValue}`;
  document.getElementById('originalHexSub').textContent = `Initial: ${toHex8(state.simValue)}`;

  // Update Status Pill
  const pill = document.getElementById('simResultPill');
  pill.textContent = `${state.simOperation} (${state.simShiftAmt}) Complete`;

  // Render Flow Visualizer Bits & SVGs
  renderFlowVisualizer(analysis, animate);

  // Update Boundary Tags
  renderBoundaryTags(analysis);

  // Update Mathematical Transformation Callout
  updateMathCallout(analysis);

  // Also update hardware schematic to match current inputs
  updateHardwareSchematic();
}

function renderFlowVisualizer(analysis, animate) {
  const inBitsRow = document.getElementById('flowInputBits');
  const outBitsRow = document.getElementById('flowOutputBits');
  const svg = document.getElementById('vectorSvg');

  inBitsRow.innerHTML = '';
  outBitsRow.innerHTML = '';
  svg.innerHTML = '';

  const inBin = toBinary8(state.simValue);
  const outBin = analysis.outBin;

  // Render Input Bits (Bit 7 down to Bit 0)
  for (let i = 7; i >= 0; i--) {
    const bitChar = inBin.charAt(7 - i);
    const box = document.createElement('div');
    const isDiscarded = analysis.mappings[i] === -1;
    box.className = `flow-bit-box ${isDiscarded ? 'state-discarded' : 'state-preserved'}`;
    box.id = `flowInBit_${i}`;
    box.innerHTML = `
      <div class="bit-digit">${bitChar}</div>
      <div class="bit-idx-tag">In[${i}]</div>
    `;
    inBitsRow.appendChild(box);
  }

  // Render Output Bits (Bit 7 down to Bit 0)
  for (let j = 7; j >= 0; j--) {
    const bitChar = outBin.charAt(7 - j);
    const box = document.createElement('div');
    const isInserted = analysis.insertedIndices.includes(j);
    box.className = `flow-bit-box ${isInserted ? 'state-inserted' : 'state-preserved'}`;
    box.id = `flowOutBit_${j}`;
    box.innerHTML = `
      <div class="bit-digit">${bitChar}</div>
      <div class="bit-idx-tag">Out[${j}]</div>
    `;
    outBitsRow.appendChild(box);
  }

  // Draw connecting SVG paths
  requestAnimationFrame(() => {
    drawMovementVectors(analysis, animate);
  });
}

function drawMovementVectors(analysis, animate) {
  const svg = document.getElementById('vectorSvg');
  if (!svg) return;
  svg.innerHTML = '';

  const svgRect = svg.getBoundingClientRect();
  const width = svgRect.width || 640;
  const height = 60;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Calculate center-x coordinates of 8 slots (Bit 7 is slot 0, Bit 0 is slot 7)
  const slotWidth = width / 8;
  const getX = (bitIdx) => {
    const slot = 7 - bitIdx;
    return slot * slotWidth + slotWidth / 2;
  };

  // Draw Discarded Vectors (drop off into red dashed curves)
  analysis.discardedBits.forEach(d => {
    const startX = getX(d.bitIndex);
    const endX = state.simOperation === 'LSL' ? Math.max(10, startX - 40) : Math.min(width - 10, startX + 40);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const dAttr = `M ${startX} 0 C ${startX} ${height * 0.4}, ${endX} ${height * 0.6}, ${endX} ${height * 0.85}`;
    path.setAttribute('d', dAttr);
    path.setAttribute('class', 'flow-path discard-wire');
    svg.appendChild(path);
  });

  // Draw Connected Preserved / Wrapped Paths
  for (let i = 0; i < 8; i++) {
    const dest = analysis.mappings[i];
    if (dest !== -1) {
      const startX = getX(i);
      const endX = getX(dest);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Smooth cubic bezier S-curve
      const dAttr = `M ${startX} 0 C ${startX} ${height * 0.5}, ${endX} ${height * 0.5}, ${endX} ${height}`;
      path.setAttribute('d', dAttr);
      path.setAttribute('class', `flow-path active-wire ${animate ? 'animating' : ''}`);
      svg.appendChild(path);
    }
  }

  // Draw Inserted Bits (drop into output row from boundary)
  analysis.insertedIndices.forEach(j => {
    const endX = getX(j);
    const startX = endX;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const dAttr = `M ${startX} ${height * 0.4} L ${endX} ${height}`;
    path.setAttribute('d', dAttr);
    path.setAttribute('class', 'flow-path insert-wire');
    svg.appendChild(path);
  });
}

function renderBoundaryTags(analysis) {
  const insBox = document.getElementById('insertedBitsContent');
  const disBox = document.getElementById('discardedBitsContent');

  insBox.innerHTML = '';
  disBox.innerHTML = '';

  if (analysis.insertedBits.length === 0) {
    insBox.innerHTML = '<span class="boundary-bit-badge inserted">None (All bits preserved)</span>';
  } else {
    analysis.insertedBits.forEach(item => {
      const span = document.createElement('span');
      span.className = 'boundary-bit-badge inserted';
      span.textContent = `Bit ${item.bitIndex} = '${item.value}' (${item.type})`;
      insBox.appendChild(span);
    });
  }

  if (analysis.discardedBits.length === 0) {
    disBox.innerHTML = '<span class="boundary-bit-badge discarded">None (No bits lost)</span>';
  } else {
    analysis.discardedBits.forEach(item => {
      const span = document.createElement('span');
      span.className = 'boundary-bit-badge discarded';
      span.textContent = `Bit ${item.bitIndex} ('${item.value}') Dropped`;
      disBox.appendChild(span);
    });
  }
}

function updateMathCallout(analysis) {
  const callout = document.getElementById('mathFormulaText');
  const op = state.simOperation;
  const k = state.simShiftAmt;
  const inVal = state.simValue;
  const outVal = analysis.outVal;

  if (k === 0) {
    callout.innerHTML = `Y = X = ${inVal} (Shift count is 0; Word identity preserved)`;
    return;
  }

  switch (op) {
    case 'LSL':
      callout.innerHTML = `Y = (${inVal} &laquo; ${k}) &amp; 0xFF = (${inVal} &times; 2<sup>${k}</sup>) mod 256 = <strong>${outVal}</strong> (${toHex8(outVal)})`;
      break;
    case 'LSR':
      callout.innerHTML = `Y = (${inVal} &raquo;&raquo;&raquo; ${k}) = &lfloor;${inVal} / 2<sup>${k}</sup>&rfloor; = <strong>${outVal}</strong> (${toHex8(outVal)})`;
      break;
    case 'ASR': {
      const signedIn = (inVal & 0x80) ? inVal - 256 : inVal;
      const signedOut = (outVal & 0x80) ? outVal - 256 : outVal;
      callout.innerHTML = `Y = (${signedIn} &raquo; ${k}) [Signed ASR preserving Bit 7] = <strong>${signedOut}</strong> (Unsigned: ${outVal}, ${toHex8(outVal)})`;
      break;
    }
    case 'ROL':
      callout.innerHTML = `Y = (${inVal} &laquo; ${k}) | (${inVal} &raquo;&raquo;&raquo; (8 &minus; ${k})) = <strong>${outVal}</strong> (Rotated Left by ${k})`;
      break;
    case 'ROR':
      callout.innerHTML = `Y = (${inVal} &raquo;&raquo;&raquo; ${k}) | (${inVal} &laquo; (8 &minus; ${k})) = <strong>${outVal}</strong> (Rotated Right by ${k})`;
      break;
  }
}

function resetSimulator() {
  state.simValue = 13;
  state.simOperation = 'LSL';
  setShiftAmount(1);
  document.getElementById('operationSelect').value = 'LSL';
  syncSimInputsFromVal();
  updateOperationSummary();
  runSimulation();
  setStatus('Reset Simulator to default: Decimal 13 (00001101), LSL by 1.');
}

// =====================================================================
// FEATURE 2: 3-STAGE BARREL SHIFTER HARDWARE VISUALIZATION
// =====================================================================

/**
 * Computes intermediate states for the 3 stages of an 8-bit barrel shifter.
 * Stage 0: Shift by 1 if S0 = 1, else pass-through.
 * Stage 1: Shift by 2 if S1 = 1, else pass-through.
 * Stage 2: Shift by 4 if S2 = 1, else pass-through.
 */
function computeHardwareStages(val, op, amt) {
  const k = amt % 8;
  const s0 = (k & 1) ? 1 : 0;
  const s1 = (k & 2) ? 1 : 0;
  const s2 = (k & 4) ? 1 : 0;

  // Stage 0 computation (Shift by 1 if S0 is active)
  const bus0 = s0 ? computeShift(val, op, 1) : val;

  // Stage 1 computation (Shift by 2 if S1 is active)
  const bus1 = s1 ? computeShift(bus0, op, 2) : bus0;

  // Stage 2 computation (Shift by 4 if S2 is active)
  const bus2 = s2 ? computeShift(bus1, op, 4) : bus1;

  return {
    s0, s1, s2,
    inputBus: val,
    bus0,
    bus1,
    bus2,
    outputBus: bus2
  };
}

function initHardwareVisualization() {
  const stepBtn = document.getElementById('hwStepBtn');
  const animBtn = document.getElementById('hwAnimateAllBtn');

  stepBtn.addEventListener('click', () => {
    stepHardwareForward();
  });

  animBtn.addEventListener('click', () => {
    animateHardwareFlow();
  });

  updateHardwareSchematic();
}

function updateHardwareSchematic() {
  const hw = computeHardwareStages(state.simValue, state.simOperation, state.simShiftAmt);

  // Update Top Architectural Info
  document.getElementById('hwShiftAmtLabel').textContent = `k = ${state.simShiftAmt} (${state.simOperation})`;
  document.getElementById('hwControlSignals').textContent = `S₂=${hw.s2} • S₁=${hw.s1} • S₀=${hw.s0}`;

  // Update Stage Headers & Active Classes
  const col0 = document.getElementById('hwStage0');
  const col1 = document.getElementById('hwStage1');
  const col2 = document.getElementById('hwStage2');

  col0.classList.toggle('stage-active', hw.s0 === 1);
  col1.classList.toggle('stage-active', hw.s1 === 1);
  col2.classList.toggle('stage-active', hw.s2 === 1);

  document.getElementById('hwS0State').textContent = hw.s0 ? 'S₀ = 1 (SHIFT +1)' : 'S₀ = 0 (PASS)';
  document.getElementById('hwS1State').textContent = hw.s1 ? 'S₁ = 1 (SHIFT +2)' : 'S₁ = 0 (PASS)';
  document.getElementById('hwS2State').textContent = hw.s2 ? 'S₂ = 1 (SHIFT +4)' : 'S₂ = 0 (PASS)';

  // Render Input Bus Nodes D[7] .. D[0]
  renderBusColumn('hwInputBusBits', hw.inputBus, 'D');

  // Render MUX arrays for the 3 stages
  renderMuxStage('hwMuxArray0', 0, hw.inputBus, hw.bus0, hw.s0, 1);
  renderMuxStage('hwMuxArray1', 1, hw.bus0, hw.bus1, hw.s1, 2);
  renderMuxStage('hwMuxArray2', 2, hw.bus1, hw.bus2, hw.s2, 4);

  // Render Intermediate Buses
  document.getElementById('hwInterBits0').textContent = toBinary8(hw.bus0);
  document.getElementById('hwInterBits1').textContent = toBinary8(hw.bus1);
  document.getElementById('hwInterBits2').textContent = toBinary8(hw.bus2);

  // Render Output Bus Nodes Y[7] .. Y[0]
  renderBusColumn('hwOutputBusBits', hw.outputBus, 'Y');
}

function renderBusColumn(elementId, val, prefix) {
  const container = document.getElementById(elementId);
  container.innerHTML = '';
  const binStr = toBinary8(val);

  for (let i = 7; i >= 0; i--) {
    const bitChar = binStr.charAt(7 - i);
    const isHigh = bitChar === '1';
    const node = document.createElement('div');
    node.className = `hw-bus-node ${isHigh ? 'high' : ''}`;
    node.innerHTML = `
      <span class="mono">${prefix}[${i}]</span>
      <span class="bit-char">${bitChar}</span>
    `;
    container.appendChild(node);
  }
}

function renderMuxStage(containerId, stageIndex, inVal, outVal, sBit, shiftWeight) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const inBin = toBinary8(inVal);
  const outBin = toBinary8(outVal);

  for (let i = 7; i >= 0; i--) {
    const mux = document.createElement('div');
    mux.className = `mux-cell ${sBit === 1 ? 'active-shift' : 'active-pass'}`;

    const outBit = outBin.charAt(7 - i);
    const isOutHigh = outBit === '1';

    // Channel 0: Unshifted input from this bit index
    const ch0Bit = inBin.charAt(7 - i);

    // Channel 1 label description based on shift operation and weight
    const ch1SourceDesc = getMuxChannel1Source(i, shiftWeight, state.simOperation);

    mux.innerHTML = `
      <div class="mux-inputs">
        <span class="${sBit === 0 ? 'ch-active' : ''}">0: In[${i}] (${ch0Bit})</span>
        <span class="${sBit === 1 ? 'ch-active' : ''}">1: ${ch1SourceDesc}</span>
      </div>
      <span class="mux-label-tag">M${i}</span>
      <span class="mux-out ${isOutHigh ? 'val-1' : ''}">${outBit}</span>
    `;

    container.appendChild(mux);
  }
}

function getMuxChannel1Source(bitIdx, weight, op) {
  if (op === 'LSL') {
    const src = bitIdx - weight;
    return src >= 0 ? `In[${src}]` : `0 (Pad)`;
  } else if (op === 'LSR') {
    const src = bitIdx + weight;
    return src < 8 ? `In[${src}]` : `0 (Pad)`;
  } else if (op === 'ASR') {
    const src = bitIdx + weight;
    return src < 8 ? `In[${src}]` : `Sign(B7)`;
  } else if (op === 'ROL') {
    const src = (bitIdx - weight + 8) % 8;
    return `In[${src}]`;
  } else if (op === 'ROR') {
    const src = (bitIdx + weight) % 8;
    return `In[${src}]`;
  }
  return `In[${bitIdx}]`;
}

function stepHardwareForward() {
  const stages = [
    document.getElementById('hwColInput'),
    document.getElementById('hwStage0'),
    document.getElementById('hwStage1'),
    document.getElementById('hwStage2'),
    document.getElementById('hwColOutput')
  ];

  state.hwStepCurrent = (state.hwStepCurrent + 1) % stages.length;

  stages.forEach((el, idx) => {
    el.style.transition = 'box-shadow 0.3s, transform 0.3s';
    if (idx === state.hwStepCurrent) {
      el.style.boxShadow = '0 0 25px rgba(0, 229, 255, 0.6)';
      el.style.transform = 'scale(1.02)';
    } else {
      el.style.boxShadow = '';
      el.style.transform = '';
    }
  });

  const names = ['Input Bus D[7:0]', 'Stage 0 (S0 = Shift 1)', 'Stage 1 (S1 = Shift 2)', 'Stage 2 (S2 = Shift 4)', 'Output Bus Y[7:0]'];
  setStatus(`Hardware Step: Highlighting ${names[state.hwStepCurrent]}`);
}

function animateHardwareFlow() {
  if (state.hwStepInterval) {
    clearInterval(state.hwStepInterval);
  }

  state.hwStepCurrent = -1;
  let count = 0;
  setStatus('Propagating signals across Logarithmic 3-Stage MUX Array...');

  state.hwStepInterval = setInterval(() => {
    stepHardwareForward();
    count++;
    if (count >= 5) {
      clearInterval(state.hwStepInterval);
      state.hwStepInterval = null;
      setTimeout(() => {
        document.querySelectorAll('.hw-column').forEach(el => {
          el.style.boxShadow = '';
          el.style.transform = '';
        });
        setStatus(`Signal propagation complete. Total Gate Delay: 3 × t_MUX (Single Cycle Execution).`);
      }, 900);
    }
  }, 450);
}

// =====================================================================
// FEATURE 3: EMBEDDED-DEVICE REGISTER & VIRTUAL LED SIMULATOR
// =====================================================================

function initRegisterSimulator() {
  const panel = document.getElementById('virtualLedPanel');
  panel.innerHTML = '';

  // Render 8 LEDs and Toggle buttons (LED 7 down to LED 0)
  for (let i = 7; i >= 0; i--) {
    const assembly = document.createElement('div');
    assembly.className = 'led-assembly';
    assembly.id = `ledAssembly_${i}`;

    assembly.innerHTML = `
      <span class="led-label">LED ${i}</span>
      <div class="led-housing" id="ledHousing_${i}" title="Pin B${i} (Click to Toggle)">
        <div class="led-lens"></div>
      </div>
      <button type="button" class="led-switch-btn" id="ledSwitch_${i}" title="Toggle LED ${i}">0</button>
    `;

    // Click handler on housing and switch
    const toggleBit = () => {
      state.regValue ^= (1 << i);
      updateRegisterDisplay(true);
      setStatus(`Toggled GPIO Pin B${i}. Register now: ${toHex8(state.regValue)} (${state.regValue})`);
    };

    assembly.querySelector('.led-housing').addEventListener('click', toggleBit);
    assembly.querySelector('.led-switch-btn').addEventListener('click', toggleBit);

    panel.appendChild(assembly);
  }

  // Action Buttons
  document.getElementById('regLslBtn').addEventListener('click', () => {
    state.regValue = computeShift(state.regValue, 'LSL', 1);
    updateRegisterDisplay(true);
    setStatus(`Register LSL 1 executed. New Value: ${toHex8(state.regValue)}`);
  });

  document.getElementById('regLsrBtn').addEventListener('click', () => {
    state.regValue = computeShift(state.regValue, 'LSR', 1);
    updateRegisterDisplay(true);
    setStatus(`Register LSR 1 executed. New Value: ${toHex8(state.regValue)}`);
  });

  document.getElementById('regAsrBtn').addEventListener('click', () => {
    state.regValue = computeShift(state.regValue, 'ASR', 1);
    updateRegisterDisplay(true);
    setStatus(`Register ASR 1 executed (Sign bit preserved). New Value: ${toHex8(state.regValue)}`);
  });

  document.getElementById('regRolBtn').addEventListener('click', () => {
    state.regValue = computeShift(state.regValue, 'ROL', 1);
    updateRegisterDisplay(true);
    setStatus(`Register ROL 1 executed (Bit 7 wrapped to Bit 0). New Value: ${toHex8(state.regValue)}`);
  });

  document.getElementById('regRorBtn').addEventListener('click', () => {
    state.regValue = computeShift(state.regValue, 'ROR', 1);
    updateRegisterDisplay(true);
    setStatus(`Register ROR 1 executed (Bit 0 wrapped to Bit 7). New Value: ${toHex8(state.regValue)}`);
  });

  document.getElementById('regNotBtn').addEventListener('click', () => {
    state.regValue = (~state.regValue) & 0xFF;
    updateRegisterDisplay(true);
    setStatus(`Register Inverted (~X). New Value: ${toHex8(state.regValue)}`);
  });

  document.getElementById('regClrBtn').addEventListener('click', () => {
    state.regValue = 0;
    updateRegisterDisplay(true);
    setStatus('Register Cleared to 0x00.');
  });

  document.getElementById('regSyncSimBtn').addEventListener('click', () => {
    state.regValue = state.simValue;
    updateRegisterDisplay(true);
    setStatus(`Synchronized Register with Simulator value (${state.regValue}).`);
  });

  // Embedded Presets
  document.getElementById('presetChaserBtn').addEventListener('click', () => {
    state.regValue = 0x01;
    updateRegisterDisplay(true);
    setStatus('Loaded LED Chaser starting pattern (0x01). Click ROL/ROR to chase!');
  });

  document.getElementById('presetFlagsBtn').addEventListener('click', () => {
    state.regValue = 0x85; // 10000101 (e.g. Negative + HalfCarry + Carry)
    updateRegisterDisplay(true);
    setStatus('Loaded CPU Status Flags preset (0x85 = 10000101).');
  });

  document.getElementById('presetAltBtn').addEventListener('click', () => {
    state.regValue = 0xAA; // 10101010
    updateRegisterDisplay(true);
    setStatus('Loaded Alternating bit pattern (0xAA = 10101010).');
  });

  document.getElementById('presetAllOnBtn').addEventListener('click', () => {
    state.regValue = 0xFF; // 11111111
    updateRegisterDisplay(true);
    setStatus('Set all GPIO output pins HIGH (0xFF = 255).');
  });

  updateRegisterDisplay(false);
}

function updateRegisterDisplay(animate = false) {
  const binStr = toBinary8(state.regValue);
  let activeCount = 0;

  for (let i = 7; i >= 0; i--) {
    const isLit = binStr.charAt(7 - i) === '1';
    if (isLit) activeCount++;

    const assembly = document.getElementById(`ledAssembly_${i}`);
    const switchBtn = document.getElementById(`ledSwitch_${i}`);

    if (assembly) {
      assembly.classList.toggle('lit', isLit);
    }
    if (switchBtn) {
      switchBtn.textContent = isLit ? '1' : '0';
    }
  }

  // Update Readout Boxes
  document.getElementById('regBinReadout').textContent = binStr;
  document.getElementById('regDecReadout').textContent = state.regValue;
  document.getElementById('regHexReadout').textContent = toHex8(state.regValue);
  document.getElementById('regActivePins').textContent = `${activeCount} of 8`;
}

// =====================================================================
// NAVIGATION, STATUS & MODAL MANAGEMENT
// =====================================================================

function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-tabs .nav-btn[data-target]');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      switchTab(targetId);
    });
  });

  // Theory Modal
  const openGuideBtn = document.getElementById('open-guide-btn');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const modalUnderstoodBtn = document.getElementById('modalUnderstoodBtn');
  const guideModal = document.getElementById('guideModal');

  openGuideBtn.addEventListener('click', () => {
    guideModal.classList.add('active');
  });

  const closeModal = () => {
    guideModal.classList.remove('active');
  };

  closeGuideBtn.addEventListener('click', closeModal);
  modalUnderstoodBtn.addEventListener('click', closeModal);
  guideModal.addEventListener('click', (e) => {
    if (e.target === guideModal) closeModal();
  });

  // Global Reset Button in Status Bar
  document.getElementById('globalResetBtn').addEventListener('click', () => {
    resetSimulator();
    state.regValue = 13;
    updateRegisterDisplay();
    setStatus('System reset to initial state.');
  });
}

function switchTab(sectionId) {
  state.currentTab = sectionId;

  // Update Nav Buttons
  document.querySelectorAll('.nav-tabs .nav-btn[data-target]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === sectionId);
  });

  // Update Sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === sectionId);
  });

  // Trigger recalculations / SVG redraws
  if (sectionId === 'section-simulator') {
    requestAnimationFrame(() => {
      const analysis = analyzeBitMovement(state.simValue, state.simOperation, state.simShiftAmt);
      drawMovementVectors(analysis, false);
    });
  } else if (sectionId === 'section-hardware') {
    updateHardwareSchematic();
  } else if (sectionId === 'section-register') {
    updateRegisterDisplay();
  }
}

function setStatus(msg) {
  const statusEl = document.getElementById('statusMessage');
  if (statusEl) {
    statusEl.textContent = msg;
  }
}

// =====================================================================
// WINDOW RESIZE & INIT
// =====================================================================

window.addEventListener('resize', () => {
  if (state.currentTab === 'section-simulator') {
    const analysis = analyzeBitMovement(state.simValue, state.simOperation, state.simShiftAmt);
    drawMovementVectors(analysis, false);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initSimulator();
  initHardwareVisualization();
  initRegisterSimulator();
  initNavigation();
  setStatus('ShiftLab initialized. Ready for simulation and Computer Organization and Architecture presentation.');
});
