// /** 🟢 ส่วนการตั้งค่าคอลัมน์ */
// const COL = {
//   ID: "ID",
//   TIMESTAMP: "tiemstarmp",
//   EMAIL: "Email",
//   TITLE: "คำนำหน้า",
//   FNAME: "ชื่อ",
//   LNAME: "นามสกุล",
//   PHONE: "เบอร์โทรศัพท์",
//   LICENSE: "เลขที่ใบประกอบวิชาชีพ",
//   REG_TYPE: "ประเภทการลงทะเบียน",
//   POSITION: "ตำแหน่งปัจจุบัน",
//   FOOD: "ประเภทอาหาร",
//   WORK_GROUP: "กลุ่มงาน",
//   DEPARTMENT: "หน่วยงาน",
//   WORKPLACE: "สถานที่ทำงานปัจจุบัน",
//   RECEIPT_NAME: "ชื่อที่ระบุในใบเสร็จรับเงิน",
//   ADDRESS: "ที่อยู่",
//   TAX_ID: "เลขประจำตัวผู้เสียภาษี",
//   IMAGE: "รูปภาพ", // เก็บ URL รูปภาพประจำตัว
//   PAYIN_STATUS: "สถานะ Pay-in",
//   PAYMENT_STATUS: "สถานะชำระเงิน",
//   SLIP: "slip", // เก็บ URL รูปภาพสลิปชำระเงิน
//   ATTEND_1: "วันที่ 1",
//   ATTEND_2: "วันที่ 2",
//   ATTEND_1_TIME: "Timestamp Day1",
//   ATTEND_2_TIME: "Timestamp Day2",
//   CERT_URL: "URL ประกาศนียบัตร",
//   DOWNLOAD: "จำนวนดาวน์โหลด"
// };
// /** 🟢 รายการสิทธิ์เข้าประชุม */
// const REG_STATUS = {
//   INTERNAL: 'พยาบาลในฝ่ายการพยาบาล รพ.จุฬาลงกรณ์',
//   QUOTA: 'สำหรับผู้ที่ได้รับโควต้าตามจดหมายเชิญ',
//   EXTERNAL: 'สำหรับผู้ลงทะเบียนภายนอก'
// };

// const SHEET_DATA = "Responses"; // sheet เก็บข้อมูลลงทะเบียน
// const SHEET_CONFIG = "Config";  // เก็บรายการต่างๆ

// /** * Displays the HTML form when the web app is accessed. */
// function doGet() {
//   let tmp = HtmlService.createTemplateFromFile('index');
  
//   // 🟢 ส่งตัวแปรไปให้หน้าเว็บ
//   tmp.COL = COL;
//   tmp.REG_STATUS = REG_STATUS; 
  
//   return tmp.evaluate()
//     .setTitle("งานประชุมวิชาการพยาบาล 2569")
//     .addMetaTag('viewport', 'width=device-width, initial-scale=1')
//     .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
// }

// /** ดึงไฟล์ include */
// function include(filename) {
//   return HtmlService.createHtmlOutputFromFile(filename).getContent();
// }

// /**
//  * Processes the form submission.
//  * @param {Object} formData - An object containing the form data.
//  * The keys of the object correspond to the 'name' attributes in the HTML form.
//  *   // ฟังก์ชันนี้จะถูกเรียกใช้งานเมื่อส่งแบบฟอร์มผ่านเมธอด POST
//   // ในกรณีนี้เราไม่ได้ใช้การส่ง POST โดยตรงจากแบบฟอร์ม HTML
//   // แต่ใช้ google.script.run ซึ่งเรียกใช้ฟังก์ชันฝั่งเซิร์ฟเวอร์โดยตรง
//   // ฟังก์ชัน doPost มีไว้สำหรับจัดการ HTTP POST แบบดั้งเดิมเป็นหลัก
//   // อย่างไรก็ตาม จำเป็นต้องมี doPost เพื่อให้แอปพลิเคชันเว็บใช้งานได้
//   // การนำ doPost ไปใช้จริงนี้เพียงแค่ส่งข้อมูลที่แยกวิเคราะห์แล้วไปยัง processForm
//  */
// function doPost(e) {
//   let lock = LockService.getScriptLock();
//   let result = {};

//   try {
//     // กำหนดเวลา 10 วินาที
//     if (!lock.tryLock(10000)) {
//       throw new Error('Could not obtain lock');
//     }

//     if (!e.postData || !e.postData.contents) {
//       throw new Error('No POST data received');
//     }

//     let formObject = JSON.parse(e.postData.contents);
//     result = processForm(formObject);// ✅ เรียกใช้ฟังก์ชันการประมวลผลจริง
//   } catch (error) {
//     result = { success: false, message: 'Error: ' + error.message };
//   } finally {
//     // ปลดล็อกไม่ว่าจะสำเร็จหรือผิดพลาด
//     lock.releaseLock();
//   }

//   // Return JSON response
//   return ContentService.createTextOutput(JSON.stringify(result))
//     .setMimeType(ContentService.MimeType.JSON);
// }

// /** ############################################################################################ */
// /**
//  * Retrieves the Google Chat Webhook URL from script properties.
//  * @returns {string} The Google Chat Webhook URL.
//  * @throws {Error} If the CHAT_WEBHOOK_URL property is not set.
//  */
// function getChatWebhookUrl() {
//   const url = PropertiesService.getScriptProperties().getProperty('CHAT_WEBHOOK_URL');
//   if (!url) {
//     throw new Error('Google Chat Webhook URL is not set in Script Properties. Please go to File > Project properties > Script properties and add a property named "CHAT_WEBHOOK_URL" with your webhook URL as the value.');
//   }
//   return url;
// }
// // URL ของ Google Chat Webhook ของคุณ
// // *** ระวัง: URL นี้มีความสำคัญ อย่าเผยแพร่ต่อสาธารณะ และพิจารณาเก็บใน Script Properties เพื่อความปลอดภัยที่ดีกว่า ***
// // const CHAT_WEBHOOK_URL = 'https://chat.googleapis.com/v1/spaces/AAQAB2IPCew/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Skm9In97QpJDGDE2psLtXp4EcrjcjIeeWGV6Ww5qg8U';

// /** ฟังก์ชันบันทึกการลงทะเบียนใหม่ */
// function processForm(formData) {
//   const lock = LockService.getScriptLock();
//   try {
//     if (!lock.tryLock(15000)) return { success: false, message: "ระบบไม่ว่าง" };
//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheet = ss.getSheetByName(SHEET_DATA);
//     const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
//     const autoId = getNextId(); 

//     // อัปโหลดรูปโปรไฟล์ (ID_Profile)
//     let profileUrl = "-";
//     if (formData.profilePreview && formData.profilePreview.startsWith("data:image")) {
//       profileUrl = uploadProfileImage(formData.profilePreview, autoId + "_Profile", '1GC9_VU8DwkjkwYKdd8LY4daVtUBMJ0rs');
//     }

