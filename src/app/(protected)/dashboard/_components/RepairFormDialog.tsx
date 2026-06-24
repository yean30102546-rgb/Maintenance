'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import CreateRepairForm from './CreateRepairForm'

type Machine = {
  id: string
  name: string
  dept: string | null
}

export default function RepairFormDialog({
  isOpen,
  onClose,
  machines,
  userDept
}: {
  isOpen: boolean
  onClose: () => void
  machines: Machine[]
  userDept?: string | null
}) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
          />

          {/* Modal / Bottom Sheet Container */}
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center pointer-events-none p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl border-t sm:border border-white/50 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-t-[32px] sm:rounded-[32px] pointer-events-auto max-h-[90vh] overflow-hidden flex flex-col relative"
            >
              {/* Subtle glow effect behind form */}
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

              {/* Mobile Drag Handle */}
              <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-12 h-1.5 bg-gray-300/50 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/40 relative z-10">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">สร้างรายการแจ้งซ่อม</h2>
                  <p className="text-sm text-gray-500 mt-0.5">กรอกข้อมูลเพื่อแจ้งซ่อมเครื่องจักรหรืออุปกรณ์</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/50 hover:bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors border border-white/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 sm:p-8 overflow-y-auto relative z-10 custom-scrollbar">
                <CreateRepairForm 
                  machines={machines} 
                  userDept={userDept}
                  onSuccess={onClose} 
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
