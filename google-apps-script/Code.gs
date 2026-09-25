/**
 * UCC Thailand B2C Task Tracker - Google Sheets Backend API
 * Spreadsheet URL: https://docs.google.com/spreadsheets/d/1gzhlxUFdIt3ofvKLk44TWlSaMgdT2A3bUjW8zLWQxpg/edit
 * Google Drive Folder: https://drive.google.com/drive/folders/1fWXvxxKx8rckEhDgDNLwuYC7310PKyGE
 * 
 * Instructions:
 * 1. Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1gzhlxUFdIt3ofvKLk44TWlSaMgdT2A3bUjW8zLWQxpg/edit
 * 2. Click Extensions (ส่วนขยาย) > Apps Script
 * 3. Delete any code in Code.gs and paste this entire script.
 * 4. Click Deploy (การทำให้ใช้งานได้) > New deployment (การทำให้ใช้งานได้รายการใหม่)
 * 5. Select type: Web app (เว็บแอป)
 * 6. Set Description: "UCC Task Tracker Sync API"
 * 7. Set Execute as: "Me" (ฉัน)
 * 8. Set Who has access: "Anyone" (ทุกคน)
 * 9. Click Deploy > Authorize Access (อนุญาตการเข้าถึง)
 * 10. Copy the Web app URL and paste it into the Web App Settings in the Task Tracker.
 */

const SHEET_NAMES = {
  PROJECTS: "Projects",
  TASKS: "Tasks",
  PROCUREMENTS: "Procurements",
  METADATA: "System_Config"
};

// ฟังก์ชันสำหรับกด Run สร้าง 4 แท็บครั้งแรกได้ทันที
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  initializeSheetsIfMissing(ss);
  Logger.log("Created sheets successfully!");
  return "Success! Sheets created.";
}

