import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/configs/authOptions";
import ManpowerRequisition from "@/models/hiring/ManpowerRequisition.model";
import { dbConnect } from "@/lib/mongoose";
import PDFDocument from "pdfkit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in to perform this action" },
        { status: 401 }
      );
    }

    const requisitionId = params.id;

    // Connect to database
    await dbConnect();

    // Fetch requisition with populated references
    const requisition = await ManpowerRequisition.findById(requisitionId)
      .populate("requestedBy", "firstName lastName displayName email")
      .populate("department", "name")
      .populate("departmentHeadApproval.approvedBy", "firstName lastName displayName")
      .populate("hrAdminReview.approvedBy", "firstName lastName displayName")
      .populate("financeApproval.approvedBy", "firstName lastName displayName")
      .populate("hrHeadApproval.approvedBy", "firstName lastName displayName")
      .populate("cfoApproval.approvedBy", "firstName lastName displayName")
      .populate("ceoApproval.approvedBy", "firstName lastName displayName");

    if (!requisition) {
      return NextResponse.json(
        { error: "Requisition not found" },
        { status: 404 }
      );
    }

    // Create a PDF document
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    // Collect PDF data chunks
    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    // Generate PDF content
    generatePDF(doc, requisition);

    // Finalize the PDF
    doc.end();

    // Wait for PDF generation to complete
    return new Promise<NextResponse>((resolve) => {
      doc.on("end", () => {
        // Combine chunks into a single buffer
        const pdfBuffer = Buffer.concat(chunks);

        // Create response with PDF data
        const response = new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Requisition_${requisitionId}.pdf"`,
          },
        });

        resolve(response);
      });
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

