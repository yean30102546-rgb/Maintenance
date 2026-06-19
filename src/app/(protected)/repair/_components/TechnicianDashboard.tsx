'use client'

import { useState } from 'react'
import { JobCard } from './JobCard'

type RepairJob = any // should be properly typed from Prisma

export function TechnicianDashboard({ openJobs, myJobs }: { openJobs: RepairJob[], myJobs: RepairJob[] }) {
  const [activeTab, setActiveTab] = useState<'open' | 'mine'>('open')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">จัดการงานซ่อม (Technician)</h2>
      </div>

      {/* Custom Tabs */}
      <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
        <button
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'open' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('open')}
        >
          รอซ่อม ({openJobs.length})
        </button>
        <button
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'mine' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('mine')}
        >
          งานของฉัน ({myJobs.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'open' && (
        <div>
          {openJobs.length > 0 ? (
            openJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">ไม่มีงานรอซ่อมในขณะนี้</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mine' && (
        <div>
          {myJobs.length > 0 ? (
            myJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">คุณยังไม่ได้รับงานใดๆ</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
