"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPmJob } from "@/app/actions/pm"
import { CheckCircle, Info, Settings, Clock, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlassSelect } from "@/components/ui/glass-select"

export default function PmForm({ machines, templates }: { machines: any[], templates: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedMachine, setSelectedMachine] = useState<string>("")
  const [selectedShift, setSelectedShift] = useState<string>("")
  const [selectedLine, setSelectedLine] = useState<string>("")
  const [selectedCondition, setSelectedCondition] = useState<string>("")
  const [checklistResults, setChecklistResults] = useState<Record<string, { result: string, note: string }>>({})

  const currentTemplate = templates.find(t => t.id === selectedTemplate)

  const handleResultChange = (itemId: string, field: 'result' | 'note', value: string) => {
    setChecklistResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        result: prev[itemId]?.result || 'pass',
        note: prev[itemId]?.note || '',
        [field]: value
      }
    }))
  }

  // Auto-evaluation: Set overall condition to 'ชำรุด' if any item fails
  useEffect(() => {
    const hasFail = Object.values(checklistResults).some(item => item.result === 'fail')
    if (hasFail) {
      setSelectedCondition('ชำรุด')
    } else if (!hasFail && selectedCondition === 'ชำรุด') {
      setSelectedCondition('ปกติ')
    }
  }, [checklistResults, selectedCondition])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      const resultsArray = Object.entries(checklistResults).map(([id, val]) => ({
        checklistItemId: id,
        result: val.result || 'pass',
        note: val.note || ''
      }))

      // For unselected items, default to pass
      currentTemplate?.items.forEach((item: any) => {
        if (!resultsArray.find(r => r.checklistItemId === item.id)) {
          resultsArray.push({ checklistItemId: item.id, result: 'pass', note: '' })
        }
      })

      const data = {
        pmCode: `PM-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`,
        templateId: selectedTemplate,
        machine: selectedMachine,
        pmDate: new Date(formData.get('pmDate') as string),
        shift: selectedShift,
        productionLine: selectedLine,
        runningHours: formData.get('runningHours') ? parseInt(formData.get('runningHours') as string) : undefined,
        partsReplaced: formData.get('partsReplaced') as string,
        overallCondition: selectedCondition,
        workDone: formData.get('workDone') as string,
        remarks: formData.get('remarks') as string,
        nextPmDate: formData.get('nextPmDate') ? new Date(formData.get('nextPmDate') as string) : undefined,
        results: resultsArray
      }

      await createPmJob(data)
      alert("บันทึก PM สำเร็จ")
      router.push('/dashboard') // Or /pm history once created
    } catch (error) {
      console.error(error)
      alert("เกิดข้อผิดพลาดในการบันทึก")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
      
      {/* 1. ข้อมูลทั่วไป */}
      <div className="p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-semibold flex items-center text-gray-800">
          <Settings className="w-5 h-5 mr-2 text-blue-500" /> ข้อมูลทั่วไป
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3 z-[150] relative">
            <label className="text-sm font-semibold text-gray-700">วันที่ตรวจ <span className="text-red-500">*</span></label>
            <input type="date" name="pmDate" required className="w-full text-base h-[54px] rounded-2xl border border-gray-200 px-4 bg-white/60 backdrop-blur-sm hover:bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 shadow-sm" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <GlassSelect 
            label="เทมเพลตรายการตรวจ"
            value={selectedTemplate}
            onValueChange={setSelectedTemplate}
            placeholder="-- เลือกเทมเพลต --"
            options={templates.map(t => ({ value: t.id, label: t.name }))}
            required
            zIndex={140}
          />

          <GlassSelect 
            label="เครื่องจักร"
            value={selectedMachine}
            onValueChange={setSelectedMachine}
            placeholder="-- เลือกเครื่องจักร --"
            options={machines.map(m => ({ value: m.name, label: m.name }))}
            required
            zIndex={130}
          />

          <GlassSelect 
            label="รอบกะ"
            value={selectedShift}
            onValueChange={setSelectedShift}
            placeholder="-- เลือกกะ --"
            options={["กะเช้า (08:30–20:30)", "กะดึก (20:30–08:30)"]}
            zIndex={120}
          />

          <GlassSelect 
            label="ไลน์ผลิต"
            value={selectedLine}
            onValueChange={setSelectedLine}
            placeholder="-- เลือกไลน์ --"
            options={["Line A", "Line B", "Line C"]}
            zIndex={110}
          />
        </div>
      </div>

      {/* 2. Checklist */}
      {currentTemplate && (
        <div className="p-6 md:p-8 bg-slate-50/50 space-y-6">
          <h2 className="text-lg font-semibold flex items-center text-gray-800">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> รายการตรวจสอบ (Checklist)
          </h2>
          
          <div className="flex flex-col gap-4">
            {currentTemplate.items.map((item: any, idx: number) => {
              const res = checklistResults[item.id]?.result || 'pass';
              const isFail = res === 'fail';
              
              return (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <p className="font-medium text-gray-800 text-base pt-1">{item.taskName}</p>
                    </div>
                    
                    <div className="relative flex bg-slate-100/80 rounded-xl p-1.5 w-full md:w-[320px] shrink-0 isolate">
                      {/* Sliding Pill Indicator */}
                      <div
                        className="absolute top-1.5 bottom-1.5 rounded-lg transition-all duration-500 ease-out -z-10 shadow-sm"
                        style={{
                          width: 'calc((100% - 12px) / 3)',
                          left: res === 'pass' ? '6px' : res === 'fail' ? 'calc(6px + (100% - 12px) / 3)' : 'calc(6px + ((100% - 12px) / 3) * 2)',
                          backgroundColor: res === 'pass' ? '#10b981' : res === 'fail' ? '#ef4444' : '#9ca3af'
                        }}
                      />
                      
                      <button 
                        type="button"
                        onClick={() => handleResultChange(item.id, 'result', 'pass')}
                        className={`flex-1 py-2 text-sm font-bold transition-colors duration-300 ${res === 'pass' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        ผ่าน
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleResultChange(item.id, 'result', 'fail')}
                        className={`flex-1 py-2 text-sm font-bold transition-colors duration-300 ${res === 'fail' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        ไม่ผ่าน
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleResultChange(item.id, 'result', 'na')}
                        className={`flex-1 py-2 text-sm font-bold transition-colors duration-300 ${res === 'na' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                  
                  {isFail && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
                      <input 
                        type="text" 
                        placeholder="ระบุสาเหตุที่ไม่ผ่าน หรือหมายเหตุเพิ่มเติม... *"
                        className="w-full rounded-xl border-gray-200 px-4 py-3 bg-red-50/50 hover:bg-red-50 focus:bg-white focus:ring-2 focus:ring-red-500/50 transition-all text-gray-800 placeholder-red-300"
                        value={checklistResults[item.id]?.note || ''}
                        onChange={(e) => handleResultChange(item.id, 'note', e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. สรุปสภาพเครื่องจักร */}
      <div className="p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-semibold flex items-center text-gray-800">
          <Info className="w-5 h-5 mr-2 text-indigo-500" /> รายงานผลสภาพรวม
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">ชั่วโมงการทำงาน</label>
            <input type="number" name="runningHours" placeholder="เช่น 4250" className="w-full text-base h-[54px] rounded-2xl border border-gray-200 px-4 bg-white/60 backdrop-blur-sm hover:bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 shadow-sm" />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">อะไหล่ที่เปลี่ยน</label>
            <input type="text" name="partsReplaced" placeholder="ชื่อชิ้นส่วน หรือ '-'" className="w-full text-base h-[54px] rounded-2xl border border-gray-200 px-4 bg-white/60 backdrop-blur-sm hover:bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 shadow-sm" />
          </div>

          <GlassSelect 
            label="สภาพเครื่องจักรโดยรวม"
            value={selectedCondition}
            onValueChange={setSelectedCondition}
            placeholder="-- เลือกการประเมิน --"
            options={[
              { value: "ปกติ", label: "ปกติ — พร้อมทำงาน 100%" },
              { value: "ต้องติดตาม", label: "ต้องติดตาม — พบปัญหาเล็กน้อย" },
              { value: "ชำรุด", label: "ชำรุด — ต้องหยุดซ่อม" }
            ]}
            required
            zIndex={100}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">งานที่ดำเนินการซ่อมแซม</label>
            <textarea name="workDone" rows={3} placeholder="ทำความสะอาดคราบฝุ่น, เติมสารหล่อลื่น..." className="w-full text-base rounded-2xl border border-gray-200 px-4 py-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 leading-relaxed shadow-sm"></textarea>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">ข้อสังเกตและงานติดตาม</label>
            <textarea name="remarks" rows={3} placeholder="ตรวจพบอาการสั่น..." className="w-full text-base rounded-2xl border border-gray-200 px-4 py-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 leading-relaxed shadow-sm"></textarea>
          </div>
        </div>

        <div className="space-y-3 max-w-sm">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-400" /> วันที่เสนอแผน PM ครั้งถัดไป
          </label>
          <input type="date" name="nextPmDate" className="w-full text-base h-[54px] rounded-2xl border border-gray-200 px-4 bg-white/60 backdrop-blur-sm hover:bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 shadow-sm" />
        </div>
      </div>

      <div className="p-6 md:p-8 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-full font-medium text-gray-600 hover:bg-gray-200 transition-colors">
          ยกเลิก
        </button>
        <button type="submit" disabled={loading} className="btn-liquid-primary px-8 py-2.5 rounded-full font-medium text-white shadow-lg disabled:opacity-50 flex items-center justify-center">
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
          ) : (
             <CheckCircle className="w-5 h-5 mr-2" />
          )}
          {loading ? 'กำลังบันทึก...' : 'บันทึกเช็กชีต PM'}
        </button>
      </div>

    </form>
  )
}
