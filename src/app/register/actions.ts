'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cookies } from 'next/headers';

const registerSchema = z.object({
  fullname: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  dept: z.string().min(1, "กรุณาเลือกแผนก"),
  line: z.string().min(1, "กรุณาเลือกไลน์ผลิต"),
  profilePicture: z.string().optional(),
  contact: z.string().optional(),
});

export async function registerUser(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const mockSessionId = cookieStore.get('mock_session_id')?.value;
  
  let authId = mockSessionId;

  if (!authId) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }
    authId = user.id;
  }

  const validatedFields = registerSchema.safeParse({
    fullname: formData.get('fullname'),
    dept: formData.get('dept'),
    line: formData.get('line'),
    profilePicture: formData.get('profilePicture'),
    contact: formData.get('contact'),
  });

  if (!validatedFields.success) {
    return {
      error: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง",
    };
  }

  const { fullname, dept, line, profilePicture, contact } = validatedFields.data;

  try {
    await prisma.user.create({
      data: {
        supabaseAuthId: authId,
        fullname,
        dept,
        line,
        profilePicture,
        contact,
        role: "user", // Default role
        status: "active",
      },
    });
  } catch (error) {
    console.error("Failed to register user:", error);
    return {
      error: "เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองอีกครั้ง",
    };
  }

  redirect('/dashboard');
}
