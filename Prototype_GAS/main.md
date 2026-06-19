// ============================================================
//  SFC SMART REPAIR & PM ONLINE — Code.gs  (แก้ไขแล้ว)
// ============================================================

// ─── WEB APP ENTRY ────────────────────────────────────────────
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('SFC SMART REPAIR')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── INCLUDE HELPER ──────────────────────────────────────────
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─── CONSTANTS ────────────────────────────────────────────────
var IN_PROG_ = ['กำลังซ่อม','ส่งซ่อมภายนอก','ขอหยุดเครื่องเพื่อปรับปรุง','รออะไหล่','แก้ไข (ตีกลับ)'];

// ─── LOGIN ────────────────────────────────────────────────────
function checkLogin(username, password) {
  var u = String(username || '').trim();
  var p = String(password || '').trim();
  if (!u || !p) return { status: 'fail' };

  // ── 1. ตรวจจาก Sheet Users ก่อน ──
  try {
    var usersSheet = getUsersSheet_();
    var rows = usersSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      var ru = String(rows[i][0]||'').trim();
      var rp = String(rows[i][1]||'').trim();
      var rr = String(rows[i][2]||'').trim();
      var rn = String(rows[i][3]||'').trim();
      var rs = String(rows[i][7]||'active').trim();
      if (ru === u && rp === p && rs === 'active') {
        var result = { status: 'success', role: rr, name: rn || u };
        if (rr === 'engineer') {
          result.isChief = String(rows[i][8]||'').trim() === 'true';
        }
        return result;
      }
    }
  } catch(e) { Logger.log('checkLogin sheet error: ' + e); }

  // ── 2. Hardcoded fallback ──
  if (u === 'sfc'    && p === '1234') return { status: 'success', role: 'user',  name: 'User' };
  if (u === 'แอดมิน' && p === '9911') return { status: 'success', role: 'admin', name: 'Admin' };
  if (u === 'ins'    && p === '7777') return { status: 'success', role: 'ins',   name: 'ins' };

  var techs = {
    'ช่าง1': { pass: '1111', name: 'สมชาย มั่นคง' },
    'ช่าง2': { pass: '2222', name: 'วิชัย ใจดี' },
    'ช่าง3': { pass: '3333', name: 'ประยุทธ์ ขยัน' }
  };
  if (techs[u] && techs[u].pass === p)
    return { status: 'success', role: 'technician', name: techs[u].name };

  var engineers = {
    'eng':  { pass: '5555', name: 'หัวหน้าวิศวกร (Chief)', isChief: true },
    'eng1': { pass: '4444', name: 'วิศวกร นนทชัย', isChief: false },
    'eng2': { pass: '6666', name: 'วิศวกร เมธี',   isChief: false }
  };
  if (engineers[u] && engineers[u].pass === p)
    return { status: 'success', role: 'engineer', name: engineers[u].name, isChief: !!engineers[u].isChief };

  return { status: 'fail' };
}

// ─── REGISTER ─────────────────────────────────────────────────
function registerUser(payload) {
  try {
    if (!payload || !payload.username || !payload.password || !payload.role) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
    }
    var u = String(payload.username).trim();
    var p = String(payload.password).trim();
    var r = String(payload.role).trim();

    // ห้าม username ซ้ำกับ hardcoded
    var hardcoded = ['sfc','แอดมิน','ins','ช่าง1','ช่าง2','ช่าง3','eng','eng1','eng2'];
    if (hardcoded.indexOf(u) > -1) {
      return { success: false, message: 'Username นี้ถูกใช้งานแล้ว กรุณาเลือกใหม่' };
    }

    var sh   = getUsersSheet_();
    var data = sh.getDataRange().getValues();

    // เช็ค username ซ้ำใน sheet
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]||'').trim() === u) {
        return { success: false, message: 'Username "' + u + '" ถูกใช้งานแล้ว กรุณาเลือกใหม่' };
      }
    }

    // บันทึก row ใหม่
    // col: username | password | role | fullname | dept | contact | registeredAt | status | isChief
    sh.appendRow([
      u,
      p,
      r,
      String(payload.fullname  || '').trim(),
      String(payload.dept      || '').trim(),
      String(payload.contact   || '').trim(),
      nowTs_(),
      'active',
      r === 'engineer' ? 'false' : ''   // isChief default false
    ]);

    return { success: true };
  } catch(e) {
    Logger.log('registerUser error: ' + e);
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + e.message };
  }
}

// ─── ADMIN: จัดการ Users ──────────────────────────────────────
function getUsers() {
  try {
    var sh   = getUsersSheet_();
    var data = sh.getDataRange().getDisplayValues();
    if (data.length <= 1) return [];
    return data.slice(1).filter(function(r){ return r[0]; }).map(function(r, i) {
      return {
        rowIndex:     i + 2,
        username:     r[0] || '',
        role:         r[2] || '',
        fullname:     r[3] || '',
        dept:         r[4] || '',
        contact:      r[5] || '',
        registeredAt: r[6] || '',
        status:       r[7] || 'active'
      };
    });
  } catch(e) { return []; }
}

