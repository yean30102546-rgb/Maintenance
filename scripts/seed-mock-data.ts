import { prisma } from '../src/lib/prisma';

const localRepairs = [
  {id:'REP-20260521-001',date:'21/5/2026, 09:30:00',name:'สมหมาย',dept:'ฝ่ายผลิต (Production)',machine:'ปั๊มลม',side:'ระบบลม (Pneumatic)',opType:'ซ่อมฉุกเฉิน (Break Down)',detail:'ไม่มีแรงดัน ปั๊มไม่ทำงาน',img:'',imgAfter:'',status:'รอซ่อม',technician:'',doneDate:'',eta:'',note:'',hoursOpen:35},
  {id:'REP-20260522-002',date:'22/5/2026, 08:00:00',name:'สมศรี',dept:'ฝ่ายคลังสินค้า (Warehouse)',machine:'ตู้ซิงค์',side:'ระบบไฟฟ้า (Electrical)',opType:'ซ่อมตามอาการ (Corrective)',detail:'ไฟล้นออกมา มีกลิ่นไหม้',img:'',imgAfter:'',status:'รอซ่อม',technician:'',doneDate:'',eta:'',note:'',hoursOpen:0},
  {id:'REP-20260520-003',date:'20/5/2026, 10:15:00',name:'สมบัติ',dept:'ฝ่ายผลิต (Production)',machine:'FLF (05)',side:'ระบบเครื่องกล (Mechanical)',opType:'ซ่อมตามอาการ (Corrective)',detail:'เสียงดังผิดปกติ สั่นมากกว่าปกติ',img:'',imgAfter:'',status:'กำลังซ่อม',technician:'สมชาย มั่นคง',doneDate:'',eta:'25/5/2026',note:'ถอดฝาครอบแล้ว ตรวจสอบแบริ่ง',hoursOpen:0},
];

const localPMHistory = [
  {no:1,pmCode:'PM-M-20260520',equip:'FLF (07)',productionLine:'',date:'20/5/2026',tech:'วิชัย ใจดี',runningHr:'4200',parts:'-',result:'warn',workDone:'ตรวจสอบแบริ่ง พบการสึกหรอ',note:'ติดตามต่อเดือนหน้า',checklist:'{}',savedAt:'20/5/2026, 10:00:00'},
  {no:2,pmCode:'PM-D-20260522',equip:'FLF (03)',productionLine:'',date:'22/5/2026',tech:'สมชาย มั่นคง',runningHr:'1850',parts:'-',result:'pass',workDone:'ทำความสะอาด เติมสารหล่อลื่น',note:'-',checklist:'{}',savedAt:'22/5/2026, 08:30:00'},
];

// Helper to parse Thai date string (DD/MM/YYYY, HH:mm:ss)
function parseThaiDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  try {
    const parts = dateStr.split(', ');
    const dateParts = parts[0].split('/');
    const timeParts = parts[1] ? parts[1].split(':') : ['00', '00', '00'];
    
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
    const year = parseInt(dateParts[2], 10);
    
    const hour = parseInt(timeParts[0], 10);
    const min = parseInt(timeParts[1], 10);
    const sec = parseInt(timeParts[2], 10);
    
    return new Date(year, month, day, hour, min, sec);
  } catch (e) {
    return new Date();
  }
}

async function ensureUser(fullname: string, role: string, dept?: string) {
  if (!fullname) return null;
  const existing = await prisma.user.findFirst({
    where: { fullname }
  });
  if (existing) return existing;
  
  return await prisma.user.create({
    data: {
      fullname,
      role,
      dept,
      status: 'active',
    }
  });
}

async function main() {
  console.log('Seeding mock data...');

  // Ensure all necessary users exist
  const sommai = await ensureUser('สมหมาย', 'user', 'ฝ่ายผลิต (Production)');
  const somsri = await ensureUser('สมศรี', 'user', 'ฝ่ายคลังสินค้า (Warehouse)');
  const sombat = await ensureUser('สมบัติ', 'user', 'ฝ่ายผลิต (Production)');
  const somchai = await ensureUser('สมชาย มั่นคง', 'technician', 'ซ่อมบำรุง');
  const wichai = await ensureUser('วิชัย ใจดี', 'technician', 'ซ่อมบำรุง');

  // Seed RepairJobs
  console.log('Seeding RepairJobs...');
  for (const rep of localRepairs) {
    const existingJob = await prisma.repairJob.findUnique({
      where: { jobId: rep.id }
    });

    if (!existingJob) {
      let reqId = sommai?.id;
      if (rep.name === 'สมศรี') reqId = somsri?.id;
      if (rep.name === 'สมบัติ') reqId = sombat?.id;

      let techId = null;
      if (rep.technician === 'สมชาย มั่นคง') techId = somchai?.id;
      if (rep.technician === 'วิชัย ใจดี') techId = wichai?.id;

      await prisma.repairJob.create({
        data: {
          jobId: rep.id,
          createdAt: parseThaiDate(rep.date),
          requesterId: reqId as string,
          dept: rep.dept,
          machine: rep.machine,
          side: rep.side,
          opType: rep.opType,
          detail: rep.detail,
          imgBefore: rep.img || null,
          imgAfter: rep.imgAfter || null,
          status: rep.status,
          technicianId: techId,
          eta: rep.eta || null,
          note: rep.note || null,
        }
      });
    }
  }

  // Seed PM Template if needed
  console.log('Checking PM Templates...');
  let template = await prisma.pmTemplate.findFirst({
    where: { name: 'Generic PM Template' }
  });
  if (!template) {
    template = await prisma.pmTemplate.create({
      data: {
        name: 'Generic PM Template',
        machineType: 'FLF',
      }
    });
  }

  // Seed PMJobs
  console.log('Seeding PMJobs...');
  for (const pm of localPMHistory) {
    const existingPm = await prisma.pmJob.findUnique({
      where: { pmCode: pm.pmCode }
    });

    if (!existingPm) {
      let techId = somchai?.id;
      if (pm.tech === 'วิชัย ใจดี') techId = wichai?.id;

      await prisma.pmJob.create({
        data: {
          pmCode: pm.pmCode,
          templateId: template.id,
          machine: pm.equip,
          pmDate: parseThaiDate(pm.date),
          productionLine: pm.productionLine || null,
          technicianId: techId as string,
          runningHours: pm.runningHr ? parseInt(pm.runningHr, 10) : null,
          partsReplaced: pm.parts,
          overallCondition: pm.result,
          workDone: pm.workDone,
          remarks: pm.note,
          status: 'done',
          createdAt: parseThaiDate(pm.savedAt),
        }
      });
    }
  }

  console.log('Mock data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
