'use server';

import { prisma } from '@/lib/prisma';

export async function loginUser(username: string, pass: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { username, password: pass, status: 'active' },
    });
    
    if (!user) {
      return { success: false, error: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง' };
    }
    
    // In production, sign a JWT or establish a Supabase session.
    // For this prototype, we just return success.
    return { success: true, user: { id: user.id, role: user.role, name: user.fullname } };
  } catch (error) {
    console.error('Login error', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }
}
