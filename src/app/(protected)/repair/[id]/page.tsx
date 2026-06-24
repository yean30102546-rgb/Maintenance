import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User, AlignLeft, Info } from 'lucide-react'
import { format } from 'date-fns'
import { AcceptJobForm, CompleteJobForm } from './_components/JobActions'
import JobDetailsCard from '@/app/(protected)/dashboard/_components/JobDetailsCard'

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const jobIdParam = resolvedParams.id

  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value

  let dbUser = null;
  if (sessionId) {
    dbUser = await prisma.user.findUnique({ where: { id: sessionId } })
  }

  if (!dbUser) redirect('/login')

  const job = await prisma.repairJob.findUnique({
    where: { id: jobIdParam },
    include: {
      requester: true,
      technician: true,
      qcBy: true,
    }
  })

  if (!job) {
    notFound()
  }

  return <JobDetailsCard job={job} dbUser={dbUser} />
}