function updateUserStatus(username, status) {
  try {
    var sh   = getUsersSheet_();
    var data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]||'').trim() === String(username).trim()) {
        sh.getRange(i+1, 8).setValue(status);
        return { success: true };
      }
    }
    return { success: false, message: 'ไม่พบ username' };
  } catch(e) { return { success: false, message: e.message }; }
}

function deleteUser(username) {
  try {
    var sh   = getUsersSheet_();
    var data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]||'').trim() === String(username).trim()) {
        sh.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, message: 'ไม่พบ username' };
  } catch(e) { return { success: false, message: e.message }; }
}

// ─── SHEET HELPERS ────────────────────────────────────────────
function getUsersSheet_() {
  return getOrCreateSheet_('Users', [
    'username','password','role','fullname','dept','contact','registeredAt','status','isChief'
  ]);
}

function getOrCreateSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
  }
  return sh;
}

function getRepairSheet_() {
  return getOrCreateSheet_('รายการแจ้งซ่อม', [
    'JobID','วันที่แจ้ง','ผู้แจ้ง','แผนก','เครื่องจักร',
    'ด้านปัญหา','ประเภท','รายละเอียด','รูปก่อนซ่อม','รูปหลังซ่อม','สถานะ',
    'ช่าง','วันเสร็จจริง','วันแผนหยุด','ETA','หมายเหตุ',
    'ผล QC','ผู้ QC','หมายเหตุ QC','วันที่ QC',
    'วันที่รับงาน','วันอัปเดตล่าสุด','SLA Score'
  ]);
}

function getPMSheet_() {
  return getOrCreateSheet_('PM_Calendar', [
    'ID','วันที่','ชื่องาน','เครื่อง/ไลน์','ประเภท','ผู้รับผิดชอบ','สถานะ','สี','หมายเหตุ'
  ]);
}

function getPMHistorySheet_() {
  return getOrCreateSheet_('PM_History', [
    'รหัส PM','เครื่องจักร','ไลน์ผลิต','วันที่ตรวจ',
    'ผู้ตรวจ','ชั่วโมงการทำงาน','อะไหล่ที่เปลี่ยน','สภาพโดยรวม',
    'งานที่ดำเนินการ','ข้อเสนอแนะ','วัน PM ครั้งถัดไป','รายการ Checklist','เวลาที่บันทึก'
  ]);
}

function getDailyPMHistorySheet_() {
  return getOrCreateSheet_('Daily_PM_History', [
    'รหัส','วันที่','เวลา','ไลน์ผลิต','เครื่องจักร',
    'ผู้ตรวจ','สภาพโดยรวม','Checklist JSON',
    'หมายเหตุ','ผู้ลงชื่อรับรอง','เวลาที่บันทึก',
    'สถานะวิศวกร','วิศวกรผู้รับทราบ'
  ]);
}

function getDailyPMChecklistSetupSheet_() {
  var sh = getOrCreateSheet_('Daily_PM_Checklist_Setup', ['GroupName', 'ItemName', 'Color']);
  if (sh.getLastRow() <= 1) {
    var defaults = [
      ['ความปลอดภัยทั่วไป','ทางเดินโล่งไม่มีสิ่งกีดขวาง','#ff5252'],
      ['ความปลอดภัยทั่วไป','ป้ายเตือนครบถ้วน','#ff5252'],
      ['ความปลอดภัยทั่วไป','อุปกรณ์ดับเพลิงพร้อมใช้','#ff5252'],
      ['เครื่องจักร','เครื่องจักรทำงานปกติ ไม่มีเสียงผิดปกติ','#00c6ff'],
      ['เครื่องจักร','ไม่มีการรั่วซึมของน้ำมัน/น้ำ','#00c6ff'],
      ['เครื่องจักร','อุณหภูมิการทำงานปกติ','#00c6ff'],
      ['เครื่องจักร','ระบบป้องกัน (Guard) ครบถ้วน','#00c6ff'],
      ['ระบบไฟฟ้า','ไฟแสดงสถานะปกติ','#ffd600'],
      ['ระบบไฟฟ้า','ไม่มีกลิ่นไหม้','#ffd600'],
      ['ระบบลม/ไฮดรอลิก','แรงดันอยู่ในช่วงปกติ','#00e676'],
      ['ระบบลม/ไฮดรอลิก','ไม่มีลม/น้ำมันรั่ว','#00e676'],
      ['ความสะอาด','พื้นที่รอบเครื่องสะอาด','#c084fc'],
      ['ความสะอาด','ถังขยะไม่ล้น','#c084fc']
    ];
    defaults.forEach(function(r) { sh.appendRow(r); });
  }
  return sh;
}

function getSettingsSheet_() {
  return getOrCreateSheet_('Settings', ['Key', 'Value', 'Description']);
}