//     // อัปโหลดรูปสลิป (ID_Slip)
//     let slipUrl = "-";
//     if (formData.slipImage && formData.slipImage.startsWith("data:image")) {
//       slipUrl = uploadProfileImage(formData.slipImage, autoId + "_Slip", '1X_Bv5X7VNRik2DSDCtpsdtzoL1DGuWV0');
//     }

//     let rowData = new Array(headers.length).fill("");
//     const set = (colName, val) => { const idx = getIdx(headers, colName); if (idx > -1) rowData[idx] = val; };

//     set(COL.ID, autoId);
//     set(COL.TIMESTAMP, Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy, HH:mm:ss"));
//     set(COL.EMAIL, formData.email || "-");
//     set(COL.TITLE, formData.title_Name);
//     set(COL.FNAME, formData.firstName);
//     set(COL.LNAME, formData.lastName);
//     set(COL.PHONE, formData.phoneNumber || "-");
//     set(COL.LICENSE, formData.proLicense || "-");
//     set(COL.REG_TYPE, formData.status_Register);
//     set(COL.FOOD, formData.foodType);
//     set(COL.IMAGE, profileUrl);
//     set(COL.SLIP, slipUrl); // 🟢 บันทึกลิงก์สลิป

//     // จัดการตำแหน่ง/สถานที่ทำงาน (ลอจิกเดิม)
//     let pos = "-"; let work = "-";
//     if (formData.status_Register === REG_STATUS.INTERNAL) {
//       pos = formData.internalPosition === "อื่นๆ" ? formData.internalPosition_OtherText : formData.internalPosition;
//       work = "โรงพยาบาลจุฬาลงกรณ์";
//     } else if (formData.status_Register === REG_STATUS.QUOTA) {
//       pos = "ผู้ได้รับโควต้า";
//       work = formData.affiliation === "อื่นๆ" ? formData.affiliation_otherText : formData.affiliation;
//     } else {
//       work = formData.workPlace;
//       pos = formData.externalPosition === "อื่นๆ" ? formData.externalPosition_OtherText : formData.externalPosition;
//     }
//     set(COL.POSITION, pos);
//     set(COL.WORKPLACE, work);
//     set(COL.WORK_GROUP, formData.workGroup || "-");
//     set(COL.DEPARTMENT, formData.department || "-");
//     set(COL.ADDRESS, formData.address || "-");
//     set(COL.RECEIPT_NAME, formData.name_Receipt || "-");
//     set(COL.TAX_ID, formData.taxpayer_ID || "-");

//     sheet.appendRow(rowData);
//     return { success: true, message: `ลงทะเบียนสำเร็จ ID: ${autoId}` };
//   } catch (error) { return { success: false, message: error.message }; } finally { lock.releaseLock(); }
// }

// /** อัพเดทข้อมูล */
// function updateForm(formData) {
//   const lock = LockService.getScriptLock();
//   try {
//     if (!lock.tryLock(15000)) return { success: false, message: "ระบบไม่ว่าง..." };
//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheet = ss.getSheetByName(SHEET_DATA);
//     const rowIndex = formData.rowNumber;
//     const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
//     let rowData = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
//     const existingId = rowData[getIdx(headers, COL.ID)];

//     // อัปเดตรูปโปรไฟล์ (ID_Profile)
//     if (formData.profilePreview && formData.profilePreview.startsWith("data:image")) {
//       deleteFileByUrl(rowData[getIdx(headers, COL.IMAGE)]);
//       rowData[getIdx(headers, COL.IMAGE)] = uploadProfileImage(formData.profilePreview, existingId + "_Profile", '1GC9_VU8DwkjkwYKdd8LY4daVtUBMJ0rs');
//     }

//     // อัปเดตรูปสลิป (ID_Slip)
//     if (formData.slipImage && formData.slipImage.startsWith("data:image")) {
//       deleteFileByUrl(rowData[getIdx(headers, COL.SLIP)]);
//       rowData[getIdx(headers, COL.SLIP)] = uploadProfileImage(formData.slipImage, existingId + "_Slip", '1X_Bv5X7VNRik2DSDCtpsdtzoL1DGuWV0');
//     }

//     const update = (colName, val) => { const idx = getIdx(headers, colName); if (idx > -1) rowData[idx] = val; };
//     update(COL.EMAIL, formData.email);
//     update(COL.TITLE, formData.title_Name);
//     update(COL.FNAME, formData.firstName);
//     update(COL.LNAME, formData.lastName);
//     update(COL.PHONE, formData.phoneNumber);
//     update(COL.LICENSE, formData.proLicense);
//     update(COL.FOOD, formData.foodType);
//     update(COL.ADDRESS, formData.address || "-");
//     update(COL.RECEIPT_NAME, formData.name_Receipt || "-");
//     update(COL.TAX_ID, formData.taxpayer_ID || "-");

//     clearTimerCache();
//     sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
//     return { success: true, message: "อัพเดทข้อมูลสำเร็จ" };
//   } catch (e) { return { success: false, message: e.toString() }; } finally { lock.releaseLock(); }
// }

// /**
//  * ฟังก์ชันสำหรับอัปโหลดรูปภาพ Base64 ไปยัง Google Drive
//  */
// function uploadProfileImage(base64Data, filename, folderId) {
//   try {
//     // แยกส่วนประกอบของ Data URL
//     const splitData = base64Data.split(',');
//     const contentType = splitData[0].match(/:(.*?);/)[1]; // ดึง mime type (เช่น image/jpeg)
//     const rawData = Utilities.base64Decode(splitData[1]);
//     const blob = Utilities.newBlob(rawData, contentType, filename);
    
//     // เข้าถึงโฟลเดอร์และสร้างไฟล์
//     const folder = DriveApp.getFolderById(folderId);
//     const file = folder.createFile(blob);
    
//     // ตั้งค่าให้ทุกคนที่มีลิงก์สามารถดูได้ (เพื่อให้รูปแสดงผลบนหน้าเว็บได้)
//     file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
//     // ส่งคืน URL ในรูปแบบที่สามารถนำไปแสดงผลได้ทันที
//     return "https://lh5.googleusercontent.com/d/" + file.getId();
//   } catch (e) {
//     Logger.log("Error uploading image: " + e.message);
//     return "-";
//   }
// }

// /**
//  * ฟังก์ชันสำหรับหา ID ล่าสุดและรันตัวเลขถัดไปในรูปแบบ NS-000
//  */
// function getNextId() {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName(SHEET_DATA);
//   const prefix = "NS-"; // กำหนดตัวนำหน้า
  
//   const lastRow = sheet.getLastRow();
//   if (lastRow < 2) return prefix + "001"; // ถ้าไม่มีข้อมูลเลย ให้เริ่มที่ NS-001

//   // ดึงข้อมูลคอลัมน์ A ทั้งหมด
//   const idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
//   let maxNumber = 0;

