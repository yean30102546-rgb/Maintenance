import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PmListClient from "./_components/PmListClient";

export const dynamic = 'force-dynamic';

export default async function PMPage() {
  const pmJobs = await prisma.pmJob.findMany({
    orderBy: { pmDate: 'desc' },
    include: {
      technician: true,
      template: true,
      results: {
        include: {
          checklistItem: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">ประวัติบำรุงรักษาเชิงป้องกัน (PM)</h1>
        <Link 
          href="/pm/create" 
          className="btn-liquid-primary px-5 py-2.5 rounded-full text-sm font-semibold flex items-center shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> สร้างใบงาน PM ใหม่
        </Link>
      </div>

      {pmJobs.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center py-16 text-gray-500">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีประวัติการทำ PM</h3>
          <p className="text-sm text-gray-500 mb-6">
            ข้อมูลการทำ PM จะแสดงที่นี่เมื่อมีการส่งใบงาน<br/>
            คลิกปุ่มด้านบนเพื่อสร้างใบงาน PM
          </p>
          <Link 
            href="/pm/create" 
            className="inline-flex px-6 py-2 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
          >
            เริ่มทำ PM
          </Link>
        </div>
      ) : (
        <PmListClient pmJobs={pmJobs} />
      )}
    </div>
  );
}
