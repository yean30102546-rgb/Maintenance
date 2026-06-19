"use client";

import { useActionState, useState } from 'react';
import { registerUser } from './actions';
import { Wrench, Camera } from "lucide-react";
import { motion } from "framer-motion";

const initialState = {
  error: "",
};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);
  const [profilePic, setProfilePic] = useState<string>("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-white overflow-hidden relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative background blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/20 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 text-center flex flex-col items-center">
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"
          >
            <Wrench className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold text-gray-900 mb-2 tracking-tight"
          >
            ข้อมูลผู้ใช้งานใหม่
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-500 text-sm mb-8"
          >
            กรุณากรอกข้อมูลเพื่อลงทะเบียนเข้าสู่ระบบแจ้งซ่อม
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <form 
              action={formAction} 
              className="w-full space-y-5 text-left"
            >
              {/* Hidden input to pass base64 image data */}
              <input type="hidden" name="profilePicture" value={profilePic} />

              {state.error && (
                <motion.div variants={itemVariants} className="p-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-100 text-center">
                  {state.error}
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">อัปโหลดรูปโปรไฟล์</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 ml-1 mb-1">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                  placeholder="สมชาย ใจดี"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dept" className="block text-sm font-medium text-gray-700 ml-1 mb-1">
                    แผนก <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="dept"
                    name="dept"
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
                    defaultValue=""
                  >
                    <option value="" disabled>เลือกแผนก</option>
                    <option value="แผนกผลิต">แผนกผลิต</option>
                    <option value="แผนกซ่อมบำรุง">แผนกซ่อมบำรุง</option>
                    <option value="แผนกวิศวกรรม">แผนกวิศวกรรม</option>
                    <option value="แผนกคลังสินค้า">แผนกคลังสินค้า</option>
                    <option value="แผนกธุรการ">แผนกธุรการ</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="line" className="block text-sm font-medium text-gray-700 ml-1 mb-1">
                    ไลน์ผลิต <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="line"
                    name="line"
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
                    defaultValue=""
                  >
                    <option value="" disabled>เลือกไลน์</option>
                    <option value="Line 1">Line 1</option>
                    <option value="Line 2">Line 2</option>
                    <option value="Line 3">Line 3</option>
                    <option value="Line 4">Line 4</option>
                    <option value="Line 5">Line 5</option>
                    <option value="ไม่ระบุ">ไม่ระบุ</option>
                  </select>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 ml-1 mb-1">
                  เบอร์ติดต่อ
                </label>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                  placeholder="08X-XXX-XXXX"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  {isPending ? "กำลังบันทึก..." : "ลงทะเบียน"}
                </button>
              </motion.div>
            </form>
          </motion.div>
          
        </div>
      </motion.div>
    </div>
  );
}
