"use client"

import { ReactNode, useId } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface GlassTabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function GlassTabs({ tabs, activeTab, onChange, className }: GlassTabsProps) {
  const instanceId = useId()

  return (
    <div className={cn(
      "relative flex p-1.5 space-x-1 rounded-[1.5rem]", // 24px radius
      "bg-white/40 backdrop-blur-md border border-white/20",
      "shadow-[0_8px_40px_rgba(0,0,0,0.04)]",
      className
    )}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 rounded-[1.25rem] px-3 py-1.5 text-sm font-medium transition-colors duration-300 outline-none z-10 whitespace-nowrap",
              isActive ? "text-blue-700" : "text-gray-500 hover:text-gray-700"
            )}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isActive && (
              <motion.div
                layoutId={`active-glass-tab-${instanceId}`}
                className="absolute inset-0 z-[-1] rounded-[1.25rem]"
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  boxShadow: "inset 1px 1px 0px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0,0,0,0.04)"
                }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            <span className="relative z-20 flex items-center justify-center">
              {tab.icon && <span className="mr-2 flex items-center justify-center">{tab.icon}</span>}
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
