"use client";

import { useState } from "react";
import { Calendar, ClipboardCheck, ArrowRight, Wrench, CheckCircle, AlertTriangle, XCircle, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PmListClient({ pmJobs }: { pmJobs: any[] }) {
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = pmJobs.filter(job => 
    job.machine?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.pmCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="ค้นหาเครื่องจักร หรือเลขที่ PM..."
          className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const conditionColor = 
            job.overallCondition === 'pass' ? 'bg-green-100 text-green-700' :
            job.overallCondition === 'warn' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700';

          const conditionIcon = 
            job.overallCondition === 'pass' ? <CheckCircle className="w-4 h-4 mr-1" /> :
            job.overallCondition === 'warn' ? <AlertTriangle className="w-4 h-4 mr-1" /> :
            <XCircle className="w-4 h-4 mr-1" />;

          const conditionText = 
            job.overallCondition === 'pass' ? 'ปกติ' :
            job.overallCondition === 'warn' ? 'ต้องติดตาม' :
            'ชำรุด';

          return (
            <div 
              key={job.id} 
              onClick={() => setSelectedJob(job)}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-3xl -z-10" />
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                    {job.pmCode}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg">{job.machine}</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${conditionColor}`}>
                  {conditionIcon}
                  {conditionText}
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-grow">
                <div className="flex items-center text-sm text-gray-600">
                  <ClipboardCheck className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{job.template?.name || "ไม่มีเทมเพลต"}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{new Date(job.pmDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    {job.technician?.profilePicture ? (
                      <img src={job.technician.profilePicture} alt="Profile" className="w-5 h-5 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shadow-sm">
                        {job.technician?.fullname?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'ช'}
                      </div>
                    )}
                    <span>{job.technician?.fullname || 'ไม่ระบุชื่อช่าง'}</span>
                  </div>
                </div>
              </div>

              {job.remarks && (
                <div className="mt-2 mb-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100 line-clamp-2">
                  <span className="font-medium text-gray-700">หมายเหตุ: </span>
                  {job.remarks}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-gray-50 flex justify-end">
                <div className="text-sm font-medium text-blue-600 flex items-center group">
                  ดูรายละเอียด
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div>
                  <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                    {selectedJob.pmCode}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedJob.machine}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    วันที่ตรวจ: {new Date(selectedJob.pmDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex flex-col justify-center">
                    <p className="text-xs text-blue-600/80 mb-2">ผู้ตรวจ (ช่าง)</p>
                    <div className="flex items-center gap-2">
                      {selectedJob.technician?.profilePicture ? (
                        <img src={selectedJob.technician.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                          {selectedJob.technician?.fullname?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'ช'}
                        </div>
                      )}
                      <p className="font-semibold text-gray-900">{selectedJob.technician?.fullname || '-'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">เทมเพลตที่ใช้</p>
                    <p className="font-medium text-gray-900">{selectedJob.template?.name || '-'}</p>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-4 text-lg">ผลการตรวจเช็ค</h3>
                <div className="space-y-3">
                  {selectedJob.results?.map((result: any, index: number) => {
                    const rColor = 
                      result.result === 'pass' ? 'bg-green-50 border-green-200' :
                      result.result === 'warn' ? 'bg-amber-50 border-amber-200' :
                      'bg-red-50 border-red-200';
                    
                    const rIcon = 
                      result.result === 'pass' ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                      result.result === 'warn' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                      <XCircle className="w-5 h-5 text-red-500" />;

                    return (
                      <div key={result.id} className={`flex items-start p-4 rounded-2xl border ${rColor}`}>
                        <div className="mr-3 mt-0.5">{rIcon}</div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {result.checklistItem?.taskName || `รายการที่ ${index + 1}`}
                          </p>
                          {result.note && (
                            <p className="text-sm text-gray-600 mt-1">
                              หมายเหตุ: {result.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedJob.workDone && (
                  <div className="mt-6">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">การแก้ไข/บำรุงรักษาที่ได้ทำ</h4>
                    <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedJob.workDone}
                    </div>
                  </div>
                )}
                
                {selectedJob.partsReplaced && (
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">อะไหล่ที่เปลี่ยน</h4>
                    <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedJob.partsReplaced}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
