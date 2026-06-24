# Title: Repair Workflow, Cache Invalidation, and Prisma/Turbopack Fixes
[Updated: 2026-06-24]

## 1. Summary & Current Implementation
ระบบการแจ้งซ่อมและอัปเดตสถานะ (Repair Workflow) มีการแก้ไขปัญหาความไม่สอดคล้องกันระหว่าง Database และ UI โดยการปรับลอจิกของ `revalidatePath` ใน Server Actions และแก้ไขปัญหาระบบล่มจาก `PrismaClientInitializationError` ที่เกิดจากปัญหาของ Prisma v7 + Turbopack Cache 

ปัจจุบันระบบรองรับสถานะการทำงานขั้นกลาง เช่น "ใช้งานชั่วคราว (รออะไหล่)" เพื่อหลีกเลี่ยงการถูกบังคับปิดงานก่อนเวลาอันควร และผ่านการทดสอบแบบ End-to-End ด้วย Playwright

## 2. Technical Code Snippet (Best Practice)
**การทำ Revalidation ที่ครบถ้วนใน Server Actions**
```typescript
// src/app/actions/repair.ts
export async function setTemporaryFix(formData: FormData) {
  // ... ลอจิกการอัปเดตสถานะใน Prisma ...
  await prisma.repairJob.update({
    where: { id: jobId },
    data: { status: 'ใช้งานชั่วคราว (รออะไหล่)' }
  })

  // ⚠️ ข้อควรระวัง: `revalidatePath` ไม่ใช่ Recursive
  // ต้องไล่ Invalidate หน้าที่เกี่ยวข้องทั้งหมดอย่างชัดเจนเพื่อป้องกัน Stale UI
  revalidatePath('/dashboard')
  revalidatePath('/repair/' + jobId, 'page') // เฉพาะหน้า Job Detail
  revalidatePath('/repair') // หน้ารวม
  revalidatePath('/engineer')
  
  return { success: true }
}
```

## 3. Knowledge Relationships & Lessons Learned

### Lesson 1: PrismaClientInitializationError & Turbopack
- **ปัญหา**: หลังจากปรับเปลี่ยน Adapter หรือแก้ไขโครงสร้าง Prisma (เช่นถอด `@prisma/adapter-pg`) ระบบเกิด error ร้ายแรง: `` `PrismaClient` needs to be constructed with a non-empty, valid `PrismaClientOptions` `` และตามมาด้วย Error หา Module ใน Turbopack ไม่เจอ (`Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`)
- **การแก้ไข**:
  1. ใน `src/lib/prisma.ts` ต้องให้สร้าง `return new PrismaClient()` แบบมาตรฐาน (ไม่พยายาม override constructor arguments หรือ options ที่ไม่รองรับใน v7)
  2. ต้อง **Clear `.next` directory** เสมอ หากมีปัญหา Turbopack Module หาย เพื่อบังคับให้ Re-compile ใหม่หมด

### Lesson 2: UI Stale Data (Cache ไม่ยอมล้าง)
- **ปัญหา**: เมื่อช่างกด "รับงาน" ระบบอัปเดตฐานข้อมูลสำเร็จ แต่ UI บนหน้า Dashboard และหน้า `/repair` ไม่เปลี่ยนจนกว่าจะกด F5
- **สาเหตุ**: Server Action สั่งแค่ `revalidatePath('/dashboard')` ซึ่งใน Next.js การ revalidate ไม่ส่งผลกระทบไปถึง Child route หรือหน้าอื่นๆ โดยปริยาย
- **การแก้ไข**: เพิ่ม `revalidatePath('/repair')` และ `revalidatePath('/repair/' + jobId, 'page')` เสมอ เพื่อบังคับให้หน้าที่มีการ Render รายละเอียดของ Job ล้างแคชตัวเอง

### Lesson 3: Playwright E2E Testing (Mock vs Template)
- **ปัญหา**: การรัน `npx playwright test` ครั้งแรกพังจาก 2 สาเหตุ:
  1. **Executable doesn't exist**: เซิร์ฟเวอร์ CI หรือเครื่องนักพัฒนาต้องรัน `npx playwright install chromium` เพื่อโหลด Binary สำหรับ headless browser ก่อน
  2. **Locator Timeout**: Test template พื้นฐานมักจะตรวจสอบด้วย `input[type="text"]` แต่เนื่องจากแอพใช้ระบบเข้าสู่ระบบด้วย LINE (Mock) (ปุ่ม button ธรรมดา) จึงหา input ไม่เจอ
- **การแก้ไข**: อัปเดต `tests/e2e/login.spec.ts` ให้ไปเช็ค `page.locator('button[type="submit"]')` และข้อความ `text=เข้าสู่ระบบด้วย LINE (Mock)` แทน

### Impacted By
- [Next.js + Supabase Auth & Storage](../architecture/nextjs-supabase-auth-storage.md)
- [Prisma ORM](../architecture/prisma-orm.md)