function getPMChecklistSetupSheet_() {
  var sh = getOrCreateSheet_('PM_Checklist_Setup', ['GroupName', 'ItemName', 'Color']);
  if (sh.getLastRow() <= 1) {
    var defaults = [
      ['ระบบลำเลียงสายพาน','ไม่ฉีกขาด','#00c6ff'],
      ['ระบบลำเลียงสายพาน','ไม่ชำรุด','#00c6ff'],
      ['ระบบลำเลียงสายพาน','พร้อมใช้งาน','#00c6ff'],
      ['หัวฟิวลิงค์','ตำแหน่งพร้อมใช้งาน','#ff9100'],
      ['ต้นกำลังเครื่องจักร (มอเตอร์)','พร้อมใช้งาน','#ff5252'],
      ['ต้นกำลังเครื่องจักร (มอเตอร์)','ไม่สั่น','#ff5252'],
      ['ต้นกำลังเครื่องจักร (มอเตอร์)','มีการ์ด','#ff5252'],
      ['ต้นกำลังเครื่องจักร (มอเตอร์)','น็อตไม่หลุด / ไม่หลวม','#ff5252'],
      ['สายไฟ','ต้องอยู่ในราง','#ffd600'],
      ['สายไฟ','ไม่ล้นออกมาจากตู้คอนโทรล','#ffd600'],
      ['ระบบลม','ไม่มีลมรั่ว','#00e676'],
      ['จุดหมุน','มีการอัดจาระบี / หล่อลื่น','#2dd4bf'],
      ['เครื่องชั่ง','พร้อมใช้งาน','#c084fc']
    ];
    defaults.forEach(function(r) { sh.appendRow(r); });
  }
  return sh;
}

// ─── UTILS ────────────────────────────────────────────────────
function nowTs_() {
  return Utilities.formatDate(new Date(), 'GMT+7', 'd/M/yyyy, HH:mm:ss');
}

function parseThaiDate_(str) {
  if (!str) return null;
  try {
    var datePart = String(str).split(',')[0].trim();
    var p = datePart.split('/');
    if (p.length !== 3) return null;
    var d = parseInt(p[0]), m = parseInt(p[1]) - 1, y = parseInt(p[2]);
    if (y > 2400) y -= 543;
    var dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  } catch(e) { return null; }
}

function parseDateISO_(str) {
  if (!str) return null;
  try {
    var p = String(str).trim().split('-');
    if (p.length !== 3) return null;
    var dt = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    return isNaN(dt.getTime()) ? null : dt;
  } catch(e) { return null; }
}

function parsePMDate_(str) {
  if (!str) return null;
  var s = String(str).trim();
  if (s.indexOf('-') > -1 && s.indexOf('/') === -1) return parseDateISO_(s);
  return parseThaiDate_(s);
}

function uploadPhoto_(base64, name) {
  if (!base64 || base64.length < 200) return '';
  try {
    var folders = DriveApp.getFoldersByName('SFC_Repair_Photos');
    var folder  = folders.hasNext() ? folders.next() : DriveApp.createFolder('SFC_Repair_Photos');
    var parts   = base64.split(',');
    var mime    = (parts[0].match(/:(.*?);/) || [])[1] || 'image/png';
    var ext     = mime === 'image/jpeg' ? '.jpg' : '.png';
    var blob    = Utilities.newBlob(Utilities.base64Decode(parts[1]), mime, name + ext);
    var file    = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://lh3.googleusercontent.com/d/' + file.getId();
  } catch(e) { Logger.log('uploadPhoto_ error: ' + e); return ''; }
}

// ─── SETTINGS ─────────────────────────────────────────────────
function getSetting(key) {
  try {
    var data = getSettingsSheet_().getDataRange().getValues();
    for (var i = 1; i < data.length; i++)
      if (String(data[i][0]).trim() === key) return String(data[i][1]).trim();
    return '';
  } catch(e) { return ''; }
}

function saveSetting(key, val) {
  try {
    var sh = getSettingsSheet_(), data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) { sh.getRange(i+1,2).setValue(val); return true; }
    }
    sh.appendRow([key, val, '']);
    return true;
  } catch(e) { return false; }
}

// ─── DAILY PM CHECKLIST SETUP ─────────────────────────────────
function getDailyPMChecklistSetup() {
  try {
    var sh   = getDailyPMChecklistSetupSheet_();
    var data = sh.getDataRange().getValues();
    if (data.length <= 1) return [];
    var groupsMap = {}, groupOrder = [];
    for (var i = 1; i < data.length; i++) {
      var gName = String(data[i][0]||'').trim();
      var item  = String(data[i][1]||'').trim();
      var color = String(data[i][2]||'#00c6ff').trim();
      if (!gName) continue;
      if (!groupsMap[gName]) { groupsMap[gName] = { name:gName, color:color, items:[] }; groupOrder.push(gName); }
      if (item) groupsMap[gName].items.push(item);
    }
    return groupOrder.map(function(n) { return groupsMap[n]; });
  } catch(e) { return []; }
}

