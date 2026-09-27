import { Department, DocumentType, DocumentStatus, MilestoneConfig } from '../types/index.ts';

export const DEPARTMENTS: Array<{
  id: Department;
  name: string;
  code: string;
  badge: string;
  directorate: string;
  description: string;
  iconName: string;
}> = [
  {
    id: 'Civil Registration Bureau',
    name: 'Civil Registration Bureau',
    code: 'CRB',
    badge: 'Civic Archives',
    directorate: 'Bureau of Vital Statistics & Identity',
    description: 'Vital records, birth & marriage certificates, and state identity credentials.',
    iconName: 'FileText',
  },
  {
    id: 'Passport & Immigration Office',
    name: 'Passport & Immigration Office',
    code: 'PIO',
    badge: 'Federal Border',
    directorate: 'Directorate of Consular & Travel Documents',
    description: 'Biometric international passports, diplomatic credentials, and travel endorsements.',
    iconName: 'Globe',
  },
  {
    id: 'Department of Motor Vehicles',
    name: 'Department of Motor Vehicles',
    code: 'DMV',
    badge: 'Transport Reg',
    directorate: 'Division of Driver & Vehicle Licensing',
    description: "Operator driver licenses, commercial endorsements, and title registrations.",
    iconName: 'Car',
  },
  {
    id: 'Revenue & Taxation Authority',
    name: 'Revenue & Taxation Authority',
    code: 'RTA',
    badge: 'Fiscal Bureau',
    directorate: 'Office of Tax Compliance & Assessments',
    description: 'Fiscal clearance records, tax standing certificates, and tax ID validation.',
    iconName: 'Receipt',
  },
  {
    id: 'Commerce & Licensing Board',
    name: 'Commerce & Licensing Board',
    code: 'CLB',
    badge: 'Commerce Reg',
    directorate: 'Municipal Trade & Operational Authority',
    description: 'Enterprise business licenses, commercial permits, and regulatory certificates.',
    iconName: 'Building2',
  },
];

export const DOCUMENT_CATALOG: Record<
  DocumentType,
  {
    department: Department;
    baseFee: number;
    estimatedDays: number;
    description: string;
    requiredDocs: string[];
  }
> = {
  'Certified Birth Certificate': {
    department: 'Civil Registration Bureau',
    baseFee: 35.0,
    estimatedDays: 3,
    description: 'Official vital record parchment with embossed civic seal and tamper-evident watermarks.',
    requiredDocs: ['Parent / Guardian Identity Card', 'Hospital Discharge Form or Midwife Attestation'],
  },
  'National Identity Card': {
    department: 'Civil Registration Bureau',
    baseFee: 25.0,
    estimatedDays: 5,
    description: 'Standard smart-chip national identity credential with biometric photograph.',
    requiredDocs: ['Proof of Age', 'Proof of Residential Address', 'Passport-size Photograph'],
  },
  'International Passport': {
    department: 'Passport & Immigration Office',
    baseFee: 165.0,
    estimatedDays: 7,
    description: 'Biometric 36-page international e-passport booklet conforming to ICAO 9303 standards.',
    requiredDocs: ['Certified Birth Certificate Copy', 'Color Biometric Photograph (2x2)', 'National ID'],
  },
  "Driver's License Renewal": {
    department: 'Department of Motor Vehicles',
    baseFee: 45.0,
    estimatedDays: 4,
    description: 'Class-C Operator driver authorization card with updated optical examination endorsement.',
    requiredDocs: ['Existing License or State ID', 'Certified Vision Examination Clearance'],
  },
  'Vehicle Registration Certificate': {
    department: 'Department of Motor Vehicles',
    baseFee: 65.0,
    estimatedDays: 2,
    description: 'Official automotive ownership title certificate and registration decal.',
    requiredDocs: ['Vehicle Bill of Sale', 'Certified Emissions Test Certificate', 'Proof of Insurance'],
  },
  'Tax Clearance Certificate': {
    department: 'Revenue & Taxation Authority',
    baseFee: 20.0,
    estimatedDays: 2,
    description: 'Official tax compliance ledger statement certifying zero arrears for civic filings.',
    requiredDocs: ['Recent Annual Tax Return Form', 'National Tax Identification Number'],
  },
  'Commercial Business Permit': {
    department: 'Commerce & Licensing Board',
    baseFee: 120.0,
    estimatedDays: 6,
    description: 'Operating trade and municipal commercial establishment credential.',
    requiredDocs: ['Articles of Organization / Incorporation', 'Municipal Zoning Approval Form'],
  },
  'Police Clearance Certificate': {
    department: 'Civil Registration Bureau',
    baseFee: 40.0,
    estimatedDays: 4,
    description: 'Official judicial record background clearance certified by Metropolitan Security Bureau.',
    requiredDocs: ['Two Government Photo IDs', 'Fingerprint Biometric Scan Record'],
  },
};

export const FIXED_MILESTONES: MilestoneConfig[] = [
  {
    key: 'submitted',
    stepNumber: 1,
    label: 'Request Submitted',
    shortLabel: 'Submitted',
    description: 'Application received and registered into the national civic dispatch ledger.',
    estimatedHours: 4,
  },
  {
    key: 'under_verification',
    stepNumber: 2,
    label: 'Document Under Verification',
    shortLabel: 'Verification',
    description: 'Legal identity, supporting affidavits, and national records are undergoing official examination.',
    estimatedHours: 24,
  },
  {
    key: 'processing',
    stepNumber: 3,
    label: 'Processing / Printing',
    shortLabel: 'Processing',
    description: 'Biometric encoding, security seal embossing, and physical credential fabrication.',
    estimatedHours: 48,
  },
  {
    key: 'ready_for_pickup',
    stepNumber: 4,
    label: 'Ready for Pickup / Dispatched',
    shortLabel: 'Ready / Dispatched',
    description: 'Document has passed quality audit and is waiting at the designated counter or dispatched with courier.',
    estimatedHours: 0,
  },
];
