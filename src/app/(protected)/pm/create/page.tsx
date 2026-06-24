import { prisma } from "@/lib/prisma";
import PmForm from "./_components/PmForm";
import { getMachinesForPm, getPmTemplates } from "@/app/actions/pm";

export const dynamic = "force-dynamic";

export default async function PmCreatePage() {
  const machines = await getMachinesForPm()
  const templates = await getPmTemplates()

  // For testing, if no templates exist, we create a mock one.
  if (templates.length === 0) {
    const mockTemplate = await prisma.pmTemplate.create({
      data: {
        name: "FLF Monthly Template",
        machineType: "FLF",
        items: {
          create: [
            { taskName: "ตรวจสอบระบบสายพาน", orderIndex: 1 },
            { taskName: "ตรวจสอบระดับน้ำมันหล่อลื่น", orderIndex: 2 },
            { taskName: "ทำความสะอาดระบบดูดฝุ่น", orderIndex: 3 },
            { taskName: "ตรวจสอบระบบเซนเซอร์", orderIndex: 4 },
          ]
        }
      },
      include: { items: true }
    })
    templates.push(mockTemplate)
  } else if (templates[0].items.length === 0) {
    // Fix existing template if it has no items
    await prisma.pmChecklistItem.createMany({
      data: [
        { templateId: templates[0].id, taskName: "ตรวจสอบระบบสายพาน", orderIndex: 1 },
        { templateId: templates[0].id, taskName: "ตรวจสอบระดับน้ำมันหล่อลื่น", orderIndex: 2 },
        { templateId: templates[0].id, taskName: "ทำความสะอาดระบบดูดฝุ่น", orderIndex: 3 },
        { templateId: templates[0].id, taskName: "ตรวจสอบระบบเซนเซอร์", orderIndex: 4 },
      ]
    });
    // Re-fetch templates
    const updatedTemplates = await getPmTemplates();
    templates.length = 0;
    templates.push(...updatedTemplates);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แบบฟอร์มตรวจสอบเครื่องจักร</h1>
          <p className="text-sm text-gray-500">บำรุงรักษาเชิงป้องกัน (PM)</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <PmForm machines={machines} templates={templates} />
      </div>
    </div>
  )
}