function saveDailyPMChecklistSetup(setup) {
  try {
    if (!setup || !Array.isArray(setup)) return '❌ ข้อมูลไม่ถูกต้อง';
    var sh = getDailyPMChecklistSetupSheet_();
    sh.clear();
    sh.appendRow(['GroupName', 'ItemName', 'Color']);
    setup.forEach(function(g) {
      if (!g || !g.name) return;
      if (!g.items || !g.items.length) { sh.appendRow([g.name, '', g.color||'#00c6ff']); return; }
      g.items.forEach(function(item) { sh.appendRow([g.name, item||'', g.color||'#00c6ff']); });
    });
    return '✅ บันทึก Daily Checklist สำเร็จ';
  } catch(e) { return '❌ Error: ' + e; }
}

// ─── SAVE DAILY PM ────────────────────────────────────────────
function saveDailyPM(productionLine, machine, inspector, overallResult, checklistJson, note, signedBy) {
  try {
    var sh   = getDailyPMHistorySheet_();
    var now  = new Date();
    var ts   = nowTs_();
    var code = 'DPM-' + Utilities.formatDate(now, 'GMT+7', 'yyyyMMdd') + '-' +
                         Utilities.formatDate(now, 'GMT+7', 'HHmmss');
    var dateStr = Utilities.formatDate(now, 'GMT+7', 'd/M/yyyy');
    var timeStr = Utilities.formatDate(now, 'GMT+7', 'HH:mm');
    sh.appendRow([
      code, dateStr, timeStr,
      productionLine || '', machine || '', inspector || '',
      overallResult  || '', checklistJson || '{}',
      note || '', signedBy || '', ts,
      '', ''
    ]);
    return { status: 'ok', code: code };
  } catch(e) {
    Logger.log('saveDailyPM error: ' + e);
    return { status: 'error', message: String(e) };
  }
}

// ─── GET DAILY PM HISTORY ─────────────────────────────────────
function getDailyPMHistory() {
  try {
    var sh   = getDailyPMHistorySheet_();
    var allD = sh.getDataRange().getDisplayValues();
    if (allD.length <= 1) return [];
    var data = allD.length > 151 ? [allD[0]].concat(allD.slice(-(150))) : allD;
    return data.slice(1).filter(function(r){ return r[0] !== ''; })
      .map(function(r, idx) {
        return {
          no:             idx + 1,
          code:           r[0]  || '',
          date:           r[1]  || '',
          time:           r[2]  || '',
          productionLine: r[3]  || '',
          machine:        r[4]  || '',
          inspector:      r[5]  || '',
          result:         r[6]  || '',
          checklist:      r[7]  || '{}',
          note:           r[8]  || '',
          signedBy:       r[9]  || '',
          savedAt:        r[10] || '',
          engStatus:      r[11] || '',
          engBy:          r[12] || ''
        };
      }).reverse();
  } catch(e) { Logger.log('getDailyPMHistory error: ' + e); return []; }
}

// ─── SAVE REPAIR ──────────────────────────────────────────────
function saveRepair(formData, base64Img) {
  try {
    var sh  = getRepairSheet_();
    var now = new Date();
    var jobID = 'REP-' + Utilities.formatDate(now,'GMT+7','yyyyMMdd') + '-' +
                         Utilities.formatDate(now,'GMT+7','HHmmss');
    var photoUrl = uploadPhoto_(base64Img, jobID);
    sh.appendRow([
      jobID,
      Utilities.formatDate(now,'GMT+7','d/M/yyyy, HH:mm:ss'),
      formData.requester||'', formData.dept||'',
      formData.machine||'',   formData.side||'',
      formData.opType||'',    formData.detail||'',
      photoUrl,'','รอซ่อม',
      '','','','','',
      '','','','',
      '','',''
    ]);
    return jobID;
  } catch(e) { Logger.log('saveRepair error: '+e); throw new Error('saveRepair: '+e.message); }
}

// ─── GET JOBS ─────────────────────────────────────────────────
function getJobs() {
  try {
    var sh      = getRepairSheet_();
    var allData = sh.getDataRange().getDisplayValues();
    if (allData.length <= 1) return [];
    var data = allData.length > 301 ? [allData[0]].concat(allData.slice(-(300))) : allData;
    var now  = new Date();
    return data.slice(1).filter(function(r){ return r[0] !== ''; }).map(function(r) {
      var created     = parseThaiDate_(r[1]);
      var accepted    = r[20] ? parseThaiDate_(r[20]) : null;
      var lastUpdated = r[21] ? parseThaiDate_(r[21]) : null;
      var doneDate    = r[12] ? parseThaiDate_(r[12]) : null;
      var hoursOpen        = created     ? Math.floor((now - created)    / 3600000) : 0;
      var hoursAccept      = accepted    ? Math.floor((now - accepted)   / 3600000) : 0;
      var hoursSinceUpdate = lastUpdated ? Math.floor((now - lastUpdated)/ 3600000) : hoursAccept;
      var daysDone         = doneDate    ? Math.floor((now - doneDate)   / 86400000): 0;
      var status   = String(r[10]||'รอซ่อม').trim();
      var qcResult = String(r[16]||'').trim();
      return {
        id:r[0], date:r[1], name:r[2], dept:r[3], machine:r[4],
        side:r[5], opType:r[6], detail:r[7], img:r[8], imgAfter:r[9],
        status:status, technician:r[11]||'',
        doneDate:r[12]||'', planStopDate:r[13]||'',
        eta:r[14]||'', note:r[15]||'',
        qcResult:qcResult, qcBy:r[17]||'',
        qcNote:r[18]||'', qcDate:r[19]||'',
        acceptDate:r[20]||'', lastUpdate:r[21]||'', slaScore:r[22]||'',
        hoursOpen:hoursOpen,
        slaOverdue:(status==='รอซ่อม'&&hoursOpen>24),
        sla48Over:(IN_PROG_.indexOf(status)>-1&&hoursSinceUpdate>48),
        daysDone:daysDone,
        qc15Over:(status==='ซ่อมเสร็จแล้ว'&&(qcResult===''||qcResult==='รอ QC')&&daysDone>15)
      };
    }).reverse();
  } catch(e) { Logger.log('getJobs error: '+e); return []; }
}

