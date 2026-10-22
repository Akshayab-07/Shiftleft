"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Binary, Cpu, ToggleLeft, BookOpen, RotateCcw } from "lucide-react"
import { DisplayHeading } from "@/components/DisplayHeading"
import { BitSimulatorTab } from "@/components/BitSimulatorTab"
import { BarrelShifterTab } from "@/components/BarrelShifterTab"
import { EmbeddedRegisterTab } from "@/components/EmbeddedRegisterTab"
import { GuideTab } from "@/components/GuideTab"
import { ToastContainer, type ToastMessage } from "@/components/Toast"

type TabType = "simulator" | "architecture" | "register" | "guide"

const LAB_TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "simulator", label: "Bit Simulator", icon: Binary },
  { id: "architecture", label: "Barrel Shifter Architecture", icon: Cpu },
  { id: "register", label: "Embedded Register & LEDs", icon: ToggleLeft },
  { id: "guide", label: "Computer Organization and Architecture Theory Guide", icon: BookOpen },
]

export default function LabPage() {
  const [activeTab, setActiveTab] = useState<TabType>("simulator")
  const [simValue, setSimValue] = useState<number>(13)
  const [regValue, setRegValue] = useState<number>(13)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const notify = useCallback((text: string, type: "info" | "success" = "info") => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev.slice(-3), { id, text, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleResetAll = useCallback(() => {
    setSimValue(13)
    setRegValue(13)
    notify("Reset all modules to default state (Decimal 13, 00001101)", "success")
  }, [notify])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-300 pb-6">
        <div>
          <DisplayHeading
            text="Hardware Interactive Lab"
            as="h1"
            fontSize={42}
            subtitle="Full 8-bit combinational logic suite: Bit dataflow mapping, 3-stage logarithmic multiplexer array, and GPIO microcontroller register emulation."
          />
        </div>

        {/* Global Reset Button */}
        <button
          onClick={handleResetAll}
          title="Reset All Modules to Defaults"
          className="self-start sm:self-center flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-100 px-4 py-2 text-xs font-mono font-bold text-text-800 transition-colors hover:border-primary-400 hover:bg-secondary-200 hover:text-text-950 active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5 text-primary-500" />
          <span>Reset All Modules</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-secondary-300 bg-secondary-100/80 p-1.5 shadow-sm">
        {LAB_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                isActive ? "text-primary-50" : "text-text-700 hover:text-text-950"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="lab-active-pill"
                  className="absolute inset-0 rounded-xl bg-primary-500 shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Tab View Container */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === "simulator" && (
            <motion.div
              key="sim"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <BitSimulatorTab
                currentValue={simValue}
                onValueChange={setSimValue}
                onNotify={notify}
              />
            </motion.div>
          )}

          {activeTab === "architecture" && (
            <motion.div
              key="arch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <BarrelShifterTab
                currentValue={simValue}
                onValueChange={setSimValue}
                onNotify={notify}
              />
            </motion.div>
          )}

          {activeTab === "register" && (
            <motion.div
              key="reg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <EmbeddedRegisterTab
                regValue={regValue}
                simValue={simValue}
                onRegValueChange={setRegValue}
                onNotify={notify}
              />
            </motion.div>
          )}

          {activeTab === "guide" && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <GuideTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
