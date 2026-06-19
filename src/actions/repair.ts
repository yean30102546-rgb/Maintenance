'use server';

import { prisma } from '@/lib/prisma';
import { RepairJobInput, repairJobSchema } from '@/lib/validations';
import { format } from 'date-fns';

export async function createRepairJob(data: RepairJobInput, requesterId: string, dept: string = '') {
  try {
    // Validate with Zod
    const validated = repairJobSchema.parse(data);
    
    const now = new Date();
    const jobId = `REP-${format(now, 'yyyyMMdd')}-${format(now, 'HHmmss')}`;

    const newJob = await prisma.repairJob.create({
      data: {
        jobId,
        requesterId,
        dept,
        machine: validated.machine,
        side: validated.side,
        opType: validated.opType,
        detail: validated.detail,
        imgBefore: validated.imgBefore,
        status: 'รอซ่อม'
      }
    });

    return { success: true, job: newJob };
  } catch (error: any) {
    console.error('Create Repair Job Error:', error);
    return { success: false, error: error.message || 'ไม่สามารถบันทึกข้อมูลได้' };
  }
}
