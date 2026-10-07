const SHEET_NAME = "Raspunsuri";
const DASHBOARD_KEY = "SCHIMBA-ACEASTA-PAROLA";

const RESPONSE_FIELDS = [
  "submissionId", "serverTimestamp", "clientTimestamp", "cohort",
  "S1", "S2_U", "S2_S",
  "S3_1", "S3_2", "S3_3", "S3_4", "S3_5", "S3_6", "S3_7", "S3_8",
  "S4", "S5_1", "S5_2", "S5_3", "S5_4", "S5_5",
  "S6_1", "S6_2", "S6_3", "S6_4", "S6_5",
  "S7_1", "S7_2", "S7_3", "S7_4", "S8", "S9", "S10", "SEX", "BAC_YEAR"
];

const VALID_VALUES = {
  S1: ["1", "2", "3"], S2_U: ["1", "2"], S2_S: ["1", "2"],
  S3_1: ["1", "2", "3", "4", "5", "6"], S3_2: ["1", "2", "3", "4", "5", "6"],
  S3_3: ["1", "2", "3", "4", "5", "6"], S3_4: ["1", "2", "3", "4", "5", "6"],
  S3_5: ["1", "2", "3", "4", "5", "6"], S3_6: ["1", "2", "3", "4", "5", "6"],
  S3_7: ["1", "2", "3", "4", "5", "6"], S3_8: ["1", "2", "3", "4", "5", "6"],
  S4: ["1", "2", "3", "4", "5", "6"],
  S5_1: ["1", "2", "3", "4", "5", "6"], S5_2: ["1", "2", "3", "4", "5", "6"],
  S5_3: ["1", "2", "3", "4", "5", "6"], S5_4: ["1", "2", "3", "4", "5", "6"],
  S5_5: ["1", "2", "3", "4", "5", "6"],
  S6_1: ["1", "2", "3", "4", "5", "6"], S6_2: ["1", "2", "3", "4", "5", "6"],
  S6_3: ["1", "2", "3", "4", "5", "6"], S6_4: ["1", "2", "3", "4", "5", "6"],
  S6_5: ["1", "2", "3", "4", "5", "6"],
  S7_1: ["1", "2", "3", "4", "5"], S7_2: ["1", "2", "3", "4", "5"],
  S7_3: ["1", "2", "3", "4", "5"], S7_4: ["1", "2", "3", "4", "5"],
  S8: ["1", "2", "3", "4"], S9: ["1", "2", "3", "4"], S10: ["1", "2", "3", "4", "9"],
  SEX: ["1", "2", "9"]
};

const DYNAMIC_FIELDS = ["BAC_YEAR"];

function setup() {
  getResponseSheet_();
  return "Foaia Raspunsuri este pregătită.";
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    validatePayload_(payload);
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const sheet = getResponseSheet_();
      if (!isDuplicate_(sheet, payload.submissionId)) {
        const now = new Date();
        const row = RESPONSE_FIELDS.map(field => field === "serverTimestamp" ? now : String(payload[field] || ""));
        sheet.appendRow(row);
      }
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doGet(e) {
  try {
    if (!e.parameter || e.parameter.action !== "dashboard") throw new Error("Acțiune necunoscută.");
    if (String(e.parameter.key || "") !== DASHBOARD_KEY) throw new Error("Cheie de acces incorectă.");
    return json_(aggregate_(String(e.parameter.cohort || "")));
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function validatePayload_(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Răspuns invalid.");
  if (!payload.submissionId || !payload.clientTimestamp || !payload.cohort) throw new Error("Lipsesc datele tehnice ale răspunsului.");
  Object.keys(VALID_VALUES).forEach(field => {
    const value = String(payload[field] || "");
    if (VALID_VALUES[field].indexOf(value) === -1) throw new Error("Răspuns lipsă sau invalid la " + field + ".");
  });
  const bacYear = Number(payload.BAC_YEAR);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(bacYear) || bacYear < 1950 || bacYear > currentYear) throw new Error("An invalid pentru BAC_YEAR.");
}

function getResponseSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(RESPONSE_FIELDS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, RESPONSE_FIELDS.length).setFontWeight("bold").setBackground("#13385b").setFontColor("#ffffff");
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    RESPONSE_FIELDS.forEach(field => {
      if (existingHeaders.indexOf(field) === -1) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(field).setFontWeight("bold").setBackground("#13385b").setFontColor("#ffffff");
        existingHeaders.push(field);
      }
    });
  }
  return sheet;
}

function isDuplicate_(sheet, id) {
  if (sheet.getLastRow() < 2) return false;
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext() !== null;
}

function aggregate_(cohortFilter) {
  const sheet = getResponseSheet_();
  if (sheet.getLastRow() < 2) return { ok: true, total: 0, latest: null, cohorts: {}, variables: emptyVariables_() };
  const values = sheet.getRange(1, 1, sheet.getLastRow(), RESPONSE_FIELDS.length).getValues();
  const headers = values.shift();
  const index = {};
  headers.forEach((header, i) => { index[String(header)] = i; });
  const cohorts = {};
  values.forEach(row => {
    const cohort = String(row[index.cohort] || "");
    cohorts[cohort] = (cohorts[cohort] || 0) + 1;
  });
  const rows = cohortFilter ? values.filter(row => String(row[index.cohort]) === cohortFilter) : values;
  const aggregate = emptyVariables_();
  let latest = null;
  rows.forEach(row => {
    const timestamp = row[index.serverTimestamp];
    if (timestamp && (!latest || new Date(timestamp) > new Date(latest))) latest = new Date(timestamp).toISOString();
    Object.keys(VALID_VALUES).forEach(field => {
      const value = String(row[index[field]] || "");
      if (Object.prototype.hasOwnProperty.call(aggregate[field].counts, value)) aggregate[field].counts[value] += 1;
    });
    DYNAMIC_FIELDS.forEach(field => {
      const value = String(row[index[field]] || "");
      if (!value) return;
      if (!Object.prototype.hasOwnProperty.call(aggregate[field].counts, value)) aggregate[field].counts[value] = 0;
      aggregate[field].counts[value] += 1;
    });
  });
  return { ok: true, total: rows.length, latest: latest, cohorts: cohorts, variables: aggregate };
}

function emptyVariables_() {
  const output = {};
  Object.keys(VALID_VALUES).forEach(field => {
    output[field] = { counts: {} };
    VALID_VALUES[field].forEach(value => { output[field].counts[value] = 0; });
  });
  DYNAMIC_FIELDS.forEach(field => { output[field] = { counts: {} }; });
  return output;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
