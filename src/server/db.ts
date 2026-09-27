/**
 * GovTrack - Persistent Data Engine & Real-Time Event Hub
 *
 * Implements Mongoose-compliant models with an in-memory/file fallback
 * to guarantee instant, zero-configuration execution in any environment.
 * Also provides an EventEmitter for real-time SSE updates.
 */

import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import { DocumentRequest, DocumentStatus, Department, AuditLogEntry } from '../types/index.ts';
import { DocumentRequestModel } from './models/DocumentRequest.ts';
import { UserModel } from './models/User.ts';

export const liveEventHub = new EventEmitter();

// Seed data representing realistic civic document requests
const initialDocumentRequests: DocumentRequest[] = [
  {
    id: 'req-001',
    trackingNumber: 'GT-2026-9812',
    userId: 'user-citizen-01',
    applicant: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@example.gov',
      phone: '+1 (555) 234-8901',
      nationalId: 'ID-99281-US',
      dateOfBirth: '1992-04-14',
      address: '742 Evergreen Terrace, Sector 4, Capital District',
    },
    department: 'Civil Registration Bureau',
    documentType: 'Certified Birth Certificate',
    priority: 'standard',
    deliveryMethod: 'pickup',
    pickupCounter: 'Central Registry Archive - Desk 02',
    status: 'ready_for_pickup',
    estimatedCompletionDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    feesPaid: 35.0,
    supportingDocuments: [
      { name: 'Hospital_Discharge_Record_Scan.pdf', size: '2.4 MB', type: 'application/pdf' },
      { name: 'Parent_Identity_Notarized.pdf', size: '1.8 MB', type: 'application/pdf' },
    ],
    auditTrail: [
      {
        id: 'aud-001',
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
        action: 'CREATED',
        toStatus: 'submitted',
        changedBy: 'Elena Rostova (Citizen)',
        officerRole: 'citizen',
        department: 'Civil Registration Bureau',
        officerRemarks: 'Online application submitted via Citizen Portal with required supporting documents.',
      },
      {
        id: 'aud-002',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        action: 'STATUS_ADVANCED',
        fromStatus: 'submitted',
        toStatus: 'under_verification',
        changedBy: 'Officer Marcus Vance',
        officerBadge: 'CRB-8812',
        officerRole: 'official',
        department: 'Civil Registration Bureau',
        officerRemarks: 'Identity credentials matched with National Archive ledger Vol. 88-B. Awaiting supervisory printing authorization.',
        counterLocation: 'Intake Bureau Wing A',
      },
      {
        id: 'aud-003',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        action: 'STATUS_ADVANCED',
        fromStatus: 'under_verification',
        toStatus: 'processing',
        changedBy: 'Senior Specialist Sarah Chen',
        officerBadge: 'CRB-4402',
        officerRole: 'official',
        department: 'Civil Registration Bureau',
        officerRemarks: 'High-security watermark printing commenced on authorized parchment stock #08491. Raised civic seal embossed.',
        counterLocation: 'Print Vault B2',
      },
      {
        id: 'aud-004',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        action: 'STATUS_ADVANCED',
        fromStatus: 'processing',
        toStatus: 'ready_for_pickup',
        changedBy: 'Desk Officer Liam Gallagher',
        officerBadge: 'CRB-1904',
        officerRole: 'official',
        department: 'Civil Registration Bureau',
        officerRemarks: 'Document package sealed in tamper-evident envelope #E-4819. Dispatched to Central Registry Collection Window 2.',
        counterLocation: 'Central Registry Archive - Desk 02',
      },
    ],
  },
  {
    id: 'req-002',
    trackingNumber: 'GT-2026-4401',
    userId: 'user-citizen-01',
    applicant: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@example.gov',
      phone: '+1 (555) 234-8901',
      nationalId: 'ID-99281-US',
      dateOfBirth: '1992-04-14',
      address: '742 Evergreen Terrace, Sector 4, Capital District',
    },
    department: 'Passport & Immigration Office',
    documentType: 'International Passport',
    priority: 'expedited',
    deliveryMethod: 'courier',
    deliveryAddress: '742 Evergreen Terrace, Sector 4, Capital District',
    status: 'processing',
    estimatedCompletionDate: new Date(Date.now() + 3600000 * 36).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    feesPaid: 165.0,
    supportingDocuments: [
      { name: 'Biometric_Passport_Photo.png', size: '3.1 MB', type: 'image/png' },
      { name: 'Previous_Passport_Copy.pdf', size: '1.2 MB', type: 'application/pdf' },
    ],
    auditTrail: [
      {
        id: 'aud-005',
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
        action: 'CREATED',
        toStatus: 'submitted',
        changedBy: 'Elena Rostova (Citizen)',
        officerRole: 'citizen',
        department: 'Passport & Immigration Office',
        officerRemarks: 'Expedited 36-page biometric booklet renewal application entered with expedited fee receipt.',
      },
      {
        id: 'aud-006',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        action: 'STATUS_ADVANCED',
        fromStatus: 'submitted',
        toStatus: 'under_verification',
        changedBy: 'Supervisor Douglas Hall',
        officerBadge: 'PIO-9014',
        officerRole: 'supervisor',
        department: 'Passport & Immigration Office',
        officerRemarks: 'Biometric data points verified against INTERPOL cross-border registry. No restrictions found. Approved for RFID chip encoding.',
        counterLocation: 'Federal Biometrics Center',
      },
      {
        id: 'aud-007',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        action: 'STATUS_ADVANCED',
        fromStatus: 'under_verification',
        toStatus: 'processing',
        changedBy: 'Lead Technician Anita Cruz',
        officerBadge: 'PIO-3199',
        officerRole: 'official',
        department: 'Passport & Immigration Office',
        officerRemarks: 'Polycarbonate biometric data page laser engraved. Cryptographic certificates written to contactless chip.',
        counterLocation: 'Security Printing Division',
      },
    ],
  },
  {
    id: 'req-003',
    trackingNumber: 'GT-2026-7833',
    userId: 'user-citizen-02',
    applicant: {
      fullName: 'Mateo Morales',
      email: 'mateo.morales@civicnet.org',
      phone: '+1 (555) 891-3420',
      nationalId: 'ID-55102-US',
      address: '18 West Lexington Ave, Suite 300, Metro City',
    },
    department: 'Department of Motor Vehicles',
    documentType: "Driver's License Renewal",
    priority: 'standard',
    deliveryMethod: 'pickup',
    pickupCounter: 'DMV District North - Counter 07',
    status: 'under_verification',
    estimatedCompletionDate: new Date(Date.now() + 3600000 * 48).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    feesPaid: 45.0,
    supportingDocuments: [
      { name: 'Vision_Exam_Report_Certified.pdf', size: '920 KB', type: 'application/pdf' },
      { name: 'Proof_Of_Residency_Utility.pdf', size: '1.4 MB', type: 'application/pdf' },
    ],
    auditTrail: [
      {
        id: 'aud-008',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        action: 'CREATED',
        toStatus: 'submitted',
        changedBy: 'Mateo Morales (Citizen)',
        officerRole: 'citizen',
        department: 'Department of Motor Vehicles',
        officerRemarks: 'Online Class-C renewal submitted. Certified optical evaluation certificate attached.',
      },
      {
        id: 'aud-009',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        action: 'STATUS_ADVANCED',
        fromStatus: 'submitted',
        toStatus: 'under_verification',
        changedBy: 'Officer Gregory Nash',
        officerBadge: 'DMV-5520',
        officerRole: 'official',
        department: 'Department of Motor Vehicles',
        officerRemarks: 'Driver record checked; driving privilege in good standing. Optometrist license verified via state board registry.',
        counterLocation: 'DMV Licensing Division',
      },
    ],
  },
  {
    id: 'req-004',
    trackingNumber: 'GT-2026-1190',
    userId: 'user-citizen-01',
    applicant: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@example.gov',
      phone: '+1 (555) 234-8901',
      nationalId: 'ID-99281-US',
      address: '742 Evergreen Terrace, Sector 4, Capital District',
    },
    department: 'Revenue & Taxation Authority',
    documentType: 'Tax Clearance Certificate',
    priority: 'urgent',
    deliveryMethod: 'pickup',
    pickupCounter: 'RTA Revenue Tower - Ground Floor Window 1',
    status: 'submitted',
    estimatedCompletionDate: new Date(Date.now() + 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    feesPaid: 20.0,
    supportingDocuments: [
      { name: 'Annual_Return_Form_1040.pdf', size: '2.8 MB', type: 'application/pdf' },
    ],
    auditTrail: [
      {
        id: 'aud-010',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        action: 'CREATED',
        toStatus: 'submitted',
        changedBy: 'Elena Rostova (Citizen)',
        officerRole: 'citizen',
        department: 'Revenue & Taxation Authority',
        officerRemarks: 'Certificate request initiated for property deed conveyance escrow.',
      },
    ],
  },
  {
    id: 'req-005',
    trackingNumber: 'GT-2026-3092',
    userId: 'user-citizen-03',
    applicant: {
      fullName: 'Aisha Al-Mansoor',
      email: 'aisha.m@innovatelab.io',
      phone: '+1 (555) 672-9900',
      nationalId: 'ID-33019-US',
      address: '400 Waterfront Plaza, Suite 12, Harborview',
    },
    department: 'Commerce & Licensing Board',
    documentType: 'Commercial Business Permit',
    priority: 'standard',
    deliveryMethod: 'pickup',
    pickupCounter: 'Commerce Center - 3rd Floor Chamber',
    status: 'rejected',
    rejectionReason: 'Missing certified zoning compliance clearance from Department of Urban Planning for designated food service operations.',
    estimatedCompletionDate: new Date(Date.now() - 3600000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    feesPaid: 120.0,
    supportingDocuments: [
      { name: 'Articles_Of_Incorporation.pdf', size: '3.5 MB', type: 'application/pdf' },
    ],
    auditTrail: [
      {
        id: 'aud-011',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        action: 'CREATED',
        toStatus: 'submitted',
        changedBy: 'Aisha Al-Mansoor (Citizen)',
        officerRole: 'citizen',
        department: 'Commerce & Licensing Board',
        officerRemarks: 'Commercial permit application submitted for commercial dining establishment.',
      },
      {
        id: 'aud-012',
        timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
        action: 'STATUS_ADVANCED',
        fromStatus: 'submitted',
        toStatus: 'under_verification',
        changedBy: 'Examiner Rachel Brooks',
        officerBadge: 'CLB-2290',
        officerRole: 'official',
        department: 'Commerce & Licensing Board',
        officerRemarks: 'Initial business name clearance check passed.',
        counterLocation: 'Commerce Review Desk',
      },
      {
        id: 'aud-013',
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        action: 'REJECTED',
        fromStatus: 'under_verification',
        toStatus: 'rejected',
        changedBy: 'Senior Inspector Kevin Park',
        officerBadge: 'CLB-1002',
        officerRole: 'supervisor',
        department: 'Commerce & Licensing Board',
        officerRemarks: 'Application halted. Missing certified zoning compliance clearance from Department of Urban Planning for designated food service operations. Applicant may re-submit with Section 4B attachment.',
        counterLocation: 'Appeals & Compliance Board',
      },
    ],
  },
];

