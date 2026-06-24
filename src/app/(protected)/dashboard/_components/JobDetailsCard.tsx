import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User, AlignLeft, Info } from 'lucide-react'
import { format } from 'date-fns'
import { AcceptJobForm, CompleteJobForm, WaitPartsForm, RejectJobForm, ReworkJobForm, ResubmitJobForm } from '@/app/(protected)/repair/[id]/_components/JobActions'

type JobDetailsCardProps = {
  job: any; // We can use Prisma generated types, but `any` is okay for now since it's populated
  dbUser: any;
  isModal?: boolean;
  basePath?: string;
}

export default function JobDetailsCard({ job, dbUser, isModal = false, basePath = '/dashboard' }: JobDetailsCardProps) {
  const isTechnician = ['technician', 'engineer', 'admin'].includes(dbUser.role)
  const isAssignedTechnician = job.technicianId === dbUser.id
  const isReporter = job.requesterId === dbUser.id

  const content = (
    <div className="space-y-8">
      {/* Header section with ID and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100/50 pb-6">
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">รหัสงาน</p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{job.jobId}</h2>
        </div>
        
        <div className={`px-4 py-2 rounded-full inline-flex items-center justify-center font-semibold text-sm border shadow-sm
          ${job.status === 'รอซ่อม' ? 'bg-red-50/80 text-red-700 border-red-100' : 
            job.status === 'กำลังซ่อม' ? 'bg-yellow-50/80 text-yellow-700 border-yellow-100' : 
            job.status === 'รออะไหล่' ? 'bg-orange-50/80 text-orange-700 border-orange-100' : 
            job.status === 'ตีกลับ' ? 'bg-rose-50/80 text-rose-700 border-rose-100' : 
            job.status === 'รองานแก้ไข' ? 'bg-pink-50/80 text-pink-700 border-pink-100' : 
            'bg-green-50/80 text-green-700 border-green-100'}`}
        >
          <span className={`w-2 h-2 rounded-full mr-2 
            ${job.status === 'รอซ่อม' ? 'bg-red-500' : job.status === 'กำลังซ่อม' ? 'bg-yellow-500' : job.status === 'รออะไหล่' ? 'bg-orange-500' : job.status === 'ตีกลับ' ? 'bg-rose-500' : job.status === 'รองานแก้ไข' ? 'bg-pink-500' : 'bg-green-500'}
          `} />
          {job.status}
        </div>
      </div>

      {job.rejectReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-800">
                {job.status === 'ตีกลับ' ? 'เหตุผลที่ช่างตีกลับงาน:' : 'เหตุผลที่ผู้แจ้งส่งกลับมาแก้ไข:'}
              </h4>
              <p className="text-rose-700 text-sm mt-1 whitespace-pre-wrap">{job.rejectReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 flex items-center"><AlignLeft className="w-4 h-4 mr-1.5"/> เครื่องจักร</p>
          <p className="text-lg font-semibold text-gray-900">{job.machine}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 flex items-center"><User className="w-4 h-4 mr-1.5"/> แผนกที่แจ้ง</p>
          <p className="text-lg font-semibold text-gray-900">{job.dept}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1.5"/> เวลาที่แจ้ง</p>
          <p className="text-lg font-semibold text-gray-900">{format(new Date(job.createdAt), 'dd/MM/yyyy HH:mm')}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 flex items-center"><User className="w-4 h-4 mr-1.5"/> ผู้แจ้ง</p>
          <div className="flex items-center gap-2">
            {job.requester.profilePicture ? (
              <img src={job.requester.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                {job.requester.fullname.substring(0, 2)}
              </div>
            )}
            <p className="text-lg font-semibold text-gray-900">{job.requester.fullname}</p>
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="pt-6 border-t border-gray-100/50">
        <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
          <Info className="w-4 h-4 mr-1.5" /> อาการเสีย
        </h3>
        <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
          <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-relaxed">{job.detail}</p>
        </div>
        
        {/* Images */}
        {(job.imgBefore || job.imgBefore2 || job.imgBefore3) && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500 mb-3">รูปภาพประกอบ</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {job.imgBefore && (
                <div className="rounded-2xl overflow-hidden border border-gray-100/50 shadow-sm aspect-video sm:aspect-square bg-gray-50">
                  <img src={job.imgBefore} alt="ภาพที่ 1" className="w-full h-full object-cover" />
                </div>
              )}
              {job.imgBefore2 && (
                <div className="rounded-2xl overflow-hidden border border-gray-100/50 shadow-sm aspect-video sm:aspect-square bg-gray-50">
                  <img src={job.imgBefore2} alt="ภาพที่ 2" className="w-full h-full object-cover" />
                </div>
              )}
              {job.imgBefore3 && (
                <div className="rounded-2xl overflow-hidden border border-gray-100/50 shadow-sm aspect-video sm:aspect-square bg-gray-50">
                  <img src={job.imgBefore3} alt="ภาพที่ 3" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Technician Info */}
      {job.technician && (
        <div className="pt-6 border-t border-gray-100/50">
          <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-1.5" /> ข้อมูลการซ่อม
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">ผู้รับผิดชอบ</p>
              <p className="text-lg font-semibold text-gray-900">{job.technician.fullname}</p>
            </div>
            {job.eta && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center">เวลาเสร็จ (คาดการณ์)</p>
                <p className="text-lg font-semibold text-gray-900">{job.eta}</p>
              </div>
            )}
          </div>
          
          {job.pendingReason && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-3">รอสั่งซื้ออะไหล่ / รายละเอียด</p>
              <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50 text-orange-900">
                <p className="text-[15px] leading-relaxed">{job.pendingReason}</p>
              </div>
            </div>
          )}
          
          {job.note && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-3">บันทึกการซ่อม</p>
              <div className="bg-blue-50/30 rounded-2xl p-5 border border-blue-100/50 text-blue-900">
                <p className="text-[15px] leading-relaxed">{job.note}</p>
              </div>
            </div>
          )}

          {job.imgAfter && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">ภาพหลังซ่อมเสร็จ</p>
              <div className="rounded-2xl overflow-hidden border border-green-100/50 shadow-sm aspect-video sm:aspect-square sm:max-w-xs bg-gray-50">
                <img src={job.imgAfter} alt="ภาพหลังซ่อม" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Forms */}
      {isTechnician && (job.status === 'รอซ่อม' || (isAssignedTechnician && ['กำลังซ่อม', 'รออะไหล่'].includes(job.status))) && (
        <div className="pt-6 mt-6 border-t border-gray-100/50">
          {job.status === 'รอซ่อม' && (
            <div className="space-y-6">
              <AcceptJobForm jobId={job.id} />
              <RejectJobForm jobId={job.id} />
            </div>
          )}
          {isAssignedTechnician && job.status === 'กำลังซ่อม' && (
            <div className="space-y-6">
              <WaitPartsForm jobId={job.id} />
              <CompleteJobForm jobId={job.id} />
            </div>
          )}
          {isAssignedTechnician && ['รออะไหล่'].includes(job.status) && (
            <CompleteJobForm jobId={job.id} />
          )}
        </div>
      )}

      {isReporter && ['ซ่อมเสร็จ', 'ตีกลับ'].includes(job.status) && (
        <div className="pt-6 mt-6 border-t border-gray-100/50">
          {job.status === 'ซ่อมเสร็จ' && (
            <ReworkJobForm jobId={job.id} />
          )}
          {job.status === 'ตีกลับ' && (
            <ResubmitJobForm job={job} />
          )}
        </div>
      )}
    </div>
  )

  if (isModal) {
    return content;
  }

  // Standalone Page Layout
  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-50/80 via-purple-50/40 to-transparent -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl -z-10" />

      <header className="px-4 py-6 flex items-center max-w-3xl mx-auto">
        <Link href={basePath} className="mr-4 text-gray-500 hover:text-blue-600 transition-colors bg-white/50 p-2 rounded-full backdrop-blur-sm border border-white/50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">รายละเอียดงาน</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-12">
        <div className="glass-card p-6 sm:p-8">
          {content}
        </div>
      </main>
    </div>
  )
}