// ─── TECH: รับงาน ─────────────────────────────────────────────
function techAcceptJob(jobId, techName) {
  try {
    var sh = getRepairSheet_(), data = sh.getDataRange().getValues(), ts = nowTs_();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(jobId)) {
        sh.getRange(i+1, 11).setValue('กำลังซ่อม');
        sh.getRange(i+1, 12).setValue(techName);
        sh.getRange(i+1, 21).setValue(ts);
        sh.getRange(i+1, 22).setValue(ts);
        return '✅ รับงาน ' + jobId + ' สำเร็จ';
      }
    }
    return '❌ ไม่พบ Job ID';
  } catch(e) { return '❌ Error: ' + e; }
}

// ─── TECH: อัปเดตงาน ──────────────────────────────────────────
function techUpdateJob(jobId, upd, base64After) {
  try {
    var sh = getRepairSheet_(), data = sh.getDataRange().getValues(), ts = nowTs_();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(jobId)) {
        if (upd.status)       sh.getRange(i+1, 11).setValue(upd.status);
        if (upd.doneDate)     sh.getRange(i+1, 13).setValue(upd.doneDate);
        if (upd.planStopDate) sh.getRange(i+1, 14).setValue(upd.planStopDate);
        if (upd.eta)          sh.getRange(i+1, 15).setValue(upd.eta);
        else if (upd.etaDays) sh.getRange(i+1, 15).setValue(upd.etaDays + ' วัน');
        if (upd.note)         sh.getRange(i+1, 16).setValue(upd.note);
        sh.getRange(i+1, 22).setValue(ts);
        if (base64After && base64After.length > 200) {
          var afterUrl = uploadPhoto_(base64After, jobId + '_after');
          if (afterUrl) sh.getRange(i+1, 10).setValue(afterUrl);
        }
        if (upd.status === 'ซ่อมเสร็จแล้ว') {
          sh.getRange(i+1, 17).setValue('รอ QC');
          sh.getRange(i+1, 18).setValue('');
          sh.getRange(i+1, 19).setValue('');
          sh.getRange(i+1, 20).setValue('');
        }
        return '✅ อัปเดตงาน ' + jobId + ' สำเร็จ';
      }
    }
    return '❌ ไม่พบ Job ID';
  } catch(e) { return '❌ Error: ' + e; }
}

// ─── ENGINEER: QC ─────────────────────────────────────────────
function engineerQC(jobId, qcResult, qcNote, engineerName) {
  try {
    var sh = getRepairSheet_(), data = sh.getDataRange().getValues(), ts = nowTs_();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(jobId)) {
        sh.getRange(i+1, 17).setValue(qcResult);
        sh.getRange(i+1, 18).setValue(engineerName);
        sh.getRange(i+1, 19).setValue(qcNote || '');
        sh.getRange(i+1, 20).setValue(ts);
        sh.getRange(i+1, 22).setValue(ts);
        if (qcResult === 'ตีกลับ') {
          sh.getRange(i+1, 11).setValue('แก้ไข (ตีกลับ)');
        } else if (qcResult === 'ผ่าน QC') {
          sh.getRange(i+1, 11).setValue('ปิดงาน');
          calcSLAScore_(sh, i, data[i]);
        }
        return '✅ QC บันทึกสำเร็จ: ' + qcResult;
      }
    }
    return '❌ ไม่พบ Job ID';
  } catch(e) { return '❌ Error: ' + e; }
}

function calcSLAScore_(sh, rowIdx, row) {
  try {
    var created  = parseThaiDate_(row[1]);
    var accepted = row[20] ? parseThaiDate_(row[20]) : null;
    var done     = row[12] ? parseThaiDate_(row[12]) : null;
    var score    = 100;
    if (accepted && created) {
      var h = Math.floor((accepted - created) / 3600000);
      if (h > 48) score -= 30; else if (h > 24) score -= 15;
    }
    if (done && accepted) {
      var days = Math.floor((done - accepted) / 86400000);
      if (days > 14) score -= 30; else if (days > 7) score -= 15;
    }
    sh.getRange(rowIdx + 1, 23).setValue(Math.max(0, score));
  } catch(e) { Logger.log('calcSLAScore_ error: ' + e); }
}

