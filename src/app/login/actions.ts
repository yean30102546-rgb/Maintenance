'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function loginWithCode(prevState: any, formData: FormData) {
  const passcode = formData.get('passcode') as string;
  let targetRole = '';

  if (passcode.toLowerCase() === 'reporter') {
    targetRole = 'user';
  } else if (passcode.toLowerCase() === 'tech') {
    targetRole = 'technician';
  } else {
    return { error: 'รหัสไม่ถูกต้อง (กรุณาพิมพ์ reporter หรือ tech)' };
  }

  let user = await prisma.user.findFirst({
    where: { role: targetRole },
    orderBy: { createdAt: 'asc' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        fullname: targetRole === 'technician' ? 'ช่างซ่อมบำรุง' : 'พนักงานฝ่ายผลิต',
        role: targetRole,
        dept: targetRole === 'technician' ? 'ซ่อมบำรุง' : 'ฝ่ายผลิต',
        status: 'active',
      }
    });
  }

  const cookieStore = await cookies();
  cookieStore.set('session_id', user.id, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect('/dashboard');
}
