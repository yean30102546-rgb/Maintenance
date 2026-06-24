# บันทึกการทำงาน (Memories)

- **2026-06-24**: ลื้อระบบ Login ที่ผูกกับ Supabase ออก และปรับปรุงมาใช้ระบบ Local Session ด้วย Cookie (`session_id`) ผูกกับ `user.id` โดยตรงผ่าน Prisma ลบระบบ Auth, LINE OAuth และหน้า Register เดิมออกทั้งหมด รวมถึงแยก Client ของ Supabase (Storage) ออกมาใหม่เพื่อใช้สำหรับการอัปโหลดรูปภาพของงานซ่อมเท่านั้น โดยไม่มี Logic ของ User/Auth มาเกี่ยวข้อง เพื่อแก้ปัญหาสิทธิการใช้งานของแต่ละ Role ขัดแย้งกัน
