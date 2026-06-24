'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptRepairJob, completeRepairJob, setWaitParts, rejectJobByEngineer } from '@/app/actions/repair'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Camera, AlertCircle } from 'lucide-react'

export function AcceptJobForm({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [eta, setEta] = useState('')
  const [loading, setLoading] = useState(false)

  const presetETAs = ['15 นาที', '30 นาที', '1 ชั่วโมง', '2 ชั่วโมง']

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await acceptRepairJob(jobId, eta)
    if (res.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('รับงานสำเร็จ (Job Accepted)')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleAccept} className="bg-white p-6 rounded-[24px] border border-gray-100 mt-6 shadow-sm">
      <h3 className="font-semibold text-xl mb-6 text-gray-900 tracking-tight">รับงานซ่อม</h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="eta" className="text-[15px] text-gray-500 mb-3 block font-medium">เวลาที่คาดว่าจะเสร็จ (ETA)</Label>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {presetETAs.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setEta(preset)}
                className={`px-4 py-2 rounded-full text-[15px] font-medium transition-all duration-200 active:scale-95 ${
                  eta === preset 
                    ? 'bg-[#00B900] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <Input 
            id="eta" 
            value={eta} 
            onChange={e => setEta(e.target.value)} 
            placeholder="หรือระบุเวลาเอง..." 
            required
            className="rounded-full bg-gray-50/50 border-gray-200 h-12 px-5 text-[17px] focus-visible:ring-[#00B900]"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !eta}
          className="w-full h-14 rounded-full bg-[#00B900] hover:bg-[#009900] text-white text-[17px] font-semibold active:scale-95 transition-transform"
        >
          {loading ? 'กำลังรับงาน...' : 'ยืนยันการรับงาน'}
        </Button>
      </div>
    </form>
  )
}

export function RejectJobForm({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('jobId', jobId)
    formData.append('rejectReason', reason)
    
    const res = await rejectJobByEngineer(formData)
    if (res.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('ตีกลับงานสำเร็จ')
      router.push('/engineer')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleReject} className="bg-white p-6 rounded-[24px] border border-red-100 mt-6 shadow-sm">
      <h3 className="font-semibold text-xl mb-6 text-red-700 tracking-tight flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        ตีกลับงาน / ปฏิเสธงาน
      </h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="rejectReason" className="text-[15px] text-gray-500 mb-3 block font-medium">เหตุผลที่ตีกลับ <span className="text-red-500">*</span></Label>
          <Input 
            id="rejectReason" 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
            placeholder="เช่น ข้อมูลไม่ชัดเจน, แจ้งผิดแผนก..." 
            required
            className="rounded-xl bg-gray-50 border-gray-200 h-12 px-5 text-[15px] focus-visible:ring-red-500"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !reason}
          variant="outline"
          className="w-full h-14 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-[17px] font-semibold active:scale-95 transition-transform"
        >
          {loading ? 'กำลังบันทึก...' : 'ยืนยันการตีกลับงาน'}
        </Button>
      </div>
    </form>
  )
}

export function WaitPartsForm({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWaitParts = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('jobId', jobId)
    formData.append('pendingReason', reason)
    
    const res = await setWaitParts(formData)
    if (res.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('อัปเดตสถานะเป็น "รอสั่งซื้ออะไหล่" สำเร็จ')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleWaitParts} className="bg-white p-6 rounded-[24px] border border-gray-100 mt-6 shadow-sm">
      <h3 className="font-semibold text-xl mb-6 text-gray-900 tracking-tight">รายงานสถานะรอสั่งซื้ออะไหล่</h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="reason" className="text-[15px] text-gray-500 mb-3 block font-medium">ชื่ออะไหล่ที่ต้องการสั่งซื้อ หรือ เหตุผลเพิ่มเติม</Label>
          
          <Input 
            id="reason" 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
            placeholder="เช่น ตลับลูกปืน #6204..." 
            required
            className="rounded-full bg-gray-50/50 border-gray-200 h-12 px-5 text-[17px] focus-visible:ring-[#FF9900]"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !reason}
          className="w-full h-14 rounded-full bg-[#FF9900] hover:bg-[#e68a00] text-white text-[17px] font-semibold active:scale-95 transition-transform"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกสถานะรอสั่งซื้ออะไหล่'}
        </Button>
      </div>
    </form>
  )
}

export function CompleteJobForm({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const quickTags = ['เปลี่ยนอะไหล่', 'ทำความสะอาด', 'ปรับตั้งค่า']

  const handleTagClick = (tag: string) => {
    setNote(prev => prev ? `${prev}, ${tag}` : tag)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(null)
    }
  }

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('jobId', jobId)

    const res = await completeRepairJob(formData)
    if (res.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('บันทึกงานเสร็จสิ้น')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleComplete} className="bg-white p-6 rounded-[24px] border border-gray-100 mt-6 shadow-sm">
      <h3 className="font-semibold text-xl mb-6 text-gray-900 tracking-tight">ปิดงานซ่อม</h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="note" className="text-[15px] text-gray-500 mb-3 block font-medium">บันทึกการแก้ไข</Label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-4 py-2 rounded-full text-[14px] bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
              >
                + {tag}
              </button>
            ))}
          </div>

          <textarea 
            id="note" 
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="อธิบายการแก้ไขเพิ่มเติม..." 
            required
            className="w-full p-4 border border-gray-200 rounded-[18px] bg-gray-50/50 text-[17px] focus:ring-2 focus:ring-[#00B900] focus:border-transparent outline-none transition-shadow"
          />
        </div>

        <div>
          <Label htmlFor="imgAfter" className="text-[15px] text-gray-500 mb-3 block font-medium">ภาพหลังแก้ไข</Label>
          <div className="mt-2">
            <label 
              htmlFor="imgAfter" 
              className="flex flex-col items-center justify-center w-full h-48 border border-gray-200 rounded-[20px] cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 overflow-hidden transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-[15px] text-gray-500 font-medium">แตะเพื่อถ่ายภาพ</p>
                </div>
              )}
              <input 
                id="imgAfter" 
                name="imgAfter" 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 rounded-full bg-[#00B900] hover:bg-[#009900] text-white text-[17px] font-semibold active:scale-95 transition-transform"
        >
          {loading ? 'กำลังบันทึก...' : 'ส่งตรวจ QC'}
        </Button>
      </div>
    </form>
  )
}

export function ReworkJobForm({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRework = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('jobId', jobId)
    formData.append('rejectReason', reason)

    const { reworkJobByReporter } = await import('@/app/actions/repair')
    const res = await reworkJobByReporter(formData)
    if (res.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('ส่งกลับไปให้ช่างแก้ไขแล้ว')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleRework} className="bg-white p-6 rounded-[24px] border border-orange-100 mt-6 shadow-sm">
      <h3 className="font-semibold text-xl mb-6 text-orange-700 tracking-tight flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        ส่งงานกลับไปแก้ไข
      </h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="rejectReason" className="text-[15px] text-gray-500 mb-3 block font-medium">จุดที่ต้องการให้แก้ไขเพิ่ม <span className="text-orange-500">*</span></Label>
          <Input 
            id="rejectReason" 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
            placeholder="เช่น งานยังไม่เรียบร้อย, อาการยังไม่หายขาด..." 
            required
            className="rounded-xl bg-gray-50 border-gray-200 h-12 px-5 text-[15px] focus-visible:ring-orange-500"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !reason}
          variant="outline"
          className="w-full h-14 rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 text-[17px] font-semibold active:scale-95 transition-transform"
        >
          {loading ? 'กำลังบันทึก...' : 'ยืนยันส่งงานกลับไปแก้ไข'}
        </Button>
      </div>
    </form>
  )
}

export function ResubmitJobForm({ job }: { job: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [detail, setDetail] = useState(job.detail || '')

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('jobId', job.id)
    formData.append('dept', job.dept)
    formData.append('machine', job.machine)
    formData.append('side', job.side)
    formData.append('opType', job.opType)
    formData.append('detail', detail)

    const { resubmitJob } = await import('@/app/actions/repair')
    const res = await resubmitJob(formData)
    if (res.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('แก้ไขและส่งเรื่องใหม่สำเร็จ')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleResubmit} className="bg-white p-6 rounded-[24px] border border-blue-100 mt-6 shadow-sm">
      <h3 className="font-semibold text-xl mb-6 text-blue-700 tracking-tight flex items-center">
        แก้ไขรายละเอียดเพื่อส่งเรื่องใหม่
      </h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="detail" className="text-[15px] text-gray-500 mb-3 block font-medium">รายละเอียดอาการ (แก้ไขได้) <span className="text-blue-500">*</span></Label>
          <textarea 
            id="detail" 
            value={detail} 
            onChange={e => setDetail(e.target.value)} 
            required
            rows={4}
            className="w-full rounded-xl bg-gray-50 border border-gray-200 p-4 text-[15px] focus-visible:ring-blue-500 focus:outline-none focus:ring-2"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !detail}
          className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[17px] font-semibold active:scale-95 transition-transform"
        >
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งเรื่องซ่อมใหม่'}
        </Button>
      </div>
    </form>
  )
}

