"use client"

import React from "react"
import Link from "next/link"
import { ShardBackdrop } from "@/components/ShardBackdrop"
import { DisplayHeading } from "@/components/DisplayHeading"
import { Home, Binary, AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative min-h-[75vh] flex items-center justify-center py-16">
      <ShardBackdrop
        placement="center"
        flow="vortex"
        material="satin"
        speed={0.5}
        density={0.85}
        opacity={0.38}
        className="min-h-[75vh] flex items-center"
      >
        <div className="mx-auto max-w-xl px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-100 px-3.5 py-1 text-xs font-mono font-bold text-primary-600 shadow-sm">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>404 - Page Not Found</span>
          </div>

          <DisplayHeading
            text="404 • BUS FAULT"
            as="h1"
            fontSize={50}
            subtitle="The program counter referenced an unmapped memory address. No multiplexer routing exists for this target vector."
          />

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-xs font-mono font-bold text-primary-50 shadow-lg shadow-primary-950/20 transition-all hover:bg-primary-600 active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Return to Base Address</span>
            </Link>

            <Link
              href="/lab"
              className="flex items-center gap-2 rounded-full border border-secondary-300 bg-secondary-100 px-6 py-3 text-xs font-mono font-bold text-text-950 transition-colors hover:bg-secondary-200"
            >
              <Binary className="h-4 w-4 text-primary-500" />
              <span>Interactive Lab</span>
            </Link>
          </div>
        </div>
      </ShardBackdrop>
    </div>
  )
}
