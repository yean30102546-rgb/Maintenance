'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function registerUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Not authenticated with LINE.' }
  }

  const fullname = formData.get('fullname') as string
  const role = formData.get('role') as string
  const dept = formData.get('dept') as string

  if (!fullname || !role || !dept) {
    return { error: 'Missing required fields.' }
  }

  try {
    // Determine the user name from email or provider metadata
    let username = user.email || user.user_metadata?.name || user.id
    
    // Check if lineUserId can be retrieved
    const providerData = user.identities?.find(id => id.provider === 'line')
    const lineUserId = providerData ? providerData.id : null

    // Fallback if no email is provided by LINE
    if (!username) {
        username = `line_${lineUserId}`
    }

    // Check if already registered
    const existingUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id }
    })

    if (existingUser) {
      return { success: true }
    }

    await prisma.user.create({
      data: {
        supabaseAuthId: user.id,
        lineUserId: lineUserId,
        username: username,
        fullname,
        role,
        dept,
        status: 'active',
      }
    })

    revalidatePath('/repair')
    return { success: true }
  } catch (err) {
    console.error('Registration Error:', err)
    return { error: 'Failed to register profile. Please try again.' }
  }
}
