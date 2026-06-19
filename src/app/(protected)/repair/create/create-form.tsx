'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
import { Camera } from 'lucide-react'

type Machine = {
  id: string
  name: string
  dept: string | null
}

export default function CreateRepairForm({ machines }: { machines: Machine[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [dept, setDept] = useState('')
  const [machine, setMachine] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Get unique departments from machines
  const departments = useMemo(() => {
    const depts = machines.map(m => m.dept).filter(Boolean) as string[]
    return Array.from(new Set(depts)).sort()
  }, [machines])

  // Filter machines by selected department
  const filteredMachines = useMemo(() => {
    if (!dept) return []
    return machines.filter(m => m.dept === dept).sort((a, b) => a.name.localeCompare(b.name))
  }, [machines, dept])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('dept', dept)
    formData.set('machine', machine)

    const result = await createRepairJob(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('แจ้งซ่อมสำเร็จ! (Repair request created)')
      router.push('/repair')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div>
        <Label htmlFor="dept" className="text-sm font-semibold text-gray-700 mb-2 block">แผนกที่แจ้งซ่อม (Department)</Label>
        <Select value={dept} onValueChange={(val) => { setDept(val); setMachine('') }} required>
          <SelectTrigger className="w-full text-base py-6 bg-white/60 backdrop-blur-sm border-gray-200 focus:ring-blue-500 rounded-2xl transition-all shadow-sm">
            <SelectValue placeholder="เลือกแผนก" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-xl border-gray-100">
            {departments.map(d => (
              <SelectItem key={d} value={d} className="text-base py-3 cursor-pointer">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="machine" className="text-sm font-semibold text-gray-700 mb-2 block">เครื่องจักร / อุปกรณ์ (Machine)</Label>
        <Select value={machine} onValueChange={setMachine} required disabled={!dept}>
          <SelectTrigger className="w-full text-base py-6 bg-white/60 backdrop-blur-sm border-gray-200 focus:ring-blue-500 rounded-2xl transition-all shadow-sm">
            <SelectValue placeholder={dept ? "เลือกเครื่องจักร" : "กรุณาเลือกแผนกก่อน"} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-xl border-gray-100">
            {filteredMachines.map(m => (
              <SelectItem key={m.id} value={m.name} className="text-base py-3 cursor-pointer">{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="imgBefore" className="text-sm font-semibold text-gray-700 mb-2 block">ถ่ายภาพจุดที่เสีย (Photo)</Label>
        <label 
          htmlFor="imgBefore" 
          className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-white/40 hover:bg-blue-50/50 hover:border-blue-400 transition-all overflow-hidden group"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">แตะเพื่อถ่ายรูป หรือ เลือกรูปภาพ</p>
            </div>
          )}
          <input 
            id="imgBefore" 
            name="imgBefore" 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleImageChange}
          />
        </label>
      </div>

      <div>
        <Label htmlFor="detail" className="text-sm font-semibold text-gray-700 mb-2 block">รายละเอียดอาการเสีย (Detail)</Label>
        <textarea
          id="detail"
          name="detail"
          rows={4}
          required
          className="w-full p-5 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-base bg-white/60 backdrop-blur-sm transition-all shadow-sm resize-none"
          placeholder="อธิบายอาการเสียที่พบ..."
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={loading || !dept || !machine}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-8 text-xl font-bold rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งซ่อม'}
        </Button>
      </div>
    </form>
  )
}
