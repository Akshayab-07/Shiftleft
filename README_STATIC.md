# ShiftLab — Visual Barrel Shifter & Bit Manipulation Simulator
> **Computer Organization and Architecture Academic Project**  
> An interactive educational simulator demonstrating 8-bit barrel shifter hardware architecture, pure bitwise operations, and real-world embedded-system register control.

---

## 📖 Project Overview

**ShiftLab** bridges theoretical Computer Organization and Architecture principles with hands-on visual simulation. It demonstrates:
1. **How 8-bit shift and rotate operations function** at the bit level (including sign preservation, bit discarding, and boundary insertion).
2. **How a hardware Barrel Shifter executes multi-bit shifts in a single clock cycle** using a 3-stage logarithmic array of 2:1 multiplexers ($O(\log_2 N)$ gate propagation delay) instead of consuming $k$ sequential clock cycles like simple shift registers.
3. **How embedded systems utilize 8-bit registers and bit manipulation** to control GPIO peripherals, toggle hardware pins, and decode CPU status flags.

---

## 🚀 How to Run Locally

ShiftLab is built using pure **HTML5, CSS3, and Vanilla JavaScript**. It requires **no build steps, no external frameworks, no paid APIs, and no backend database**.

### Method 1: Direct File Launch (Easiest)
Simply double-click `index.html` or drag and drop `index.html` into any modern desktop web browser (Chrome, Edge, Firefox, Brave, Safari).

### Method 2: Local HTTP Server (Optional)
If you prefer running via a local development server:

Using Python (built into Windows/Mac/Linux):
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

Using Node.js:
```bash
npx serve .
```

---

## 🛠️ Features Breakdown

### 1. Interactive 8-Bit Bit Manipulation Simulator
* **Dual Input Formats**: Enter any decimal integer `0 – 255` or an 8-bit binary string (`00000000` to `11111111`).
* **Interactive Bit Strip**: Click directly on individual bits $B_7 \dots B_0$ to toggle them between `0` and `1`.
* **5 Core Computer Organization and Architecture Operations**:
  * **Logical Left Shift (LSL / SHL)**: Bits shift left; vacated LSBs receive `0`; discarded MSBs are tracked in overflow.
  * **Logical Right Shift (LSR / SHR)**: Bits shift right; vacated MSBs receive `0`; discarded LSBs are tracked in underflow.
  * **Arithmetic Right Shift (ASR / SAR)**: Bits shift right while preserving the Most Significant Bit (Bit 7, sign bit) to maintain signed two's-complement values.
  * **Circular Left Rotation (ROL / RLC)**: Bits rotated off MSB wrap directly back into LSB without data loss.
  * **Circular Right Rotation (ROR / RRC)**: Bits rotated off LSB wrap directly back into MSB without data loss.
* **Shift Amounts $k = 0 \dots 7$**: Select shift count with the slider or quick buttons; control signals $S_2 S_1 S_0$ update dynamically.
* **Live Triad Readout**: View synchronized Binary, Decimal, and Hexadecimal representations.
* **Vector Dataflow Visualization**: Dynamic SVG movement vectors display the exact path each bit takes, clearly tagging preserved, inserted, and discarded bits.

### 2. Logarithmic Barrel Shifter Hardware Architecture
* **3-Stage Multiplexer Array**: Represents an $N = 8$ logarithmic barrel shifter with stages shifting by $2^0 = 1$, $2^1 = 2$, and $2^2 = 4$ bit positions.
* **Control Line Mapping**: For shift count $k = (S_2 S_1 S_0)_2$:
  * **Stage 0 ($S_0$)**: If $S_0 = 1$, shifts by 1 bit; if $0$, acts as straight pass-through.
  * **Stage 1 ($S_1$)**: If $S_1 = 1$, shifts by 2 bits; if $0$, acts as straight pass-through.
  * **Stage 2 ($S_2$)**: If $S_2 = 1$, shifts by 4 bits; if $0$, acts as straight pass-through.
* **Detailed MUX Inspection**: Displays all 24 individual 2:1 Multiplexers ($M_7 \dots M_0$ across 3 stages), their active channel selections, and intermediate 8-bit buses $I^{(1)}, I^{(2)}, I^{(3)}$.
* **Signal Flow & Stepping**: Features an automated signal propagation animation and single-step stage navigation.

### 3. Embedded-Device Register & Virtual LED Simulator
* **Industrial LED Panel**: 8 virtual LEDs ($LED_7 \dots LED_0$) with realistic bevels, glossy radial lens reflections, and active green luminescence.
* **Hardware Push Switches**: Toggle individual bits directly on the simulated PCB.
* **Register Controls**: Execute single-step shifts (`LSL 1`, `LSR 1`, `ASR 1`, `ROL 1`, `ROR 1`), bitwise negation (`NOT ~`), and clear (`0x00`).
* **Presets & Firmware Applications**: Includes real-world firmware examples like LED Chaser patterns, CPU status flags (Carry, Zero, Negative), and GPIO pin masking in C.

---

## 🧪 Validation & Test Vector Checklist

All required Computer Organization and Architecture test vectors have been verified:

| Test Case | Operation | Input Binary (Dec) | Shift | Output Binary (Dec) | Hex | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Test 1** | Logical Left Shift (LSL) | `00001101` (13) | 1 | `00011010` (26) | `0x1A` | ✅ Verified |
| **Test 2** | Logical Right Shift (LSR) | `00001101` (13) | 1 | `00000110` (6) | `0x06` | ✅ Verified |
| **Test 3** | Circular Left Rotation (ROL) | `10000001` (129) | 1 | `00000011` (3) | `0x03` | ✅ Verified |
| **Test 4** | Arithmetic Right Shift (ASR) | `10000000` (128) | 1 | `11000000` (192) | `0xC0` | ✅ Verified |
| **Test 5** | Zero Shift ($k = 0$) | Any value | 0 | Unchanged | Same | ✅ Verified |
| **Test 6** | Register & LED Sync | Bit toggle / operations | Any | LEDs match register | Same | ✅ Verified |
| **Test 7** | Hardware Visualization | Stage cascade ($S_2 S_1 S_0$) | Any | Final stage = output | Same | ✅ Verified |

---

## 📁 Project Structure

```
ShiftLab/
├── index.html        # Semantic HTML5 markup, navigation, tabs, and reference modal
├── styles.css        # Modern technical dark theme, responsive layout, glowing LED styles
├── script.js         # Pure bit manipulation engine, 3-stage hardware logic, register simulator
└── README.md         # Documentation, launch instructions, and Computer Organization and Architecture theoretical background
```

---

## 🎓 Computer Organization and Architecture Academic Presentation Notes

When presenting to your professor, highlight these key design points:
1. **$O(1)$ Clock Cycles vs $O(N)$ Serial Shifts**: Standard shift registers require 1 clock pulse per bit shifted. ShiftLab's barrel shifter performs arbitrary shifts $0 \le k \le 7$ in combinational logic during a single instruction execution cycle.
2. **Logarithmic Multiplexer Scaling**: An 8-bit barrel shifter requires $\log_2(8) = 3$ stages of 8 multiplexers each (24 MUXes total), drastically reducing silicon area compared to a full crossbar matrix ($8 \times 8 = 64$ switches).
3. **Embedded Significance**: Demonstrates how C bitmasking (`PORTB |= (1 << n)`) maps to physical GPIO pin states on hardware microcontrollers (e.g. AVR ATmega328P or ARM Cortex-M).
