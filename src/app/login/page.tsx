"use client";

import { useActionState } from 'react';
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { loginWithCode } from "./actions";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginWithCode, initialState);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-white overflow-hidden relative">
      {/* Decorative background blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/20 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 text-center flex flex-col items-center">
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"
          >
            <Wrench className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 mb-2 tracking-tight"
          >
            SFC SMART
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-500 mb-8"
          >
            ระบบแจ้งซ่อมและบำรุงรักษาอัจฉริยะ
          </motion.p>

          <motion.form 
            action={formAction} 
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {state?.error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-100 text-center">
                {state.error}
              </div>
            )}
            
            <div className="mb-4">
              <input 
                type="text" 
                name="passcode"
                placeholder="กรอกรหัส (reporter หรือ tech)"
                required
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center placeholder:text-gray-400"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
            >
              <span className="flex items-center">
                {isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Testing)'}
              </span>
            </button>
          </motion.form>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 text-sm text-gray-400"
          >
            ใช้สำหรับทดสอบสลับ Role ผู้ใช้งาน
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
