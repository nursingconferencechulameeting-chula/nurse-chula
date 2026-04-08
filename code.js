/**
 * Backend: ระบบเช็คชื่อเข้าประชุม (Dynamic Column Mapping + Logging)
 * GitHub Pages: https://nursingconferencechulameeting-chula.github.io/nurse-chula/
 * Google Sheet: https://docs.google.com/spreadsheets/d/17faKl37i60zOf5iZsqPgIkmr4U23y2xs0eXSTMHy0yM/edit?gid=817244781#gid=817244781
 */
const SHEET_ID = "17faKl37i60zOf5iZsqPgIkmr4U23y2xs0eXSTMHy0yM"; // ID ของ Google Sheet
const SHEET_DATA = "Responses"; 
const SHEET_STAFF = "UserScan"; 
const SHEET_LOG = "logCheckinApp";
const SHEET_TIMER = "Timer";

// กำหนดชื่อหัวคอลัมน์ที่ระบบต้องการ
const HEADERS = {
  DATA: {
    ID: "ID",
    TIMESTAMP: "Timestamp",
    EMAIL: "Email",
    TITLE: "คำนำหน้า",
    FNAME: "ชื่อ",
    LNAME: "นามสกุล",
    PHONE: "เบอร์โทรศัพท์",
    LICENSE: "เลขที่ใบประกอบวิชาชีพ",
    REG_TYPE: "ประเภทการลงทะเบียน",
    POSITION: "ตำแหน่งปัจจุบัน",
    FOOD: "ประเภทอาหาร",
    WORK_GROUP: "กลุ่มงาน",
    DEPT: "หน่วยงาน",
    // บุคคลภายนอก
    WORKPLACE: "สถานที่ทำงานปัจจุบัน",
    RECEIPT_NAME: "ชื่อที่ระบุในใบเสร็จรับเงิน",
    ADDRESS: "ที่อยู่",
    TAX_ID: "เลขประจำตัวผู้เสียภาษี",    
    PAYIN_STATUS: "สถานะ Pay-in",
    PAY_STATUS: "สถานะชำระเงิน",
    SLIP: "slip", // เก็บ URL รูปภาพสลิปชำระเงิน
    // ------
    ATT1: "วันที่ 1",
    ATT2: "วันที่ 2",
    TIME1: "Timestamp Day1",
    TIME2: "Timestamp Day2",
    IMAGE: "รูปภาพ", // เก็บ URL รูปภาพประจำตัว
  },

  STAFF: { PASSWARD: "Passward", NAME: "ชื่อ", ROLE: "สิทธิ์" },
  LOG: { TIME: "Timestamp", TID: "Target ID", TNAME: "Target Name", ACT: "Action", BY: "Recorded By", ROLE: "Staff Role" }
};

function doPost(e) {
  const res = (obj) => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  try {
    const params = JSON.parse(e.postData.contents);
    if (params.action === 'getUserPreview') return res(getUserPreview(params.id, params.day));
    if (params.action === 'checkStaffPrivilege') return res(checkStaffPrivilege(params.PASSWARD));
    if (params.action === 'recordAttendance') return res(recordAttendance(params.data));
    if (params.action === 'getRecentRecords') return res(getRecentRecords(params.data.day));
    if (params.action === 'getTimerSettings') return res(getTimerSettings());
  } catch (err) {
    return res({ success: false, message: err.toString() });
  }
}

function getColumnMapping(sheetHeaders) {
  let map = {};
  sheetHeaders.forEach((name, index) => { if (name) map[name.toString().trim()] = index; });
  return map;
}

function checkStaffPrivilege(userId) {
  // เปลี่ยนเป็น openById
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_STAFF);
  if (!sheet) return { isAllowed: false, message: "ไม่พบหน้า Sheet: " + SHEET_STAFF };

  const data = sheet.getDataRange().getValues();
  const map = getColumnMapping(data[0]);
  
  if (map[HEADERS.STAFF.PASSWARD] === undefined) return { isAllowed: false, message: "ไม่พบคอลัมน์ ID ใน Sheet Staff" };

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][map[HEADERS.STAFF.PASSWARD]]).trim() === String(userId).trim()) {
      return {
        isAllowed: true,
        name: data[i][map[HEADERS.STAFF.NAME]] || "Unknown",
        role: data[i][map[HEADERS.STAFF.ROLE]] || "Staff"
      };
    }
  }
  return { isAllowed: false };
}

