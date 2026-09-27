/**
 * GovTrack - Real-Time Government Document Processing & Tracking System
 * Core Domain Types & Enums
 */

export type DocumentStatus =
  | 'submitted'          // State 1: Request Submitted
  | 'under_verification' // State 2: Document Under Verification
  | 'processing'         // State 3: Processing/Printing
  | 'ready_for_pickup'   // State 4: Ready for Pickup / Dispatched
  | 'rejected';          // Exception: Rejection / Clarification Needed

export type Department =
  | 'Civil Registration Bureau'
  | 'Department of Motor Vehicles'
  | 'Passport & Immigration Office'
  | 'Revenue & Taxation Authority'
  | 'Commerce & Licensing Board';

export type DocumentType =
  | 'National Identity Card'
  | 'Certified Birth Certificate'
  | "Driver's License Renewal"
  | 'International Passport'
  | 'Vehicle Registration Certificate'
  | 'Tax Clearance Certificate'
  | 'Commercial Business Permit'
  | 'Police Clearance Certificate';

export type Priority = 'standard' | 'expedited' | 'urgent';

export type DeliveryMethod = 'pickup' | 'courier';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'CREATED' | 'STATUS_ADVANCED' | 'STATUS_UPDATED' | 'ACCEPTED' | 'REJECTED' | 'NOTE_ADDED' | 'DISPATCHED';
  fromStatus?: DocumentStatus;
  toStatus: DocumentStatus;
  changedBy: string;
  officerRole: 'citizen' | 'official' | 'supervisor' | 'system';
  officerBadge?: string;
  department: Department;
  officerRemarks: string;
  counterLocation?: string;
}

export interface ApplicantDetails {
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  dateOfBirth?: string;
  address: string;
}

export interface DocumentRequest {
  id: string;
  _id?: string;
  trackingNumber: string; // e.g., GT-2026-9812
  userId: string;
  applicant: ApplicantDetails;
  department: Department;
  documentType: DocumentType;
  priority: Priority;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  pickupCounter?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  estimatedCompletionDate: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: AuditLogEntry[];
  supportingDocuments: Array<{
    name: string;
    size: string;
    type: string;
  }>;
  feesPaid: number;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'officer';
  department?: Department;
  badgeNumber?: string;
}

export interface MilestoneConfig {
  key: DocumentStatus;
  stepNumber: number;
  label: string;
  shortLabel: string;
  description: string;
  estimatedHours: number;
}
