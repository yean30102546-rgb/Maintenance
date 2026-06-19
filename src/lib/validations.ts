import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกรหัสพนักงาน"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const repairJobSchema = z.object({
  machine: z.string().min(1, "กรุณาระบุเครื่องจักร"),
  side: z.string().optional(),
  opType: z.string().min(1, "กรุณาระบุประเภทปัญหา"),
  detail: z.string().min(1, "กรุณาระบุรายละเอียดปัญหา"),
  imgBefore: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RepairJobInput = z.infer<typeof repairJobSchema>;
