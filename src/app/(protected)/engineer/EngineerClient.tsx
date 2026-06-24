"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Clock, CheckCircle2, Wrench, AlertCircle, ChevronRight, User } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { GlassTabs } from "@/components/ui/glass-tabs";
import { toast } from "sonner";
import { acceptRepairJob } from "@/app/actions/repair";
import { useRouter } from "next/navigation";

type RepairJob = {
  id: string;
  jobId: string;
  machine: string | null;
  dept: string | null;
  side: string | null;
  opType: string | null;
  imgBefore: string | null;
  detail: string | null;
  status: string;
  createdAt: Date;
  technicianId: string | null;
  technician: { fullname: string } | null;
  requester: { fullname: string; dept: string | null } | null;
};

export default function EngineerClient({ jobs, currentUser }: { jobs: RepairJob[], currentUser: any }) {
  const [activeTab, setActiveTab] = useState('pending');
  
  const pendingJobs = jobs.filter(j => j.status === 'รอซ่อม');
  const inProgressJobs = jobs.filter(j => ['กำลังซ่อม', 'รออะไหล่', 'รองานแก้ไข'].includes(j.status));
  const completedJobs = jobs.filter(j => ['ซ่อมเสร็จ', 'ตีกลับ'].includes(j.status));

  const getFilteredJobs = () => {
    switch (activeTab) {
      case 'pending': return pendingJobs;
      case 'progress': return inProgressJobs;
      case 'completed': return completedJobs;
      default: return [];
    }
  };

  const activeJobs = getFilteredJobs();

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 sm:pb-0"
    >
      {/* Overview Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 sm:gap-4 mb-2">
        <div className="bg-white rounded-[16px] p-4 text-center border border-red-200 shadow-sm cursor-pointer hover:bg-red-50 transition-colors" onClick={() => setActiveTab('pending')}>
          <div className="text-2xl font-bold text-red-600 mb-1">{pendingJobs.length}</div>
          <div className="text-[10px] sm:text-xs font-semibold text-gray-500">รอรับงาน</div>
        </div>
        <div className="bg-white rounded-[16px] p-4 text-center border border-amber-200 shadow-sm cursor-pointer hover:bg-amber-50 transition-colors" onClick={() => setActiveTab('progress')}>
          <div className="text-2xl font-bold text-amber-600 mb-1">{inProgressJobs.length}</div>
          <div className="text-[10px] sm:text-xs font-semibold text-gray-500">กำลังซ่อม</div>
        </div>
        <div className="bg-white rounded-[16px] p-4 text-center border border-green-200 shadow-sm cursor-pointer hover:bg-green-50 transition-colors" onClick={() => setActiveTab('completed')}>
          <div className="text-2xl font-bold text-green-600 mb-1">{completedJobs.length}</div>
          <div className="text-[10px] sm:text-xs font-semibold text-gray-500">เสร็จสิ้น</div>
        </div>
      </motion.div>

      {/* Tabs Menu */}
      <motion.div variants={itemVariants} className="flex justify-center px-2">
        <GlassTabs 
          tabs={[
            { id: 'pending', label: 'รอรับงาน' },
            { id: 'progress', label: 'กำลังซ่อม' },
            { id: 'completed', label: 'เสร็จสิ้น' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="w-full max-w-md mx-auto"
        />
      </motion.div>

      {/* Tab Content Section */}
      <motion.div variants={itemVariants} className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <JobListView jobs={activeJobs} activeTab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'รอซ่อม':
      return { bg: 'bg-red-50', text: 'text-red-600', icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
    case 'กำลังซ่อม':
      return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Wrench className="w-3.5 h-3.5 mr-1" /> };
    case 'รออะไหล่':
      return { bg: 'bg-orange-50', text: 'text-orange-600', icon: <Clock className="w-3.5 h-3.5 mr-1" /> };

    case 'รองานแก้ไข':
      return { bg: 'bg-pink-50', text: 'text-pink-600', icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
    case 'ตีกลับ':
      return { bg: 'bg-rose-50', text: 'text-rose-600', icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
    case 'ซ่อมเสร็จ':
      return { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
  }
}

function JobListView({ jobs, activeTab }: { jobs: RepairJob[], activeTab: string }) {
  const router = useRouter();

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-[16px] border border-dashed border-gray-300 p-8 text-center mt-4">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">ไม่มีรายการในหมวดหมู่นี้</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} activeTab={activeTab} router={router} />
      ))}
    </div>
  );
}

function JobCard({ job, activeTab, router }: { job: RepairJob, activeTab: string, router: any }) {
  const style = getStatusStyle(job.status);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleQuickAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAccepting) return;
    setIsAccepting(true);
    
    // Quick accept defaults to "ไม่ระบุ" (Not specified) or empty string since eta is optional in logic, but AcceptJobForm enforces it.
    // In our server action, it's just a string, so we can pass 'รับงานด่วน' or similar.
    const res = await acceptRepairJob(job.id, 'ด่วน/ไม่ระบุเวลา');
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('รับงานสำเร็จ (Job Accepted)');
      router.refresh();
    }
    setIsAccepting(false);
  };

  return (
    <Link href={`?viewJob=${job.id}`} scroll={false} className="block group">
      <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-indigo-300">
        <div className="flex justify-between items-start mb-3">
          <div className="pr-4">
            <h4 className="text-base font-bold text-gray-900 line-clamp-1">{job.machine || 'ไม่ระบุเครื่องจักร'}</h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-gray-500">
              <span className="text-indigo-600 font-semibold">{job.jobId}</span>
              <span>•</span>
              <span className="truncate">{job.dept || 'ไม่ระบุแผนก'}</span>
            </div>
          </div>
          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${style.bg} ${style.text}`}>
            {style.icon}
            {job.status}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3 text-sm text-gray-500">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span>ผู้แจ้ง: <strong className="text-gray-800 font-medium">{job.requester?.fullname || 'ไม่ทราบชื่อ'}</strong></span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4">
          {job.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">วันที่แจ้ง</span>
            <span className="text-xs text-gray-700 font-medium">
              {format(new Date(job.createdAt), 'd MMM yyyy HH:mm', { locale: th })}
            </span>
          </div>
          
          <div className="flex items-center">
            {activeTab === 'pending' ? (
              <button 
                onClick={handleQuickAccept}
                disabled={isAccepting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors flex items-center shadow-sm"
              >
                {isAccepting ? 'กำลังรับงาน...' : 'รับงานด่วน'}
              </button>
            ) : (
              <div className="flex items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                <span className="text-xs font-bold mr-1">
                  {job.technician ? `ช่าง: ${job.technician.fullname}` : 'ดูรายละเอียด'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
