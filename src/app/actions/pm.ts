"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function getMachinesForPm() {
  return await prisma.machine.findMany({
    where: { status: 'active' },
    orderBy: { name: 'asc' }
  })
}

export async function getPmTemplates() {
  return await prisma.pmTemplate.findMany({
    include: {
      items: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  })
}

export async function createPmJob(data: {
  pmCode: string,
  templateId: string,
  machine: string,
  pmDate: Date,
  shift?: string,
  productionLine?: string,
  runningHours?: number,
  partsReplaced?: string,
  overallCondition: string,
  workDone?: string,
  remarks?: string,
  nextPmDate?: Date,
  results: { checklistItemId: string, result: string, note?: string }[]
}) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value

  if (!sessionId) throw new Error("Unauthorized")

  const dbUser = await prisma.user.findUnique({ where: { id: sessionId } })
  if (!dbUser) throw new Error("User not found")

  // Create PM Job
  const pmJob = await prisma.pmJob.create({
    data: {
      pmCode: data.pmCode,
      templateId: data.templateId,
      machine: data.machine,
      pmDate: data.pmDate,
      shift: data.shift,
      productionLine: data.productionLine,
      technicianId: dbUser.id,
      runningHours: data.runningHours,
      partsReplaced: data.partsReplaced,
      overallCondition: data.overallCondition,
      workDone: data.workDone,
      remarks: data.remarks,
      nextPmDate: data.nextPmDate,
      status: "done",
      results: {
        create: data.results.map(r => ({
          checklistItemId: r.checklistItemId,
          result: r.result,
          note: r.note
        }))
      }
    }
  })

  revalidatePath('/dashboard')
  revalidatePath('/pm')

  return { success: true, pmJob }
}