// Handle GET requests (Fetch all data)
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfMissing(ss);

    const projects = readSheetData(ss, SHEET_NAMES.PROJECTS);
    const tasks = readSheetData(ss, SHEET_NAMES.TASKS);
    const procurements = readSheetData(ss, SHEET_NAMES.PROCUREMENTS);

    return createJsonResponse({
      status: "success",
      timestamp: new Date().toISOString(),
      counts: {
        projects: projects.length,
        tasks: tasks.length,
        procurements: procurements.length
      },
      data: {
        projects: formatProjectsOutput(projects),
        tasks: formatTasksOutput(tasks),
        procurements: formatProcurementsOutput(procurements)
      }
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

// Handle POST requests (Save/Update data)
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfMissing(ss);

    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || "syncAll";

    if (action === "syncAll") {
      if (postData.projects && Array.isArray(postData.projects)) {
        writeSheetData(ss, SHEET_NAMES.PROJECTS, getProjectHeaders(), formatProjectsForSheet(postData.projects));
      }
      if (postData.tasks && Array.isArray(postData.tasks)) {
        writeSheetData(ss, SHEET_NAMES.TASKS, getTaskHeaders(), formatTasksForSheet(postData.tasks));
      }
      if (postData.procurements && Array.isArray(postData.procurements)) {
        writeSheetData(ss, SHEET_NAMES.PROCUREMENTS, getProcurementHeaders(), formatProcurementsForSheet(postData.procurements));
      }

      // Log last sync time
      updateLastSync(ss);

      return createJsonResponse({
        status: "success",
        message: "Data successfully synced to Google Sheet",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "uploadFile") {
      var folderId = "1fWXvxxKx8rckEhDgDNLwuYC7310PKyGE";
      var folder;
      try {
        folder = DriveApp.getFolderById(folderId);
      } catch (err) {
        folder = DriveApp.getRootFolder();
      }
      var decoded = Utilities.base64Decode(postData.base64Data);
      var blob = Utilities.newBlob(decoded, postData.mimeType || "application/octet-stream", postData.fileName);
      var file = folder.createFile(blob);
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {}

      return createJsonResponse({
        status: "success",
        fileUrl: file.getUrl(),
        fileId: file.getId(),
        fileName: file.getName(),
        timestamp: new Date().toISOString()
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Unknown action: " + action
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

// Ensure sheets and styled header rows exist
function initializeSheetsIfMissing(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const configs = [
    { name: SHEET_NAMES.PROJECTS, headers: getProjectHeaders(), color: "#0f172a" },
    { name: SHEET_NAMES.TASKS, headers: getTaskHeaders(), color: "#1e1b4b" },
    { name: SHEET_NAMES.PROCUREMENTS, headers: getProcurementHeaders(), color: "#14532d" },
  ];

  configs.forEach(function(cfg) {
    var sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.appendRow(cfg.headers);
      var headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
      headerRange.setBackground(cfg.color);
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  });

  // Remove default "Sheet1" if empty and others exist
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

// Headers Definition
function getProjectHeaders() {
  return [
    "ID", "Project Code", "Project Name", "Description", "Category", 
    "Type", "Department", "Summary Status", "Lead ID", "Lead Name", 
    "Lead Role", "Target Date", "Due Date", "Budget Allocated (THB)", 
    "Color", "Status Notes", "Attachments Count", "Created At"
  ];
}

function getTaskHeaders() {
  return [
    "ID", "Task Name", "Project ID", "Project Name", "Phase", 
    "Status", "Priority", "Duration (Days)", "Start Date", "Due Date", 
    "Is Milestone", "Assignee ID", "Assignee Name", "Assignee Role", 
    "Graphic Format", "Graphic Dimensions", "Graphic Notes", 
    "Attachments JSON", "Subtasks JSON", "Updated At"
  ];
}

function getProcurementHeaders() {
  return [
    "ID", "PR Number", "PO Number", "Project ID", "Project Name", 
    "Title", "Expense Category", "Supplier Name", "Supplier Contact", 
    "Amount (THB)", "VAT Included", "Status", "Lead Time (Days)", 
    "Quotations JSON", "Requested By Name", "Created At", 
    "Target Delivery Date", "Notes"
  ];
}

// Convert Objects to Sheet Rows
function formatProjectsForSheet(projects) {
  return projects.map(function(p) {
    return [
      p.id || "",
      p.code || "",
      p.name || "",
      p.description || "",
      p.category || "",
      p.type || "",
      p.department || "",
      p.summaryStatus || "Planning",
      p.lead ? p.lead.id : "",
      p.lead ? p.lead.name : "",
      p.lead ? p.lead.role : "",
      p.targetDate || "",
      p.dueDate || "",
      p.budgetAllocated || 0,
      p.color || "bg-amber-500",
      JSON.stringify(p.statusNotes || []),
      p.attachments ? p.attachments.length : 0,
      new Date().toISOString()
    ];
  });
}

function formatTasksForSheet(tasks) {
  return tasks.map(function(t) {
    return [
      t.id || "",
      t.taskName || "",
      t.projectId || "",
      t.projectName || "",
      t.phase || "General",
      t.status || "Backlog",
      t.priority || "Medium",
      t.durationDays || 7,
      t.startDate || "",
      t.dueDate || "",
      t.isMilestone ? "TRUE" : "FALSE",
      t.assignee ? t.assignee.id : "",
      t.assignee ? t.assignee.name : "",
      t.assignee ? t.assignee.role : "",
      t.graphicSpecs ? t.graphicSpecs.format : "",
      t.graphicSpecs ? (t.graphicSpecs.dimensions || "") : "",
      t.graphicSpecs ? (t.graphicSpecs.notes || "") : "",
      JSON.stringify(t.attachments || []),
      JSON.stringify(t.subtasks || []),
      new Date().toISOString()
    ];
  });
}

function formatProcurementsForSheet(procurements) {
  return procurements.map(function(pr) {
    return [
      pr.id || "",
      pr.prNumber || "",
      pr.poNumber || "",
      pr.projectId || "",
      pr.projectName || "",
      pr.title || "",
      pr.expenseCategory || "Other",
      pr.supplierName || "",
      pr.supplierContact || "",
      pr.amountTHB || 0,
      pr.vatIncluded ? "TRUE" : "FALSE",
      pr.procurementStatus || "Draft",
      pr.leadTimeDays || 0,
      JSON.stringify(pr.quotations || []),
      pr.requestedBy ? pr.requestedBy.name : "",
      pr.createdAt || "",
      pr.targetDeliveryDate || "",
      pr.notes || ""
    ];
  });
}

// Convert Sheet Rows back to Objects
function formatProjectsOutput(rows) {
  return rows.map(function(r) {
    var statusNotes = [];
    try { statusNotes = JSON.parse(r["Status Notes"] || "[]"); } catch (e) {}

    return {
      id: String(r["ID"] || ""),
      code: String(r["Project Code"] || ""),
      name: String(r["Project Name"] || ""),
      description: String(r["Description"] || ""),
      category: String(r["Category"] || ""),
      type: String(r["Type"] || "New Product"),
      department: String(r["Department"] || "B2C"),
      summaryStatus: String(r["Summary Status"] || "Planning"),
      lead: {
        id: String(r["Lead ID"] || "user-1"),
        name: String(r["Lead Name"] || "Wanwisa Chanpraprai"),
        role: String(r["Lead Role"] || "Assistant Product Manager (NPD)"),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        department: "B2C",
        email: "wanwisa@ucc.co.th",
        title: "NPD Lead",
        onTimeRate: 98,
        maxCapacity: 8
      },
      targetDate: String(r["Target Date"] || ""),
      dueDate: String(r["Due Date"] || ""),
      budgetAllocated: Number(r["Budget Allocated (THB)"]) || 0,
      color: String(r["Color"] || "bg-amber-500"),
      statusNotes: statusNotes,
      attachments: []
    };
  });
}

function formatTasksOutput(rows) {
  return rows.map(function(r) {
    var attachments = [];
    var subtasks = [];
    try { attachments = JSON.parse(r["Attachments JSON"] || "[]"); } catch (e) {}
    try { subtasks = JSON.parse(r["Subtasks JSON"] || "[]"); } catch (e) {}

    var graphicSpecs = null;
    if (r["Graphic Format"]) {
      graphicSpecs = {
        format: r["Graphic Format"],
        dimensions: r["Graphic Dimensions"] || undefined,
        notes: r["Graphic Notes"] || undefined
      };
    }

    return {
      id: String(r["ID"] || ""),
      taskName: String(r["Task Name"] || ""),
      projectId: String(r["Project ID"] || ""),
      projectName: String(r["Project Name"] || ""),
      phase: String(r["Phase"] || "General"),
      status: String(r["Status"] || "Backlog"),
      priority: String(r["Priority"] || "Medium"),
      durationDays: Number(r["Duration (Days)"]) || 7,
      startDate: String(r["Start Date"] || ""),
      dueDate: String(r["Due Date"] || ""),
      isMilestone: String(r["Is Milestone"]).toUpperCase() === "TRUE",
      projectLead: {
        id: "user-1",
        name: "Wanwisa Chanpraprai",
        role: "Assistant Product Manager (NPD)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        department: "B2C",
        email: "wanwisa@ucc.co.th",
        title: "NPD Lead",
        onTimeRate: 98,
        maxCapacity: 8
      },
      assignee: {
        id: String(r["Assignee ID"] || "user-1"),
        name: String(r["Assignee Name"] || "Wanwisa Chanpraprai"),
        role: String(r["Assignee Role"] || "NPD Lead"),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        department: "B2C",
        email: "wanwisa@ucc.co.th",
        title: "NPD Lead",
        onTimeRate: 98,
        maxCapacity: 8
      },
      role: String(r["Assignee Role"] || "Marketer"),
      graphicSpecs: graphicSpecs,
      attachments: attachments,
      subtasks: subtasks
    };
  });
}

function formatProcurementsOutput(rows) {
  return rows.map(function(r) {
    var quotations = [];
    try { quotations = JSON.parse(r["Quotations JSON"] || "[]"); } catch (e) {}

    return {
      id: String(r["ID"] || ""),
      prNumber: String(r["PR Number"] || ""),
      poNumber: r["PO Number"] ? String(r["PO Number"]) : undefined,
      projectId: String(r["Project ID"] || ""),
      projectName: String(r["Project Name"] || ""),
      title: String(r["Title"] || ""),
      expenseCategory: String(r["Expense Category"] || "Other"),
      supplierName: String(r["Supplier Name"] || ""),
      supplierContact: String(r["Supplier Contact"] || ""),
      amountTHB: Number(r["Amount (THB)"]) || 0,
      vatIncluded: String(r["VAT Included"]).toUpperCase() === "TRUE",
      procurementStatus: String(r["Status"] || "Draft"),
      leadTimeDays: Number(r["Lead Time (Days)"]) || 0,
      quotations: quotations,
      requestedBy: {
        id: "user-1",
        name: String(r["Requested By Name"] || "Wanwisa Chanpraprai"),
        role: "NPD Lead",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        department: "B2C",
        email: "wanwisa@ucc.co.th",
        title: "NPD Lead",
        onTimeRate: 98,
        maxCapacity: 8
      },
      createdAt: String(r["Created At"] || ""),
      targetDeliveryDate: r["Target Delivery Date"] ? String(r["Target Delivery Date"]) : undefined,
      notes: r["Notes"] ? String(r["Notes"]) : undefined
    };
  });
}

// Low-level Sheet Read/Write Helpers
function readSheetData(ss, sheetName) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return data.map(function(row) {
    var obj = {};
    headers.forEach(function(h, idx) {
      obj[h] = row[idx];
    });
    return obj;
  });
}

function writeSheetData(ss, sheetName, headers, rowData) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  // Clear existing data rows (keep header)
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1 && lastCol > 0) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }

  // Write new data if present
  if (rowData.length > 0) {
    sheet.getRange(2, 1, rowData.length, headers.length).setValues(rowData);
  }
}

function updateLastSync(ss) {
  var metaSheet = ss.getSheetByName(SHEET_NAMES.METADATA);
  if (!metaSheet) {
    metaSheet = ss.insertSheet(SHEET_NAMES.METADATA);
    metaSheet.appendRow(["Key", "Value", "Updated At"]);
  }
  metaSheet.getRange(2, 1, 1, 3).setValues([["Last_Sync_Timestamp", new Date().toISOString(), new Date()]]);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
