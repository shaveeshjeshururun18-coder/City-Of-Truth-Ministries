"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  url?: string
  icon: LucideIcon | React.ReactNode | React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  id?: string
  onClick?: () => void
}

export interface NavBarProps {
  items: NavItem[]
  className?: string
  activeTab?: string
  onTabChange?: (nameOrId: string) => void
  glowColor?: "amber" | "primary" | "blue" | string
  isFloating?: boolean
}

export function NavBar({
  items,
  className,
  activeTab: controlledActiveTab,
  onTabChange,
  glowColor = "amber",
  isFloating = true,
}: NavBarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0]?.id || items[0]?.name || "")
  const [isMobile, setIsMobile] = useState(false)

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (!item.url || item.url === "#" || item.url.startsWith("#")) {
      e.preventDefault()
    }
    const targetKey = item.id || item.name
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(targetKey)
    }
    if (onTabChange) {
      onTabChange(targetKey)
    }
    if (item.onClick) {
      item.onClick()
    }
  }

  const isAmber = glowColor === "amber"

  return (
    <div
      className={cn(
        isFloating
          ? "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6"
          : "relative flex justify-center w-full",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl py-1.5 px-2 rounded-full shadow-xl shadow-slate-950/10">
        {items.map((item) => {
          const itemKey = item.id || item.name
          const isActive = activeTab === itemKey || activeTab === item.name

          const renderIcon = () => {
            if (!item.icon) return null
            if (React.isValidElement(item.icon)) {
              return (
                <span className={cn("transition-transform duration-200", isActive && "scale-110", isAmber && isActive ? "text-amber-600 dark:text-amber-400" : "")}>
                  {item.icon}
                </span>
              )
            }
            const IconComponent = item.icon as React.ComponentType<any>
            return (
              <IconComponent
                size={17}
                strokeWidth={2.4}
                className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110",
                  isAmber && isActive ? "text-amber-600 dark:text-amber-400" : ""
                )}
              />
            )
          }

          return (
            <a
              key={itemKey}
              href={item.url || "#"}
              onClick={(e) => handleItemClick(item, e)}
              className={cn(
                "relative cursor-pointer text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 select-none",
                "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                isActive && (isAmber ? "text-amber-700 dark:text-amber-300 font-extrabold" : "text-slate-950 dark:text-white font-extrabold"),
              )}
            >
              {renderIcon()}
              <span className="hidden md:inline whitespace-nowrap">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId={`tubelight_lamp_${items[0]?.id || 'nav'}`}
                  className={cn(
                    "absolute inset-0 w-full rounded-full -z-10",
                    isAmber ? "bg-amber-500/10 dark:bg-amber-400/15" : "bg-primary/5 dark:bg-white/10"
                  )}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 30,
                  }}
                >
                  {/* Physical Glowing Tubelight Filament Lamp */}
                  <div
                    className={cn(
                      "absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full transition-colors",
                      isAmber
                        ? "bg-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.95)]"
                        : "bg-blue-600 shadow-[0_0_14px_rgba(37,99,235,0.9)]"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute w-12 h-6 rounded-full blur-md -top-2 -left-2 pointer-events-none",
                        isAmber ? "bg-amber-400/40" : "bg-blue-500/35"
                      )}
                    />
                    <div
                      className={cn(
                        "absolute w-8 h-6 rounded-full blur-md -top-1 pointer-events-none",
                        isAmber ? "bg-amber-400/50" : "bg-blue-500/45"
                      )}
                    />
                    <div
                      className={cn(
                        "absolute w-4 h-4 rounded-full blur-sm top-0 left-2 pointer-events-none",
                        isAmber ? "bg-amber-300/60" : "bg-blue-400/55"
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default NavBar
