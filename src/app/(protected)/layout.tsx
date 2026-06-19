import Link from "next/link";
import { ReactNode } from "react";
import { Wrench, Calendar, LayoutDashboard, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const mockSessionId = cookieStore.get('mock_session_id')?.value;

  let authId = mockSessionId;

  if (!authId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/login');
    }
    authId = user.id;
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: authId }
  });

  if (!dbUser) {
    redirect('/register');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 sm:pb-0">
      <nav className="bg-white border-b sticky top-0 z-10 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-blue-600">SFC SMART</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Link>
                <Link href="/pm" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Calendar className="w-4 h-4 mr-2" /> งาน PM
                </Link>
                <Link href="/admin" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <Settings className="w-4 h-4 mr-2" /> Admin
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link href="/repair/create" className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200 flex items-center">
                <Wrench className="w-4 h-4 mr-2" /> แจ้งงานซ่อม
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="sm:hidden bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md flex items-center justify-between">
        <h1 className="font-bold text-lg">SFC SMART REPAIR</h1>
        <Link href="/repair/create" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
          <Wrench className="w-5 h-5" />
        </Link>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative">
        {children}
        
        {/* Floating Action Button (Mobile Only) */}
        <div className="sm:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <Link href="/repair/create">
            <div className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-white">
              <Wrench className="w-6 h-6" />
            </div>
          </Link>
        </div>
      </main>
      
      {/* Mobile Nav Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-10 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">หน้าหลัก</span>
        </Link>
        <Link href="/repair" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <Wrench className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">แจ้งซ่อม</span>
        </Link>
        <Link href="/pm" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">งาน PM</span>
        </Link>
        <Link href="/admin" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">ตั้งค่า</span>
        </Link>
      </div>
    </div>
  );
}