//   for (let i = 0; i < idValues.length; i++) {
//     let idString = String(idValues[i][0]); // เช่น "NS-005"
//     if (idString.indexOf(prefix) !== -1) {
//       // ตัดตัวอักษร prefix ออก แล้วแปลงส่วนที่เหลือเป็นตัวเลข
//       let currentNumber = parseInt(idString.replace(prefix, ""));
//       if (!isNaN(currentNumber) && currentNumber > maxNumber) {
//         maxNumber = currentNumber;
//       }
//     }
//   }

//   // รันเลขถัดไป
//   let nextNumber = maxNumber + 1;
  
//   // จัดรูปแบบให้เป็น 3 หลัก (001, 002, 010, 100)
//   let formattedNumber = ("000" + nextNumber).slice(-3);
  
//   return prefix + formattedNumber;
// }

// /**
//  * ฟังก์ชันสำหรับลบไฟล์เดิมใน Drive จาก URL ที่เก็บใน Sheet
//  */
// function deleteFileByUrl(fileUrl) {
//   if (!fileUrl || fileUrl === "-" || !fileUrl.includes("/d/")) return;
  
//   try {
//     // แกะ ID ไฟล์จาก URL (รูปแบบ https://lh5.googleusercontent.com/d/FILE_ID)
//     const fileId = fileUrl.split('/d/')[1];
//     if (fileId) {
//       DriveApp.getFileById(fileId).setTrashed(true); // ย้ายลงถังขยะ
//       Logger.log("ลบไฟล์เดิมเรียบร้อย: " + fileId);
//     }
//   } catch (e) {
//     // หากไม่พบไฟล์เดิม (อาจถูกลบไปแล้ว) ให้ข้ามไป ไม่ต้องหยุดการทำงาน
//     Logger.log("ไม่สามารถลบไฟล์ได้: " + e.message);
//   }
// }

// /**
//  * ส่งข้อมูลการลงทะเบียนเป็นข้อความแบบ Card ไปยัง Google Chat Webhook.
//  * ต้องมีการตั้งค่า CHAT_WEBHOOK_URL ใน Script Properties.
//  * @param {Object} formData - ข้อมูลแบบฟอร์ม.
//  * @param {string} fullAddress - ข้อมูลที่อยู่แบบรวม.
//  * @param {Date} now - วัตถุ Date ของเวลาปัจจุบัน.
//  */
// function sendNotificationToChat(formData, fullAddress, now) {
//   let CHAT_WEBHOOK_URL;
//   try {
//     CHAT_WEBHOOK_URL = getChatWebhookUrl(); // Get URL from Script Properties
//   } catch (e) {
//     Logger.log("❌ ไม่สามารถส่งข้อความ Chat ได้: " + e.message);
//     console.error("Error getting Webhook URL from properties:", e);
//     return; // Stop execution if URL is not available
//   }

//   const formattedDateTime = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd/MM/yyyy, HH:mm น.");

//   // --- แมปชื่อตัวแปรให้ตรงกับ HTML ---
//   const prefix = String(formData.title_Name || '').trim();
//   const firstName = String(formData.firstName || '').trim();
//   const lastName = String(formData.lastName || '').trim();
//   const fullName = `${prefix}${firstName} ${lastName}`.trim();

//   const email = String(formData.email || '').trim();
//   const tel = String(formData.phoneNumber || '').trim();
//   const license = String(formData.proLicense || '').trim();
//   const foodType = String(formData.foodType || '').trim();
//   const receiptName = String(formData.name_Receipt || '').replace(/[\r\n]+/g, ' ').trim();
//   const taxId = String(formData.taxpayer_ID || '').trim() || '-';
//   const statusRegister = String(formData.status_Register || '-').trim();

//   // จัดการข้อมูล สถานที่ทำงาน และ ตำแหน่ง ตามประเภทการลงทะเบียน
//   let workPlaceDisplay = "";
//   let positionDisplay = "";

//   if (formData.status_Register === REG_STATUS.INTERNAL) {
//     workPlaceDisplay = (formData.workGroup || '-') + " / " + (formData.department || '-');
//     positionDisplay = formData.internalPosition || '-';
//   } else if (formData.status_Register === REG_STATUS.QUOTA) {
//     workPlaceDisplay = formData.affiliation || '-';
//     if (formData.affiliation_otherText) workPlaceDisplay += " (" + formData.affiliation_otherText + ")";
//     positionDisplay = "ผู้ได้รับโควต้า";
//   } else {
//     workPlaceDisplay = String(formData.workPlace || '-').replace(/[\r\n]+/g, ' ').trim();
//     positionDisplay = formData.externalPosition || '-';
//     if (positionDisplay === "อื่นๆ") positionDisplay = formData.externalPosition_OtherText || '-';
//   }
//   // -------------------------------------------

//   const cardMessage = {
//     cards: [
//       {
//         header: {
//           title: "🔔 มีการลงทะเบียนใหม่!",
//           subtitle: `# ${formData.status_Register || 'งานประชุมวิชาการพยาบาล 2569'} #`,
//         },
//         sections: [
//           {
//             header: "✅ <b>ข้อมูลผู้ลงทะเบียน</b>",
//             widgets: [
//               { textParagraph: { text: `🗓️ <b>เวลาลงทะเบียน:</b> ${formattedDateTime}` } },
//               { textParagraph: { text: `👤 <b>ผู้ลงทะเบียน:</b> ${fullName}` } },
//               { keyValue: { 
//                   topLabel: "ประเภทการลงทะเบียน", 
//                   content: `<b>${statusRegister}</b>`,
//                   contentMultiline: true 
//               } },              
//               { keyValue: { content: "📧 อีเมล: " + (email || '-') } },
//               { keyValue: { content: "📱 เบอร์โทรศัพท์: " + (tel || '-') } },
//               { keyValue: { content: "📄 เลขที่ใบประกอบวิชาชีพ: " + (license || '-') } },
//               { keyValue: { content: "📌 สถานที่ทำงาน: " + (workPlaceDisplay || '-') } },
//               { keyValue: { content: "🏷️ ตำแหน่ง: " + (positionDisplay || '-') } },
//               { keyValue: { content: "🍽️ ประเภทอาหาร: " + (foodType || '-') } },
//             ]
//           },
//           {
//             header: "✅ <b>ข้อมูลออกใบเสร็จ</b>",
//             widgets: [
//               { keyValue: { content: "👤 ชื่อในใบเสร็จ: " + (receiptName || '-') } },
//               { keyValue: { content: "🏠 ที่อยู่: " + (fullAddress || '-'), contentMultiline: true } },
//               { keyValue: { content: "🧾 เลขประจำตัวผู้เสียภาษี: " + (taxId || '-') } },
//             ]
//           },
//           {
//             header: "✅ <b>Link</b>",
//             widgets: [
//               {
//                 buttons: [
//                   {
//                     textButton: {
//                       text: "📂 เปิด Google Sheet",
//                       onClick: {
//                         openLink: {
//                           url: "https://docs.google.com/spreadsheets/d/1PW2fz87N-k0HpUWAKYQn_T1tyTIp69BxdOTkyXABoA0/edit?gid=817244781#gid=817244781",
//                         }
//                       }
//                     }
//                   }
//                 ]
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   };