function recordAttendance(d) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) {
      return { success: false, message: "⚠️ ระบบไม่ว่าง (Busy) กรุณาลองใหม่อีกครั้งใน 2-3 วินาที" };
    }

    // --- 1. ส่วนการเช็คเวลาที่แก้ไขให้ตรงกับ getTimerSettings ---
    const timerData = getTimerSettings();
    if (!timerData.success) {
      return { success: false, message: "⚠️ ไม่สามารถดึงข้อมูลเวลาได้: " + timerData.message };
    }

    const now = new Date().getTime();
    const settings = timerData.registrationTime;
    
    // ดึงค่าช่วงเวลาตามวันที่ส่งมา (d.day เป็น 1 หรือ 2)
    const timeConfig = (d.day == 1) ? settings.day1 : settings.day2;
    const target = timeConfig.start;
    const end = timeConfig.end;

    // ตรวจสอบเงื่อนไขเวลาเปิด-ปิด
    if (!target || !end) {
      return { success: false, message: "⚠️ ยังไม่มีการตั้งค่าเวลาสำหรับวันที่ " + d.day };
    }
    
    if (now < target) {
      const startTimeStr = Utilities.formatDate(new Date(target), "GMT+7", "HH:mm");
      return { success: false, message: "⚠️ ยังไม่ถึงเวลาลงทะเบียน (เริ่ม " + startTimeStr + " น.)" };
    }
    
    if (now > end) {
      return { success: false, message: "⚠️ หมดเวลาลงทะเบียนสำหรับวันนี้แล้ว" };
    }
    // -------------------------------------------------------

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_DATA);
    
    const data = sheet.getDataRange().getValues();
    const map = getColumnMapping(data[0]);
    const h = HEADERS.DATA;

    // ตรวจสอบการรับค่า input (รองรับทั้ง d.data.text และ d.text)
    const rawInput = (d.data && d.data.text) ? d.data.text.toString().trim() : (d.text ? d.text.toString().trim() : "");
    const inputId = rawInput.includes('|') ? rawInput.split('|')[0].trim() : rawInput;

    const normalize = (val) => {
      const num = val.toString().replace(/\D/g, ''); 
      return num ? num.padStart(3, '0') : val;
    };

    const targetIdNorm = normalize(inputId);
    const colAtt = (d.day == 1) ? map[h.ATT1] : map[h.ATT2];
    const colTime = (d.day == 1) ? map[h.TIME1] : map[h.TIME2];

    for (let i = 1; i < data.length; i++) {
      const sheetId = String(data[i][map[h.ID]]).trim();
      const sheetIdNorm = normalize(sheetId);

      if (sheetId.toUpperCase() === inputId.toUpperCase() || sheetIdNorm === targetIdNorm) {
        const fullName = data[i][map[h.FNAME]] + " " + data[i][map[h.LNAME]];

        // ตรวจสอบสถานะชำระเงินสำหรับบุคคลภายนอก
        if (data[i][map[h.REG_TYPE]] === "สำหรับผู้ลงทะเบียนภายนอก" && data[i][map[h.PAY_STATUS]] !== "ชำระเงินเรียบร้อย") {
          return { success: false, message: "⚠️ บุคคลภายนอกต้องชำระเงินก่อน" };
        }

        // ตรวจสอบว่าเคยลงชื่อไปหรือยัง
        if (data[i][colAtt] === "เข้าประชุม") {
          return { success: false, message: "ID: " + sheetId + " ลงชื่อวันนี้ไปแล้ว" };
        }

        // กรณีวันที่ 2 แต่ยังไม่ได้ลงชื่อวันที่ 1
        if (d.day == 2 && data[i][map[h.ATT1]] !== "เข้าประชุม" && !d.confirmSkip) {
          return { success: false, requireConfirm: true, message: "ยังไม่ได้ลงชื่อวันที่ 1 ยืนยันบันทึกวันที่ 2 หรือไม่?" };
        }

        const currentTime = new Date();
        sheet.getRange(i + 1, colAtt + 1).setValue("เข้าประชุม");
        sheet.getRange(i + 1, colTime + 1).setValue(currentTime);
        
        if (typeof writeLog === 'function') writeLog(sheetId, fullName, d.day, d.staffInfo);

        return { 
          success: true, 
          user: { 
            id: sheetId, 
            name: fullName, 
            time: Utilities.formatDate(currentTime, "GMT+7", "HH:mm:ss"), 
            dept: data[i][map[h.DEPT]], 
            img: data[i][map[h.IMAGE]] 
          } 
        };
      }
    }
    return { success: false, message: "ไม่พบข้อมูลรหัส: " + inputId };

  } catch (err) {
    return { success: false, message: "Backend Error: " + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function writeLog(targetId, targetName, day, staff) {
  // เปลี่ยนเป็น openById
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([HEADERS.LOG.TIME, HEADERS.LOG.TID, HEADERS.LOG.TNAME, HEADERS.LOG.ACT, HEADERS.LOG.BY, HEADERS.LOG.ROLE]);
  }
  sheet.appendRow([new Date(), targetId, targetName, "สแกนวันที่ " + day, staff ? staff.name : "System", staff ? staff.role : "-"]);
}

function getRecentRecords(day) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_DATA);
  const data = sheet.getDataRange().getValues();
  const map = getColumnMapping(data[0]);
  const h = HEADERS.DATA;
  const colAtt = (day == 1) ? map[h.ATT1] : map[h.ATT2];
  const colTime = (day == 1) ? map[h.TIME1] : map[h.TIME2];
  
  let records = [];
  let presentCount = 0;
  let totalRows = data.length - 1; // จำนวนรายชื่อทั้งหมด (ไม่รวมหัวตาราง)

  // วนลูปจากล่างขึ้นบน เพื่อหาคนล่าสุด และนับยอดรวมไปพร้อมกัน
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][colAtt] === "เข้าประชุม") {
      presentCount++; // นับจำนวนคนมาแล้วทั้งหมด
      
      // เก็บข้อมูลเฉพาะ 15 คนล่าสุดเพื่อส่งไปแสดงที่ลิสต์หน้าเว็บ
      if (records.length < 15) {
        records.push({ 
          id: data[i][map[h.ID]], 
          name: data[i][map[h.FNAME]] + " " + data[i][map[h.LNAME]], 
          time: data[i][colTime] ? Utilities.formatDate(new Date(data[i][colTime]), "GMT+7", "HH:mm:ss") : "-" 
        });
      }
    }
  }

  return { 
    success: true, 
    records: records, 
    present: presentCount, 
    absent: totalRows - presentCount 
  };
}

