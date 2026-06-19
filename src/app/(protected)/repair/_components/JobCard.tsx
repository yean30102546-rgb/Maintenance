import Link from 'next/link'
import { Clock, CheckCircle2, Wrench, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

type JobCardProps = {
  job: {
    id: string
    jobId: string
    machine: string | null
    dept: string | null
    detail: string | null
    status: string
    createdAt: Date
    technician?: { fullname: string } | null
  }
}

export function JobCard({ job }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'รอซ่อม':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'กำลังซ่อม':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'รอ QC':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ซ่อมเสร็จ':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'รอซ่อม':
        return <AlertCircle className="w-4 h-4 mr-1" />
      case 'กำลังซ่อม':
        return <Wrench className="w-4 h-4 mr-1" />
      case 'รอ QC':
        return <Clock className="w-4 h-4 mr-1" />
      case 'ซ่อมเสร็จ':
        return <CheckCircle2 className="w-4 h-4 mr-1" />
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />
    }
  }

  return (
    <Link href={`/repair/${job.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 hover:shadow-md transition-shadow active:scale-[0.99]">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-1">{job.jobId}</span>
            <h3 className="text-lg font-bold text-gray-900">{job.machine}</h3>
            <span className="text-sm text-gray-500">{job.dept}</span>
          </div>
          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>
            {getStatusIcon(job.status)}
            {job.status}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">
          {job.detail}
        </p>

        <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-gray-500">
          <span>{format(new Date(job.createdAt), 'dd MMM yyyy, HH:mm')}</span>
          {job.technician && (
            <span className="font-medium text-gray-700 flex items-center">
              ช่าง: {job.technician.fullname}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