//   const options = {
//     method: 'POST',
//     contentType: 'application/json',
//     payload: JSON.stringify(cardMessage),
//     muteHttpExceptions: true 
//   };

//   Logger.log("Attempting to send Google Chat notification...");

//   try {
//     const response = UrlFetchApp.fetch(CHAT_WEBHOOK_URL, options);
//     const responseCode = response.getResponseCode();
//     if (responseCode >= 200 && responseCode < 300) {
//       Logger.log("✅ ส่งข้อความแจ้งเตือนไปยัง Google Chat แล้ว");
//     } else {
//       Logger.log(`❌ ข้อผิดพลาด HTTP Status: ${responseCode}`);
//     }
//   } catch (error) {
//     Logger.log("❌ เกิดข้อผิดพลาดในการส่ง Chat: " + error.message);
//   }
// }

// /** ฟังชันสำหรับเลือก กลุ่มงาน และ หน่วยงาน */
// function getWorkGroupData() {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
//   if (!sheet || sheet.getLastRow() < 2) return {}; // ป้องกัน Error ถ้าไม่มีข้อมูล
//   const data = sheet.getRange("A2:B" + sheet.getLastRow()).getValues();
//   const result = {};
//   Logger.log("data: "+ JSON.stringify(data));

//   data.forEach(([group, dept]) => {
//     if (group && dept) {
//       if (!result[group]) result[group] = [];
//       if (!result[group].includes(dept)) {
//         result[group].push(dept);
//       }
//     }
//   });

//   return result;
// }

// /**
//  * ฟังก์ชันบันทึก กลุ่มงาน และ หน่วยงาน ใหม่
//  */
// function saveNewQA(group, dept) {
//   if (!group || !dept || group === "อื่นๆ" || dept === "อื่นๆ") return;

//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
//   if (!sheet) return;

//   const data = sheet.getDataRange().getValues();
  
//   // ตรวจสอบว่าคู่ กลุ่มงาน-หน่วยงาน นี้มีอยู่แล้วหรือยัง
//   const isDuplicate = data.some(row => 
//     row[0].toString().trim().toLowerCase() === group.trim().toLowerCase() &&
//     row[1].toString().trim().toLowerCase() === dept.trim().toLowerCase()
//   );

//   if (!isDuplicate) {
//     sheet.appendRow([group.trim(), dept.trim()]);
//     // เรียงลำดับตามกลุ่มงาน (คอลัมน์ A)
//     const lastRow = sheet.getLastRow();
//     if (lastRow > 1) {
//       sheet.getRange(2, 1, lastRow - 1, 2).sort([{column: 1, ascending: true}, {column: 2, ascending: true}]);
//     }
//   }
// }

// // ฟังก์ชันสำหรับดึงรายการสังกัด
// function getAffiliationData() {
//   try {
//     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
//     if (!sheet) return [];
    
//     const lastRow = sheet.getLastRow();
//     if (lastRow < 2) return []; // ถ้าไม่มีข้อมูลเลย
//     const data = sheet.getRange("C2:C" + lastRow).getValues();
    
//     // แปลงจาก Array 2 มิติเป็น Array 1 มิติ และกรองช่องว่างออก
//     return data.flat().filter(item => item.toString().trim() !== "");
//   } catch (e) {
//     console.log("Error: " + e.message);
//     return [];
//   }
// }

// /**
//  * ฟังก์ชันบันทึกสังกัดใหม่ลง Sheet ถ้ายังไม่มีในรายการ
//  */
// function saveNewAffiliationIfMissing(newAffiliation) {
//   if (!newAffiliation || newAffiliation === "" || newAffiliation === "อื่นๆ") return;

//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
//   if (!sheet) return;

//   const lastRow = sheet.getLastRow();
//   let existingData = [];
  
//   if (lastRow >= 2) {
//     existingData = sheet.getRange("C2:C" + lastRow).getValues().flat();
//   }

//   // ตรวจสอบว่ามีชื่อนี้อยู่แล้วหรือยัง (Case-insensitive และลบช่องว่าง)
//   const isDuplicate = existingData.some(item => 
//     item.toString().trim().toLowerCase() === newAffiliation.trim().toLowerCase()
//   );

//   if (!isDuplicate) {
//     sheet.appendRow([newAffiliation.trim()]);
//     // (Option) อาจจะสั่ง Sort รายการใหม่ตามตัวอักษรหลังจากเพิ่ม
//     const newLastRow = sheet.getLastRow();
//     if (newLastRow > 2) {
//       sheet.getRange("C2:C" + newLastRow).sort({column: 3, ascending: true});
//     }
//   }
// }

// // ฟังก์ชันสำหรับดึงรายการ ตำแหน่ง/วิชาชีพ
// function getProfessionData() {
//   try {
//     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG); 
//     if (!sheet) return [];
//     const lastRow = sheet.getLastRow();
//     if (lastRow < 2) return [];
//     const data = sheet.getRange("D2:D" + lastRow).getValues();
//     return data.flat().filter(item => item.toString().trim() !== "");
//   } catch (e) {
//     return [];
//   }
// }

// // ฟังก์ชันบันทึกวิชาชีพใหม่
// function saveNewProfession(profession) {
//   if (!profession || profession === "" || profession === "อื่นๆ") return;

//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
//   if (!sheet) return;

//   const lastRow = sheet.getLastRow();
//   let existingData = [];
//   if (lastRow >= 2) {
//     existingData = sheet.getRange("D2:D" + lastRow).getValues().flat();
//   }

//   const isDuplicate = existingData.some(item => 
//     item.toString().trim().toLowerCase() === profession.trim().toLowerCase()
//   );

//   if (!isDuplicate) {
//     // บันทึกที่แถวใหม่
//     sheet.getRange(lastRow + 1, 4).setValue(profession.trim());
//     sheet.getRange("D2:D" + (lastRow + 1)).sort({column: 4, ascending: true});
//   }
// }

// // ฟังก์ชันสำหรับดึงรายการ คำนำหน้า
// function getPrefixData() {
//   try {
//     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG); 
//     if (!sheet) return [];
//     const lastRow = sheet.getLastRow();
//     if (lastRow < 2) return [];
//     const data = sheet.getRange("E2:E" + lastRow).getValues();
//     return data.flat().filter(item => item.toString().trim() !== "");
//   } catch (e) {
//     return [];
//   }
// }

