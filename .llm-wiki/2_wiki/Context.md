# Title: Project Context (SFC SMART REPAIR & PM ONLINE)
[Updated: 2026-06-17]

## 1. Summary & Current Implementation
โปรเจกต์ SFC SMART REPAIR & PM ONLINE คือระบบแจ้งซ่อมและบำรุงรักษาเชิงป้องกัน (PM) สำหรับโรงงาน
ปัจจุบันกำลังอยู่ในช่วง Migrate จาก Google Apps Script (GAS) Prototype แบบเดิม ให้กลายเป็นระบบระดับ Production โดยใช้ **Next.js (App Router) + Supabase + Prisma + TailwindCSS** 

## 2. System & Users (ระบบและผู้ใช้งาน)
- **กลุ่มเป้าหมายหลัก**: พนักงานภายในโรงงานทั้งหมด (พนักงานฝ่ายผลิต, ช่างซ่อม, วิศวกร QC, แอดมิน)
- **Platform Access**: เน้นการเข้าถึงผ่านแอปพลิเคชัน LINE (LIFF / Links) เป็นหลักเพื่อความสะดวกรวดเร็ว

## 3. Logic & Workflows (ลอจิกและกระบวนการทำงาน)
- **Workflow งานซ่อม**: ต้องผ่านการตรวจสอบคุณภาพ (QC) จาก Engineer ทุกงานจึงจะสามารถปิดงาน (Closed) ในระบบได้ ช่างหน้างานไม่สามารถกดปิดงานเองได้โดยพลการเพื่อป้องกันข้อผิดพลาด
- **Tech Stack Rules**: ห้ามใช้ `any` ใน TypeScript (อนุโลมให้ใช้ `unknown` หรือ `await`), บังคับใช้ Zod Validate, และยึดหลักการเขียนโค้ดสไตล์ `/ponytail` (Lazy/Efficient, ไม่ Overengineering)

## 4. Functions & Features (ฟังก์ชันและฟีเจอร์หลัก)
- **Responsive Layout Focus**: 
  - **Mobile-first**: สำหรับหน้าจอผู้แจ้งซ่อม (User) และหน้าจออัปเดตงานของช่าง (Technician)
  - **Desktop-first**: สำหรับหน้า Dashboard และตารางข้อมูลของ Admin และ Engineer
- **Testing Pipeline**: รองรับ Vitest สำหรับ Unit Testing และ Playwright สำหรับ End-to-End Testing (E2E)

## 5. Style & Design (สไตล์และการออกแบบ)
- **Brand Personality**: **ทันสมัย (Modern), หรูหรา (Premium), มีลูกเล่น Animation เยอะๆ**
- **Anti-references (สิ่งที่ต้องเลี่ยงเด็ดขาด)**: 
  - หลีกเลี่ยงฟอร์มที่ผู้ใช้ต้องพิมพ์ข้อความเยอะ (ให้เน้น Dropdown, Datepicker, หรือ Click แทน)
  - หลีกเลี่ยงหน้าจอที่รกเกินไป
  - หลีกเลี่ยงการใช้สีฉูดฉาดที่ทำให้เกิดความสับสน
- **Accessibility & Inclusion**: 
  - บังคับใช้ตัวหนังสือขนาดใหญ่อ่านง่าย (สำคัญมากเมื่อใช้งานในพื้นที่หน้างาน)
  - Contrast ระหว่างสีพื้นหลังและตัวหนังสือต้องชัดเจน
  - เน้นใช้งานง่ายที่สุดสำหรับพนักงานที่อาจไม่ถนัดเทคโนโลยี

## 6. Knowledge Relationships
- Depends On (must read): [[index.md]], [[../../PRODUCT.md]]
- Impacted By (changes affect): `c:\Workplace\MAINTENANCEAPP\Prototype_GAS\script.html` (Original Source)
