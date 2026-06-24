# Title: Dev Bypass Role Conflict & "Magic Engineer" Bug
[Updated: 2026-06-24]

## 1. Summary & Current Implementation
การใช้ "Development Bypass" แบบอัตโนมัติ (เช็คว่า `if (!dbUser && process.env.NODE_ENV === 'development')` แล้วดึง `user` คนแรกในฐานข้อมูลมาสวมรอย) ทำให้เกิดปัญหาร้ายแรงในการทดสอบระบบแบบหลาย Role. ปัญหาคือ หาก cookie `mock_session_id` หายไป หรือการสืบค้นหา `dbUser` ล้มเหลวชั่วคราวในฝั่ง Server ระหว่างการ Navigation (เช่น กดเปิด Modal เพื่อ Add Job), โค้ด Bypass จะนำสิทธิ์ช่างเทคนิคที่เจอเป็นคนแรกมาแทนที่ทันที ทำให้ผู้ใช้รู้สึกว่าสิทธิ์ "เปลี่ยนไปเป็น engineer แบบงงๆ"

ปัจจุบัน: นำบล็อก Dev Bypass ทั้งหมดออกจาก `layout.tsx` แล้ว และใช้ `redirect('/login')` หากค้นหา `dbUser` ไม่พบ เพื่อให้ตรวจสอบปัญหาที่แท้จริงได้แทนที่จะสวมรอยแบบผิดๆ

## 2. Technical Code Snippet (Best Practice)
**❌ Bad Pattern (สิ่งที่ทำให้เกิดบั๊กสวมรอย):**
```tsx
// ใน layout.tsx 
if (!dbUser && process.env.NODE_ENV === 'development') {
  // หากเกิดข้อผิดพลาดในการดึง user ระบบจะไปดึง user คนแรก (ซึ่งอาจจะเป็น Engineer) มาสวมรอย
  dbUser = await prisma.user.findFirst(); 
  authId = dbUser.supabaseAuthId;
}
```

**✅ Good Pattern (Implementation ปัจจุบัน):**
```tsx
// ใน layout.tsx
let dbUser = await prisma.user.findUnique({
  where: { supabaseAuthId: authId }
});

// ห้ามมี Fallback สวมรอยสิทธิ์ หากหา user ไม่พบ ให้ตีกลับไปหน้า Login เพื่อให้ระบบ Auth ทำงานถูกต้อง
if (!dbUser) {
  redirect('/login');
}
```

## 3. Knowledge Relationships
- Depends On (must read): [[nextjs-supabase-auth-storage.md]] (อธิบายการจัดการ mock_session_id cookie ในระบบ Auth ของเรา)
