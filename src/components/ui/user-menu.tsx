"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { logoutUser } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";

export function UserMenu({ dbUser }: { dbUser: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  const displayName = dbUser?.fullname || dbUser?.username || "ผู้ใช้งาน";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
          {dbUser?.profilePicture ? (
            <img src={dbUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{dbUser?.dept || "ไม่มีแผนก"}</p>
              <div className="mt-2 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                {dbUser?.role?.toUpperCase()}
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
