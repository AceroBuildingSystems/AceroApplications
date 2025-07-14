import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGenerationOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  scale?: number;
  quality?: number;
}

export interface FormTemplateData {
  formType: string;
  formData: any;
  submittedBy?: any;
  submissionDate?: Date;
  approvalHistory?: any[];
  organizationLogo?: string;
  organizationName?: string;
}

export class HRMSPDFGenerator {
  
  // Main method to generate PDF from form data
  static async generateFormPDF(
    templateData: FormTemplateData, 
    options: PDFGenerationOptions = {}
  ): Promise<{ success: boolean; pdfBlob?: Blob; pdfDataUrl?: string; error?: string }> {
    try {
      const {
        filename = `${templateData.formType}_${Date.now()}.pdf`,
        format = 'a4',
        orientation = 'portrait',
        margin = 20,
        scale = 1,
        quality = 0.95
      } = options;

      // Create HTML template
      const htmlContent = this.createFormTemplate(templateData);
      
      // Create temporary container
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.style.backgroundColor = 'white';
      container.style.padding = `${margin}px`;
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.lineHeight = '1.4';
      
      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale,
        quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Calculate dimensions
      const imgWidth = format === 'a4' ? 210 : 216; // A4 or Letter width in mm
      const pageHeight = format === 'a4' ? 350 : 279; // A4 or Letter height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Generate blob and data URL
      const pdfBlob = pdf.output('blob');
      const pdfDataUrl = pdf.output('datauristring');

      return {
        success: true,
        pdfBlob,
        pdfDataUrl
      };

    } catch (error: any) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate PDF'
      };
    }
  }

  // Download PDF file
  static downloadPDF(pdfBlob: Blob, filename: string) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Create HTML template based on form type
  private static createFormTemplate(templateData: FormTemplateData): string {
    const { formType, formData, submittedBy, submissionDate, approvalHistory, organizationLogo, organizationName } = templateData;

    // Ensure we have actual form data
    if (!formData || Object.keys(formData).length === 0) {
      console.warn('No form data provided for PDF generation');
      return this.createEmptyFormTemplate(formType, organizationName, organizationLogo);
    }

    const baseTemplate = `
      <div style="max-width: 210mm; margin: 0 auto; padding: 20px; background: white; font-family: 'Arial', sans-serif;">
        ${this.createHeader(organizationName, organizationLogo)}
        ${this.getFormTypeTemplate(formType, formData)}
        ${this.createSubmissionInfo(submittedBy, submissionDate)}
        ${this.createApprovalSection(approvalHistory)}
        ${this.createFooter()}
      </div>
    `;

    return baseTemplate;
  }

  // Create header section
  private static createHeader(organizationName = 'Acero Building Systems', logoUrl?: string): string {
    return `
      <div style="text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 20px; margin-bottom: 30px;">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 60px; margin-bottom: 10px;">` : ''}
        <h1 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: bold;">${organizationName}</h1>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Human Resources Management System</p>
      </div>
    `;
  }

  // Get specific form template based on form type
  private static getFormTypeTemplate(formType: string, formData: any): string {
    switch (formType) {
      case 'manpower_requisition':
        return this.createManpowerRequisitionTemplate(formData);
      case 'candidate_information':
        return this.createCandidateInformationTemplate(formData);
      case 'business_trip_request':
        return this.createBusinessTripRequestTemplate(formData);
      case 'new_employee_joining':
        return this.createNewEmployeeJoiningTemplate(formData);
      case 'assets_it_access':
        return this.createAssetsITAccessTemplate(formData);
      case 'employee_information':
        return this.createEmployeeInformationTemplate(formData);
      case 'accommodation_transport_consent':
        return this.createAccommodationTransportConsentTemplate(formData);
      case 'beneficiary_declaration':
        return this.createBeneficiaryDeclarationTemplate(formData);
      case 'non_disclosure_agreement':
        return this.createNonDisclosureAgreementTemplate(formData);
      default:
        return this.createGenericFormTemplate(formType, formData);
    }
  }

  // Create empty form template when no data is available
  private static createEmptyFormTemplate(formType: string, organizationName = 'Acero Building Systems', logoUrl?: string): string {
    try {
      const formTitle = (formType || 'Form')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return `
        <div style="max-width: 210mm; margin: 0 auto; padding: 20px; background: white; font-family: 'Arial', sans-serif;">
          ${this.createHeader(organizationName, logoUrl)}
          <div style="margin-bottom: 30px; text-align: center; padding: 40px; border: 2px dashed #e5e7eb; border-radius: 10px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">${formTitle}</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">No form data available to generate PDF</p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">Please ensure the form has been properly submitted with data.</p>
          </div>
          ${this.createFooter()}
        </div>
      `;
    } catch (error) {
      console.error('Error creating empty form template:', error);
      return `
        <div style="max-width: 210mm; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1>Error Generating Document</h1>
          <p>An error occurred while generating the PDF document.</p>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      `;
    }
  }

  // Enhanced Manpower Requisition Template with actual data validation
  private static createManpowerRequisitionTemplate(data: any): string {
    // Validate that we have actual data
    if (!data || typeof data !== 'object') {
      return this.createEmptyFormTemplate('manpower_requisition');
    }

    // Extract form data - handle nested structure if needed
    const formData = data.formData || data;
    
    return `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
          MANPOWER REQUISITION FORM (ABS/HR/N/F01)
        </h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">MR Number:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.mrNumber || formData?.requestId || 'Auto-generated'}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Date:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.requestDate ? new Date(formData?.requestDate).toLocaleDateString() : new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Department:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${this.getDisplayValue(formData?.department)}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Location:</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Position Title:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.positionTitle || formData?.requestedPosition || 'N/A'}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">No. of Positions:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.numberOfPositions || formData?.noOfPositions || '1'}</td>
          </tr>
          <tr>

            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Urgency:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.urgency || formData?.priority || 'Normal'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Reporting To:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${this.getDisplayValue(formData?.reportingTo)}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Expected Join Date:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.candidateInfo?.expectedDateOfJoining ? new Date(formData?.candidateInfo?.expectedDateOfJoining).toLocaleDateString() : 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Requested By:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${this.getDisplayValue(formData?.requestedBy)}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Vacancy Reason:</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.vacancyReason || 'N/A'}</td>
          </tr>
        </table>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Job Description & Requirements</h3>
          <p style="margin-bottom: 10px;"><strong>Job Description:</strong></p>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb; margin-bottom: 15px; min-height: 60px;">
            ${formData?.jobDescription || 'N/A'}
          </div>
          
          <p style="margin-bottom: 10px;"><strong>Required Qualifications:</strong></p>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb; margin-bottom: 15px; min-height: 60px;">
            ${formData?.requiredQualifications || formData?.qualifications || 'N/A'}
          </div>

          <p style="margin-bottom: 10px;"><strong>Preferred Qualifications:</strong></p>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb; min-height: 60px;">
            ${formData?.preferredQualifications || formData?.preferredSkills || 'N/A'}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Budget Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 50%;">Budget Allocated:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.budgetAllocated || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Salary Range:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.salaryRange || formData?.expectedSalary || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Justification</h3>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb; min-height: 60px;">
            ${formData?.justification || formData?.businessJustification || 'N/A'}
          </div>
        </div>
      </div>
    `;
  }

  // Candidate Information Template
  private static createCandidateInformationTemplate(data: any): string {
    console.log('Creating Candidate Information Template with data:', data);
    if (!data || typeof data !== 'object') {
      return this.createEmptyFormTemplate('manpower_requisition');
    }

    // Extract form data - handle nested structure if needed
    const formData = data?.formData || data;
    
    return `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
          CANDIDATE INFORMATION FORM (ABS/HR/C/F02)
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Personal Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Full Name:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.fullName || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Date of Birth:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.dateOfBirth ? new Date(formData?.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Nationality:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.nationality?.name || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Gender:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.gender || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Marital Status:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.maritalStatus || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Religion:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.religion || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Contact Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Email:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.email || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Phone:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.phone || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Address:</td>
              <td colspan="3" style="padding: 8px; border: 1px solid #d1d5db;">${formData?.currentAddress || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Position Applied For</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Position:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.positionApplied || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Department:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.department?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Expected Salary:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.expectedSalary || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Notice Period:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.noticePeriod || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Educational Background</h3>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb;">
            ${formData?.education || 'N/A'}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Work Experience</h3>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb;">
            ${formData?.workExperience || 'N/A'}
          </div>
        </div>
      </div>
    `;
  }

  // Business Trip Request Template
  private static createBusinessTripRequestTemplate(data: any): string {
    if (!data || typeof data !== 'object') {
      return this.createEmptyFormTemplate('manpower_requisition');
    }

    // Extract form data - handle nested structure if needed
    const formData = data?.formData || data;
    return `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
          BUSINESS TRIP REQUEST FORM (ABS/HR/N/F12)
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Trip Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Employee Name:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.employeeName || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Employee ID:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.employeeId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Department:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.department?.name || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Designation:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.designation || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Destination:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.destination || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Trip Type:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.tripType || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Start Date:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.startDate ? new Date(formData?.startDate).toLocaleDateString() : 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; formData?-color: #f9fafb; font-weight: bold;">End Date:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.endDate ? new Date(formData?.endDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Purpose & Objectives</h3>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb; margin-bottom: 15px;">
            <strong>Purpose of Trip:</strong><br>
            ${formData?.purpose || 'N/A'}
          </div>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb;">
            <strong>Expected Outcomes:</strong><br>
            ${formData?.expectedOutcomes || 'N/A'}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Budget Estimate</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 50%;">Transportation:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.transportationCost || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Accommodation:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.accommodationCost || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Daily Allowance:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.dailyAllowance || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Other Expenses:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.otherExpenses || 'N/A'}</td>
            </tr>
            <tr style="border-top: 2px solid #374151;">
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #1f2937; color: white; font-weight: bold;">Total Estimated Cost:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #1f2937; color: white; font-weight: bold;">${formData?.totalEstimatedCost || 'N/A'}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  // Generic template for other form types
  private static createGenericFormTemplate(formType: string, data: any): string {
    const formTitle = formType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
          ${formTitle}
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Form Data</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${Object.entries(data).map(([key, value]) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">
                  ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">
                  ${this.formatFieldValue(value)}
                </td>
              </tr>
            `).join('')}
          </table>
        </div>
      </div>
    `;
  }

  // Create additional templates for other form types
  private static createNewEmployeeJoiningTemplate(data: any): string {
    return this.createGenericFormTemplate('new_employee_joining', data);
  }

  private static createAssetsITAccessTemplate(data: any): string {
    return this.createGenericFormTemplate('assets_it_access', data);
  }

  private static createEmployeeInformationTemplate(data: any): string {
    return this.createGenericFormTemplate('employee_information', data);
  }

  private static createAccommodationTransportConsentTemplate(data: any): string {
    return this.createGenericFormTemplate('accommodation_transport_consent', data);
  }

  private static createBeneficiaryDeclarationTemplate(data: any): string {
    return this.createGenericFormTemplate('beneficiary_declaration', data);
  }

  private static createNonDisclosureAgreementTemplate(data: any): string {
    const formData = data?.formData || data;
    return `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
          NON-DISCLOSURE AGREEMENT (ABS/HR/C/F06)
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Parties and Agreement Date</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold; width: 30%;">Agreement Date:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.agreementDate ? new Date(formData?.agreementDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Employee Name:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.employeeName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Employee ID:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.employeeId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; font-weight: bold;">Company Representative:</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${formData?.companyRepName || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Agreement Terms</h3>
          <div style="border: 1px solid #d1d5db; padding: 10px; background-color: #f9fafb;">
            ${formData?.agreementText || 'Agreement text not available.'}
          </div>
        </div>
      </div>
    `;
  }

  // Create submission info section
  private static createSubmissionInfo(submittedBy?: any, submissionDate?: Date): string {
    if (!submittedBy && !submissionDate) return '';

    return `
      <div style="margin-bottom: 30px; padding: 15px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 5px;">
        <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Submission Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${submittedBy ? `
            <tr>
              <td style="padding: 5px; font-weight: bold; width: 30%;">Submitted By:</td>
              <td style="padding: 5px;">${submittedBy.displayName || submittedBy.name || 'N/A'}</td>
            </tr>
          ` : ''}
          ${submissionDate ? `
            <tr>
              <td style="padding: 5px; font-weight: bold;">Submission Date:</td>
              <td style="padding: 5px;">${new Date(submissionDate).toLocaleString()}</td>
            </tr>
          ` : ''}
        </table>
      </div>
    `;
  }

  // Create approval section
  private static createApprovalSection(approvalHistory?: any[]): string {
    if (!approvalHistory || approvalHistory.length === 0) return '';

    return `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Approval History</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Step</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Approver</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Status</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Date</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Comments</th>
            </tr>
          </thead>
          <tbody>
            ${approvalHistory.map((approval, index) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${approval.stepName || `Step ${index + 1}`}</td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${approval.approverName || 'N/A'}</td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">
                  <span style="padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; 
                    ${approval.status === 'approved' ? 'background-color: #d1fae5; color: #065f46;' :
                      approval.status === 'rejected' ? 'background-color: #fee2e2; color: #991b1b;' :
                      'background-color: #fef3c7; color: #92400e;'}">
                    ${approval.status ? approval.status.toUpperCase() : 'PENDING'}
                  </span>
                </td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">
                  ${approval.actionDate ? new Date(approval.actionDate).toLocaleDateString() : 'N/A'}
                </td>
                <td style="padding: 8px; border: 1px solid #d1d5db;">${approval.comments || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Create footer section
  private static createFooter(): string {
    return `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">This document was generated automatically by the HRMS system on ${new Date().toLocaleString()}</p>
        <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Acero Building Systems. All rights reserved.</p>
      </div>
    `;
  }

  // Helper method to check if a value is an ObjectId
  private static isObjectId(value: any): boolean {
    if (!value) return false;
    // Check for MongoDB ObjectId
    if (typeof value === 'object' && value._bsontype === 'ObjectID') return true;
    // Check for 24 character hex string
    const str = value.toString ? value.toString() : String(value);
    return /^[0-9a-fA-F]{24}$/.test(str);
  }

  // Helper method to check if an object is a populated reference
  private static isPopulatedReference(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    // Check if it has _id and at least one display field
    return (
      ('_id' in obj) && (
        'name' in obj ||
        'displayName' in obj ||
        'title' in obj ||
        'label' in obj ||
        'email' in obj
      )
    );
  }

  // Helper method to get the best display value from an object
  private static getDisplayValueFromObject(obj: any): string | null {
    if (!obj || typeof obj !== 'object') return null;

    // Handle populated references
    if (this.isPopulatedReference(obj)) {
      // Check common display fields in order of preference
      const displayValue = 
        obj.displayName ||
        (obj.firstName && obj.lastName ? `${obj.firstName} ${obj.lastName}`.trim() : null) ||
        obj.name ||
        obj.title ||
        obj.label ||
        obj.email ||
        obj.phone ||
        obj.fullName ||
        obj.userName ||
        obj.username;
      
      if (displayValue) return String(displayValue);
    }

    // Check for nested objects that might contain display values
    for (const [key, val] of Object.entries(obj)) {
      // Skip private fields and potential circular references
      if (key.startsWith('_') || key === 'password' || key === 'hash' || key === 'salt') continue;
      
      // If the value is an object, recursively check it
      if (val && typeof val === 'object' && !Array.isArray(val) && !this.isObjectId(val)) {
        const nestedDisplay = this.getDisplayValueFromObject(val);
        if (nestedDisplay) return nestedDisplay;
      }
    }

    return null;
  }

  // Main method to get display value for any type
  private static getDisplayValue(value: any): string {
    try {
      // Handle null/undefined
      if (value === null || value === undefined) {
        return 'N/A';
      }

      // Handle primitive types
      if (typeof value === 'string') {
        return value.trim() || 'N/A';
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }

      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) return 'N/A';
        return value.map(v => this.getDisplayValue(v)).filter(Boolean).join(', ');
      }

      // Handle objects
      if (typeof value === 'object') {
        // Handle Mongoose documents
        if (value._id && typeof value.toObject === 'function') {
          value = value.toObject({ virtuals: true, getters: true });
        }

        // Check if it's a populated reference
        const displayValue = this.getDisplayValueFromObject(value);
        if (displayValue) return displayValue;

        // Special handling for common ID fields
        const idFields = ['_id', 'id', 'userId', 'employeeId', 'departmentId', 'locationId'];
        for (const field of idFields) {
          if (value[field] && !this.isObjectId(value[field])) {
            return String(value[field]);
          }
        }

        // Try to find any string value in the object
        for (const [key, val] of Object.entries(value)) {
          if (key.startsWith('_')) continue;
          if (val && typeof val === 'string' && val.trim() && !this.isObjectId(val)) {
            return val.trim();
          }
        }

        // As a last resort, try to stringify
        try {
          const str = JSON.stringify(value, (key, val) => {
            if (key.startsWith('_') || key === 'password' || this.isObjectId(val)) return undefined;
            return val;
          });
          return str === '{}' ? 'N/A' : str;
        } catch {
          return 'N/A';
        }
      }

      return String(value);
    } catch (error) {
      console.warn('Error getting display value:', { value, error });
      return 'N/A';
    }
  }

  // Helper method to format field values with better object handling
  private static formatFieldValue(value: any): string {
    // First try to get a display value
    const displayValue = this.getDisplayValue(value);
    if (displayValue !== 'N/A') {
      return displayValue;
    }

    // For arrays, try to format each item
    if (Array.isArray(value) && value.length > 0) {
      return value.map(v => this.getDisplayValue(v)).filter(Boolean).join(', ');
    }

    // For objects, try to find meaningful values
    if (value && typeof value === 'object') {
      // Check for common ID fields that might be useful
      const idFields = ['_id', 'id', 'code', 'referenceNumber'];
      for (const field of idFields) {
        if (value[field]) {
          return String(value[field]);
        }
      }

      // Try to find any non-empty string value
      for (const [key, val] of Object.entries(value)) {
        if (key.startsWith('_')) continue;
        if (val && typeof val === 'string' && val.trim()) {
          return val.trim();
        }
      }
    }

    return displayValue; // Fall back to the display value
  }
}

export default HRMSPDFGenerator;