// ─── TECH PERFORMANCE ─────────────────────────────────────────
function getTechPerformance() {
  try {
    var sh = getRepairSheet_(), data = sh.getDataRange().getDisplayValues(), pm = {};
    data.slice(1).forEach(function(r) {
      var n = String(r[11]||'').trim(); if (!n) return;
      if (!pm[n]) pm[n] = { name:n, total:0, done:0, closed:0, back:0, qcPass:0, scores:[] };
      pm[n].total++;
      var st = String(r[10]||'').trim();
      if (st==='ซ่อมเสร็จแล้ว' || st==='ปิดงาน') pm[n].done++;
      if (st==='ปิดงาน') pm[n].closed++;
      if (st==='แก้ไข (ตีกลับ)' || String(r[16]||'').trim()==='ตีกลับ') pm[n].back++;
      if (String(r[16]||'').trim()==='ผ่าน QC') pm[n].qcPass++;
      var sc = parseInt(r[22]); if (!isNaN(sc)) pm[n].scores.push(sc);
    });
    return Object.values(pm).map(function(t) {
      var avgSLA    = t.scores.length > 0 ? Math.round(t.scores.reduce(function(a,b){return a+b;},0) / t.scores.length) : null;
      var qcRate    = t.done  > 0 ? Math.round(t.qcPass / t.done  * 100) : 0;
      var closeRate = t.total > 0 ? Math.round(t.closed / t.total * 100) : 0;
      var backRate  = t.total > 0 ? Math.round(t.back   / t.total * 100) : 0;
      var perf      = avgSLA !== null
        ? Math.round(avgSLA * 0.6 + (100 - backRate * 2) * 0.4)
        : Math.max(0, 100 - backRate * 2);
      return {
        name:t.name, total:t.total, done:t.done, closed:t.closed,
        back:t.back, qcPass:t.qcPass, avgSLA:avgSLA,
        qcRate:qcRate, closeRate:closeRate, backRate:backRate,
        perfScore: Math.max(0, Math.min(100, perf))
      };
    }).sort(function(a,b){ return b.perfScore - a.perfScore; });
  } catch(e) { return []; }
}

// ─── ADMIN: UPDATE / DELETE ───────────────────────────────────
function updateJobStatus(jobId, newStatus, technician, note, base64After) {
  try {
    var sh = getRepairSheet_(), data = sh.getDataRange().getValues(), ts = nowTs_();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(jobId)) {
        sh.getRange(i+1, 11).setValue(newStatus);
        if (technician) sh.getRange(i+1, 12).setValue(technician);
        if (note)       sh.getRange(i+1, 16).setValue(note);
        sh.getRange(i+1, 22).setValue(ts);
        if (base64After && base64After.length > 200) {
          var url = uploadPhoto_(base64After, jobId + '_after');
          if (url) sh.getRange(i+1, 10).setValue(url);
        }
        return '✅ อัปเดตสถานะเป็น: ' + newStatus;
      }
    }
    return '❌ ไม่พบ Job ID';
  } catch(e) { return '❌ Error: ' + e; }
}

function deleteJob(jobId) {
  try {
    var sh = getRepairSheet_(), data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(jobId)) {
        sh.deleteRow(i + 1);
        return '✅ ลบงาน ' + jobId + ' สำเร็จ';
      }
    }
    return '❌ ไม่พบ Job ID';
  } catch(e) { return '❌ Error: ' + e; }
}

// ─── ADMIN STATS ──────────────────────────────────────────────
function getAdminStats() {
  try {
    var sh   = getRepairSheet_();
    var data = sh.getDataRange().getDisplayValues();
    var s    = { total:0, waiting:0, working:0, done:0, closed:0,
                 pendingQC:0, passQC:0, failQC:0,
                 monthlyData:{}, deptData:{}, sideData:{} };
    data.slice(1).forEach(function(r) {
      if (!r[0]) return; s.total++;
      var st = String(r[10]||'').trim();
      if (st==='รอซ่อม') s.waiting++;
      else if (IN_PROG_.indexOf(st) > -1) s.working++;
      else if (st==='ซ่อมเสร็จแล้ว') s.done++;
      else if (st==='ปิดงาน') s.closed++;
      var qc = String(r[16]||'').trim();
      if (qc==='รอ QC')   s.pendingQC++;
      if (qc==='ผ่าน QC') s.passQC++;
      if (qc==='ตีกลับ')  s.failQC++;
      var dt   = parseThaiDate_(r[1]);
      if (dt) {
        var key = String(dt.getMonth()+1).padStart(2,'0') + '/' + dt.getFullYear();
        s.monthlyData[key] = (s.monthlyData[key] || 0) + 1;
      }
      var dept = String(r[3]||'ไม่ระบุ').trim();
      var side = String(r[5]||'ไม่ระบุ').trim();
      s.deptData[dept] = (s.deptData[dept] || 0) + 1;
      s.sideData[side] = (s.sideData[side] || 0) + 1;
    });
    var sorted = {};
    Object.keys(s.monthlyData).sort(function(a,b) {
      var pa = a.split('/'), pb = b.split('/');
      return (parseInt(pa[1])*12 + parseInt(pa[0])) - (parseInt(pb[1])*12 + parseInt(pb[0]));
    }).forEach(function(k){ sorted[k] = s.monthlyData[k]; });
    s.monthlyData = sorted;
    return s;
  } catch(e) { Logger.log('getAdminStats error: '+e); return null; }
}

