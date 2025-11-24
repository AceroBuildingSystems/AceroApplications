import { HRMSFormConfig } from '@/types/hrms';
import { HRMSFormTypes } from '@/types/hrms';

// Form configurations for all HRMS forms
export const HRMS_FORM_CONFIGS: Record<string, HRMSFormConfig> = {

  // === Manpower Requisition Form ===
  [HRMSFormTypes.MANPOWER_REQUISITION]: {
    formType: HRMSFormTypes.MANPOWER_REQUISITION,
    title: 'Manpower Requisition Form',
    description: 'Request for new employee recruitment or replacement',
    submitLabel: 'Submit Requisition',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'request_info',
        title: 'Request Information',
        description: 'Basic information about the requisition request',
        fields: [
          {
            name: 'requestedBy',
            type: 'select',
            label: 'Requested By',
            required: true,
            options: [] // Will be populated from API
          },
          {
            name: 'expectedCompletionDate',
            type: 'date',
            label: 'Expected Completion Date',
            required: true,
            defaultValue: new Date().toISOString()
          },
          {
            name: 'requestedDepartment',
            type: 'select',
            label: 'Department',
            required: true,
            options: [] // Will be populated from API
          },
          {
            name: 'requiredPosition',
            type: 'select',
            label: 'Requested Position',
            required: true,
            options: [],
            placeholder: 'Select position to be filled',
          },
          {
            name: 'workLocation',
            type: 'select',
            label: 'Work Location',
            required: true,
            options: [],
            placeholder: 'Select work location',
          }
        ]
      },
      {
        id: 'position_info',
        title: 'Position Information',
        description: 'Details about the position and vacancy reason',
        fields: [
          {
            name: 'vacancyReason',
            type: 'radio',
            label: 'Vacancy Reason',
            required: true,
            options: [
              { label: 'New Position', value: 'new_position' },
              { label: 'Replacement', value: 'replacement' }
            ]
          },

          {
            name: 'positionType',
            type: 'radio',
            label: 'New Position Type',
            required: true,
            options: [
              { label: 'Budgeted', value: 'budgeted' },
              { label: 'Non-Budgeted', value: 'nonbudgeted' }
            ],
            showIf: (values) => values.vacancyReason === 'new_position'
          },

          {
            name: 'noOfVacantPositions',
            type: 'number',
            label: 'Number of Vacant Positions',
            required: true,
          },
          {
            name: 'recruitmentType',
            type: 'select',
            label: 'Recruitment Type',
            options: [],
            placeholder: 'Select recruitment type',
          }
        ]
      },
      {
        id: 'previous_employee',
        title: 'Previous Employee Details',
        description: 'Information about the employee being replaced (if applicable)',
        fields: [
          {
            name: 'prevEmployee',
            type: 'select',
            label: 'Employee Name',
            options: [],
            placeholder: 'Select previous employee',
            showIf: (values) => values.vacancyReason === 'replacement'
          },

          {
            name: 'dateOfExit',
            type: 'date',
            label: 'Date of Exit',
            showIf: (values) => values.vacancyReason === 'replacement'
          },
          {
            name: 'prevEmployeeSalary',
            type: 'number',
            label: 'Salary (AED)',
            showIf: (values) => values.vacancyReason === 'replacement'
          }
        ]
      },

    ]
  },

  // === Candidate Information Form ===

  [HRMSFormTypes.CANDIDATE_INFORMATION]: {
    formType: HRMSFormTypes.CANDIDATE_INFORMATION,
    title: 'Candidate Information Form',
    description: 'Comprehensive candidate information and background details',
    submitLabel: 'Submit Application',
    saveDraftLabel: 'Save Draft',
    sections: [
      // Personal details section
      {
        id: 'personal_details',
        title: 'Personal Details',
        description: 'Basic personal information of the candidate',
        fields: [
          {
            name: 'firstName',
            type: 'text',
            label: 'First Name (As Per Passport)',
            required: true,
            placeholder: 'Enter first name as per passport'
          },
          {
            name: 'lastName',
            type: 'text',
            label: 'Last Name (As Per Passport)',
            required: true,
            placeholder: 'Enter last name as per passport'
          },
          {
            name: 'contactNumber',
            type: 'tel',
            label: 'Contact Number',
            required: true,
            placeholder: 'Contact number with country code',
          },
          {
            name: 'email',
            type: 'email',
            label: 'Email Address',
            required: true,
            placeholder: 'your.email@example.com'
          },
          {
            name: 'gender',
            type: 'radio',
            label: 'Gender',
            required: true,
            options: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' }
            ]
          },
          {
            name: 'nationality',
            type: 'select',
            label: 'Nationality',
            required: true,
            options: [] // Will be populated from countries API
          },
          {
            name: 'currentLocation',
            type: 'text',
            label: 'Current Location',
            required: true,
            placeholder: 'City, Country'
          },
          {
            name: 'dateOfBirth',
            type: 'date',
            label: 'Date of Birth',
            required: true
          },

          {
            name: 'maritalStatus',
            type: 'radio',
            label: 'Marital Status',
            required: true,
            options: [
              { label: 'Single', value: 'single' },
              { label: 'Married', value: 'married' },
              { label: 'Divorced', value: 'divorced' }
            ]
          },
          {
            name: 'drivingLicense',
            type: 'radio',
            label: 'Driving License',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
          {
            name: 'currentlyWorking',
            type: 'radio',
            label: 'Currently Working',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
        ]
      },
      //Professional details
      {
        id: 'professional_details',
        title: 'Professional Details',
        description: 'Information about your professional background',
        fields: [

          {
            name: 'totalYearsOfExperience',
            type: 'number',
            label: 'Total Years of Experience',
            required: true,
            validation: { min: 0 }
          },
          {
            name: 'relevantYearsOfExperience',
            type: 'number',
            label: 'Relevant Years of Experience',
            required: true,
            validation: { min: 0 }
          },
          {
            name: 'currentEmployer',
            type: 'text',
            label: 'Current Employer',
            //required: true,
            placeholder: 'Name of current or most recent employer'
          },
          {
            name: 'currentWorkLocation',
            type: 'text',
            label: 'Current Work Location',
            //required: true,
            placeholder: 'City, Country'
          },
          {
            name: 'currentDesignation',
            type: 'text',
            label: 'Current Designation',
            //required: true,
            placeholder: 'Your current or most recent job title'
          },
          {
            name: 'noticePeriodRequired',
            type: 'number',
            label: 'Notice Period Required (Days)',
            //required: true,
            placeholder: '15, 30, etc'
          },
          {
            name: 'currentSalaryPackage',
            type: 'number',
            label: 'Current Salary (Per Month)',
            //required: true,
            validation: { min: 0 }
          },
          {
            name: 'expectedSalaryPackage',
            type: 'number',
            label: 'Expected Salary (Per Month)',
            // required: true,
            validation: { min: 0 }
          },
        ]
      },
      //Visa details
      {
        id: 'visa_details',
        title: 'Visa Details',
        description: 'Visa information and current visa status',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          {
            name: 'visaType',
            type: 'select',
            label: 'Visa Type',
            //  required: true,
            options: []
          },
          {
            name: 'visaExpiry',
            type: 'date',
            label: 'Visa Expiry Date',
            // required: true
          },
        ]
      },
      //Education details
      {
        id: 'education_details',
        title: 'Education Details',
        description: 'Information about your educational background',
        fields: [
          {
            name: 'highestQualification',
            type: 'select',
            label: 'Highest Qualification',
            required: true,

            options: []
          },
          {
            name: 'specialization',
            type: 'text',
            label: 'Specialization',
            required: false,
            placeholder: 'e.g., Coputer Science, Accounts etc.'
          },
          {
            name: 'degreeCertificateAttested',
            type: 'radio',
            label: 'Degree Certificate Attested',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
          {
            name: 'languagesKnown',
            type: 'textarea',
            label: 'Languages Known',
            required: true,
            placeholder: 'e.g., English, Arabic, Hindi'
          },
          {
            name: 'certifications',
            type: 'text',
            label: 'Certifications (if any)',
            placeholder: 'Mention your certifications here'
          },
          {
            name: 'attachResume',
            type: 'file',
            label: 'Attach Resume (PDF Only)',
            required: true,
            accept: '.pdf',
          }
        ]
      },
      //Referral information
      {
        id: 'referral_info',
        title: 'Referral Information',
        description: 'How you know about this position',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          {
            name: 'sourceOfPositionInfo',
            type: 'text',
            label: 'Source of Position Information',
            required: true,
            placeholder: 'e.g., Job portal, referral, company website'
          },
          {
            name: 'friendsRelativesInABS',
            type: 'radio',
            label: 'Do you have friends or relatives working in ABS?',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
          {
            name: 'friendsRelativesDetails.name',
            type: 'text',
            label: 'Friend/Relative Name',
            showIf: (values) => values.friendsRelativesInABS === 'yes',
          },
          {
            name: 'friendsRelativesDetails.relation',
            type: 'text',
            label: 'Relation',
            showIf: (values) => values.friendsRelativesInABS === 'yes',
          },
          {
            name: 'friendsRelativesDetails.contactNo',
            type: 'tel',
            label: 'Contact Number',
            showIf: (values) => values.friendsRelativesInABS === 'yes',
          },

        ]
      },
      //Declaration
      {
        id: 'declaration',

        title: 'Declaration',
        description: 'I declare that the above statement given by me is true and correct to the best of my knowledge and belief. I understand that all information provided about me to you will be held by you and used for the purpose of evaluating my qualifications, experience and suitability for employment with you. I also understand that my employment contract will be terminated if, after investigation, the company discovers that any information which I have provided, or which has been provided by me, is false or misleading.',
        fields: [
          {
            name: 'declaredBy.candidateSignature',
            type: 'text',
            label: 'Candidate Signature',
            required: true,
            placeholder: 'Type your full name as signature'
          },

        ]
      },
      //HR Admin
      {
        id: 'hrAdmin',

        title: 'For HR/Admin',
        // description: 'I declare that the above statement given by me is true and correct to the best of my knowledge and belief. I understand that all information provided about me to you will be held by you and used for the purpose of evaluating my qualifications, experience and suitability for employment with you. I also understand that my employment contract will be terminated if, after investigation, the company discovers that any information which I have provided, or which has been provided by me, is false or misleading.',
        fields: [
          {
            name: 'checkedBy',
            type: 'select',
            label: 'Checked By',
            placeholder: 'select checked by',
            options: []
          },
          {
            name: 'remarks',
            type: 'textarea',
            label: 'Remarks (If Any)',
            placeholder: 'Type your remarks here'
          },

        ]
      }

    ]
  },


  // === direct candidate form === //

  [HRMSFormTypes.CANDIDATE_INFORMATION_NEW]: {
    formType: HRMSFormTypes.CANDIDATE_INFORMATION_NEW,
    title: 'Candidate Information Form',
    description: 'Comprehensive candidate information and background details',
    submitLabel: 'Submit Application',
    saveDraftLabel: 'Save Draft',
    sections: [
      // Personal details section
      {
        id: 'personal_details',
        title: 'Personal Details',
        description: 'Basic personal information of the candidate',
        fields: [
          {
            name: 'firstName',
            type: 'text',
            label: 'First Name (As Per Passport)',
            required: true,
            placeholder: 'Enter first name as per passport'
          },
          {
            name: 'lastName',
            type: 'text',
            label: 'Last Name (As Per Passport)',
            required: true,
            placeholder: 'Enter last name as per passport'
          },
          {
            name: 'contactNumber',
            type: 'tel',
            label: 'Contact Number',
            required: true,
            placeholder: 'Contact number with country code',
          },
          {
            name: 'email',
            type: 'email',
            label: 'Email Address',
            required: true,
            placeholder: 'your.email@example.com'
          },
          {
            name: 'gender',
            type: 'radio',
            label: 'Gender',
            required: true,
            options: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' }
            ]
          },
          {
            name: 'nationality',
            type: 'select',
            label: 'Nationality',
            required: true,
            options: [] // Will be populated from countries API
          },
          {
            name: 'currentLocation',
            type: 'text',
            label: 'Current Location',
            required: true,
            placeholder: 'City, Country'
          },
          {
            name: 'dateOfBirth',
            type: 'date',
            label: 'Date of Birth',
            required: true
          },

          {
            name: 'maritalStatus',
            type: 'radio',
            label: 'Marital Status',
            required: true,
            options: [
              { label: 'Single', value: 'single' },
              { label: 'Married', value: 'married' },
              { label: 'Divorced', value: 'divorced' }
            ]
          },
          {
            name: 'drivingLicense',
            type: 'radio',
            label: 'Driving License',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
          {
            name: 'currentlyWorking',
            type: 'radio',
            label: 'Currently Working',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
        ]
      },
      //Professional details
      {
        id: 'professional_details',
        title: 'Professional Details',
        description: 'Information about your professional background',
        fields: [

          {
            name: 'totalYearsOfExperience',
            type: 'number',
            label: 'Total Years of Experience',
            required: true,
            validation: { min: 0 }
          },
          {
            name: 'relevantYearsOfExperience',
            type: 'number',
            label: 'Relevant Years of Experience',
            required: true,
            validation: { min: 0 }
          },
          {
            name: 'currentEmployer',
            type: 'text',
            label: 'Current Employer',
            //required: true,
            placeholder: 'Name of current or most recent employer'
          },
          {
            name: 'currentWorkLocation',
            type: 'text',
            label: 'Current Work Location',
            //required: true,
            placeholder: 'City, Country'
          },
          {
            name: 'currentDesignation',
            type: 'text',
            label: 'Current Designation',
            //required: true,
            placeholder: 'Your current or most recent job title'
          },
          {
            name: 'noticePeriodRequired',
            type: 'number',
            label: 'Notice Period Required (Days)',
            //required: true,
            placeholder: '15, 30, etc'
          },
          {
            name: 'currentSalaryPackage',
            type: 'number',
            label: 'Current Salary (Per Month)',
            //required: true,
            validation: { min: 0 }
          },
          {
            name: 'expectedSalaryPackage',
            type: 'number',
            label: 'Expected Salary (Per Month)',
            // required: true,
            validation: { min: 0 }
          },
        ]
      },
      //Visa details
      {
        id: 'visa_details',
        title: 'Visa Details',
        description: 'Visa information and current visa status',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          {
            name: 'visaType',
            type: 'select',
            label: 'Visa Type',
            //  required: true,
            options: []
          },
          {
            name: 'visaExpiry',
            type: 'date',
            label: 'Visa Expiry Date',
            // required: true
          },
        ]
      },
      //Education details
      {
        id: 'education_details',
        title: 'Education Details',
        description: 'Information about your educational background',
        fields: [
          {
            name: 'highestQualification',
            type: 'select',
            label: 'Highest Qualification',
            required: true,

            options: [
              { value: 'laptop', label: 'Laptop' },
              { value: 'desktop', label: 'Desktop' },
              { value: 'monitor', label: 'Monitor' },
              {
                value: 'telephone-extension',
                label: 'Telephone Extension',

              },
              { value: 'mobile-phone', label: 'Mobile Phone' },
              { value: 'sim-card', label: 'Sim Card' },
              { value: 'keyboard-mouse', label: 'wireless Keyboard Mouse' },
              { value: 'wireless-mouse', label: 'Wireless Mouse' },
              { value: 'headphone', label: 'Headphone' }
            ]
          },
          {
            name: 'degreeCertificateAttested',
            type: 'radio',
            label: 'Degree Certificate Attested',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
          {
            name: 'languagesKnown',
            type: 'textarea',
            label: 'Languages Known',
            required: true,
            placeholder: 'e.g., English, Arabic, Hindi'
          },
          {
            name: 'certifications',
            type: 'text',
            label: 'Certifications (if any)',
            placeholder: 'Mention your certifications here'
          },
          {
            name: 'attachResume',
            type: 'file',
            label: 'Attach Resume',
            required: true,
            accept: '.pdf,.doc,.docx',
          }
        ]
      },
      //Referral information
      {
        id: 'referral_info',
        title: 'Referral Information',
        description: 'How you know about this position',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          {
            name: 'sourceOfPositionInfo',
            type: 'text',
            label: 'Source of Position Information',
            required: true,
            placeholder: 'e.g., Job portal, referral, company website'
          },
          {
            name: 'friendsRelativesInABS',
            type: 'radio',
            label: 'Do you have friends or relatives working in ABS?',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
          {
            name: 'friendsRelativesDetails.name',
            type: 'text',
            label: 'Friend/Relative Name',
            showIf: (values) => values.friendsRelativesInABS === 'yes',
          },
          {
            name: 'friendsRelativesDetails.relation',
            type: 'text',
            label: 'Relation',
            showIf: (values) => values.friendsRelativesInABS === 'yes',
          },
          {
            name: 'friendsRelativesDetails.contactNo',
            type: 'tel',
            label: 'Contact Number',
            showIf: (values) => values.friendsRelativesInABS === 'yes',
          },

        ]
      },
      //Declaration
      {
        id: 'declaration',

        title: 'Declaration',
        description: 'I declare that the above statement given by me is true and correct to the best of my knowledge and belief. I understand that all information provided about me to you will be held by you and used for the purpose of evaluating my qualifications, experience and suitability for employment with you. I also understand that my employment contract will be terminated if, after investigation, the company discovers that any information which I have provided, or which has been provided by me, is false or misleading.',
        fields: [
          {
            name: 'declaredBy.candidateSignature',
            type: 'text',
            label: 'Candidate Signature',
            required: true,
            placeholder: 'Type your full name as signature'
          },

        ]
      },
      //HR Admin


    ]
  },

  // === Candidate Information Form ===
  // [HRMSFormTypes.CANDIDATE_INFORMATION]: {
  //   formType: HRMSFormTypes.CANDIDATE_INFORMATION,
  //   title: 'Candidate Information Form',
  //   description: 'Comprehensive candidate information and background details',
  //   submitLabel: 'Submit Information',
  //   saveDraftLabel: 'Save Draft',
  //   sections: [
  //     {
  //       id: 'personal_details',
  //       title: 'Personal Details',
  //       description: 'Basic personal information of the candidate',
  //       fields: [
  //         {
  //           name: 'positionApplied',
  //           type: 'text',
  //           label: 'Position Applied For',
  //           required: true,
  //           placeholder: 'Enter the position you are applying for'
  //         },
  //         {
  //           name: 'name',
  //           type: 'text',
  //           label: 'Full Name',
  //           required: true,
  //           placeholder: 'Enter your full name as per passport'
  //         },
  //         {
  //           name: 'dateOfBirth',
  //           type: 'date',
  //           label: 'Date of Birth',
  //           required: true
  //         },
  //         {
  //           name: 'nationality',
  //           type: 'select',
  //           label: 'Nationality',
  //           required: true,
  //           options: [] // Will be populated from countries API
  //         },
  //         {
  //           name: 'gender',
  //           type: 'radio',
  //           label: 'Gender',
  //           required: true,
  //           options: [
  //             { label: 'Male', value: 'male' },
  //             { label: 'Female', value: 'female' }
  //           ]
  //         },
  //         {
  //           name: 'maritalStatus',
  //           type: 'radio',
  //           label: 'Marital Status',
  //           required: true,
  //           options: [
  //             { label: 'Single', value: 'single' },
  //             { label: 'Married', value: 'married' },
  //             { label: 'Divorced', value: 'divorced' }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       id: 'family_details',
  //       title: 'Family Details',
  //       description: 'Information about family members',
  //       fields: [
  //         {
  //           name: 'fatherName',
  //           type: 'text',
  //           label: "Father's Name",
  //           required: true,
  //           placeholder: "Enter your father's full name"
  //         },
  //         {
  //           name: 'motherName',
  //           type: 'text',
  //           label: "Mother's Name",
  //           required: true,
  //           placeholder: "Enter your mother's full name"
  //         },
  //         {
  //           name: 'spouseName',
  //           type: 'text',
  //           label: "Spouse's Name",
  //           placeholder: "Enter spouse name if married",
  //           showIf: (values) => values.maritalStatus === 'married'
  //         }
  //       ]
  //     },
  //     {
  //       id: 'contact_details',
  //       title: 'Contact Information',
  //       description: 'Contact details and addresses',
  //       fields: [
  //         {
  //           name: 'contactAddressUAE',
  //           type: 'textarea',
  //           label: 'Contact Address in UAE',
  //           required: true,
  //           placeholder: 'Enter your current address in UAE'
  //         },
  //         {
  //           name: 'phoneNumbersUAE',
  //           type: 'tel',
  //           label: 'Phone Number (UAE)',
  //           required: true,
  //           placeholder: '+971-XX-XXXXXXX'
  //         },
  //         {
  //           name: 'contactAddressHomeCountry',
  //           type: 'textarea',
  //           label: 'Contact Address (Home Country)',
  //           required: true,
  //           placeholder: 'Enter your address in home country'
  //         },
  //         {
  //           name: 'phoneNumbersHomeCountry',
  //           type: 'tel',
  //           label: 'Phone Number (Home Country)',
  //           required: true,
  //           placeholder: 'Include country code'
  //         },
  //         {
  //           name: 'email',
  //           type: 'email',
  //           label: 'Email Address',
  //           required: true,
  //           placeholder: 'your.email@example.com'
  //         },
  //         {
  //           name: 'homeTownCityIntlAirport',
  //           type: 'text',
  //           label: 'Home Town/City/International Airport',
  //           required: true,
  //           placeholder: 'Nearest major city or airport'
  //         }
  //       ]
  //     },
  //     {
  //       id: 'passport_employment',
  //       title: 'Passport & Employment Details',
  //       description: 'Passport information and current employment status',
  //       fields: [
  //         {
  //           name: 'passportNo',
  //           type: 'text',
  //           label: 'Passport Number',
  //           required: true,
  //           placeholder: 'Enter passport number'
  //         },
  //         {
  //           name: 'passportExpiry',
  //           type: 'date',
  //           label: 'Passport Expiry Date',
  //           required: true
  //         },
  //         {
  //           name: 'currentWorkLocation',
  //           type: 'text',
  //           label: 'Current Work Location',
  //           required: true,
  //           placeholder: 'City, Country'
  //         },
  //         {
  //           name: 'currentSalaryPackage',
  //           type: 'number',
  //           label: 'Current Salary Package (AED)',
  //           required: true,
  //           validation: { min: 0 }
  //         },
  //         {
  //           name: 'noticePeriod',
  //           type: 'text',
  //           label: 'Notice Period',
  //           required: true,
  //           placeholder: 'e.g., 30 days, 2 months'
  //         },
  //         {
  //           name: 'expectedDOJ',
  //           type: 'date',
  //           label: 'Expected Date of Joining',
  //           required: true
  //         }
  //       ]
  //     },
  //     {
  //       id: 'visa_options',
  //       title: 'Visa-Cancellation Options (UAE Based)',
  //       description: 'Options for UAE visa holders',
  //       collapsible: true,
  //       defaultExpanded: false,
  //       fields: [
  //         {
  //           name: 'VisaCancellation',
  //           type: 'radio',
  //           label: 'Visa Cacellation',
  //           required: true,
  //           options: [
  //             { label: 'Join directly after visa cancellation', value: 'joinDirectlyAfterCancellation' },
  //             { label: 'Travel to home country first', value: 'travelToHomeCountry' }
  //           ]

  //         },
  //         {
  //           name: 'reasonForTravel',
  //           type: 'text',
  //           label: 'Reason for Travel',
  //           showIf: (values) => {

  //             return values.VisaCancellation === 'travelToHomeCountry'
  //           },
  //           placeholder: 'Specify reason for travel'
  //         },
  //         {
  //           name: 'daysStayHomeCountry',
  //           type: 'number',
  //           label: 'Days to Stay in Home Country',
  //           showIf: (values) => values.VisaCancellation === 'travelToHomeCountry',
  //           validation: { min: 1, max: 365 }
  //         }
  //       ]
  //     },
  //     {
  //       id: 'referral_info',
  //       title: 'Referral Information',
  //       description: 'How you learned about this position',
  //       collapsible: true,
  //       defaultExpanded: false,
  //       fields: [
  //         {
  //           name: 'sourceOfPositionInfo',
  //           type: 'text',
  //           label: 'Source of Position Information',
  //           required: true,
  //           placeholder: 'e.g., Job portal, referral, company website'
  //         },
  //         {
  //           name: 'friendsRelativesInABS',
  //           type: 'checkbox',
  //           label: 'Do you have friends or relatives working in ABS?'
  //         }
  //       ]
  //     }
  //   ]
  // },


  // ==== Interview And Assesment ==== //
  // === Interview Assessment Form ===
  [HRMSFormTypes.INTERVIEW_ASSESSMENT]: {
    formType: HRMSFormTypes.INTERVIEW_ASSESSMENT,
    title: 'Interview Assessment Form',
    description: 'Record interview rounds and assessment scores for a candidate',
    submitLabel: 'Submit Assessment',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'candidate_info',
        title: 'Candidate Information',
        description: 'Basic details about the candidate being assessed',
        fields: [
          {
            name: 'candidateName',
            type: 'text',
            label: 'Candidate Name',
            disable: true
          },
          {
            name: 'candidateId.recruitment.requiredPosition.name',
            type: 'text',
            label: 'Position',
            disable: true
          },
          {
            name: 'candidateId.recruitment.department.name',
            type: 'text',
            label: 'Department',
            disable: true
          },
          {
            name: 'attachResume',
            type: 'file',
            label: 'Resume',
            disable: true,
            accept: '.pdf,.doc,.docx',
          }
        ]
      },

      {
        id: 'rounds_section',
        title: 'Interview Rounds',
        description: 'Details of each interview round conducted',
        fields: [
          {
            name: 'rounds',
            type: 'array',
            label: 'Rounds',
            subFields: [
              {
                name: 'interviewer',
                type: 'select',
                label: 'Interviewer',
                options: [], // Populate from User collection

              },
              {
                name: 'date',
                type: 'date',

                label: 'Interview Date',

              },
              {
                name: 'roundStatus',
                type: 'select',
                label: 'Round Status',

                options: [
                  { name: 'Shortlisted', _id: 'shortlisted' },
                  { name: 'Rejected', _id: 'rejected' },
                  { name: 'N/A', _id: 'na' }
                ]
              },
              {
                name: 'remarks',
                type: 'textarea',

                label: 'Remarks'
              }
            ]
          }
        ]
      },

    
      {
        id: 'assessment_section',
        title: 'Assessment (For Department Manager)',
        description: 'Score the candidate on predefined parameters (1–5)',
        visibleFor: ['Manager'],
        fields: [
          {
            name: 'assessmentParameters',
            type: 'array',
            label: 'Assessment Parameters (Score 1 - 5 , 1-Poor / 5-Very Good)',
            subFields: [
              {
                name: 'parameterName',
                type: 'label', // display only, not editable
                label: 'Parameter'
              },
              {
                name: 'score',
                type: 'number',
                label: 'Score (1–5)',
                max: 5,
                placeholder: 'Score (1–5)'
              }
            ],
            defaultValue: [
              { parameterName: 'Education Qualification', score: '' },
              { parameterName: 'Technical Proficiency/ Job Knowledge', score: '' },
              { parameterName: 'Work Experience', score: '' },
              { parameterName: 'Communication skills', score: '' },
              { parameterName: 'Interpersonal Skills', score: '' },
              { parameterName: 'Intellect/Future Potential', score: '' },
              { parameterName: 'Stable work history', score: '' },
              { parameterName: 'Self Confidence/ Self Esteem', score: '' },
              { parameterName: 'Proactive/Initiative towards learning', score: '' },
              { parameterName: 'Team Orientation', score: '' }
            ]
          },

        ]
      },

        {
        id: 'preliminary_feedback',
        title: 'Preliminary Interview Feedback (HR/ADMIN Department)',
        description: '',
        visibleFor: ['Manager', 'HR & Admin'],
        fields: [
          {
            name: 'hrFeedback.date',
            type: 'date',
            label: 'Interview Date',

          },
          {
            name: 'hrFeedback.remarks',
            type: 'textarea',
            label: 'Remarks'
          }

        ]
      },


      {
        id: 'status_remarks',
        title: 'Status And Remarks (For Department Manager)',
        description: '',
        visibleFor: ['Manager'],
        fields: [
          {
            name: 'status',
            type: 'select',
            label: 'Selction Status',

            options: [
              { name: 'Recruited', _id: 'recruited' },
              { name: 'Shortlisted', _id: 'shortlisted' },
              { name: 'Held', _id: 'held' },
              { name: 'Rejected', _id: 'rejected' },
              { name: 'N/A', _id: 'na' }
            ]
          },
          {
            name: 'remarks',
            type: 'textarea',
            label: 'Overall Remarks'
          }

        ]
      },

      

    ]
  },


  // === Offer Acceptance === //

  [HRMSFormTypes.OFFER_ACCEPTANCE]: {
    formType: HRMSFormTypes.OFFER_ACCEPTANCE,
    title: 'Offer Acceptance Form',
    description: 'Record details of offer issuance and acceptance for a selected candidate',
    submitLabel: 'Submit Offer',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'candidate_info',
        title: 'Candidate Details',
        description: 'Basic details about the offer issued to the candidate',
        fields: [
          {
            name: 'candidateId',
            type: 'select',
            label: 'Candidate Name',
            options: [],
            required: true,
            placeholder: 'Select the candidate'
          },
          {
            name: 'position',
            type: 'text',
            label: 'Position',
            showIf: (values) => values?.candidateId !== '',
            disable: true
          },
          {
            name: 'offerDepartment',
            type: 'text',
            label: 'Department',
            showIf: (values) => values?.candidateId !== '',
            disable: true
          },


        ]
      },
      {
        id: 'offer_info',
        title: 'Offer Details',
        description: 'Basic details about the offer issued to the candidate',
        fields: [

          {
            name: 'offerIssueDate',
            type: 'date',
            label: 'Offer Issue Date',
            required: true
          },
          {
            name: 'offerStatus',
            type: 'select',
            label: 'Offer Status',
            options: [
              { name: 'Issued', _id: 'issued' },
              { name: 'Accepted', _id: 'accepted' },
              { name: 'Rejected', _id: 'rejected' }
            ]
          },

          {
            name: 'offerLetterUrl',
            type: 'file',
            label: 'Offer Letter',
            accept: '.pdf,.doc,.docx'
          }
        ]
      },
      {
        id: 'joining_info',
        title: 'Joining Details',
        description: '',

        fields: [
          {
            name: 'expectedJoiningDate',
            type: 'date',
            label: 'Expected Joining Date',
            showIf: (values) => values?.offerStatus === 'accepted',
          },
          {
            name: 'joiningImmediate',
            type: 'radio',
            label: 'Joining Immediate',
            showIf: (values) => values?.offerStatus === 'accepted',
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          },
          {
            name: 'reasonToTravel',
            type: 'textarea',
            label: 'Reason to Travel (If applicable)',
            showIf: (values) => values?.joiningImmediate === 'no',
          },
          {
            name: 'noOfDays',
            type: 'number',
            label: 'Number of Days',
            showIf: (values) => values?.joiningImmediate === 'no',
          },
          {
            name: 'remarks',
            type: 'textarea',
            label: 'Remarks',
            showIf: (values) => values?.offerStatus === 'accepted',
          },
        ]
      },
      {
        id: 'passport_info',
        title: 'Passport Details',
        description: 'Contact details and addresses',
        fields: [
          {
            name: 'passportInfo.passportNo',
            type: 'text',
            label: 'Passport Number',
            placeholder: 'Enter passport number',
            showIf: (values) => values?.offerStatus === 'accepted',
          },
          {
            name: 'passportInfo.issueDate',
            type: 'date',
            label: 'Date Of Issue',
            placeholder: 'Issue date of passport',
            showIf: (values) => values?.offerStatus === 'accepted',
          },
          {
            name: 'passportInfo.expiryDate',
            type: 'date',
            label: 'Date Of Expiry',
            placeholder: 'Expiry date of passport',
            showIf: (values) => values?.offerStatus === 'accepted',
          },
          {
            name: 'passportInfo.attachPassport',
            type: 'file',
            label: 'Upload Passport Copy',
            placeholder: 'Upload scanned copy of passport',
            accept: '.pdf,.jpg,.png',
            showIf: (values) => values?.offerStatus === 'accepted',
          },

        ]
      },
      {
        id: 'documents_info',
        title: 'Upload Documents',
        description: 'Contact details and addresses',
        fields: [
          {
            name: 'uploadDocuments.attachVisitVisa',
            type: 'file',
            label: 'Upload Visit Visa Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png',
            showIf: (values) => values?.offerStatus === 'accepted',
          },
          {
            name: 'uploadDocuments.attachVisaCancellation',
            type: 'file',
            label: 'Upload Visa Cancellation Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png',
            showIf: (values) => values?.offerStatus === 'accepted',
          },
          {
            name: 'uploadDocuments.attachEducationCertificates',
            type: 'file',
            label: 'Upload Education Certificates',
            placeholder: 'Expiry date of passport',
            accept: '.pdf,.jpg,.png',
            multiple: true,
            showIf: (values) => values?.offerStatus === 'accepted',
          },
          {
            name: 'uploadDocuments.passportSizePhoto',
            type: 'file',
            label: 'Upload Passport Size Photo',
            placeholder: 'Expiry date of passport',
            accept: '.jpg,.png',
            showIf: (values) => values?.offerStatus === 'accepted',
          },

        ]
      }

    ]
  },



  // === Business Trip Request Form ===
  [HRMSFormTypes.BUSINESS_TRIP_REQUEST]: {
    formType: HRMSFormTypes.BUSINESS_TRIP_REQUEST,
    title: 'Business Trip Request Form',
    description: 'Request for business travel and related approvals',
    submitLabel: 'Submit Request',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'employee_details',
        title: 'Traveller Details',
        description: 'Information about the traveler',
        fields: [
          {
            name: 'travellerType',
            type: 'select',
            label: 'Traveller Type',
            required: true,
            options: [] // Will be populated from API
          },
          {
            name: 'travellerName',
            type: 'text',
            label: 'Traveller Name',
            required: true,
            placeholder: 'Enter full name of the traveler'
          },
          {
            name: 'empId',
            type: 'text',
            label: 'Employee ID',
            showIf: (values) => values.travellerType === 'employee',
            placeholder: 'Employee ID'
          },
          {
            name: 'requestedDepartment',
            type: 'select',
            label: 'Department',
            required: true,
            showIf: (values) => values.travellerType === 'employee',
            options: [] // Will be populated from API
          },
          {
            name: 'requiredPosition',
            type: 'select',
            label: 'Designation',
            required: true,
            showIf: (values) => values.travellerType === 'employee',
            options: [] // Will be populated from API
          },

        ]
      },
      {
        id: 'trip_details',
        title: 'Travel Details',
        description: 'Information about the business travel',
        fields: [
          {
            name: 'placeOfVisit',
            type: 'text',
            label: 'Place of Visit (City & Country)',
            required: true,
            placeholder: 'e.g., Dubai, UAE'
          },
          {
            name: 'purposeOfVisit',
            type: 'textarea',
            label: 'Purpose of Visit',
            required: true,
            placeholder: 'Describe the business purpose of this trip'
          },
          {
            name: 'periodFrom',
            type: 'date',
            label: 'Travel Date From',
            required: true
          },
          {
            name: 'periodTo',
            type: 'date',
            label: 'Travel Date To',
            required: true
          }
        ]
      },
      {
        id: 'logistics',
        title: 'Logistics & Arrangements',
        description: 'Travel and accommodation arrangements',
        fields: [
          {
            name: 'cashAdvanceRequired',
            type: 'radio',
            label: 'Cash Advance Required',
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },

            ]
          },
          {
            name: 'cashAdvanceCurrency',
            type: 'select',
            label: 'Currency',
            placeholder: 'Select Currency',
            showIf: (values) => values.cashAdvanceRequired === 'yes',
            options: []
          },
          {
            name: 'cashAdvanceAmount',
            type: 'number',
            label: 'Cash Advance Amount',
            showIf: (values) => values.cashAdvanceRequired === 'yes',
            validation: { min: 0 }
          },
          {
            name: 'airTicketArrangedBy',
            type: 'select',
            label: 'Air Ticket Arranged By',
            required: true,
            options: []
          },
          {
            name: 'hotelArrangedBy',
            type: 'select',
            label: 'Hotel Arranged By',
            required: true,
            options: []
          },

          {
            name: 'remarks',
            type: 'textarea',
            label: 'Additional Remarks',
            placeholder: 'Any additional information or special requirements'
          },

          {
            name: 'requestedBySignature',
            type: 'text',
            label: 'Employee Signature',
            placeholder: 'Type your full name as signature',
            required: true,
          },


        ]
      },
      {
        id: 'reimbursements',
        title: 'Reimbursements',
        description: '',
        fields: [

          {
            name: 'airTicketreimbursement',
            type: 'checkbox',
            label: 'Air Ticket Reimbursement',
            required: false,
            showIf: (values) => values.airTicketArrangedBy === 'employee' || values.airTicketArrangedBy === 'guest',

          },
          {
            name: 'airTicketreimbursedTo',
            type: 'radio',
            label: 'Air Ticket Reimbursed To',
            required: false,
            showIf: (values) => values.airTicketreimbursement && (values.airTicketArrangedBy === 'employee' || values.airTicketArrangedBy === 'guest'),
            options: [
              { label: 'Guest', value: 'guest' },
              { label: 'Employee', value: 'employee' },

            ]
          },
          {
            name: 'hotelreimbursement',
            type: 'checkbox',
            label: 'Hotel Reimbursement',
            required: false,
            showIf: (values) => values.hotelArrangedBy === 'employee' || values.hotelArrangedBy === 'guest',
          },
          {
            name: 'hotelreimbursedTo',
            type: 'radio',
            label: 'Hotel Reimbursed To',
            required: false,
            showIf: (values) => values.hotelreimbursement && (values.hotelArrangedBy === 'employee' || values.hotelArrangedBy === 'guest'),
            options: [
              { label: 'Guest', value: 'guest' },
              { label: 'Employee', value: 'employee' },

            ]
          },
          {
            name: 'reimbursedCurrency',
            type: 'select',
            label: 'Currency',
            required: false,
            placeholder: 'Select Currency',
            options: [],
            showIf: (values) => values.hotelreimbursement || values.airTicketreimbursement,
          },
          {
            name: 'reimbursedAmount',
            type: 'number',
            label: 'Amount to be Reimbursed',
            required: false,
            validation: { min: 0 },
            showIf: (values) => values.hotelreimbursement || values.airTicketreimbursement,
          },
        ]
      }
    ]
  },

  // === New Employee Joining Form ===
  [HRMSFormTypes.NEW_EMPLOYEE_JOINING]: {
    formType: HRMSFormTypes.NEW_EMPLOYEE_JOINING,
    title: 'New Employee Joining Form',
    description: 'Employee onboarding and joining formalities',
    submitLabel: 'Submit Joining Form',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'basic_info',
        title: 'Basic Joining Detail',
        description: 'Essential details for the new employee',
        fields: [
          {
            name: 'employee',
            type: 'select',
            label: 'Employee name',
            required: true,
            options: []
          },
          {
            name: 'designation',
            type: 'select',
            label: 'Designation',
            disable: true,
            // required: true,
            options: [] // Will be populated from API
          },
          {
            name: 'department',
            type: 'select',
            label: 'Department/Section',
            disable: true,
            // required: true,
            options: [] // Will be populated from API
          },
          {
            name: 'workLocation',
            disable: true,
            type: 'select',
            label: 'Work Location',
            // required: true,
            options: [] // Will be populated from API
          },
          {
            name: 'reportingTo',
            type: 'select',
            label: 'Reporting To',
            required: true,
            options: [] // Will be populated from managers/supervisors
          },
          {
            name: 'dateOfReporting',
            type: 'date',
            label: 'Date of Reporting',
            required: true
          },
          {
            name: 'remarks',
            type: 'textarea',
            label: 'Remarks',
            placeholder: 'Any additional notes or instructions'
          }
        ]
      },
      // {
      //   id: 'hr_admin_section',
      //   title: 'For HR/ADMIN Use Only',
      //   description: 'Section to be filled by HR/Admin team',
      //   collapsible: true,
      //   defaultExpanded: false,
      //   fields: [
      //     {
      //       name: 'dateOfJoining',
      //       type: 'date',
      //       label: 'Actual Date of Joining'
      //     },
      //     {
      //       name: 'empId',
      //       type: 'text',
      //       label: 'Employee ID',
      //       placeholder: 'Will be auto-generated if not provided'
      //     }
      //   ]
      // },
    ]
  },

  // === Assets & IT Access Form ===
  [HRMSFormTypes.ASSETS_IT_ACCESS]: {
    formType: HRMSFormTypes.ASSETS_IT_ACCESS,
    title: 'Assets & IT Access Form',
    description: 'IT access and asset allocation for employees',
    submitLabel: 'Submit Request',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'employee_info',
        title: 'Employee Information',
        description: 'Basic employee details',
        fields: [
          {
            name: 'fullName',
            type: 'text',
            label: 'Employee Name',
            disable: true
          },
          {
            name: 'designation',
            type: 'select',
            label: 'Designation',
            disable: true,
            options: []
          },
          {
            name: 'department',
            type: 'select',
            label: 'Department/Section',
            disable: true,
            options: []
          },
          {
            name: 'reportingTo',
            type: 'select',
            label: 'Reporting To',
            disable: true,
            options: []
          },
          {
            name: 'itAccess.dateOfRequest',
            type: 'date',
            label: 'Date of Request',
            required: true,
          },
          {
            name: 'itAccess.email',
            type: 'email',
            label: 'Email ID (To be filled by IT)',
            placeholder: 'Company email address'
          },
          {
            name: 'itAccess.displayName',
            type: 'text',
            label: 'Preferred Display Name',
            placeholder: 'Display Name'
          },

        ]
      },

      {
        id: 'assets_hardware',
        title: 'IT Hardware/Software Assets Access',
        description: '',
        fields: [
          {
            name: 'itAccess.itHardwareAssets',
            type: 'checkbox-group',   // 👈 new type
            label: 'Hardwares',

            options: [
              { value: 'laptop', label: 'Laptop' },
              { value: 'cpu', label: 'CPU' },
              { value: 'monitor', label: 'Monitor' },
              {
                value: 'telephone-extension',
                label: 'Telephone Extension',

              },
              { value: 'mobile-phone', label: 'Mobile Phone' },
              { value: 'sim-card', label: 'Sim Card' },
              { value: 'keyboard-mouse', label: 'wireless Keyboard Mouse' },
              { value: 'wireless-mouse', label: 'Wireless Mouse' },
              { value: 'headphone', label: 'Headphone' }
            ]
          },
          // {
          //   name: 'itAccess.extensionType',
          //   type: 'radio',
          //   label: 'Telephone Extension Type',
          //   defaultValue: 'virtual',
          //   options: [
          //     { value: 'physical', label: 'Physical' },
          //     { value: 'virtual', label: 'Virtual' }
          //   ],
          //   showIf: (values) => Array.isArray(values.itAccess?.itHardwareAssets) && values.itAccess?.itHardwareAssets.includes('telephone-extension')
          // },

          {
            name: 'itAccess.itSoftwareAssets',
            type: 'checkbox-group',   // 👈 new type
            label: 'Softwares',

            options: [
              { value: 'oracle', label: 'Oracle Fusion' },
              { value: 'acrobat-pro', label: 'Acrobat Pro' },
              { value: 'tally', label: 'Tally' },
              { value: 'zw-cad', label: 'ZW CAD' },
              { value: 'autodesk', label: 'Autodesk' },
              { value: 'dwg-reader', label: 'DWG Reader' },
              { value: 'mbs', label: 'MBS' },
              { value: 'staad-pro', label: 'STAAD Pro' },
              { value: 'ram-connect', label: 'RAM Connect' },
              { value: 'idea-statica', label: 'IDEA StatiCa' },
              { value: 'sap-2000', label: 'SAP 2000' },
              { value: 'etabs', label: 'ETABS' },
              { value: 'cfs', label: 'CFS' },
              { value: 'tekla', label: 'Tekla' },
              { value: 'trimble-connect', label: 'Trimble Connect' }
            ]
          },
          {
            name: 'itAccess.workplaceApps',
            type: 'checkbox-group',   // 👈 new type
            label: 'Workplace Apps/Inhouse Apps',

            options: [
              { value: 'accurest', label: 'Accurest' },
              { value: 'inhouseApps', label: 'Inhouse Apps' },
              { value: 'aceroApps', label: 'Acero Applications' },
              { value: 'hrms', label: 'HRMS' },
              { value: 'e-invoice', label: 'E-Invoicing' },

            ]
          },

        ]
      },
      {
        id: 'assets_access',
        title: 'Access To Be Provided',
        description: '',
        fields: [
          {
            name: 'itAccess.accessToProvide',
            type: 'checkbox-group',   // 👈 new type
            label: 'Access To Provide',

            options: [
              { value: 'fullAccessInternet', label: 'Full Access Internet' },
              { value: 'limitedAccessInternet', label: 'Limited Access Internet' },
              { value: 'colorPrinter', label: 'Color Printer' },
              { value: 'blackWhitePrinter', label: 'Black And White Printer' },
              { value: 'networkDriveAccess', label: 'Network Drive Access' },
              { value: 'usb', label: 'USB' },
              { value: 'whatsapp', label: 'Whatsapp' },
              { value: 'emailGroups', label: 'Email Groups' },
            ]
          },
          {
            name: 'itAccess.othersAccess',
            type: 'checkbox-group',   // 👈 new type
            label: 'Others Access',

            options: [
              { value: 'stationarySet', label: 'Stationary Set' },
              { value: 'tools', label: 'Tools & Equipments' },
              { value: 'vehicle', label: 'Vehicle' },

            ]
          }
        ]
      }
    ]
  },

  // === Employee Information Form ===
  [HRMSFormTypes.EMPLOYEE_INFORMATION]: {
    formType: HRMSFormTypes.EMPLOYEE_INFORMATION,
    title: 'Employee Information Form',
    description: 'Comprehensive employee information and details',
    submitLabel: 'Submit Information',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'basic_info_hr',
        title: 'Basic Information By HR',
        description: 'Essential employee details',
        fields: [
          {
            name: 'fullName',
            type: 'text',
            label: 'Employee Name',
            disable: true,
            required: true,
            placeholder: 'Full name of the employee'
          },
          {
            name: 'employeeInfo.empId',
            type: 'text',
            label: 'Employee ID',
            required: true,
            placeholder: 'Employee identification number'
          },
          {
            name: 'designation',
            type: 'select',
            label: 'Designation',
            disable: true,

            options: []
          },
          {
            name: 'employeeInfo.grade',
            type: 'text',
            label: 'Grade',
            placeholder: 'Employee grade/level'
          },
          {
            name: 'department',
            type: 'select',
            label: 'Department',
            disable: true,
            options: []
          },
          {
            name: 'workLocation',
            type: 'select',
            label: 'Location',
            disable: true,
            options: []
          },
          {
            name: 'employeeInfo.dateOfJoining',
            type: 'date',
            label: 'Date of Joining',
            required: true
          },

          {
            name: 'category',
            type: 'select',
            label: 'Category',
            disable: true,
            options: []
          },

        ]
      },

      {
        id: 'salary_info_hr',
        title: 'For HR/Admin Use',
        description: 'Essential employee details',
        fields: [
          {
            name: 'employeeInfo.salaryDetails.basic',
            type: 'number',
            label: 'Basic Salary',
            placeholder: 'Enter basic salary',

            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.housingAllowance',
            type: 'number',
            label: 'Housing Allowance',
            placeholder: 'Enter housing allowance',
            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.transportAllowance',
            type: 'number',
            label: 'Transport Allowance',
            placeholder: 'Enter transport allowance',
            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.miscAllowance',
            type: 'number',
            label: 'Miscellaneous Allowance',
            placeholder: 'Enter misc allowance',
            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.mobileAllowance',
            type: 'number',
            label: 'Mobile Allowance',
            placeholder: 'Enter mobile allowance',
            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.foodAllowance',
            type: 'number',
            label: 'Food Allowance',
            placeholder: 'Enter food allowance',
            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.companyCarAllow',
            type: 'number',
            label: 'Company Car Allowance',
            placeholder: 'Enter company car allowance',
            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.petrolCard',
            type: 'number',
            label: 'Petrol Card',
            placeholder: 'Enter petrol card value',
            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.otherAllowance',
            type: 'number',
            label: 'Other Allowance',
            placeholder: 'Enter other allowance',
            min: 0
          },
          {
            name: 'employeeInfo.salaryDetails.totalSalary',
            type: 'text',
            label: 'Total Salary',
            placeholder: 'Auto-calculated total',
            disable: true,   // this one should be auto-calculated

          }
        ]
      },
      {
        id: 'basic_info',
        title: 'Employee Basic Details',
        description: 'Essential employee details',
        fields: [

          {
            name: 'dateOfBirth',
            type: 'date',
            label: 'Date of Birth',
            required: true
          },
          {
            name: 'nationality',
            type: 'select',
            label: 'Nationality',
            required: true,
            options: []
          },
          {
            name: 'gender',
            type: 'radio',
            label: 'Gender',
            required: true,
            options: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' }
            ]
          },
          {
            name: 'maritalStatus',
            type: 'radio',
            label: 'Marital Status',
            required: true,
            options: [
              { label: 'Single', value: 'single' },
              { label: 'Married', value: 'married' }
            ]
          },
          {
            name: 'employeeInfo.religion',
            type: 'text',
            label: 'Religion',
            placeholder: 'Employee religion'
          },
          {
            name: 'employeeInfo.bloodGroup',
            type: 'text',
            label: 'Blood Group',
            placeholder: 'e.g., A+, B-, O+'
          },

          {
            name: 'employeeInfo.homeTownAirport',
            type: 'text',
            label: 'Home Town Airport',
            placeholder: 'Home town airport'
          },

        ]
      },
      {
        id: 'family_details',
        title: 'Family Details',
        description: 'Information about family members',
        fields: [
          {
            name: 'employeeInfo.familyDetails.fatherName',
            type: 'text',
            label: "Father's Name",
            placeholder: "Enter father's full name"
          },
          {
            name: 'employeeInfo.familyDetails.fatherNationality._id',
            type: 'select',
            label: "Nationality",
            options: []
          },
          {
            name: 'employeeInfo.familyDetails.motherName',
            type: 'text',
            label: "Mother's Name",
            placeholder: "Enter mother's full name"
          },
          {
            name: 'employeeInfo.familyDetails.motherNationality._id',
            type: 'select',
            label: "Nationality",
            options: []
          },
          {
            name: 'employeeInfo.familyDetails.spouseName',
            type: 'text',
            label: "Spouse Name",
            placeholder: "Enter spouse full name"
          },
          {
            name: 'employeeInfo.familyDetails.spouseNationality._id',
            type: 'select',
            label: "Nationality",
            options: []
          },
          {
            name: 'employeeInfo.familyDetails.child1Name',
            type: 'text',
            label: "First Child Name",
            placeholder: "Enter first child full name"
          },
          {
            name: 'employeeInfo.familyDetails.child1Nationality._id',
            type: 'select',
            label: "Nationality",
            options: []
          },
          {
            name: 'employeeInfo.familyDetails.child2Name',
            type: 'text',
            label: "Second Child Name",
            placeholder: "Enter second child full name"
          },
          {
            name: 'employeeInfo.familyDetails.child2Nationality._id',
            type: 'select',
            label: "Nationality",
            options: []
          },
          {
            name: 'employeeInfo.familyDetails.child3Name',
            type: 'text',
            label: "Third Child Name",
            placeholder: "Enter third child full name"
          },
          {
            name: 'employeeInfo.familyDetails.child3Nationality._id',
            type: 'select',
            label: "Nationality",
            options: []
          },
        ]
      },
      {
        id: 'contact_info',
        title: 'Contact Details',
        description: 'Contact details and addresses',
        fields: [
          {
            name: 'employeeInfo.contacts.contactAddressUAE',
            type: 'textarea',
            label: 'Contact Address (UAE)',
            placeholder: 'Current address in UAE'
          },
          {
            name: 'employeeInfo.contacts.phoneNumberUAE',
            type: 'number',
            label: 'Phone Number (UAE)',
            placeholder: '+971-XX-XXXXXXX'
          },
          {
            name: 'employeeInfo.contacts.contactAddressHomeCountry',
            type: 'textarea',
            label: 'Contact Address (Home Country)',
            placeholder: 'Address in home country'
          },
          {
            name: 'employeeInfo.contacts.phoneNumberHomeCountry',
            type: 'number',
            label: 'Phone Number (Home Country)',
            placeholder: 'Include country code'
          },
          {
            name: 'employeeInfo.contacts.emailId',
            type: 'email',
            label: 'Personal Email Address',
            placeholder: 'employee.email@company.com'
          },
          {
            name: 'employeeInfo.contacts.emergencyContactNumber',
            type: 'number',
            label: 'Emergency Contact Number',
            placeholder: 'Emergency contact number'
          }
        ]
      },

    ]
  },

  // === Beneficiary Declaration Form ===
  [HRMSFormTypes.BENEFICIARY_DECLARATION]: {
    formType: HRMSFormTypes.BENEFICIARY_DECLARATION,
    title: 'Beneficiary Declaration Form',
    description: 'Declaration of beneficiaries for employee benefits',
    submitLabel: 'Submit Declaration',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'employee_info',
        title: 'Employee Information',
        description: 'Basic employee details',
        fields: [
          {
            name: 'fullName',
            type: 'text',
            label: 'Employee Name',
            disable: true,
            placeholder: 'Full name of the employee'
          },
          {
            name: 'employeeInfo.empId',
            type: 'text',
            label: 'Employee ID',
            disable: true,
            placeholder: 'Employee identification number'
          },
          {
            name: 'department',
            type: 'select',
            label: 'Department',
            disable: true,
            options: []
          },
          {
            name: 'designation',
            type: 'select',
            label: 'Designation',
            disable: true,
            options: []
          },


        ]
      },
      {
        id: 'beneficiary_details',
        title: 'Beneficiary Details',
        description: 'Information about your beneficiaries',
        fields: [
          {
            name: 'employeeInfo.beneficiaryInfo.name',
            type: 'text',
            label: 'Beneficiary Name',
            required: true,
            placeholder: 'Full name of primary beneficiary'
          },
          {
            name: 'employeeInfo.beneficiaryInfo.relation',
            type: 'text',
            label: 'Relationship',
            required: true,
            placeholder: 'Relation with the beneficiary (e.g., Spouse, Child)'
          },

          {
            name: 'employeeInfo.beneficiaryInfo.addressAndContact',
            type: 'textarea',
            label: 'Contact Details',
            required: true,
            placeholder: 'Address and phone number of the beneficiary'
          },

        ]
      },

      {
        id: 'declaration',
        title: 'Declaration',
        description: 'I declare that the information provided above is true and accurate',
        fields: [

          {
            name: 'employeeInfo.beneficiaryInfo.declaration.employeeSignature',
            type: 'text',
            label: 'Employee Signature',
            placeholder: 'Type your full name as signature',
            required: true
          },
          {
            name: 'employeeInfo.beneficiaryInfo.declaration.declarationDate',
            type: 'date',
            label: 'Declaration Date',
            required: true,
            defaultValue: new Date().toISOString()
          },
          {
            name: 'employeeInfo.beneficiaryInfo.declaration.attachBeneficiaryDeclaration',
            type: 'file',
            label: 'Upload Beneficiary Declaration Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png'
          },

        ]
      },
      {
        id: 'hrAdmin_section',
        title: 'For HR/Admin Use Only',
        description: '',
        fields: [

          {
            name: 'employeeInfo.beneficiaryInfo.hrAdmin.departmentSignature',
            type: 'text',
            label: 'HR/Admin Department Signature',
            placeholder: 'Signature by HR/Admin Department',

          },
          {
            name: 'employeeInfo.beneficiaryInfo.hrAdmin.departmentSignatureDate',
            type: 'date',
            label: 'Signature Date',

            defaultValue: new Date().toISOString()
          },

          {
            name: 'employeeInfo.beneficiaryInfo.hrAdmin.headHrAdminSignature',
            type: 'text',
            label: 'Head Of HR/Admin Signature',
            placeholder: 'Signature by Head Of HR/Admin Department',

          },
          {
            name: 'employeeInfo.beneficiaryInfo.hrAdmin.headSignatureDate',
            type: 'date',
            label: 'Signature Date',

            defaultValue: new Date().toISOString()
          },
          {
            name: 'employeeInfo.beneficiaryInfo.hrAdmin.remarks',
            type: 'text',
            label: 'Remarks',
            placeholder: 'Remarks by HR/Admin',

          },
        ]
      }
    ]
  },

  // === Accommodation/Transport Consent Form ===
  [HRMSFormTypes.ACCOMMODATION_TRANSPORT_CONSENT]: {
    formType: HRMSFormTypes.ACCOMMODATION_TRANSPORT_CONSENT,
    title: 'Accommodation/Transportation Consent Form',
    description: 'Employee consent for accommodation and transportation',
    submitLabel: 'Submit Consent',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'employee_details',
        title: 'Employee Information',
        description: 'Basic employee details',
        fields: [
          {
            name: 'fullName',
            type: 'text',
            label: 'Employee Name',
            disable: true,
            placeholder: 'Full name of the employee'
          },
          {
            name: 'employeeInfo.empId',
            type: 'text',
            label: 'Employee ID',
            disable: true,
            placeholder: 'Employee identification number'
          },

          {
            name: 'department',
            type: 'select',
            label: 'Department',
            disable: true,
            options: []
          },
          {
            name: 'designation',
            type: 'select',
            label: 'Designation',
            disable: true,
            options: []
          },

        ]
      },
      {
        id: 'transportation_options',
        title: 'Transportation Options',
        description: 'Choose your transportation preference',
        fields: [
          {
            name: 'employeeInfo.consentInfo.transportationPreference',
            type: 'radio',
            label: 'Transportation Preference',
            required: true,
            options: [
              { label: 'Company Provided Transportation', value: 'company_provided' },
              { label: 'Own Transportation', value: 'own_transportation' }
            ]
          },
          {
            name: 'employeeInfo.consentInfo.pickUpPoint',
            type: 'text',
            label: 'Place/Pick Up Point',
            placeholder: 'Place or pick up point',
            showIf: (values) => values.employeeInfo?.consentInfo?.transportationPreference === 'company_provided'
          },
          {
            name: 'employeeInfo.consentInfo.pickUpCity',
            type: 'text',
            label: 'City',
            placeholder: 'City name',
            showIf: (values) => values.employeeInfo?.consentInfo?.transportationPreference === 'company_provided'
          },
          {
            name: 'employeeInfo.consentInfo.deductionAmountTransportation',
            type: 'number',
            label: 'Amount to be Deducted (if any)',
            placeholder: 'Deduction amount from salary',
            showIf: (values) => values.employeeInfo?.consentInfo?.transportationPreference === 'company_provided'
          }
        ]
      },
      {
        id: 'accommodation_options',
        title: 'Accommodation Options',
        description: 'Choose your accommodation preference',
        fields: [
          {
            name: 'employeeInfo.consentInfo.accomodationPreference',
            type: 'radio',
            label: 'Accomodation Preference',
            required: true,
            options: [
              { label: 'Company Provided Accomodation', value: 'company_provided' },
              { label: 'Own Accomodation', value: 'own_accomodation' }
            ]
          },
          {
            name: 'employeeInfo.consentInfo.flatRoomNo',
            type: 'text',
            label: 'Flat/Room No',
            placeholder: 'Flat or room number',
            showIf: (values) => values.employeeInfo?.consentInfo?.accomodationPreference === 'company_provided'
          },
          {
            name: 'employeeInfo.consentInfo.accomodatedDate',
            type: 'date',
            label: 'Accomodated From',
            placeholder: 'Pick a date',
            showIf: (values) => values.employeeInfo?.consentInfo?.accomodationPreference === 'company_provided'
          },
          {
            name: 'employeeInfo.consentInfo.location',
            type: 'text',
            label: 'Location',
            placeholder: 'Location of the accomodation',
            showIf: (values) => values.employeeInfo?.consentInfo?.accomodationPreference === 'company_provided'
          },
          {
            name: 'employeeInfo.consentInfo.deductionAmountAccomodation',
            type: 'number',
            label: 'Amount to be Deducted (if any)',
            placeholder: 'Deduction amount from salary',
            showIf: (values) => values.employeeInfo?.consentInfo?.accomodationPreference === 'company_provided'
          }
        ]
      },

      {
        id: 'consent_declaration',
        title: 'Consent & Declaration',
        description: 'Employee consent and declarations',
        fields: [
          {
            name: 'employeeInfo.consentInfo.declaration.declarationDate',
            type: 'date',
            label: 'Declaration Date',
            required: true,
            defaultValue: new Date().toISOString()
          },
          {
            name: 'employeeInfo.consentInfo.declaration.employeeSignature',
            type: 'text',
            label: 'Employee Signature',
            placeholder: 'Type your full name as signature',
            required: true
          },
          {
            name: 'employeeInfo.consentInfo.declaration.attachDeclaration',
            type: 'file',
            label: 'Upload Consent Declaration Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png'
          },

        ]
      }
    ]
  },



  // === Non-Disclosure Agreement Form ===
  [HRMSFormTypes.NON_DISCLOSURE_AGREEMENT]: {
    formType: HRMSFormTypes.NON_DISCLOSURE_AGREEMENT,
    title: 'Non-Disclosure Agreement',
    description: 'Standard and custom non-disclosure agreements',
    submitLabel: 'Submit Agreement',
    saveDraftLabel: 'Save as Draft',
    sections: [
      {
        id: 'nda_Info_Details',
        title: 'Agreement Details',
        description: 'Information about the involved parties and the agreement date.',
        fields: [
          {
            name: 'employeeInfo.ndaInfo.data',
            type: 'label',
            label: `This agreement is made as of (date)  __ / __  / __  , by ___________ and between Acero Building Systems and its affiliate Companies with principal offices at Dubai, UAE , (The Company), and 	(The Employee).
Purpose: The Company and The Employee wish to enter an employment relationship in connection with which The Company will disclose its Confidential Information(as defined below) to the Employee(The Relationship).

Definition of Confidential Information: Confidential Information means any information or know- how, including but not limited to, that which relates to business strategy, research, product plans, products, services, customers, markets, software, developments, inventions, processes, designs, marketing or finances of The Company, which all shall be deemed as Confidential Information.Confidential Information does not include information or know how which(i) is in the possession of the employee at the time of disclosure as shown by the employee’s files and records immediately prior to the time of disclosure, or(ii) prior to or after the time of disclosure becomes part of the public knowledge or literature other than as a result of any improper inaction or action of The Employee or, (iii) is approved by The Company, in writing, for release.
Nondisclosure of Confidential Information: The Employee agrees not to use any Confidential Information disclosed to him/ her by The Company for any purpose outside of its own operations.The Employee will not disclose any Confidential Information of the Company to parties outside the Relationship or to other employees of The Company other than employees or agents under appropriate burden of confidentiality and who are required to have the information in order to carry out their duties.The Employee agrees that he/ she will take all reasonable measures to protect the secrecy of and avoid disclosure or use of Confidential Information of The Company in order to prevent it from falling into the public domain or the possession of persons other than those persons authorized under this Agreement to have any such information.
    Publicity: The Employee will not, without prior consent of the other party, disclose the confidential information of the company disclosed to the employee to any other person under this agreement, and will not disclose any discussions or negotiations taking place between the parties, except as required by law and then only with prior notice to The Company.
Return of Materials: Any materials or documents that have been furnished by The Company to the Employee in connection with The Relationship will be promptly returned by The Employee, accompanied by all copies of such documentation or certification of destruction, at the time of the Employee’s separation from the Company.
Patent or Copyright Infringement: The company has not granted any rights to The Employee with regards to The Company’s rights to patents and copyrights.The Employee is not authorized to reproduce the Company’s material, to benefit people not in the Company’s direct employment.
    Period: The forgoing commitments of each party shall be valid for a period of two years from separation of the employment.
Successors and Assigns: This agreement shall be binding upon and for the benefits of the undersigned parties, their successors and assigns, provided that Confidential Information of The Company may not be assigned without the prior written consent of The Company.Failure to enforce any provision of this Agreement shall not constitute a waiver of any term hereof.
Governing Law: This agreement shall be governed by and enforced in accordance with the laws of the UAE employed region and shall be binding upon The Employee in the UAE and worldwide.
    Remedies: The Employee agrees that any violation or threatened violation may cause irreparable injury, both financial and strategic, to The Company and in addition to any and all remedies that may be available, in law, in equity or otherwise; The Company may choose to pursue legal action against The Employee.
    In Witness whereof, this Nondisclosure Agreement is executed as of the date first above written.`,

          },


        ]
      },
      {
        id: 'parties_info',
        title: 'Agreement Details',
        description: 'Information about the involved parties and the agreement date.',
        fields: [

          {
            name: 'employeeInfo.ndaInfo.aggrementDate',
            type: 'date',
            label: 'Agreement Date',
            required: true,
            defaultValue: new Date().toISOString()
          },
          {
            name: 'fullName',
            type: 'text',
            label: 'Employee Name',
            disable: true,
            placeholder: 'Full name of the employee'
          },
          {
            name: 'employeeInfo.ndaInfo.attachNda',
            type: 'file',
            label: 'Upload Signed Aggrement Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png'
          },

        ]
      },

    ]
  },

  // === Induction Program Form ===
  [HRMSFormTypes.EMPLOYEE_ORIENTATION]: {
    formType: HRMSFormTypes.EMPLOYEE_ORIENTATION,
    title: 'Employee Orientation Program',
    description: 'Orientation and onboarding program for new employees',
    submitLabel: 'Submit Orientation Form',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'employee_details',
        title: 'Employee Details',
        description: 'Basic employee details',
        fields: [
          {
            name: 'fullName',
            type: 'text',
            label: 'Employee Name',
            disable: true,
            placeholder: 'Full name of the employee'
          },
          {
            name: 'employeeInfo.empId',
            type: 'text',
            label: 'Employee ID',
            disable: true,
            placeholder: 'Employee identification number'
          },

          {
            name: 'department',
            type: 'select',
            label: 'Department',
            disable: true,
            options: []
          },
          {
            name: 'designation',
            type: 'select',
            label: 'Designation',
            disable: true,
            options: []
          },
          {
            name: 'employeeInfo.dateOfJoining',
            type: 'date',
            label: 'Date Of Joining',
            disable: true,
            options: []
          },

        ]
      },
      {
        id: 'program_contents',
        title: 'Orientation Program Details',
        description: 'Details of each induction step',
        fields: [

          {
            name: 'induction.steps.step1.contentHeader',
            type: 'label',
            label: 'About Acero Building Systems',
            disable: true
          },
          {
            name: 'induction.steps.step1.conductedByHeader',
            type: 'label',
            label: 'HR & Admin Department',
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step1.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step1.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },


          // Step 2
          {
            name: 'induction.step2.contentHeader',
            type: 'label',
            label: `HR Policy & Procedures:
          • Working Days/Hours
          • Leave Entitlement
          • Performance Assessments
          • Training and Advancement
          • Legal Requirements
          • Employee Relations`,
            disable: true
          },
          {
            name: 'induction.step2.conductedByHeader',
            type: 'label',
            label: 'HR & Admin Department',
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step2.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step2.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // Step 3
          {
            name: 'induction.step3.contentHeader',
            type: 'label',
            label: 'Administrative Facilities',
            disable: true
          },
          {
            name: 'induction.step3.conductedByHeader',
            type: 'label',
            label: 'HR & Admin Department',
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step3.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step3.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // Step 4
          {
            name: 'induction.step4.contentHeader',
            type: 'label',
            label: 'Introduction of Employee’s Department',
            disable: true
          },
          {
            name: 'induction.step4.conductedByHeader',
            type: 'label',
            label: `Employee's Department`,
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step4.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step4.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // Step 5
          {
            name: 'induction.step5.contentHeader',
            type: 'label',
            label: 'Employee’s Roles and Responsibilities',
            disable: true
          },
          {
            name: 'induction.step5.conductedByHeader',
            type: 'label',
            label: `Employee's Department`,
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step5.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step5.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // Step 6
          {
            name: 'induction.step6.contentHeader',
            type: 'label',
            label: 'Initial Job instructions and assignments',
            disable: true
          },
          {
            name: 'induction.step6.conductedByHeader',
            type: 'label',
            label: `Reporting Manager/Head`,
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step6.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step6.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // Step 7
          {
            name: 'induction.step7.contentHeader',
            type: 'label',
            label: 'Company Quality Policy and Procedure',
            disable: true
          },
          {
            name: 'induction.step7.conductedByHeader',
            type: 'label',
            label: `QA/QC Department`,
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step7.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step7.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // Step 8
          {
            name: 'induction.step8.contentHeader',
            type: 'label',
            label: 'QMS/EMS/SMS Awareness',
            disable: true
          },
          {
            name: 'induction.step8.conductedByHeader',
            type: 'label',
            label: `Management Representative`,
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step8.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step8.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // Step 9
          {
            name: 'induction.step9.contentHeader',
            type: 'label',
            label: 'Health & Safety Policy and Procedure',
            disable: true
          },
          {
            name: 'induction.step9.conductedByHeader',
            type: 'label',
            label: `HSE Department`,
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step9.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step9.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // Step 10
          {
            name: 'induction.step10.contentHeader',
            type: 'label',
            label: 'IT Access and Policy (For Staffs)',
            disable: true
          },
          {
            name: 'induction.step10.conductedByHeader',
            type: 'label',
            label: `IT Department`,
            disable: true
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step10.signature',
            type: 'labeltext',
            label: 'Conducted By',
            placeholder: 'Conducted By Name'
          },
          {
            name: 'employeeInfo.orientationInfo.steps.step10.date',
            type: 'labeldate',
            label: 'Date',
            placeholder: 'Conducted On Date'
          },

          // ⬇️ Continue similarly for all remaining steps (Department Intro, Roles & Responsibilities, Job Instructions, QA/QC, Management Rep, HSE, IT, etc.)
        ]
      },
      {
        id: 'final_signoff',
        title: 'Final Endorsements',
        description: 'Attended and reviewed by concerned departments',
        fields: [
          {
            name: 'employeeInfo.orientationInfo.attendedBy.signature',
            type: 'text',
            label: 'Attended By (New Employee) - Signature'
          },
          {
            name: 'employeeInfo.orientationInfo.attendedBy.date',
            type: 'date',
            label: 'Date'
          },
          {
            name: 'employeeInfo.orientationInfo.endorsedBy.signature',
            type: 'text',
            label: 'Endorsed By (Department Head) - Signature'
          },
          {
            name: 'employeeInfo.orientationInfo.endorsedBy.date',
            type: 'date',
            label: 'Date'
          },
          {
            name: 'employeeInfo.orientationInfo.reviewedBy.signature',
            type: 'text',
            label: 'Reviewed By (HR/Admin) - Signature'
          },
          {
            name: 'employeeInfo.orientationInfo.reviewedBy.date',
            type: 'date',
            label: 'Date'
          },
          {
            name: 'employeeInfo.orientationInfo.approvedBy.signature',
            type: 'text',
            label: 'Approved By (Head of HR) - Signature'
          },
          {
            name: 'employeeInfo.orientationInfo.approvedBy.date',
            type: 'date',
            label: 'Date'
          }
        ]
      }
    ]
  },

  // === Non-Disclosure Agreement Form ===
  [HRMSFormTypes.VISA_PROCESS]: {
    formType: HRMSFormTypes.VISA_PROCESS,
    title: 'Medical & Visa Process',
    description: '',
    submitLabel: 'Submit',
    saveDraftLabel: 'Save as Draft',
    sections: [
      {
        id: 'employee_info',
        title: 'Employee Details',
        description: 'Information about the involved parties and the agreement date.',
        fields: [

          {
            name: 'fullName',
            type: 'text',
            label: 'Employee Name',
            disable: true,
            placeholder: 'Full name of the employee'
          },
          {
            name: 'employeeInfo.empId',
            type: 'text',
            label: 'Employee ID',
            disable: true,
            placeholder: 'Employee Identification number'
          },

        ]
      },
      {
        id: 'visa_info',
        title: 'Medical & Visa Details',
        description: 'Information about the involved parties and the agreement date.',
        fields: [


          {
            name: 'employeeInfo.visaInfo.visaIssueDate',
            type: 'date',
            label: 'Visa Issue Date',
            placeholder: 'Visa Issue Date',
          },
          {
            name: 'employeeInfo.visaInfo.visaExpiryDate',
            type: 'date',
            label: 'Visa Expiry Date',
            placeholder: 'Visa Expiry Date',
          },
          {
            name: 'employeeInfo.visaInfo.visaFileNo',
            type: 'text',
            label: 'Visa File Number',
            placeholder: 'Visa File Number'
          },
          {
            name: 'employeeInfo.visaInfo.emiratesIdNo',
            type: 'text',
            label: 'Emirates ID Number',
            placeholder: 'Emirates ID Number'
          },
          {
            name: 'employeeInfo.visaInfo.emiratesIdIssueDate',
            type: 'date',
            label: 'Emirates ID Issue Date',
            placeholder: 'Visa Issue Date',
          },
          {
            name: 'employeeInfo.visaInfo.emiratesIdExpiryDate',
            type: 'date',
            label: 'Emirates ID Expiry Date',
            placeholder: 'Visa Expiry Date',
          },
          {
            name: 'employeeInfo.visaInfo.workPermitNo',
            type: 'text',
            label: 'Work Permit Number',
            placeholder: 'Work Permit Number'
          },
          {
            name: 'employeeInfo.visaInfo.visaType._id',
            type: 'select',
            label: 'Visa Type',
            placeholder: 'Visa Type',
            options: []
          },
          {
            name: 'employeeInfo.visaInfo.laborCardExpiryDate',
            type: 'date',
            label: 'Labor Card Expiry Date',
            placeholder: 'Labor Card Expiry Date',
          },
          {
            name: 'employeeInfo.visaInfo.iloeExpiryDate',
            type: 'date',
            label: 'ILOE Expiry Date',
            placeholder: 'ILOE Expiry Date',
          },
          {
            name: 'employeeInfo.visaInfo.medicalInsuranceProvider',
            type: 'text',
            label: 'Medical Insurance Provider',
            placeholder: 'Medical Insurance Provider'
          },

        ]
      },

      {
        id: 'upload_info',
        title: 'Upload Documents',
        description: 'Information about the involved parties and the agreement date.',
        fields: [

          {
            name: 'employeeInfo.visaInfo.attachVisa',
            type: 'file',
            label: 'Upload Visa Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png'
          },
          {
            name: 'employeeInfo.visaInfo.attachEmiratesId',
            type: 'file',
            label: 'Upload Emirates Id Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png'
          },
          {
            name: 'employeeInfo.visaInfo.attachLaborCard',
            type: 'file',
            label: 'Upload Labor Card Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png'
          },
          {
            name: 'employeeInfo.visaInfo.attachIloe',
            type: 'file',
            label: 'Upload ILOE Copy',
            placeholder: '',
            accept: '.pdf,.jpg,.png'
          },

        ]
      },

    ]
  },

  // === Employee Performance Appraisal Form ===
  [HRMSFormTypes.PERFORMANCE_APPRAISAL]: {
    formType: HRMSFormTypes.PERFORMANCE_APPRAISAL,
    title: 'Employee Performance Appraisal Form',
    description: '',
    submitLabel: 'Submit Appraisal',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'employee_info',
        title: 'Employee Information',
        description: 'Basic details about the employee being appraised',
        fields: [
          {
            name: 'employeeDept',
            type: 'select',
            label: 'Employee Name',
            placeholder: 'Select Employee',
            required: true,
            options: [] // Populate from Employee collection
          },

          {
            name: 'evaluationDate',
            type: 'date',
            label: 'Date of Evaluation',
            placeholder: 'Select Evaluation Date'
          }
        ]
      },


      {
        id: 'evaluation_section',
        title: 'Evaluation (For Department Manager)',
        description: 'Evaluate the employee on the following parameters (1–5, 1-Poor / 5-Very Good)',
        visibleFor: ['Manager'],
        fields: [
          {
            name: 'evaluationParameters',
            type: 'evaluation',
            title: 'Evaluation (For Department Manager)',
            label: 'Evaluation Parameters',
            subFields: [
              {
                name: 'parameterTitle',
                type: 'label', // display only
                label: 'Parameter',
                style: 'font-bold'
              },
              {
                name: 'parameterDescription',
                type: 'label', // display only
                label: 'Description'
              },
              {
                name: 'score',
                type: 'number', // input for score
                label: 'Rating (1–5)',
                min: 1,
                max: 5,
                placeholder: 'Enter score 1–5'
              }
            ],
            defaultValue: [
              {
                parameterName: 'Knowledge of Job',
                description:
                  'Familiar with duties and requirements of this position and knows the methods and practices to perform the job. Knowledge gained through experience, education and training.',
                score: ''
              },
              {
                parameterName: 'Productivity',
                description:
                  'Uses working time effectively, plans and prioritizes work, sets and accomplishes goals, and completes assignments on schedule.',
                score: ''
              },
              {
                parameterName: 'Quality of Work',
                description:
                  'Completes duties successfully within estimated time, with output meeting expectations.',
                score: ''
              },
              {
                parameterName: 'Adaptability',
                description:
                  'Ability to learn quickly, adapt to changes in job assignments, methods, and personnel.',
                score: ''
              },
              {
                parameterName: 'Dependability',
                description:
                  'Reliability in performing work assignments, following instructions, taking responsibility, and requiring minimal supervision.',
                score: ''
              },
              {
                parameterName: 'Communication Skills',
                description:
                  'Ability to communicate effectively in oral and written form with internal and external stakeholders.',
                score: ''
              },
              {
                parameterName: 'Initiative and Resourcefulness',
                description:
                  'Contributes ideas, develops/carries out new methods, is a self-starter, anticipates needs, and seeks extra tasks.',
                score: ''
              },
              {
                parameterName: 'Team Orientation',
                description:
                  'Works effectively with superiors, peers, subordinates, and customers.',
                score: ''
              },
              {
                parameterName: 'Attendance and Punctuality',
                description:
                  'Reports to work on time, stays on the job, observes time limits for breaks/lunch, and gives prompt notice for absence.',
                score: ''
              },
              {
                parameterName: 'Organizational Obligations',
                description:
                  'Fits into company culture/values, shows loyalty, goes beyond boundaries, and commits to organizational success.',
                score: ''
              }
            ]
          },

        ]
      },
      {
        id: 'employee_response',
        title: 'Employee Response',
        description: '',
        fields: [

          {
            name: 'employeeResponse.reviewed',
            type: 'checkbox',
            label: 'I have reviewed this document and discussed the contents with my reporting head and I have been advised of my performance status.',

          },
          {
            name: 'employeeResponse.signature',
            type: 'text',
            label: 'Employee Signature',

          },
          {
            name: 'employeeResponse.comments',
            type: 'textarea',
            label: 'Comments',
            placeholder: 'Enter your comments here',

          },
          {
            name: 'employeeResponse.date',
            type: 'date',
            label: 'Date',
            placeholder: 'Select Date'
          },

        ]
      },

      {
        id: 'dep_head_feedback',
        title: 'Reporting/Department Head Feedback',
        description: '',
        fields: [

          {
            name: 'depHeadFeedback.findings',
            type: 'textarea',
            label: 'Significant findings of the Evaluations',
            placeholder: '',
          },
          {
            name: 'depHeadFeedback.trainingRecommenedation',
            type: 'textarea',
            label: 'Training recommended to the employee',
            placeholder: '',
          },
          {
            name: 'depHeadFeedback.otherRecommenedation',
            type: 'textarea',
            label: 'Any other Recommendations',
            placeholder: '',
          },
          {
            name: 'depHeadFeedback.signature',
            type: 'text',
            label: 'Signature',

          },

          {
            name: 'depHeadFeedback.date',
            type: 'date',
            label: 'Date',
            placeholder: 'Select Date'
          },

        ]
      },

      {
        id: 'hr_admin_use',
        title: 'For HR/Admin Use',
        description: '',
        fields: [

          {
            name: 'purposeOfEvaluation',
            type: 'radio',
            label: 'Purpose of the review',
            options: [
              { label: 'Annual Review', value: 'annual_review' },
              { label: 'Probation Completion', value: 'probation_completion' },
              { label: 'Increment', value: 'increment' },
              { label: 'Promotion', value: 'promotion' },
              { label: 'Department Transfer', value: 'department_transfer' },
              { label: 'Job Transfer', value: 'job_transfer' },
              { label: 'Intermediate Review', value: 'intermediate_review' },]
          },

        ]
      },

    ]
  },

  // === Employee Performance Appraisal Form ===
  [HRMSFormTypes.OFFBOARDING]: {
    formType: HRMSFormTypes.OFFBOARDING,
    title: 'Offboarding Process',
    description: '',
    submitLabel: 'Submit Request',
    saveDraftLabel: 'Save Draft',
    sections: [
      {
        id: 'employee_info',
        title: 'Employee Information',
        description: 'Basic details about the employee being appraised',
        fields: [
          {
            name: 'employee',
            type: 'select',
            label: 'Employee Name',
            placeholder: 'Select Employee',
            required: true,
            options: [] // Populate from Employee collection
          },

          {
            name: 'releavingDate',
            type: 'date',
            label: 'Last Working Date',
            placeholder: 'Select Last Working Date'
          }
        ]
      },


      {
        id: 'offboarding_handover',
        title: 'Offboarding Handover Checklist',
        description: 'Checklist of items to be handed over by the employee before exit',
        visibleFor: ['Manager', 'HR'],
        fields: [
          {
            name: 'handoverDetails',
            type: 'handover',
            title: 'Department-wise Handover',
            label: 'Handover Checklist',
            subFields: [
              {
                name: 'department',
                type: 'label',
                label: 'Department',
                style: 'font-bold'
              },
              {
                name: 'taskDescription',
                type: 'arrayLabel', // display multiple tasks
                label: 'Handover Task / Item Description'
              },
              {
                name: 'remarks',
                type: 'text',
                label: 'Remarks'
              },
              {
                name: 'signature',
                type: 'text',
                label: 'Signature'
              }
            ],
            defaultValue: [
              {
                department: "Employee Department",
                taskDescription: [{
                  description: "Documents and Records", remarks: "",
                  signature: "",
                }, {
                  description: "Job Handover", remarks: "",
                  signature: "",
                }, {
                  description: "Emails to be forwarded (provide Email ID)", remarks: "",
                  signature: "",
                }

                ],
              },
              {
                department: 'Finance',

                taskDescription: [{
                  description: "Outstanding Amount Cleared", remarks: "",
                  signature: "",
                }, {
                  description: "Petty Cash Cleared", remarks: "",
                  signature: "",
                }, {
                  description: "Others", remarks: "",
                  signature: "",
                }

                ],
              },
              {
                department: 'IT',
                taskDescription: [{
                  description: "Laptop / Desktop", remarks: "",
                  signature: "",
                }, {
                  description: "Mobile Phone / Sim Card", remarks: "",
                  signature: "",
                }, {
                  description: "User Name and Passwords", remarks: "",
                  signature: "",
                },
                {
                  description: "Biometric Access closed on LWD", remarks: "",
                  signature: "",
                }

                ],

              },
              {
                department: 'Material Control / Stores',
                taskDescription: [{
                  description: "Tools and Equipment’s", remarks: "",
                  signature: "",
                },

                ],


              },
              // {
              //   department: 'Accommodation In charge',
              //   taskDescription: ['Accommodation Items and Locker Keys'],
              //   handoverTo: '',
              //   handoverDate: '',
              //   status: false,
              //   signature: ''
              // },
              {
                department: 'HR & ADMIN',
                taskDescription: [{
                  description: "Medical Insurance Card / ID Card", remarks: "",
                  signature: "",
                },
                {
                  description: "Office Drawer / Room / Vehicle Keys", remarks: "",
                  signature: "",
                },
                {
                  description: "Accommodation Items and Locker Keys", remarks: "",
                  signature: "",
                },
                {
                  description: "Others", remarks: "",
                  signature: "",
                },

                ],

              },
              {
                department: 'Other Department',
                taskDescription: [
                  {
                    description: "Others", remarks: "",
                    signature: "",
                  },

                ],

              }
            ]
          },
          {
            name: 'remarks',
            type: 'textarea',
            label: 'Remarks (if any)',
            placeholder: 'Enter any remarks here'
          },
        ]
      },
      {
        id: 'clearance_signatures',
        title: 'Clearance Signatures',
        description: '',
        fields: [
          {
            name: 'employeeClearance.signature',
            type: 'text',
            label: 'Employee Signature',
            placeholder: 'Employee Signature',
            required: false,

          },

          {
            name: 'employeeClearance.date',
            type: 'date',
            label: 'Signature Date',
            placeholder: 'Pick Signature Date'
          },
          {
            name: 'endorsedBy.signature',
            type: 'text',
            label: 'Endorsed By (Department Head) Signature',
            placeholder: 'Endorsed By Signature',
            required: false,

          },

          {
            name: 'endorsedBy.date',
            type: 'date',
            label: 'Signature Date',
            placeholder: 'Pick Signature Date'
          },
          {
            name: 'reviewedBy.signature',
            type: 'text',
            label: 'Reviewed By (HR/Admin) Signature',
            placeholder: 'Reviewed By Signature',
            required: false,

          },

          {
            name: 'reviewedBy.date',
            type: 'date',
            label: 'Signature Date',
            placeholder: 'Pick Signature Date'
          },
          {
            name: 'approvedBy.signature',
            type: 'text',
            label: 'Approved By Head Of HR Signature',
            placeholder: 'Approved By Signature',
            required: false,

          },

          {
            name: 'approvedBy.date',
            type: 'date',
            label: 'Signature Date',
            placeholder: 'Pick Signature Date'
          }

        ]
      },


    ]
  },

  // Tasks

  [HRMSFormTypes.TASK]: {
    formType: HRMSFormTypes.TASK,
    title: 'Task',
    submitLabel: 'Save Task',
    description: 'Task creation, assignment, and progress tracking',
    sections: [
      {
        id: 'task_info',
        title: 'Task Details',
        fields: [
          { name: 'subject', type: 'text', label: 'Task Title', required: true, placeholder: 'Enter task title' },
          { name: 'description', type: 'textarea', label: 'Description', placeholder: 'Describe the task...' },

          {
            name: 'startDateTime',
            type: 'datetime',
            label: 'Start Date & Time',
            required: true,
          },
          {
            name: 'endDateTime',
            type: 'datetime',
            label: 'End Date & Time',
            required: true,
          },
          {
            name: 'priority',
            type: 'radio',
            label: 'Priority',
            required: true,
            options: [
              { label: 'Normal', value: 'normal' },
              { label: 'High', value: 'high' }, { label: 'Critical', value: 'critical' }
            ]
          },
        ],
      },
      {
        id: 'task_type',
        title: 'Other Details',
        fields: [
          {
            name: 'taskType',
            type: 'radio',
            label: 'Task Type',
            required: true,
            options: [
              { label: 'One Time', value: 'one-time' },
              { label: 'Recurring', value: 'recurring' }
            ]
          },

          {
            name: 'recurring.intervalType',
            type: 'select',
            label: 'Recurring Interval',
            options: [],
            showIf: (values) => values.taskType === 'recurring'
          },
          {
            name: 'recurring.customDays',
            type: 'number',
            label: 'Custom Days Interval',
            placeholder: 'Enter number of days',
            showWhen: { field: 'recurring.intervalType', value: 'custom' },
            min: 1,
            showIf: (values) => values?.recurring?.intervalType === 'custom'
          },

          {
            name: 'assignees',
            type: 'multiSelect',
            label: 'Assign To',
            options: [], // populate from user list
            required: true,

            placeholder: 'Select one or more users to assign the task',
          },
          {
            name: 'attachments',
            type: 'file',
            label: 'Attach Files',
            multiple: true,
            helperText: 'Upload documents or images related to the task',
          },
        ],
      },


    ],
  },

  [HRMSFormTypes.TICKET]: {
    formType: HRMSFormTypes.TICKET,
    title: 'Support Ticket',
    sections: [
      {
        id: 'ticket_info',
        title: 'Ticket Information',
        fields: [
          { name: 'category', type: 'select', label: 'Category', options: ['IT', 'HR', 'Finance'] },
          { name: 'subject', type: 'text', label: 'Subject', required: true },
          { name: 'description', type: 'textarea', label: 'Description' },
          { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High'] },
          { name: 'attachments', type: 'file', label: 'Upload Files' },
        ],
      },
    ],
  },






};


// export function injectOptionsIntoFormConfig(config, optionsMap) {
//   // Deep clone the config while skipping functions (like showIf)
//   const clonedConfig = JSON.parse(JSON.stringify(config));

//   clonedConfig.sections.forEach((section) => {
//     section.fields.forEach((field) => {
//       if (field.type === 'select' && optionsMap[field.name]) {
//         field.data = optionsMap[field.name];
//       }
//     });
//   });

//   return clonedConfig;
// }


export function deepCloneWithOptionsInjection(obj, optionsMap) {
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneWithOptionsInjection(item, optionsMap));
  } else if (obj && typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      const val = obj[key];
      if (key === 'options' && Array.isArray(val) && optionsMap[obj.name]) {
        // Inject options for select fields by matching 'name'
        cloned['data'] = optionsMap[obj.name];
      } else if (typeof val === 'function') {
        // Preserve functions like showIf
        cloned[key] = val;
      } else {
        cloned[key] = deepCloneWithOptionsInjection(val, optionsMap);
      }
    }
    return cloned;
  }
  // Primitive values: string, number, boolean, null, undefined
  return obj;
}





// Helper function to get form config by type
export function getFormConfig(formType: string): HRMSFormConfig | undefined {
  return HRMS_FORM_CONFIGS[formType];
}

// Helper function to get all form types
export function getAllFormTypes(): string[] {
  return Object.keys(HRMS_FORM_CONFIGS);
}

// Helper function to validate required fields
export function getRequiredFields(formType: string): string[] {
  const config = getFormConfig(formType);
  if (!config) return [];

  const requiredFields: string[] = [];
  config.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.required) {
        requiredFields.push(field.name);
      }
    });
  });

  return requiredFields;
}

