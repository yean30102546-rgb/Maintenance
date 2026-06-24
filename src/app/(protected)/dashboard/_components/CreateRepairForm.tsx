'use client'

import { useState, useMemo, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { createRepairJob } from '@/app/actions/repair'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Camera, ChevronDown, X, Maximize2 } from 'lucide-react'

type Machine = {
  id: string
  name: string
  dept: string | null
}

export default function CreateRepairForm({ 
  machines,
  userDept,
  onSuccess 
}: { 
  machines: Machine[]
  userDept?: string | null
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  
  const [dept, setDept] = useState<string | null>(userDept || null)
  const [machine, setMachine] = useState<string | null>(null)
  const [side, setSide] = useState<string | null>(null)
  const [opType, setOpType] = useState<string | null>(null)
  
  const [images, setImages] = useState<{file: File, preview: string}[]>([])
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null)

  // Hardcoded departments as requested
  const departments = [
    "แผนกบัญชี (ACCD)",
    "แผนกธุรการ - ออฟฟิศ (ADMO)",
    "แผนกธุรการ - โรงงาน (ADMP)",
    "แผนกพาณิชย์ (CMCD)",
    "แผนกพาณิชย์ผลิตภัณฑ์พิเศษ (CSPD)",
    "แผนกวิศวกรรม (ENGD)",
    "กรรมการผู้จัดการ - K.Chira (MDCR)",
    "กรรมการผู้จัดการ - KTR (MDKY)",
    "กรรมการผู้จัดการ - DR. (MDPC)",
    "กรรมการผู้จัดการ - K.Porapong (MDPR)",
    "กรรมการผู้จัดการ - K.Tisanu (MDTR)",
    "กรรมการผู้จัดการ - K.Worawan (MDWV)",
    "แผนกบริหาร - KTR (MGKY)",
    "แผนกบริหาร - K.Porapong (MGPR)",
    "แผนกบริหาร (MGTD)",
    "แผนกบริหาร - K.Tisanu (MGTR)",
    "แผนกซ่อมบำรุง (MTND)",
    "แผนกปฏิบัติการ (OPRD)",
    "แผนกผลิต (ผสม) (PDBD)",
    "แผนกผลิต (บรรจุ) (PDFD)",
    "แผนกวางแผน (PLND)",
    "แผนกจัดซื้อ (PURD)",
    "แผนกควบคุมคุณภาพ (QCTD)",
    "แผนกจัดการคุณภาพ (QMTD)",
    "ระบบจัดการคุณภาพและความปลอดภัย (QSMS)",
    "แผนกความปลอดภัย (SAFD)",
    "วิเคราะห์และวางแผนห่วงโซ่อุปทาน (SCPD)",
    "คลังสินค้าสำเร็จรูป (WFGD)",
    "คลังสินค้าบรรจุภัณฑ์ (WPKD)",
    "คลังสูตรและวัตถุดิบ (WRMD)"
  ]

  // Filter machines by selected department
  const filteredMachines = useMemo(() => {
    if (!dept) return []
    return machines.filter(m => m.dept === dept).sort((a, b) => a.name.localeCompare(b.name))
  }, [machines, dept])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const availableSlots = 3 - images.length
      const filesToAdd = newFiles.slice(0, availableSlots)
      
      if (filesToAdd.length > 0) {
        const newImages = filesToAdd.map(file => ({
          file,
          preview: URL.createObjectURL(file)
        }))
        setImages(prev => [...prev, ...newImages])
      } 
      if (newFiles.length > availableSlots) {
        toast.error('สามารถแนบรูปภาพได้สูงสุด 3 รูป')
      }
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      // revoke URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const openPreview = (src: string) => {
    setPreviewImageSrc(src)
    setPreviewModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const detail = formData.get('detail') as string
    
    if (!detail || detail.trim() === '') {
      toast.error('กรุณาระบุรายละเอียดอาการเสีย (Detail)')
      return
    }

    setLoading(true)

    if (dept) formData.set('dept', dept)
    if (machine) formData.set('machine', machine)
    if (side) formData.set('side', side)
    if (opType) formData.set('opType', opType)

    formData.delete('imgBeforeRaw') // Remove the raw input from the FormData

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: false, // Disabled web worker to prevent freezing in Next.js dev mode
    }

    try {
      if (images[0]) {
        const comp0 = await imageCompression(images[0].file, options)
        formData.set('imgBefore', comp0, comp0.name)
      }
      if (images[1]) {
        const comp1 = await imageCompression(images[1].file, options)
        formData.set('imgBefore2', comp1, comp1.name)
      }
      if (images[2]) {
        const comp2 = await imageCompression(images[2].file, options)
        formData.set('imgBefore3', comp2, comp2.name)
      }
    } catch (error) {
      console.error("Error compressing images:", error)
    }

    try {
      const result = await createRepairJob(formData)

      if (result.error) {
        toast.error(result.error)
        setLoading(false)
      } else {
        toast.success('แจ้งซ่อมสำเร็จ! (Repair request created)')
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error("Server Action Error:", error)
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองอีกครั้ง')
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div className="z-[120] relative">
        <Label htmlFor="dept" className="text-sm font-semibold text-gray-700 mb-2 block">แผนกที่แจ้งซ่อม (Department)</Label>
        <Select value={dept || ''} onValueChange={(val) => { setDept(val); setMachine(null) }} required disabled={!!userDept}>
          <SelectTrigger className="w-full text-base py-6 bg-white/60 backdrop-blur-sm border-gray-200 focus:ring-blue-500 rounded-2xl transition-all shadow-sm">
            <SelectValue placeholder="เลือกแผนก" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false} className="rounded-2xl shadow-xl border-gray-100 z-[9999] max-h-60 overflow-y-auto">
            {/* If userDept is provided, just show that option, otherwise show all */}
            {(userDept ? [userDept] : departments).map(d => (
              <SelectItem key={d} value={d} className="text-base py-3 cursor-pointer">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="z-[110] relative">
        <Label htmlFor="machine" className="text-sm font-semibold text-gray-700 mb-2 block">เครื่องจักร / อุปกรณ์ (Machine)</Label>
        <Select value={machine || ''} onValueChange={setMachine} required>
          <SelectTrigger className="w-full text-base py-6 bg-white/60 backdrop-blur-sm border-gray-200 focus:ring-blue-500 rounded-2xl transition-all shadow-sm">
            <SelectValue placeholder="เลือกเครื่องจักร" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false} className="rounded-2xl shadow-xl border-gray-100 z-[9999] max-h-60 overflow-y-auto">
            <SelectItem value="FLF (01)" className="text-base py-3 cursor-pointer">FLF (01)</SelectItem>
            <SelectItem value="FLF (02)" className="text-base py-3 cursor-pointer">FLF (02)</SelectItem>
            <SelectItem value="FLF (03)" className="text-base py-3 cursor-pointer">FLF (03)</SelectItem>
            <SelectItem value="FLF (04)" className="text-base py-3 cursor-pointer">FLF (04)</SelectItem>
            <SelectItem value="FLF (05)" className="text-base py-3 cursor-pointer">FLF (05)</SelectItem>
            <SelectItem value="FLF (06)" className="text-base py-3 cursor-pointer">FLF (06)</SelectItem>
            <SelectItem value="FLF (07)" className="text-base py-3 cursor-pointer">FLF (07)</SelectItem>
            <SelectItem value="FLF (08)" className="text-base py-3 cursor-pointer">FLF (08)</SelectItem>
            <SelectItem value="FLF (09)" className="text-base py-3 cursor-pointer">FLF (09)</SelectItem>
            <SelectItem value="FLF (10)" className="text-base py-3 cursor-pointer">FLF (10)</SelectItem>
            <SelectItem value="FLF (11)" className="text-base py-3 cursor-pointer">FLF (11)</SelectItem>
            <SelectItem value="FLF (12)" className="text-base py-3 cursor-pointer">FLF (12)</SelectItem>
            <SelectItem value="FLF (13)" className="text-base py-3 cursor-pointer">FLF (13)</SelectItem>
            <SelectItem value="FLF (14)" className="text-base py-3 cursor-pointer">FLF (14)</SelectItem>
            <SelectItem value="FLF (15)" className="text-base py-3 cursor-pointer">FLF (15)</SelectItem>
            <SelectItem value="FLF (16)" className="text-base py-3 cursor-pointer">FLF (16)</SelectItem>
            <SelectItem value="FLF (17)" className="text-base py-3 cursor-pointer">FLF (17)</SelectItem>
            <SelectItem value="FLF (18)" className="text-base py-3 cursor-pointer">FLF (18)</SelectItem>
            <SelectItem value="FLF (19)" className="text-base py-3 cursor-pointer">FLF (19)</SelectItem>
            <SelectItem value="FLF (20)" className="text-base py-3 cursor-pointer">FLF (20)</SelectItem>
            <SelectItem value="FLF (21)" className="text-base py-3 cursor-pointer">FLF (21)</SelectItem>
            <SelectItem value="FLF (22)" className="text-base py-3 cursor-pointer">FLF (22)</SelectItem>
            <SelectItem value="FLF (23)" className="text-base py-3 cursor-pointer">FLF (23)</SelectItem>
            <SelectItem value="FLF (24)" className="text-base py-3 cursor-pointer">FLF (24)</SelectItem>
            <SelectItem value="FLF (25)" className="text-base py-3 cursor-pointer">FLF (25)</SelectItem>
            <SelectItem value="FLF (26)" className="text-base py-3 cursor-pointer">FLF (26)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="z-[105] relative">
        <Label htmlFor="side" className="text-sm font-semibold text-gray-700 mb-2 block">ด้านปัญหา (Problem Type)</Label>
        <Select value={side} onValueChange={setSide} required>
          <SelectTrigger className="w-full text-base py-6 bg-white/60 backdrop-blur-sm border-gray-200 focus:ring-blue-500 rounded-2xl transition-all shadow-sm">
            <SelectValue placeholder="เลือกด้านปัญหา" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false} className="rounded-2xl shadow-xl border-gray-100 z-[9999] max-h-60 overflow-y-auto">
            <SelectItem value="ระบบไฟฟ้า (Electrical)" className="text-base py-3 cursor-pointer">ระบบไฟฟ้า (Electrical)</SelectItem>
            <SelectItem value="ระบบเครื่องกล (Mechanical)" className="text-base py-3 cursor-pointer">ระบบเครื่องกล (Mechanical)</SelectItem>
            <SelectItem value="ระบบลม (Pneumatic)" className="text-base py-3 cursor-pointer">ระบบลม (Pneumatic)</SelectItem>
            <SelectItem value="ระบบไฮดรอลิก (Hydraulic)" className="text-base py-3 cursor-pointer">ระบบไฮดรอลิก (Hydraulic)</SelectItem>
            <SelectItem value="โครงสร้าง/สาธารณูปโภค (Utility)" className="text-base py-3 cursor-pointer">โครงสร้าง/สาธารณูปโภค (Utility)</SelectItem>
            <SelectItem value="ระบบควบคุมและจัดเก็บข้อมูล(scada)" className="text-base py-3 cursor-pointer">ระบบควบคุมและจัดเก็บข้อมูล(scada)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="z-[100] relative">
        <Label htmlFor="opType" className="text-sm font-semibold text-gray-700 mb-2 block">ประเภทงานซ่อม (Operation Type)</Label>
        <Select value={opType} onValueChange={setOpType} required>
          <SelectTrigger className="w-full text-base py-6 bg-white/60 backdrop-blur-sm border-gray-200 focus:ring-blue-500 rounded-2xl transition-all shadow-sm">
            <SelectValue placeholder="เลือกประเภท" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false} className="rounded-2xl shadow-xl border-gray-100 z-[9999] max-h-60 overflow-y-auto">
            <SelectItem value="ซ่อมฉุกเฉิน (Break Down)" className="text-base py-3 cursor-pointer">ซ่อมฉุกเฉิน (Break Down)</SelectItem>
            <SelectItem value="ซ่อมตามอาการ (Corrective)" className="text-base py-3 cursor-pointer">ซ่อมตามอาการ (Corrective)</SelectItem>
            <SelectItem value="ปรับปรุงประสิทธิภาพ (Modify)" className="text-base py-3 cursor-pointer">ปรับปรุงประสิทธิภาพ (Modify)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">ถ่ายภาพจุดที่เสีย (Photo) - สูงสุด 3 รูป</Label>
        
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-200 shadow-sm bg-white">
                <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => openPreview(img.preview)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => removeImage(idx)} className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white backdrop-blur-sm transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length < 3 && (
          <label 
            htmlFor="imgBefore" 
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-white/40 hover:bg-blue-50/50 hover:border-blue-400 transition-all overflow-hidden group relative"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">แตะเพื่อถ่ายรูป หรือ เลือกรูปภาพ</p>
              <p className="text-xs text-gray-400 mt-1">({images.length}/3)</p>
            </div>
            <input 
              id="imgBefore" 
              name="imgBeforeRaw" 
              type="file" 
              accept="image/*" 
              multiple
              capture="environment" 
              className="hidden" 
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      <div>
        <Label htmlFor="detail" className="text-sm font-semibold text-gray-700 mb-2 block">รายละเอียดอาการเสีย (Detail)</Label>
        <textarea
          id="detail"
          name="detail"
          rows={4}
          className="w-full p-5 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-base bg-white/60 backdrop-blur-sm transition-all shadow-sm resize-none"
          placeholder="อธิบายอาการเสียที่พบ..."
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={loading || !dept || !machine || !side || !opType}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-8 text-xl font-bold rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งซ่อม'}
        </Button>
      </div>

      {/* Image Preview Modal */}
      {previewModalOpen && previewImageSrc && (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
          <button 
            type="button"
            onClick={() => setPreviewModalOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={previewImageSrc} alt="Full Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </form>
  )
}