// /**
//  * ค้นหาข้อมูล (ปรับปรุง Index สำหรับโครงสร้างที่มี ID อยู่คอลัมน์ A)
//  */
// function searchUser(query) {
//   try {
//     const searchTerm = String(query || "").toLowerCase().trim();
//     if (searchTerm === "" || searchTerm === "-") return { success: false, message: "กรุณาระบุข้อมูลค้นหา" };

//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheet = ss.getSheetByName(SHEET_DATA);
//     const data = sheet.getDataRange().getValues();
//     const headers = data[0];
//     const rows = data.slice(1);

//     const idxId = getIdx(headers, COL.ID);
//     const idxEmail = getIdx(headers, COL.EMAIL);
//     const idxLicense = getIdx(headers, COL.LICENSE);
//     const idxAttend1 = getIdx(headers, COL.ATTEND_1);
//     const idxAttend2 = getIdx(headers, COL.ATTEND_2);
//     const idxCert = getIdx(headers, COL.CERT_URL);

//     const filteredRows = [];
//     rows.forEach((row, i) => {
//       const idVal = String(row[idxId] || "").toLowerCase().trim();
//       const emailVal = String(row[idxEmail] || "").toLowerCase().trim();
//       const licenseVal = String(row[idxLicense] || "").trim();

//       if (idVal === searchTerm || emailVal === searchTerm || licenseVal === searchTerm) {
//         const userData = { rowNumber: i + 2 };
//         headers.forEach((h, index) => {
//           let val = row[index];
//           if (val instanceof Date) val = Utilities.formatDate(val, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
//           userData[h] = val;
//         });

//         userData['canDownload'] = (row[idxAttend1] === "เข้าประชุม" && row[idxAttend2] === "เข้าประชุม");
//         userData['certUrl'] = row[idxCert] || "#";
//         filteredRows.push(userData);
//       }
//     });

//     return filteredRows.length > 0 ? { success: true, data: filteredRows } : { success: false, message: "ไม่พบข้อมูล" };
//   } catch (e) {
//     return { success: false, message: e.toString() };
//   }
// }

// // สำหรับนับจำนวนคลิก (ฝั่ง Server)
// function trackDownload(rowNumber) {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DATA);
//   const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
//   const idxDown = getIdx(headers, COL.DOWNLOAD);
  
//   const lock = LockService.getScriptLock();
//   try {
//     lock.waitLock(10000);
//     const cell = sheet.getRange(rowNumber, idxDown + 1);
//     const count = (Number(cell.getValue()) || 0) + 1;
//     cell.setValue(count);
//     return { success: true, newCount: count };
//   } finally {
//     lock.releaseLock();
//   }
// }

// //======== สำหรับ เจ้าหน้าที่ =================
// const SHEET_USER = "user"; 

// /**
//  * ตรวจสอบ Login และดึงข้อมูลสิทธิ์ (admin/editor)
//  */
// /**
//  * ตรวจสอบ Login ด้วย Password อย่างเดียว
//  * คอลัมน์ A: Password, B: ชื่อผู้ใช้งาน, C: สิทธิ์
//  */
// function checkAdminLogin(password) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName("user");
//   if (!sheet) return { success: false, message: "ไม่พบข้อมูลผู้ใช้งาน (Sheet: user)" };

//   const data = sheet.getDataRange().getValues();
//   const inputPass = String(password || "").trim();

//   for (let i = 1; i < data.length; i++) {
//     const sheetPass = String(data[i][0]).trim();
//     const sheetUser = String(data[i][1]).trim(); // ชื่อบุคคล
//     const sheetRole = String(data[i][2]).trim().toLowerCase();

//     if (sheetPass === inputPass) {
//       return { 
//         success: true, 
//         username: sheetUser, // ส่งชื่อบุคคลกลับไปแสดง
//         role: sheetRole 
//       };
//     }
//   }
//   return { success: false, message: "รหัสผ่านไม่ถูกต้อง" };
// }

// /**
//  * ดึงข้อมูลทั้งหมดมาแสดงในตาราง Admin
//  */
// function getAdminAllData() {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DATA);
//   const data = sheet.getDataRange().getValues();
//   if (data.length < 1) return [];
  
//   const headers = data[0];
//   const rows = data.slice(1);
  
//   return rows.map((row, index) => {
//     let obj = { rowNumber: index + 2 };
//     headers.forEach((h, idx) => {
//       let val = row[idx];
//       if (val instanceof Date) val = Utilities.formatDate(val, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
//       obj[h] = val;
//     });
//     return obj;
//   });
// }

// /** อัพเดทสถานะจากหน้า Admin */
// function updateAdminStatus(rowNumber, statusData) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName(SHEET_DATA);
//   const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
//   try {
//     // ดึงข้อมูลแถวนี้ที่มีอยู่ใน Sheet ปัจจุบันมาตรวจสอบ
//     const currentRow = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
    
//     const setVal = (colName, newValue) => {
//       const idx = getIdx(headers, colName);
//       const oldValue = currentRow[idx];
      
//       let finalValue = newValue;

//       // เงื่อนไขสำหรับคอลัมน์เวลา (ATTEND_1_TIME / ATTEND_2_TIME)
//       if (colName === COL.ATTEND_1_TIME || colName === COL.ATTEND_2_TIME) {
//         // ถ้าค่าใหม่ที่ส่งมาว่าง แต่ของเดิมมีเวลาอยู่แล้ว -> ให้ใช้ค่าเดิม (ป้องกันข้อมูลหาย)
//         if (!newValue && oldValue) {
//           finalValue = oldValue;
//         }
//       }
      
//       // บันทึกข้อมูลลง Sheet เฉพาะเมื่อค่ามีการเปลี่ยนแปลงเท่านั้น (ช่วยลดภาระระบบ)
//       if (finalValue !== oldValue) {
//         sheet.getRange(rowNumber, idx + 1).setValue(finalValue);
//       }
//     };

//     // บันทึกตามลำดับ Array ที่ส่งมา
//     setVal(COL.PAYIN_STATUS,   statusData[0]);
//     setVal(COL.PAYMENT_STATUS, statusData[1]);
//     setVal(COL.ATTEND_1,       statusData[2]);
//     setVal(COL.ATTEND_2,       statusData[3]);
//     setVal(COL.ATTEND_1_TIME,  statusData[4]);
//     setVal(COL.ATTEND_2_TIME,  statusData[5]);
//     setVal(COL.CERT_URL,       statusData[6]);
//     setVal(COL.DOWNLOAD,       statusData[7]);

//     return { success: true };
//   } catch (e) {
//     return { success: false, message: e.toString() };
//   }
// }

// /**
//  * ลบข้อมูล (จะมีการเช็คสิทธิ์ที่หน้าบ้านอีกครั้ง)
//  */
// function deleteRegistration(rowNumber) {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DATA);
//   try {
//     sheet.deleteRow(rowNumber);
//     return { success: true };
//   } catch (e) {
//     return { success: false, message: e.toString() };
//   }
// }