/**
 * เพิ่มฟังก์ชันสำหรับดึงข้อมูล Preview ก่อนบันทึก
 * ช่วยให้ตรวจสอบชื่อ รูปภาพ และสถานะการชำระเงินได้ก่อน
 */
function getUserPreview(inputId, day) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_DATA);
  const data = sheet.getDataRange().getValues();
  const map = getColumnMapping(data[0]);
  const h = HEADERS.DATA;

  const rawInput = inputId.toString().trim();
  const cleanId = rawInput.includes('|') ? rawInput.split('|')[0].trim() : rawInput;

  const normalize = (val) => {
    const num = val.toString().replace(/\D/g, ''); 
    return num ? num.padStart(3, '0') : val;
  };

  const targetIdNorm = normalize(cleanId);
  
  // กำหนดคอลัมน์ที่จะตรวจสอบ (วันที่ 1 หรือ วันที่ 2) และ คอลัมน์เวลา
  const colAtt = (day == 2) ? map[h.ATT2] : map[h.ATT1];
  const colTime = (day == 2) ? map[h.TIME2] : map[h.TIME1]; // ดึงคอลัมน์ Timestamp Day1/2

  for (let i = 1; i < data.length; i++) {
    const sheetId = String(data[i][map[h.ID]]).trim();
    const sheetIdNorm = normalize(sheetId);

    if (sheetId.toUpperCase() === cleanId.toUpperCase() || sheetIdNorm === targetIdNorm) {
      
      const isAlreadyScanned = (data[i][colAtt] === "เข้าประชุม");
      let formattedTime = "-";

      // ถ้าสแกนแล้ว ให้ดึงเวลามา Format
      if (isAlreadyScanned && data[i][colTime]) {
        formattedTime = Utilities.formatDate(new Date(data[i][colTime]), "GMT+7", "HH:mm:ss");
      }

      return {
        success: true,
        isAlreadyScanned: isAlreadyScanned,
        scannedTime: formattedTime, // *** ส่งค่าเวลาที่บันทึกไว้กลับไป ***
        user: {
          id: sheetId,
          name: data[i][map[h.FNAME]] + " " + data[i][map[h.LNAME]],
          dept: data[i][map[h.DEPT]],
          position: data[i][map[h.POSITION]],
          regType: data[i][map[h.REG_TYPE]],
          payStatus: String(data[i][map[h.PAY_STATUS]]).trim(),
          img: data[i][map[h.IMAGE]]
        }
      };
    }
  }
  return { success: false, message: "ไม่พบข้อมูลรหัส: " + cleanId };
}

// กำหนดเวลา เปิด-ปิด การลงทะเบียน
function getTimerSettings() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_TIMER);
  if (!sheet) return { success: false, message: "ไม่พบ Sheet Timer" };

  try {
    const data = sheet.getDataRange().getValues();
    const timer = {};

    // แปลงข้อมูลจาก Sheet เป็น Object โดยใช้ config_id เป็น Key
    data.forEach(row => {
      timer[row[0]] = { 
        item1: row[2], // คอลัมน์ C (วันเวลาเริ่มต้น)
        item2: row[3]  // คอลัมน์ D (วันเวลาสิ้นสุด)
      };
    });

    // Helper function สำหรับแปลงเป็น Timestamp
    const getTime = (val) => {
      if (!val || val === "") return null;
      const dateObj = new Date(val);
      return isNaN(dateObj.getTime()) ? null : dateObj.getTime();
    };

    return {
      success: true,
      registrationTime: { // สำหรับเช็คเวลาลงทะเบียนรายวัน
        day1: { 
          start: getTime(timer["T-03"]?.item1), 
          end:   getTime(timer["T-03"]?.item2) 
        },
        day2: { 
          start: getTime(timer["T-04"]?.item1), 
          end:   getTime(timer["T-04"]?.item2) 
        }
      }
    };

  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