// Helper function to generate PDF content
function generatePDF(doc: PDFKit.PDFDocument, requisition: any) {
  // Add company logo
  // doc.image("public/images/logo.png", 50, 50, { width: 150 });
  
  // Add title
  doc.fontSize(18).text("MANPOWER REQUISITION FORM", { align: "center" });
  doc.moveDown();
  
  // Section: Request Information
  doc
    .fontSize(12)
    .fillColor("#0066cc")
    .text("Request Information", { align: "center" })
    .moveDown(0.5);
  
  // Create a table-like structure
  const tableTop = doc.y;
  const tableLeft = 50;
  const colWidth = 250;
  const rowHeight = 25;
  
  // Draw table borders
  doc.rect(tableLeft, tableTop, colWidth, rowHeight).stroke();
  doc.rect(tableLeft + colWidth, tableTop, colWidth, rowHeight).stroke();
  doc.rect(tableLeft, tableTop + rowHeight, colWidth, rowHeight).stroke();
  doc.rect(tableLeft + colWidth, tableTop + rowHeight, colWidth, rowHeight).stroke();
  
  // Add row headers
  doc
    .fontSize(10)
    .fillColor("#000")
    .text("Requested by (Name)", tableLeft + 5, tableTop + 7)
    .text("Date", tableLeft + colWidth + 5, tableTop + 7)
    .text("Department", tableLeft + 5, tableTop + rowHeight + 7)
    .text("Requested Position", tableLeft + colWidth + 5, tableTop + rowHeight + 7);
  
  // Add row values
  const requesterName = requisition.requestedBy ? 
    (requisition.requestedBy.displayName || `${requisition.requestedBy.firstName} ${requisition.requestedBy.lastName}`) : 
    "N/A";
  
  const requestDate = requisition.requestDate ? 
    new Date(requisition.requestDate).toLocaleDateString() : 
    "N/A";
  
  const department = requisition.department ? requisition.department.name : "N/A";
  
  doc
    .fontSize(10)
    .text(requesterName, tableLeft + 120, tableTop + 7, { align: "right" })
    .text(requestDate, tableLeft + colWidth + 120, tableTop + 7, { align: "right" })
    .text(department, tableLeft + 120, tableTop + rowHeight + 7, { align: "right" })
    .text(requisition.requestedPosition || "N/A", tableLeft + colWidth + 120, tableTop + rowHeight + 7, { align: "right" });
  
  doc.moveDown(2);
  
  // Position Details
  doc
    .fontSize(12)
    .fillColor("#0066cc")
    .text("Position Details", { align: "center" })
    .moveDown(0.5);
  
  // Position characteristics table
  const detailsTable = [
    { label: "Number of Positions:", value: requisition.numberRequired || 1 },
    { label: "Employment Type:", value: requisition.employmentType ? formatTitle(requisition.employmentType) : "Full Time" },
    { label: "Priority:", value: requisition.priority ? formatTitle(requisition.priority) : "Normal" },
    { label: "Expected Start Date:", value: requisition.startDate ? new Date(requisition.startDate).toLocaleDateString() : "N/A" }
  ];
  
  detailsTable.forEach((row, index) => {
    doc
      .fontSize(10)
      .fillColor("#000")
      .text(`${row.label} ${row.value}`, tableLeft, doc.y);
    doc.moveDown(0.5);
  });
  
  doc.moveDown();
  
  // Justification
  doc
    .fontSize(12)
    .fillColor("#0066cc")
    .text("Justification", { align: "center" })
    .moveDown(0.5);
  
  doc
    .fontSize(10)
    .fillColor("#000")
    .text(requisition.justification || "No justification provided.", {
      align: "left",
      columns: 1,
    });
  
  doc.moveDown();
  
  // Duties & Responsibilities
  if (requisition.duties) {
    doc
      .fontSize(12)
      .fillColor("#0066cc")
      .text("Duties & Responsibilities", { align: "center" })
      .moveDown(0.5);
    
    doc
      .fontSize(10)
      .fillColor("#000")
      .text(requisition.duties, {
        align: "left",
        columns: 1,
      });
    
    doc.moveDown();
  }
  
  // Qualifications & Skills
  if (requisition.qualifications) {
    doc
      .fontSize(12)
      .fillColor("#0066cc")
      .text("Qualifications & Skills", { align: "center" })
      .moveDown(0.5);
    
    doc
      .fontSize(10)
      .fillColor("#000")
      .text(requisition.qualifications, {
        align: "left",
        columns: 1,
      });
    
    doc.moveDown();
  }
  
  // Approval Status
  doc
    .fontSize(12)
    .fillColor("#0066cc")
    .text("Approval Status", { align: "center" })
    .moveDown(0.5);
  
  // Create approval table
  const approvalTable = [
    {
      role: "Department Head",
      status: getApprovalStatus(requisition.departmentHeadApproval),
      approver: getApproverName(requisition.departmentHeadApproval?.approvedBy),
      date: getApprovalDate(requisition.departmentHeadApproval?.approvalDate)
    },
    {
      role: "HR Admin",
      status: getApprovalStatus(requisition.hrAdminReview),
      approver: getApproverName(requisition.hrAdminReview?.approvedBy),
      date: getApprovalDate(requisition.hrAdminReview?.approvalDate)
    },
    {
      role: "Finance",
      status: getApprovalStatus(requisition.financeApproval),
      approver: getApproverName(requisition.financeApproval?.approvedBy),
      date: getApprovalDate(requisition.financeApproval?.approvalDate)
    },
    {
      role: "HR Head",
      status: getApprovalStatus(requisition.hrHeadApproval),
      approver: getApproverName(requisition.hrHeadApproval?.approvedBy),
      date: getApprovalDate(requisition.hrHeadApproval?.approvalDate)
    },
    {
      role: "CFO",
      status: getApprovalStatus(requisition.cfoApproval),
      approver: getApproverName(requisition.cfoApproval?.approvedBy),
      date: getApprovalDate(requisition.cfoApproval?.approvalDate)
    },
    {
      role: "CEO",
      status: getApprovalStatus(requisition.ceoApproval),
      approver: getApproverName(requisition.ceoApproval?.approvedBy),
      date: getApprovalDate(requisition.ceoApproval?.approvalDate)
    }
  ];
  
  // Draw approval table
  const approvalTop = doc.y;
  const approvalColWidths = [100, 100, 150, 100];
  let approvalRowY = approvalTop;
  
  // Table header
  doc
    .rect(tableLeft, approvalRowY, approvalColWidths[0], rowHeight).stroke()
    .rect(tableLeft + approvalColWidths[0], approvalRowY, approvalColWidths[1], rowHeight).stroke()
    .rect(tableLeft + approvalColWidths[0] + approvalColWidths[1], approvalRowY, approvalColWidths[2], rowHeight).stroke()
    .rect(tableLeft + approvalColWidths[0] + approvalColWidths[1] + approvalColWidths[2], approvalRowY, approvalColWidths[3], rowHeight).stroke();
  
  doc
    .fontSize(10)
    .fillColor("#000")
    .text("Role", tableLeft + 5, approvalRowY + 7)
    .text("Status", tableLeft + approvalColWidths[0] + 5, approvalRowY + 7)
    .text("Approver", tableLeft + approvalColWidths[0] + approvalColWidths[1] + 5, approvalRowY + 7)
    .text("Date", tableLeft + approvalColWidths[0] + approvalColWidths[1] + approvalColWidths[2] + 5, approvalRowY + 7);
  
  // Table rows
  approvalTable.forEach((approval, index) => {
    approvalRowY += rowHeight;
    
    // Draw row
    doc
      .rect(tableLeft, approvalRowY, approvalColWidths[0], rowHeight).stroke()
      .rect(tableLeft + approvalColWidths[0], approvalRowY, approvalColWidths[1], rowHeight).stroke()
      .rect(tableLeft + approvalColWidths[0] + approvalColWidths[1], approvalRowY, approvalColWidths[2], rowHeight).stroke()
      .rect(tableLeft + approvalColWidths[0] + approvalColWidths[1] + approvalColWidths[2], approvalRowY, approvalColWidths[3], rowHeight).stroke();
    
    // Add row data
    doc
      .fontSize(9)
      .text(approval.role, tableLeft + 5, approvalRowY + 7)
      .text(approval.status, tableLeft + approvalColWidths[0] + 5, approvalRowY + 7)
      .text(approval.approver, tableLeft + approvalColWidths[0] + approvalColWidths[1] + 5, approvalRowY + 7)
      .text(approval.date, tableLeft + approvalColWidths[0] + approvalColWidths[1] + approvalColWidths[2] + 5, approvalRowY + 7);
  });
  
  // Add footer
  doc.moveDown(4);
  doc
    .fontSize(8)
    .fillColor("#666")
    .text(`Document generated on ${new Date().toLocaleString()}`, { align: "center" });
}

// Helper function to get approval status
function getApprovalStatus(approval: any): string {
  if (!approval) return "Pending";
  return approval.approved ? "Approved" : "Pending";
}

// Helper function to get approver name
function getApproverName(approver: any): string {
  if (!approver) return "N/A";
  return approver.displayName || `${approver.firstName} ${approver.lastName}` || "N/A";
}

// Helper function to get approval date
function getApprovalDate(date: any): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
}

// Helper to format constants like "FULL_TIME" to "Full Time"
function formatTitle(text: string): string {
  return text
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
} 