// /**
//  * บันทึกแบบประเมินผล
//  */
// /**
//  * บันทึกแบบประเมินผลแยกคอลัมน์รายข้อ เพื่อให้นำไปวิเคราะห์ผลได้ทันที
//  */
// function saveAssessment(formData) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   let sheet = ss.getSheetByName("Assessment");
  
//   // 1. กำหนดหัวตาราง (Headers) 
//   // 🔴 เปลี่ยน "ชื่อ-นามสกุล", "หน่วยงาน" เป็น "รหัสจับฉลาก"
//   const headers = [
//     "Timestamp", "วันที่ประเมิน", "ผู้เข้าประชุม", "ประสงค์ของที่ระลึก", "รหัสจับฉลาก",
//     "1.1", "1.2", "1.3", "1.4", "1.5",
//     "2.1", "2.2", "2.3", "2.4", "2.5",
//     "3.1", "3.2", "3.3", "3.4", "3.5",
//     "4.1", "4.2", "4.3", "4.4", "4.5",
//     "5.1", "5.2", "5.3", "5.4", "5.5", 
//     "6.1", "6.2", "6.3", "6.4", "6.5",
//     "ภาพรวม", "หัวข้อจัดครั้งหน้า", "ข้อเสนอแนะ"
//   ];

//   if (!sheet) {
//     sheet = ss.insertSheet("Assessment");
//     sheet.getRange(1, 1, 1, headers.length).setValues([headers])
//          .setBackground("#004085").setFontColor("white").setFontWeight("bold");
//     sheet.setFrozenRows(1);
//   }

//   // 🟢 2. ระบบสร้างหมายเลขจับฉลากอัตโนมัติ (Auto Number: G-001)
//   let luckyNumber = "-"; // ค่าเริ่มต้นถ้าไม่รับของ
  
//   if (formData.gift === "รับของที่ระลึก") {
//     // เปิดระบบ Lock ป้องกันคนกดส่งฟอร์มพร้อมกัน (Race condition)
//     const lock = LockService.getScriptLock();
//     lock.waitLock(10000); // รอคิวสูงสุด 10 วินาที
    
//     try {
//       const props = PropertiesService.getScriptProperties();
      
//       // ดึงค่าหมายเลขล่าสุด ถ้ายังไม่มีให้เริ่มที่ 0
//       let currentNumber = parseInt(props.getProperty('LuckyDrawCounter') || '0');
      
//       // บวกเพิ่ม 1
//       currentNumber += 1;
      
//       // อัปเดตค่าล่าสุดกลับลงไปในระบบ
//       props.setProperty('LuckyDrawCounter', currentNumber.toString());
      
//       // จัดรูปแบบตัวเลขให้เป็น G-001, G-015, G-999
//       luckyNumber = "G-" + ("000" + currentNumber).slice(-3);
      
//     } finally {
//       lock.releaseLock(); // คืนสิทธิ์คิวให้คนถัดไป
//     }
//   }

//   const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

//   // 3. จัดเตรียมแถวข้อมูลหลัก
//   let rowData = [
//     timestamp,
//     formData.evalDay === 1 ? "วันที่ 1 (25 ส.ค.)" : "วันที่ 2 (26 ส.ค.)",
//     formData.origin || "-",
//     formData.gift || "-",
//     luckyNumber // 🟢 นำหมายเลขที่รันได้มาใส่แทนข้อมูลชื่อ
//   ];

//   // 4. ดึงข้อมูลคะแนน q1_1 ถึง q6_5 มาใส่ในแถว
//   const maxMain = 6; 
//   for (let m = 1; m <= maxMain; m++) {
//     for (let s = 1; s <= 5; s++) {
//       let key = "q" + m + "_" + s;
//       rowData.push(formData[key] || ""); 
//     }
//   }

//   // 5. ข้อมูลสรุปท้ายฟอร์ม
//   rowData.push(formData.overallRating || "");
//   rowData.push(formData.nextTopic || "");
//   rowData.push(formData.feedback || "");

//   try {
//     sheet.appendRow(rowData);
    
//     // 🟢 6. ส่ง luckyNumber กลับไปให้หน้าเว็บเพื่อเด้งแจ้งเตือน
//     return { 
//       success: true, 
//       message: "บันทึกแบบประเมินเรียบร้อยแล้ว ขอบคุณครับ",
//       luckyNumber: luckyNumber !== "-" ? luckyNumber : null 
//     };
    
//   } catch (e) {
//     return { success: false, message: "Error: " + e.toString() };
//   }
// }

// // 🛠️ ฟังก์ชันเสริม: เผื่อต้องการรีเซ็ตหมายเลขจับฉลากให้กลับไปเริ่มที่ 0 ใหม่ (ใช้รันเองหน้า Script Editor)
// function resetLuckyDrawCounter() {
//   PropertiesService.getScriptProperties().setProperty('LuckyDrawCounter', '0');
//   Logger.log("รีเซ็ตหมายเลขกลับเป็น G-001 เรียบร้อยแล้ว");
// }

// /**
//  * ดึงข้อมูลสรุปแบบประเมินแยกตามวันที่และกลุ่มผู้เข้าประชุม
//  */
// /**
//  * ดึงข้อมูลสรุปแบบประเมินและข้อความจากคอลัมน์ AL, AM
//  */
// function getAssessmentSummary(filter) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName("Assessment");
//   if (!sheet) return { success: false, message: "ไม่พบข้อมูล" };

//   const data = sheet.getDataRange().getValues();
//   const headers = data[0];
//   const rows = data.slice(1);

//   let summary = {};
//   let textComments = []; // สำหรับเก็บ AL และ AM
//   let totalFiltered = 0;

//   // ทำ Map หัวตาราง
//   const headerMap = {};
//   headers.forEach((h, idx) => { headerMap[h] = idx; });

//   // เตรียมโครงสร้างคะแนน q1_1 ถึง q6_5
//   for (let m = 1; m <= 6; m++) {
//     for (let s = 1; s <= 5; s++) {
//       summary[`q${m}_${s}`] = { "มาก": 0, "ปานกลาง": 0, "น้อย": 0 };
//     }
//   }

//   rows.forEach(row => {
//     const rowDate = String(row[1] || "");    
//     const rowOrigin = String(row[2] || "");  

//     const matchDate = !filter.date || rowDate.includes(filter.date);
//     const matchOrigin = !filter.origin || rowOrigin === filter.origin;

//     if (matchDate && matchOrigin) {
//       totalFiltered++;
      
//       // 1. นับคะแนนประเมิน (เดิม)
//       for (let m = 1; m <= 6; m++) {
//         for (let s = 1; s <= 5; s++) {
//           let colHeader = `${m}.${s}`;
//           let colIdx = headerMap[colHeader];
//           if (colIdx !== undefined) {
//             let val = String(row[colIdx] || "").trim(); 
//             if (summary[`q${m}_${s}`][val] !== undefined) {
//               summary[`q${m}_${s}`][val]++;
//             }
//           }
//         }
//       }

