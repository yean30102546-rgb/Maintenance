import Link from "next/link";
import { ReactNode } from "react";
import { Wrench, Calendar, LayoutDashboard, Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import GlobalRepairModal from "@/components/GlobalRepairModal";
import { Suspense } from "react";
import { ClientNavMenu } from "@/components/ui/client-nav-menu";
import { DesktopAddButton, MobileAddButton, MobileFabButton } from "@/components/ui/top-add-button";
import { UserMenu } from "@/components/ui/user-menu";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  let dbUser = null;

  if (sessionId) {
    dbUser = await prisma.user.findUnique({
      where: { id: sessionId }
    });
  }

  if (!dbUser) {
    redirect('/login');
  }

  // Fetch active machines for the Global Repair Form
  const machines = await prisma.machine.findMany({
    where: { status: 'active' },
    select: { id: true, name: true, dept: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 sm:pb-0">
      <nav className="bg-white border-b sticky top-0 z-[100] hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-blue-600">SFC SMART</span>
            </div>
            
            {/* Center the Tab Menu */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <ClientNavMenu userRole={dbUser.role} />
            </div>

            <div className="flex items-center gap-3">
              {dbUser.role !== 'technician' && dbUser.role !== 'engineer' && (
                <DesktopAddButton />
              )}
              <UserMenu dbUser={dbUser} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="sm:hidden bg-blue-600 text-white p-4 sticky top-0 z-[100] shadow-md flex items-center justify-between">
        <h1 className="font-bold text-lg">SFC SMART</h1>
        <div className="flex items-center gap-2">
          {dbUser.role !== 'technician' && dbUser.role !== 'engineer' && (
            <MobileAddButton />
          )}
          <UserMenu dbUser={dbUser} />
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative">
        {children}
        
        {/* Floating Action Button (Mobile Only) */}
        {dbUser.role !== 'technician' && dbUser.role !== 'engineer' && (
          <MobileFabButton />
        )}
      </main>
      
      <Suspense fallback={null}>
        <GlobalRepairModal machines={machines} userDept={dbUser.dept} />
      </Suspense>
      
      {/* Mobile Nav Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-10 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">หน้าหลัก</span>
        </Link>
        
        {(dbUser.role === 'technician' || dbUser.role === 'engineer' || dbUser.role === 'admin') && (
          <Link href="/engineer" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
            <Wrench className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">รับงานช่าง</span>
          </Link>
        )}

        <Link href="/pm" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">งาน PM</span>
        </Link>
        
        {dbUser.role === 'admin' && (
          <Link href="/admin" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
            <Settings className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">ตั้งค่า</span>
          </Link>
        )}
      </div>
    </div>
  );
}