// ─── PM CALENDAR ──────────────────────────────────────────────
function getPMCalendar() {
  try {
    var sh   = getPMSheet_();
    var data = sh.getDataRange().getDisplayValues();
    if (data.length <= 1) return [];
    var now  = new Date();
    return data.slice(1).filter(function(r){ return r[0] !== ''; }).map(function(r) {
      var rawDate = String(r[1]||'').trim();
      var dt      = parsePMDate_(rawDate);
      var isoDate = dt ? Utilities.formatDate(dt,'GMT+7','yyyy-MM-dd') : rawDate;
      var status  = String(r[6]||'รอดำเนินการ').trim();
      if (status==='รอดำเนินการ' && dt && dt < now) status = 'เกินกำหนด';
      return {
        id:r[0], date:isoDate, title:r[2], machine:r[3],
        type:r[4], assignee:r[5], status:status,
        color:r[7]||'#ffd600', note:r[8]||''
      };
    });
  } catch(e) { Logger.log('getPMCalendar error: '+e); return []; }
}

function savePMItem(item) {
  try {
    var sh   = getPMSheet_();
    var data = sh.getDataRange().getValues();
    var ts   = Utilities.formatDate(new Date(),'GMT+7','yyyyMMddHHmmss');
    var saveDate = String(item.date||'').trim();
    if (saveDate.indexOf('/') > -1) {
      var dt = parseThaiDate_(saveDate);
      if (dt) saveDate = Utilities.formatDate(dt,'GMT+7','yyyy-MM-dd');
    }
    if (item.id) {
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(item.id)) {
          sh.getRange(i+1,2).setValue(saveDate);
          sh.getRange(i+1,3).setValue(item.title   || '');
          sh.getRange(i+1,4).setValue(item.machine  || '');
          sh.getRange(i+1,5).setValue(item.type     || '');
          sh.getRange(i+1,6).setValue(item.assignee || '');
          sh.getRange(i+1,7).setValue(item.status   || 'รอดำเนินการ');
          sh.getRange(i+1,8).setValue(item.color    || '#ffd600');
          sh.getRange(i+1,9).setValue(item.note     || '');
          return '✅ อัปเดต PM สำเร็จ';
        }
      }
    }
    var newId = 'PM-' + ts;
    sh.appendRow([
      newId, saveDate, item.title||'', item.machine||'',
      item.type||'', item.assignee||'',
      item.status||'รอดำเนินการ', item.color||'#ffd600', item.note||''
    ]);
    return '✅ เพิ่ม PM สำเร็จ: ' + newId;
  } catch(e) { return '❌ Error: ' + e; }
}

function deletePMItem(pmId) {
  try {
    var sh   = getPMSheet_();
    var data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(pmId)) {
        sh.deleteRow(i + 1);
        return '✅ ลบ PM สำเร็จ';
      }
    }
    return '❌ ไม่พบ PM ID';
  } catch(e) { return '❌ Error: ' + e; }
}

// ─── PM CHECKLIST SETUP ───────────────────────────────────────
function getPMChecklistSetup() {
  try {
    var sh   = getPMChecklistSetupSheet_();
    var data = sh.getDataRange().getValues();
    if (data.length <= 1) return [];
    var groupsMap = {}, groupOrder = [];
    for (var i = 1; i < data.length; i++) {
      var gName = String(data[i][0]||'').trim();
      var item  = String(data[i][1]||'').trim();
      var color = String(data[i][2]||'#00c6ff').trim();
      if (!gName) continue;
      if (!groupsMap[gName]) { groupsMap[gName] = { name:gName, color:color, items:[] }; groupOrder.push(gName); }
      if (item) groupsMap[gName].items.push(item);
    }
    return groupOrder.map(function(n){ return groupsMap[n]; });
  } catch(e) { return []; }
}

function savePMChecklistSetup(setup) {
  try {
    if (!setup || !Array.isArray(setup)) return '❌ ข้อมูลไม่ถูกต้อง';
    var sh = getPMChecklistSetupSheet_();
    sh.clear();
    sh.appendRow(['GroupName','ItemName','Color']);
    setup.forEach(function(g) {
      if (!g || !g.name) return;
      if (!g.items || !g.items.length) { sh.appendRow([g.name, '', g.color||'#00c6ff']); return; }
      g.items.forEach(function(item){ sh.appendRow([g.name, item||'', g.color||'#00c6ff']); });
    });
    return '✅ บันทึกรายการเช็กชีต PM สำเร็จ';
  } catch(e) { return '❌ Error: ' + e; }
}