//       // 2. ดึงข้อความจากคอลัมน์ AL และ AM (หัวข้อจัดครั้งหน้า และ ข้อเสนอแนะ)
//       // ใช้ชื่อหัวตารางที่คุณระบุมา
//       const nextTopic = String(row[headerMap["หัวข้อจัดครั้งหน้า"]] || "").trim();
//       const suggestion = String(row[headerMap["ข้อเสนอแนะ"]] || "").trim();
      
//       // เก็บลงตารางถ้ามีการกรอกอย่างใดอย่างหนึ่งมา
//       if ((nextTopic && nextTopic !== "-") || (suggestion && suggestion !== "-")) {
//         textComments.push({
//           topic: nextTopic || "-",
//           feedback: suggestion || "-"
//         });
//       }
//     }
//   });

//   return {
//     success: true,
//     totalResponses: totalFiltered,
//     results: summary,
//     comments: textComments // ข้อมูลที่จะนำไปทำตาราง
//   };
// }

// // Scan QR Code และตรวจสอบสถานะ "เข้าประชุม"
// function recordAttendance(decodedText, day) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName(SHEET_DATA);
//   const data = sheet.getDataRange().getValues();
//   const headers = data[0];

//   const idxId = getIdx(headers, COL.ID);
//   const idxFname = getIdx(headers, COL.FNAME);
//   const idxLname = getIdx(headers, COL.LNAME);
  
//   const colAttendName = (day == 1) ? COL.ATTEND_1 : COL.ATTEND_2;
//   const colTimeName = (day == 1) ? COL.ATTEND_1_TIME : COL.ATTEND_2_TIME;
  
//   const idxAttend = getIdx(headers, colAttendName);
//   const idxTime = getIdx(headers, colTimeName);

//   const parts = decodedText.split('|');
//   if (parts.length < 3) return { success: false, message: "รูปแบบ QR Code ไม่ถูกต้อง" };

//   const sId = parts[0].trim();
//   const sFname = parts[1].trim();
//   const sLname = parts[2].trim();

//   for (let i = 1; i < data.length; i++) {
//     // 1. ตรวจสอบข้อมูลบุคคลให้ตรงกัน
//     if (String(data[i][idxId]) === sId && 
//         String(data[i][idxFname]).trim() === sFname && 
//         String(data[i][idxLname]).trim() === sLname) {
      
//       // 2. [สำคัญ] สร้างข้อมูลบุคคลเตรียมไว้ก่อน ไม่ว่าจะซ้ำหรือไม่
//       const userObj = {};
//       userObj['rowNumber'] = i + 1;
//       headers.forEach((h, idx) => {
//         let val = data[i][idx];
//         if (val instanceof Date) {
//           val = Utilities.formatDate(val, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
//         }
//         userObj[h] = val;
//       });

//       // 3. ตรวจสอบการสแกนซ้ำ
//       if (data[i][idxAttend] === "เข้าประชุม") {
//         return { 
//           success: false, 
//           isDuplicate: true,
//           message: "ท่านได้ลงชื่อเข้างานวันนี้ไปแล้ว",
//           userData: userObj // ส่งข้อมูลกลับไปด้วยเพื่อให้ Frontend แสดงเวลาเดิม
//         };
//       }

//       // 4. กรณีสแกนครั้งแรก: บันทึกข้อมูลลงในคอลัมน์
//       const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
      
//       sheet.getRange(i + 1, idxAttend + 1).setValue("เข้าประชุม"); 
//       sheet.getRange(i + 1, idxTime + 1).setValue(now);           
      
//       // อัพเดทเวลาล่าสุดใน object ก่อนส่งกลับ
//       userObj[colTimeName] = now;

//       return { 
//         success: true, 
//         message: "ลงชื่อสำเร็จ", 
//         userData: userObj 
//       };
//     }
//   }
//   return { success: false, message: "ไม่พบข้อมูลในระบบ" };
// }

// // ฟังก์ชันช่วยหาลำดับ Index จากชื่อหัวตาราง (เริ่มที่ 0)
// function getIdx(headers, name) {
//   const index = headers.indexOf(name);
//   if (index === -1) throw new Error("ไม่พบคอลัมน์ชื่อ: " + name);
//   return index;
// }

// // บันทึกจำนวนดาวน์โหลด (เรียกจากปุ่มในหน้ากำหนดการ)
// function incrementDownloadCount(fileIdentifier) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   let sheet = ss.getSheetByName("DownloadCount");
//   if (!sheet) {
//     sheet = ss.insertSheet("DownloadCount");
//     sheet.getRange("A1").setValue(0);
//   }
//   const cell = sheet.getRange("A1");
//   let val = parseInt(cell.getValue() || 0);
//   let newVal = val + 1;
//   cell.setValue(newVal);
//   return newVal; // 🟢 ส่งค่ากลับไปให้ Vue.js เพื่ออัพเดท Badge
// }

// // ดึงจำนวนดาวน์โหลดปัจจุบัน
// function getCurrentDownloadCount(fileIdentifier) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName("DownloadCount");
//   if (!sheet) return 0;
//   return sheet.getRange("A1").getValue() || 0; // 🟢 ส่งค่ากลับไปโชว์ตอนเปิดหน้าแรก
// }

// /**
//  * ดึงค่าวันเวลาปิดระบบจาก Sheet "Timer" ช่อง A2
//  */
// function getDeadlineFromSheet() {
//   try {
//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheet = ss.getSheetByName('Timer');
    
//     if (!sheet) {
//       console.error("หา Sheet 'Timer' ไม่เจอ");
//       return null;
//     }

//     // ดึงค่าจากช่อง A2 (แถวที่ 2 คอลัมน์ที่ 1)
//     const rawValue = sheet.getRange(2, 1).getValue(); 
    
//     // แปลงเป็น Date Object
//     const deadlineValue = new Date(rawValue);
    
//     // ตรวจสอบความถูกต้องของวันที่
//     if (isNaN(deadlineValue.getTime())) {
//       console.error("ข้อมูลในช่อง A2 ไม่ใช่รูปแบบวันที่ที่ถูกต้อง");
//       return null;
//     }

//     // บันทึก Log ดูในระบบ
//     console.log("วันที่ดึงจาก A2 คือ: " + deadlineValue.toLocaleString('th-TH'));

//     // ส่งค่ากลับเป็น Timestamp (ตัวเลข) ให้หน้าบ้านเปรียบเทียบค่าได้ทันที
//     return deadlineValue.getTime();

//   } catch (e) {
//     console.error("Error reading Timer sheet A2: " + e.message);
//     return null;
//   }
// }

// /**
//  * ดึงเวลาปิดลงทะเบียนบุคคลภายนอก จาก Sheet Timer ช่อง B2
//  */
// function getExternalDeadline() {
//   try {
//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheet = ss.getSheetByName('Timer');
//     if (!sheet) return null;

