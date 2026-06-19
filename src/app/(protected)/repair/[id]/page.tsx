import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User, AlignLeft, Info } from 'lucide-react'
import { format } from 'date-fns'
import { AcceptJobForm, CompleteJobForm } from './_components/JobActions'

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { supabaseAuthId: user.id } })
  if (!dbUser) redirect('/register')

  const job = await prisma.repairJob.findUnique({
    where: { id: params.id },
    include: {
      requester: true,
      technician: true,
      qcBy: true,
    }
  })

  if (!job) {
    notFound()
  }

  const isTechnician = dbUser.role === 'technician'
  const isAssignedTechnician = job.technicianId === dbUser.id

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-12">
      <header className="bg-white/70 backdrop-blur-xl saturate-150 border-b border-gray-200/50 px-4 py-4 sticky top-0 z-20 flex items-center transition-all">
        <Link href="/repair" className="mr-4 text-[#00B900] hover:text-[#009900] active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[17px] font-semibold text-gray-900 tracking-tight">รายละเอียดงาน {job.jobId}</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Status Banner */}
        <div className={`p-4 rounded-[18px] flex items-center justify-between font-semibold text-[17px] tracking-tight border
          ${job.status === 'รอซ่อม' ? 'bg-red-50 text-red-700 border-red-100' : 
            job.status === 'กำลังซ่อม' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
            job.status === 'รอ QC' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}
        >
          <span>สถานะ</span>
          <span>{job.status}</span>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-5 shadow-sm">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight leading-tight">{job.machine}</h2>
            <p className="text-[17px] text-gray-500 mt-1">แผนก: {job.dept}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div className="flex items-start text-[15px] text-gray-600">
              <Calendar className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
              <span className="leading-snug">แจ้งเมื่อ:<br/><span className="text-gray-900 font-medium">{format(new Date(job.createdAt), 'dd/MM/yyyy HH:mm')}</span></span>
            </div>
            <div className="flex items-start text-[15px] text-gray-600">
              <User className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
              <span className="leading-snug">ผู้แจ้ง:<br/><span className="text-gray-900 font-medium">{job.requester.fullname}</span></span>
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-xl text-gray-900 tracking-tight flex items-center mb-4">
            <AlignLeft className="w-5 h-5 mr-2 text-gray-400" /> อาการเสีย
          </h3>
          <p className="text-[17px] text-gray-700 whitespace-pre-wrap leading-relaxed">{job.detail}</p>
          
          {job.imgBefore && (
            <div className="mt-5 rounded-[16px] overflow-hidden border border-gray-100 bg-gray-50">
              <img src={job.imgBefore} alt="Before Repair" className="w-full object-cover max-h-80" />
            </div>
          )}
        </div>

        {/* Technician Info (If accepted) */}
        {job.technician && (
          <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-xl text-gray-900 tracking-tight flex items-center mb-4">
              <Info className="w-5 h-5 mr-2 text-gray-400" /> ข้อมูลการซ่อม
            </h3>
            <div className="space-y-3 text-[17px]">
              <p className="text-gray-700"><span className="text-gray-500">ช่างรับผิดชอบ:</span> <span className="font-medium text-gray-900">{job.technician.fullname}</span></p>
              {job.eta && <p className="text-gray-700"><span className="text-gray-500">เวลาที่คาดว่าจะเสร็จ:</span> <span className="font-medium text-gray-900">{job.eta}</span></p>}
            </div>
            
            {job.note && (
              <div className="mt-5 p-4 bg-[#f5f5f7] rounded-[18px]">
                <p className="text-[15px] font-medium text-gray-500 mb-2">บันทึกการแก้ไข</p>
                <p className="text-[17px] text-gray-900 leading-relaxed">{job.note}</p>
              </div>
            )}
            {job.imgAfter && (
              <div className="mt-5 rounded-[16px] overflow-hidden border border-gray-100 bg-gray-50">
                <img src={job.imgAfter} alt="After Repair" className="w-full object-cover max-h-80" />
              </div>
            )}
          </div>
        )}

        {/* Actions for Technician */}
        {isTechnician && job.status === 'รอซ่อม' && (
          <AcceptJobForm jobId={job.id} />
        )}

        {isTechnician && isAssignedTechnician && job.status === 'กำลังซ่อม' && (
          <CompleteJobForm jobId={job.id} />
        )}
      </main>
    </div>
  )
}
