'use server'

import { supabaseStorage as supabase } from '@/lib/supabase/storage'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function createRepairJob(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) {
      return { error: 'Unauthorized. Please log in.' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: sessionId }
    })

    if (!dbUser) {
      return { error: 'User profile not found. Please register.' }
    }

    const dept = formData.get('dept') as string
    const machine = formData.get('machine') as string
    const side = formData.get('side') as string
    const opType = formData.get('opType') as string
    const detail = formData.get('detail') as string
    const imgFile1 = formData.get('imgBefore') as File | null
    const imgFile2 = formData.get('imgBefore2') as File | null
    const imgFile3 = formData.get('imgBefore3') as File | null

    if (!dept || !machine || !detail || !side || !opType) {
      return { error: 'Missing required fields (Department, Machine, Side, Operation Type, Detail).' }
    }

    const uploadImage = async (file: File | null) => {
      if (!file || file.size === 0) return null;
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `requests/${fileName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('JobImages')
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload failed:', uploadError);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('JobImages')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    };

    const imgBeforeUrl = await uploadImage(imgFile1);
    const imgBefore2Url = await uploadImage(imgFile2);
    const imgBefore3Url = await uploadImage(imgFile3);

    // Extract prefix from parentheses, e.g. "แผนกบัญชี (ACCD)" -> "ACCD"
    const prefixMatch = dept.match(/\(([^)]+)\)$/)
    const prefix = prefixMatch ? prefixMatch[1] : 'REP'

    // Generate date string DDMMYYYY (Buddhist Era)
    const now = new Date()
    const dd = now.getDate().toString().padStart(2, '0')
    const mm = (now.getMonth() + 1).toString().padStart(2, '0')
    const yyyyBE = (now.getFullYear() + 543).toString()
    const dateStr = `${dd}${mm}${yyyyBE}`
    
    const idPrefix = `${prefix}-${dateStr}`

    // Find the latest job for this prefix today to get the running number
    const latestJob = await prisma.repairJob.findFirst({
      where: {
        jobId: {
          startsWith: idPrefix + '-'
        }
      },
      orderBy: {
        jobId: 'desc'
      }
    })

    let nextNum = 1
    if (latestJob && latestJob.jobId) {
      const parts = latestJob.jobId.split('-')
      if (parts.length >= 3) {
        // e.g. PDB-30102569-01 -> parts[2] is "01"
        const lastNum = parseInt(parts[parts.length - 1], 10)
        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1
        }
      }
    }

    const jobId = `${idPrefix}-${nextNum.toString().padStart(2, '0')}`
    // Insert into database
    await prisma.repairJob.create({
      data: {
        jobId,
        requesterId: dbUser.id,
        dept,
        machine,
        side,
        opType,
        detail,
        imgBefore: imgBeforeUrl,
        imgBefore2: imgBefore2Url,
        imgBefore3: imgBefore3Url,
        status: 'รอซ่อม', // "Waiting for repair"
      }
    })

    revalidatePath('/repair')
    return { success: true }
    
  } catch (error) {
    console.error('Failed to create repair job:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function acceptRepairJob(jobId: string, eta: string) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) return { error: 'Unauthorized.' }

    const dbUser = await prisma.user.findUnique({ where: { id: sessionId } })
    if (!dbUser || !['technician', 'engineer', 'admin'].includes(dbUser.role)) {
      return { error: 'Unauthorized: Engineering role required.' }
    }

    await prisma.repairJob.update({
      where: { id: jobId },
      data: {
        status: 'กำลังซ่อม',
        technicianId: dbUser.id,
        eta,
      }
    })

    revalidatePath('/dashboard'); revalidatePath('/repair/' + jobId, 'page'); revalidatePath('/repair')
    revalidatePath('/engineer')
    return { success: true }
  } catch (err) {
    console.error('Failed to accept job:', err)
    return { error: 'Failed to accept job. Please try again.' }
  }
}

export async function setWaitParts(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) return { error: 'Unauthorized.' }

    const dbUser = await prisma.user.findUnique({ where: { id: sessionId } })
    if (!dbUser || !['technician', 'engineer', 'admin'].includes(dbUser.role)) {
      return { error: 'Unauthorized: Engineering role required.' }
    }

    const jobId = formData.get('jobId') as string
    const pendingReason = formData.get('pendingReason') as string

    if (!pendingReason || pendingReason.trim() === '') {
      return { error: 'กรุณาระบุชื่ออะไหล่หรือเหตุผลที่ต้องรอ' }
    }

    await prisma.repairJob.update({
      where: { id: jobId },
      data: {
        status: 'รออะไหล่',
        pendingReason: pendingReason.trim(),
      }
    })

    revalidatePath('/dashboard'); revalidatePath('/repair/' + jobId, 'page'); revalidatePath('/repair')
    revalidatePath('/engineer')
    return { success: true }
  } catch (err) {
    console.error('Failed to set wait parts status:', err)
    return { error: 'Failed to update job status. Please try again.' }
  }
}

export async function completeRepairJob(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) return { error: 'Unauthorized.' }

    const jobId = formData.get('jobId') as string
    const note = formData.get('note') as string
    const imageFile = formData.get('imgAfter') as File | null

    let imgAfterUrl = null

    // Attempt Image Upload if provided (Bypass if Supabase is down)
    if (imageFile && imageFile.size > 0) {
      try {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `after_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `requests/${fileName}`
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from('JobImages')
          .upload(filePath, buffer, { contentType: imageFile.type })

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('JobImages').getPublicUrl(filePath)
          imgAfterUrl = publicUrlData.publicUrl
        } else {
          console.warn('Image upload failed, proceeding without image:', uploadError)
        }
      } catch (uploadException) {
         console.warn('Image upload threw an exception, proceeding without image:', uploadException)
      }
    }

    await prisma.repairJob.update({
      where: { id: jobId },
      data: {
        status: 'ซ่อมเสร็จ',
        note,
        doneDate: new Date(),
        ...(imgAfterUrl && { imgAfter: imgAfterUrl })
      }
    })

    revalidatePath('/dashboard'); revalidatePath('/repair/' + jobId, 'page'); revalidatePath('/repair')
    revalidatePath('/engineer')
    return { success: true }
  } catch (err) {
    console.error('Failed to complete job:', err)
    return { error: 'Failed to complete job. Please try again.' }
  }
}