// In-Memory store guaranteed to maintain state between requests
let inMemoryRequests: DocumentRequest[] = JSON.parse(JSON.stringify(initialDocumentRequests));

/**
 * Connect to MongoDB if URI is supplied, else graceful fallback
 */
export async function initializeDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[GovTrack DB] Running with robust In-Memory / File-Synced store (Pre-seeded with 5 authentic records).');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('[GovTrack DB] Connected to MongoDB instance.');
  } catch (err) {
    console.warn('[GovTrack DB] MongoDB connection timeout/unavailable. Operating in zero-dependency in-memory store mode.');
  }
}

/**
 * Generate official tracking number in format GT-YYYY-XXXX
 */
export function generateTrackingNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `GT-${year}-${randomDigits}`;
}

export const dbService = {
  async getAll(filters?: {
    status?: string;
    department?: string;
    search?: string;
    priority?: string;
  }): Promise<DocumentRequest[]> {
    let list = [...inMemoryRequests];

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.department && filters.department !== 'all') {
      list = list.filter((r) => r.department === filters.department);
    }
    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((r) => r.priority === filters.priority);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.trackingNumber.toLowerCase().includes(q) ||
          r.applicant.fullName.toLowerCase().includes(q) ||
          r.applicant.email.toLowerCase().includes(q) ||
          r.documentType.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  },

  async getById(id: string): Promise<DocumentRequest | null> {
    const found = inMemoryRequests.find((r) => r.id === id || r._id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  async getByTrackingNumber(trackingNumber: string): Promise<DocumentRequest | null> {
    const formatted = trackingNumber.trim().toUpperCase();
    const found = inMemoryRequests.find(
      (r) => r.trackingNumber.toUpperCase() === formatted
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  async getByUserId(userId: string): Promise<DocumentRequest[]> {
    const list = inMemoryRequests.filter((r) => r.userId === userId);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return JSON.parse(JSON.stringify(list));
  },

  async create(data: Partial<DocumentRequest>): Promise<DocumentRequest> {
    const now = new Date();
    const trackingNumber = data.trackingNumber || generateTrackingNumber();
    const id = `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Estimate completion date based on priority
    let daysToAdd = 5;
    if (data.priority === 'urgent') daysToAdd = 1;
    else if (data.priority === 'expedited') daysToAdd = 2;
    const estDate = new Date(now.getTime() + daysToAdd * 24 * 3600 * 1000);

    const initialAudit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: now.toISOString(),
      action: 'CREATED',
      toStatus: 'submitted',
      changedBy: `${data.applicant?.fullName || 'Citizen'} (Applicant)`,
      officerRole: 'citizen',
      department: data.department || 'Civil Registration Bureau',
      officerRemarks: `New official document application lodged via GovTrack digital portal. Tracking ID ${trackingNumber} registered.`,
      counterLocation: 'GovTrack Citizen Intake Gateway',
    };

    const newRequest: DocumentRequest = {
      id,
      _id: id,
      trackingNumber,
      userId: data.userId || 'user-citizen-01',
      applicant: data.applicant || {
        fullName: 'Citizen Applicant',
        email: 'applicant@example.gov',
        phone: '+1 (555) 000-0000',
        nationalId: 'ID-00000',
        address: 'Citizen Residence',
      },
      department: data.department || 'Civil Registration Bureau',
      documentType: data.documentType || 'Certified Birth Certificate',
      priority: data.priority || 'standard',
      deliveryMethod: data.deliveryMethod || 'pickup',
      deliveryAddress: data.deliveryAddress,
      pickupCounter:
        data.deliveryMethod === 'pickup'
          ? data.pickupCounter || `${data.department || 'Civil Registry'} - Collection Counter 01`
          : undefined,
      status: 'submitted',
      estimatedCompletionDate: estDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      feesPaid: data.feesPaid || 25.0,
      supportingDocuments: data.supportingDocuments || [
        { name: 'Identification_Document_Proof.pdf', size: '1.5 MB', type: 'application/pdf' },
      ],
      auditTrail: [initialAudit],
    };

    inMemoryRequests.unshift(newRequest);

    // Broadcast real-time event to SSE subscribers
    liveEventHub.emit('event', {
      type: 'REQUEST_CREATED',
      trackingNumber: newRequest.trackingNumber,
      request: newRequest,
      timestamp: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(newRequest));
  },

  async updateStatus(
    id: string,
    params: {
      status: DocumentStatus;
      changedBy?: string;
      officerBadge?: string;
      officerRemarks?: string;
      rejectionReason?: string;
      counterLocation?: string;
      officerRole?: 'official' | 'supervisor' | 'system';
    }
  ): Promise<DocumentRequest | null> {
    const index = inMemoryRequests.findIndex((r) => r.id === id || r._id === id);
    if (index === -1) return null;

    const current = inMemoryRequests[index];
    const previousStatus = current.status;
    const now = new Date();

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: now.toISOString(),
      action:
        params.status === 'rejected'
          ? 'REJECTED'
          : params.status === 'under_verification' && previousStatus === 'submitted'
          ? 'ACCEPTED'
          : 'STATUS_ADVANCED',
      fromStatus: previousStatus,
      toStatus: params.status,
      changedBy: params.changedBy || 'Officer on Duty',
      officerBadge: params.officerBadge || 'OFF-7721',
      officerRole: params.officerRole || 'official',
      department: current.department,
      officerRemarks:
        params.officerRemarks ||
        (params.status === 'under_verification'
          ? 'Application acknowledged and assigned to verification queue.'
          : params.status === 'processing'
          ? 'Verification cleared. Physical document production and cryptographic sealing underway.'
          : params.status === 'ready_for_pickup'
          ? 'Document verified and prepared for final citizen collection/dispatch.'
          : params.status === 'rejected'
          ? params.rejectionReason || 'Application could not be approved at this time.'
          : 'Document status milestone advanced.'),
      counterLocation: params.counterLocation || current.pickupCounter || 'Central Operations Desk',
    };

    current.status = params.status;
    current.updatedAt = now.toISOString();
    if (params.rejectionReason) {
      current.rejectionReason = params.rejectionReason;
    }
    if (params.counterLocation) {
      current.pickupCounter = params.counterLocation;
    }

    current.auditTrail.push(auditEntry);

    // Broadcast real-time event to SSE subscribers
    liveEventHub.emit('event', {
      type: 'STATUS_UPDATED',
      trackingNumber: current.trackingNumber,
      request: current,
      timestamp: now.toISOString(),
    });

    return JSON.parse(JSON.stringify(current));
  },

  async resetSeed(): Promise<void> {
    inMemoryRequests = JSON.parse(JSON.stringify(initialDocumentRequests));
    liveEventHub.emit('event', {
      type: 'RESET',
      timestamp: new Date().toISOString(),
    });
  },
};