// Form validation schemas (to be expanded as needed)
export const FORM_VALIDATION_SCHEMAS = {
  [HRMSFormTypes.MANPOWER_REQUISITION]: {
    requestedBy: { required: true },
    department: { required: true },
    requestedPosition: { required: true, minLength: 2 },
    vacancyReason: { required: true },
    noOfVacantPositions: { required: true, min: 1 }
  },
  [HRMSFormTypes.CANDIDATE_INFORMATION]: {
    name: { required: true, minLength: 2 },
    positionApplied: { required: true },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    passportNo: { required: true },
    nationality: { required: true }
  },
  [HRMSFormTypes.BUSINESS_TRIP_REQUEST]: {
    empOrGuestName: { required: true },
    placeOfVisit: { required: true },
    purposeOfVisit: { required: true, minLength: 10 },
    periodFrom: { required: true },
    periodTo: { required: true }
  },
  [HRMSFormTypes.NEW_EMPLOYEE_JOINING]: {
    empName: { required: true },
    designation: { required: true },
    departmentSection: { required: true },
    reportingTo: { required: true },
    dateOfReporting: { required: true }
  },
  [HRMSFormTypes.ASSETS_IT_ACCESS]: {
    empName: { required: true },
    designation: { required: true },
    departmentSection: { required: true },
    reportingTo: { required: true }
  },
  [HRMSFormTypes.EMPLOYEE_INFORMATION]: {
    empName: { required: true },
    empId: { required: true },
    designation: { required: true },
    department: { required: true },
    location: { required: true },
    dateOfJoining: { required: true },
    dateOfBirth: { required: true },
    category: { required: true },
    gender: { required: true },
    nationality: { required: true },
    maritalStatus: { required: true }
  },
  [HRMSFormTypes.ACCOMMODATION_TRANSPORT_CONSENT]: {
    empName: { required: true },
    empId: { required: true },
    designation: { required: true },
    department: { required: true },
    dateOfJoining: { required: true },
    accommodationPreference: { required: true },
    transportationPreference: { required: true },
    consentGiven: { required: true },
    declarationDate: { required: true },
    employeeSignature: { required: true }
  },
  [HRMSFormTypes.BENEFICIARY_DECLARATION]: {
    empName: { required: true },
    empId: { required: true },
    designation: { required: true },
    department: { required: true },
    dateOfJoining: { required: true },
    'primaryBeneficiary.name': { required: true },
    'primaryBeneficiary.relationship': { required: true },
    'primaryBeneficiary.percentage': { required: true, min: 1, max: 100 },
    'primaryBeneficiary.contactDetails': { required: true },
    declarationStatement: { required: true },
    changeNotification: { required: true },
    declarationDate: { required: true },
    employeeSignature: { required: true }
  },
  [HRMSFormTypes.NON_DISCLOSURE_AGREEMENT]: {
    employeeName: { required: true },
    employeeId: { required: true },
    designation: { required: true },
    department: { required: true },
    startDate: { required: true },
    confidentialityPeriod: { required: true },
    scopeOfConfidentiality: { required: true },
    understandTerms: { required: true },
    acknowledgeViolations: { required: true },
    agreementDate: { required: true },
    employeeSignature: { required: true }
  }
};