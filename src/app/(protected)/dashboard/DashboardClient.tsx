"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Clock, CheckCircle2, Wrench, AlertCircle, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type RepairJob = {
  id: string;
  jobId: string;
  machine: string | null;
  dept: string | null;
  detail: string | null;
  status: string;
  createdAt: Date;
  technician: { fullname: string } | null;
};

export default function DashboardClient({ jobs }: { jobs: RepairJob[] }) {
  const activeJobs = jobs.filter(j => j.status !== 'ซ่อมเสร็จ');
  const completedJobs = jobs.filter(j => j.status === 'ซ่อมเสร็จ');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 sm:pb-0"
    >
      {/* Huge Call to Action Button */}
      <motion.div variants={itemVariants}>
        <Link href="/repair/create" className="block">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(37,99,235,0.25)] text-white relative overflow-hidden group transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-colors" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">แจ้งซ่อมใหม่</h2>
                <p className="text-blue-100 text-sm">สร้างรายการแจ้งซ่อมเครื่องจักรหรืออุปกรณ์</p>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Active Jobs Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">กำลังดำเนินการ</h3>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {activeJobs.length} รายการ
          </span>
        </div>

        {activeJobs.length > 0 ? (
          <div className="space-y-4">
            {activeJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-md rounded-[24px] border border-dashed border-gray-300 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">ไม่มีรายการแจ้งซ่อมที่ค้างอยู่</p>
          </div>
        )}
      </motion.div>

      {/* History Section */}
      {completedJobs.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">ประวัติการแจ้งซ่อม</h3>
          </div>
          <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
            {completedJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Internal Apple-style JobCard component
function JobCard({ job }: { job: RepairJob }) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'รอซ่อม':
        return { bg: 'bg-red-50', text: 'text-red-600', icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
      case 'กำลังซ่อม':
        return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Wrench className="w-3.5 h-3.5 mr-1" /> };
      case 'รอ QC':
        return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Clock className="w-3.5 h-3.5 mr-1" /> };
      case 'ซ่อมเสร็จ':
        return { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
    }
  };

  const style = getStatusStyle(job.status);

  return (
    <Link href={`/repair/${job.id}`} className="block group">
      <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div className="pr-4">
            <h4 className="text-base font-bold text-gray-900 line-clamp-1">{job.machine || 'ไม่ระบุเครื่องจักร'}</h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{job.dept || 'ไม่ระบุแผนก'} • {job.jobId}</p>
          </div>
          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${style.bg} ${style.text}`}>
            {style.icon}
            {job.status}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4">
          {job.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100/60">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">วันที่แจ้ง</span>
            <span className="text-xs text-gray-700 font-medium">
              {format(new Date(job.createdAt), 'd MMM yyyy HH:mm', { locale: th })}
            </span>
          </div>
          
          <div className="flex items-center text-gray-400 group-hover:text-blue-500 transition-colors">
            <span className="text-xs font-bold mr-1">{job.technician ? `ช่าง: ${job.technician.fullname}` : 'รอรับงาน'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