// ─── SAVE PM CHECKLIST ────────────────────────────────────────
function savePMChecklist(pmCode, equip, productionLine, date, tech, runningHr, partsReplaced, overallResult, workDone, remarks, nextPm, checklistJson) {
  try {
    var sh = getPMHistorySheet_();
    var ts = nowTs_();
    sh.appendRow([
      pmCode        || '',
      equip         || '',
      productionLine|| '',
      date          || '',
      tech          || '',
      runningHr     || '',
      partsReplaced || '',
      overallResult || '',
      workDone      || '',
      remarks       || '',
      nextPm        || '',
      checklistJson || '{}',
      ts
    ]);
    var calSh   = getPMSheet_();
    var calData = calSh.getDataRange().getValues();
    for (var i = 1; i < calData.length; i++) {
      var rowId    = String(calData[i][0]);
      var rowEquip = String(calData[i][3]);
      var rowDt    = parsePMDate_(String(calData[i][1]));
      var chkDt    = parsePMDate_(String(date || ''));
      var same     = rowDt && chkDt
        && rowDt.getFullYear() === chkDt.getFullYear()
        && rowDt.getMonth()    === chkDt.getMonth()
        && rowDt.getDate()     === chkDt.getDate();
      if (rowId === String(pmCode) || (rowEquip === String(equip) && same)) {
        calSh.getRange(i+1, 7).setValue('เสร็จแล้ว');
        calSh.getRange(i+1, 8).setValue('#00e676');
        break;
      }
    }
    return '✅ บันทึกประวัติ PM เรียบร้อย';
  } catch(e) { Logger.log('savePMChecklist error: '+e); return '❌ Error: ' + e; }
}

// ─── ENGINEER ACK DAILY PM ────────────────────────────────────
function engineerAckDailyPM(code, engineerName) {
  try {
    var sh   = getDailyPMHistorySheet_();
    var data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(code)) {
        sh.getRange(i+1, 12).setValue('รับทราบแล้ว');
        sh.getRange(i+1, 13).setValue(engineerName + ' (' + nowTs_() + ')');
        return { status: 'ok' };
      }
    }
    return { status: 'error', message: 'ไม่พบรหัส PM: ' + code };
  } catch(e) {
    Logger.log('engineerAckDailyPM error: ' + e);
    return { status: 'error', message: String(e) };
  }
}

// ─── GET PM HISTORY ───────────────────────────────────────────
function getPMHistory() {
  try {
    var sh   = getPMHistorySheet_();
    var allD = sh.getDataRange().getDisplayValues();
    if (allD.length <= 1) return [];
    var data = allD.length > 151 ? [allD[0]].concat(allD.slice(-(150))) : allD;
    return data.slice(1).filter(function(r){ return r[0] !== ''; }).map(function(r, idx) {
      return {
        no:             idx + 1,
        pmCode:         r[0]  || '',
        equip:          r[1]  || '',
        productionLine: r[2]  || '',
        date:           r[3]  || '',
        tech:           r[4]  || '',
        runningHr:      r[5]  || '',
        parts:          r[6]  || '',
        result:         r[7]  || '',
        workDone:       r[8]  || '',
        note:           r[9]  || '',
        nextPM:         r[10] || '',
        checklist:      r[11] || '{}',
        savedAt:        r[12] || ''
      };
    }).reverse();
  } catch(e) { Logger.log('getPMHistory error: '+e); return []; }
}

// ─── EXPORT JOBS ──────────────────────────────────────────────
function getExportData(jobIds) {
  try {
    var jobs = getJobs();
    if (!jobIds || !jobIds.length) return jobs.slice(0, 50);
    return jobs.filter(function(j){ return jobIds.indexOf(j.id) > -1; });
  } catch(e) { return []; }
}

// ─── INITIAL DATA ─────────────────────────────────────────────
function getInitialData() {
  try {
    return {
      jobs:           getJobs(),
      checklistSetup: getPMChecklistSetup(),
      pm:             getPMCalendar(),
      pmHistory:      getPMHistory()
    };
  } catch(e) {
    Logger.log('getInitialData error: ' + e);
    return { jobs: [], checklistSetup: [], pm: [], pmHistory: [] };
  }
}

// ─── PM DATA (lazy) ───────────────────────────────────────────
function getPMData() {
  try {
    return {
      pm:        getPMCalendar(),
      pmHistory: getPMHistory()
    };
  } catch(e) {
    Logger.log('getPMData error: '+e);
    return { pm: [], pmHistory: [] };
  }
}

// ─── DAILY PM DATA (lazy) ─────────────────────────────────────
function getDailyPMData() {
  try {
    return {
      dailyPMHistory:      getDailyPMHistory(),
      dailyChecklistSetup: getDailyPMChecklistSetup()
    };
  } catch(e) {
    Logger.log('getDailyPMData error: '+e);
    return { dailyPMHistory: [], dailyChecklistSetup: [] };
  }
}