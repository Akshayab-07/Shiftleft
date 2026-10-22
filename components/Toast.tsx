"use client"

import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, Info } from "lucide-react"

export interface ToastMessage {
  id: string
  text: string
  type?: "info" | "success"
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-white/[0.1] bg-[#0c1219]/95 px-4 py-2.5 text-xs font-medium text-zinc-200 shadow-xl backdrop-blur-md"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-cyan-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
