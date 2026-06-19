"use client";

import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { mockLogin } from "./actions";

export default function LoginPage() {
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
        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 text-center flex flex-col items-center">
          
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
            action={mockLogin} 
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
            >
              <span className="flex items-center">
                เข้าสู่ระบบด้วย LINE (Mock)
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
            </button>
          </motion.form>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 text-sm text-gray-400"
          >
            สำหรับการทดสอบระบบเท่านั้น
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