//     const rawValue = sheet.getRange("B2").getValue();
//     const dateObj = new Date(rawValue);
    
//     // ส่งกลับเป็น Timestamp (ตัวเลข) เพื่อให้ JavaScript ฝั่ง Client เปรียบเทียบง่าย
//     return isNaN(dateObj.getTime()) ? null : dateObj.getTime();
//   } catch (e) {
//     return null;
//   }
// }

// /**
//  * ดึงค่าวันเวลาเปิด-ปิดแบบประเมินแยกตามวัน
//  * คอลัมน์ C (3): เปิด/ปิด วันที่ 1
//  * คอลัมน์ D (4): เปิด/ปิด วันที่ 2
//  */
// function getAssessmentTimer() {
//   try {
//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheet = ss.getSheetByName('Timer');
//     if (!sheet) return null;

//     const getTimestampFromCell = (row, col) => {
//       const rawValue = sheet.getRange(row, col).getValue(); 
//       const dateObj = new Date(rawValue);
//       return isNaN(dateObj.getTime()) ? null : dateObj.getTime();
//     };

//     // ส่งกลับด้วยชื่อตัวแปรเต็ม
//     return {
//       day1Open:  getTimestampFromCell(2, 3), // C2
//       day1Close: getTimestampFromCell(3, 3), // C3
//       day2Open:  getTimestampFromCell(2, 4), // D2
//       day2Close: getTimestampFromCell(3, 4)  // D3
//     };
//   } catch (e) {
//     return null;
//   }
// }

// /**
//  * ดึงวันเวลาเปิดปุ่มดาวน์โหลดใบประกาศจาก Sheet "Timer" ช่อง F2
//  */
// function getCertDownloadDeadline() {
//   try {
//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheet = ss.getSheetByName('Timer');
//     if (!sheet) return null;

//     // F2 คือ แถวที่ 2 คอลัมน์ที่ 6
//     const rawValue = sheet.getRange(2, 6).getValue(); 
//     const deadlineDate = new Date(rawValue);
    
//     if (isNaN(deadlineDate.getTime())) {
//       console.error("ข้อมูลในช่อง F2 ไม่ใช่รูปแบบวันที่ที่ถูกต้อง");
//       return null;
//     }

//     // ส่งค่ากลับเป็น Timestamp (ตัวเลข)
//     return deadlineDate.getTime();
//   } catch (e) {
//     console.error("Error reading Timer sheet F2: " + e.message);
//     return null;
//   }
// }

// /**
//  * ฟังก์ชันสำหรับล้างแคชเวลาปิดระบบ
//  */
// function clearTimerCache() {
//   const cache = CacheService.getScriptCache();
//   cache.remove("deadline_timestamp");
//   console.log("ล้างแคชระบบ Timer เรียบร้อยแล้ว");
// }

// /** ส่งหัวข้อแบบประเมินผล และรูปภาพไปแสดงที่ html  */
// function getAssessmentConfig() {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName("AssessmentConfig");
//   const data = sheet.getDataRange().getValues();
//   data.shift(); // ตัดหัวตาราง
  
//   const day1 = [];
//   const day2 = [];

//   data.forEach(row => {
//     const day = row[0];
//     const id = row[1];
//     const title = row[2];
    
//     // 1. แยกรายชื่อวิทยากร
//     const names = String(row[3]).split(',').map(s => s.trim());
//     const depts = String(row[4]).split(',').map(s => s.trim());
    
//     // 2. แยก URL รูปภาพ และส่งเข้าฟังก์ชันแปลงลิงก์ทันที
//     const imgsRaw = String(row[5]).split(',').map(s => s.trim());
//     const imgs = imgsRaw.map(url => driveToDirectLink(url)); // << แปลงทุกลิงก์ในรายการ
    
//     const speakers = names.map((name, index) => ({
//       name: name,
//       dept: depts[index] || depts[0], // ถ้าใส่สังกัดไม่ครบ ให้ใช้สังกัดแรก
//       img: imgs[index] || "" // ใช้ลิงก์ที่แปลงแล้ว (lh5)
//     }));

//     const questionObj = { id, title, speakers };

//     if (day == 1) day1.push(questionObj);
//     if (day == 2) day2.push(questionObj);
//   });

//   return { success: true, day1, day2 };
// }

// /** ส่งกำหนดการ และรูปภาพไปแสดงที่ html  */
// function getScheduleFromSheet() {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName("ScheduleData");
//   const data = sheet.getDataRange().getValues();
//   data.shift(); // ตัดหัวตาราง
  
//   const now = new Date();
//   const schedule = { day1: [], day2: [] };

//   data.forEach((row, index) => {
//     const rowNum = index + 2; // เก็บเลขแถวไว้เพื่อใช้อ้างอิงตอนกดดาวน์โหลด
//     const openDate = row[9] ? new Date(row[9]) : null;
    
//     const session = {
//       rowNumber: rowNum,
//       day: row[0],
//       time: row[1],
//       title: row[2],
//       isBreak: row[3] === true || row[3] === "TRUE",
//       icon: row[4],
//       speaker: { 
//         name: row[5], 
//         dept: row[6], 
//         // --- ปรับปรุงตรงนี้เพื่อแปลงลิงก์รูปภาพ ---
//         img: driveToDirectLink(row[7]) 
//       },
//       file: {
//         url: row[8] || "",
//         count: row[10] || 0, // ดึงจำนวนดาวน์โหลดจากคอลัมน์ K
//         isOpen: openDate ? now >= openDate : true,
//         openDateStr: openDate ? openDate.toLocaleString('th-TH') : ""
//       }
//     };

//     if (session.day == 1) schedule.day1.push(session);
//     if (session.day == 2) schedule.day2.push(session);
//   });

//   return { success: true, data: schedule, sheetUrl: ss.getUrl() };
// }

// // ฟังก์ชันบันทึกจำนวนดาวน์โหลดเอกสารวิทยากร
// function trackFileDownload(rowNum) {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ScheduleData");
//   const cell = sheet.getRange(rowNum, 11); // คอลัมน์ K
//   const currentCount = parseInt(cell.getValue()) || 0;
//   cell.setValue(currentCount + 1);
//   return currentCount + 1;
// }


// /**
//  * แปลงลิงก์ Google Drive เป็น Direct Link (lh5)
//  */
// function driveToDirectLink(url) {
//   if (!url || typeof url !== 'string' || url === '-' || url === '') return "";
  
//   // ค้นหา File ID จาก URL
//   const match = url.match(/\/d\/(.+?)\/(view|edit|usp|$|#|\?)/);
//   if (match && match[1]) {
//     return `https://lh5.googleusercontent.com/d/${match[1]}`;
//   }
//   return url; // ถ้าไม่ใช่ลิงก์ Drive ให้ส่งค่าเดิมกลับไป
// }
