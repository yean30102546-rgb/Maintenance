'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createRepairJob(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please log in.' }
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id }
    })

    if (!dbUser) {
      return { error: 'User profile not found. Please register.' }
    }

    const dept = formData.get('dept') as string
    const machine = formData.get('machine') as string
    const detail = formData.get('detail') as string
    const imageFile = formData.get('imgBefore') as File | null

    if (!dept || !machine || !detail) {
      return { error: 'Missing required fields (Department, Machine, Detail).' }
    }

    let imgBeforeUrl = null

    // Handle Image Upload
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `requests/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('repair-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Image upload failed:', uploadError)
        return { error: 'Failed to upload image. Please try again.' }
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('repair-images')
        .getPublicUrl(filePath)

      imgBeforeUrl = publicUrlData.publicUrl
    }

    // Generate Job ID: REP-YYYYMMDD-HHMMSS
    const now = new Date()
    const jobId = `REP-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`

    // Insert into database
    await prisma.repairJob.create({
      data: {
        jobId,
        requesterId: dbUser.id,
        dept,
        machine,
        detail,
        imgBefore: imgBeforeUrl,
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
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return { error: 'Unauthorized.' }

    const dbUser = await prisma.user.findUnique({ where: { supabaseAuthId: user.id } })
    if (!dbUser || dbUser.role !== 'technician') return { error: 'Unauthorized: Technician role required.' }

    await prisma.repairJob.update({
      where: { id: jobId },
      data: {
        status: 'กำลังซ่อม',
        technicianId: dbUser.id,
        eta,
      }
    })

    revalidatePath('/repair')
    return { success: true }
  } catch (err) {
    console.error('Failed to accept job:', err)
    return { error: 'Failed to accept job. Please try again.' }
  }
}

export async function completeRepairJob(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized.' }

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

        const { error: uploadError } = await supabase.storage
          .from('repair-images')
          .upload(filePath, imageFile, { cacheControl: '3600', upsert: false })

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('repair-images').getPublicUrl(filePath)
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
        status: 'รอ QC',
        note,
        doneDate: new Date(),
        ...(imgAfterUrl && { imgAfter: imgAfterUrl })
      }
    })

    revalidatePath('/repair')
    return { success: true }
  } catch (err) {
    console.error('Failed to complete job:', err)
    return { error: 'Failed to complete job. Please try again.' }
  }
}