export async function rejectJobByEngineer(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) return { error: 'Unauthorized.' }

    const dbUser = await prisma.user.findUnique({ where: { id: sessionId } })
    if (!dbUser || !['technician', 'engineer', 'admin'].includes(dbUser.role)) {
      return { error: 'Unauthorized: Engineering role required.' }
    }

    const jobId = formData.get('jobId') as string
    const rejectReason = formData.get('rejectReason') as string

    if (!rejectReason || rejectReason.trim() === '') {
      return { error: 'กรุณาระบุเหตุผลในการตีกลับ' }
    }

    await prisma.repairJob.update({
      where: { id: jobId },
      data: {
        status: 'ตีกลับ',
        rejectReason: rejectReason.trim(),
        technicianId: dbUser.id // Track who rejected it
      }
    })

    revalidatePath('/dashboard'); revalidatePath('/repair/' + jobId, 'page'); revalidatePath('/repair')
    revalidatePath('/engineer')
    return { success: true }
  } catch (err) {
    console.error('Failed to reject job:', err)
    return { error: 'Failed to reject job. Please try again.' }
  }
}

export async function reworkJobByReporter(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) return { error: 'Unauthorized.' }

    const jobId = formData.get('jobId') as string
    const rejectReason = formData.get('rejectReason') as string

    if (!rejectReason || rejectReason.trim() === '') {
      return { error: 'กรุณาระบุเหตุผลที่ให้กลับไปแก้ไข' }
    }

    await prisma.repairJob.update({
      where: { id: jobId },
      data: {
        status: 'รองานแก้ไข',
        rejectReason: rejectReason.trim(),
      }
    })

    revalidatePath('/dashboard'); revalidatePath('/repair/' + jobId, 'page'); revalidatePath('/repair')
    revalidatePath('/engineer')
    return { success: true }
  } catch (err) {
    console.error('Failed to rework job:', err)
    return { error: 'Failed to update job status. Please try again.' }
  }
}

export async function resubmitJob(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (!sessionId) return { error: 'Unauthorized.' }

    const jobId = formData.get('jobId') as string
    const dept = formData.get('dept') as string
    const machine = formData.get('machine') as string
    const side = formData.get('side') as string
    const opType = formData.get('opType') as string
    const detail = formData.get('detail') as string

    if (!dept || !machine || !detail || !side || !opType) {
      return { error: 'Missing required fields.' }
    }

    await prisma.repairJob.update({
      where: { id: jobId },
      data: {
        dept,
        machine,
        side,
        opType,
        detail,
        status: 'รอซ่อม', // Back to pending
        rejectReason: null, // Clear the reject reason
        technicianId: null, // Unassign the technician so it goes back to pool
      }
    })

    revalidatePath('/dashboard'); revalidatePath('/repair/' + jobId, 'page'); revalidatePath('/repair')
    revalidatePath('/engineer')
    return { success: true }
  } catch (err) {
    console.error('Failed to resubmit job:', err)
    return { error: 'Failed to resubmit job. Please try again.' }
  }
}

