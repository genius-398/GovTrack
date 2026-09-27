/**
 * Step 1: Database Schemas & Architecture
 * DocumentRequest Schema & Model (MongoDB / Mongoose)
 *
 * Implements the 4 core fixed milestones:
 *   - State 1: Request Submitted ('submitted')
 *   - State 2: Document Under Verification ('under_verification')
 *   - State 3: Processing/Printing ('processing')
 *   - State 4: Ready for Pickup / Dispatched ('ready_for_pickup')
 * Plus error/rejection handling ('rejected') and an immutable Audit Trail subdocument.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLogEntry {
  timestamp: Date;
  action: 'CREATED' | 'STATUS_ADVANCED' | 'STATUS_UPDATED' | 'ACCEPTED' | 'REJECTED' | 'NOTE_ADDED' | 'DISPATCHED';
  fromStatus?: string;
  toStatus: string;
  changedBy: string;
  officerRole: 'citizen' | 'official' | 'supervisor' | 'system';
  officerBadge?: string;
  department: string;
  officerRemarks: string;
  counterLocation?: string;
}

export interface IApplicantDetails {
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  dateOfBirth?: string;
  address: string;
}

export interface IDocumentRequest extends Document {
  trackingNumber: string;
  userId: mongoose.Types.ObjectId | string;
  applicant: IApplicantDetails;
  department:
    | 'Civil Registration Bureau'
    | 'Department of Motor Vehicles'
    | 'Passport & Immigration Office'
    | 'Revenue & Taxation Authority'
    | 'Commerce & Licensing Board';
  documentType:
    | 'National Identity Card'
    | 'Certified Birth Certificate'
    | "Driver's License Renewal"
    | 'International Passport'
    | 'Vehicle Registration Certificate'
    | 'Tax Clearance Certificate'
    | 'Commercial Business Permit'
    | 'Police Clearance Certificate';
  priority: 'standard' | 'expedited' | 'urgent';
  deliveryMethod: 'pickup' | 'courier';
  deliveryAddress?: string;
  pickupCounter?: string;
  status: 'submitted' | 'under_verification' | 'processing' | 'ready_for_pickup' | 'rejected';
  rejectionReason?: string;
  estimatedCompletionDate: Date;
  feesPaid: number;
  supportingDocuments: Array<{
    name: string;
    size: string;
    type: string;
    uploadedAt: Date;
  }>;
  auditTrail: IAuditLogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// Subdocument Schema for Immutable Real-Time Audit Logging
const AuditLogEntrySchema = new Schema<IAuditLogEntry>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    action: {
      type: String,
      enum: ['CREATED', 'STATUS_ADVANCED', 'STATUS_UPDATED', 'ACCEPTED', 'REJECTED', 'NOTE_ADDED', 'DISPATCHED'],
      required: true,
    },
    fromStatus: {
      type: String,
      enum: ['submitted', 'under_verification', 'processing', 'ready_for_pickup', 'rejected', null],
    },
    toStatus: {
      type: String,
      enum: ['submitted', 'under_verification', 'processing', 'ready_for_pickup', 'rejected'],
      required: true,
    },
    changedBy: {
      type: String,
      required: true,
      trim: true,
    },
    officerRole: {
      type: String,
      enum: ['citizen', 'official', 'supervisor', 'system'],
      default: 'official',
    },
    officerBadge: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    officerRemarks: {
      type: String,
      required: true,
      trim: true,
    },
    counterLocation: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

// Main DocumentRequest Schema
const DocumentRequestSchema: Schema<IDocumentRequest> = new Schema(
  {
    trackingNumber: {
      type: String,
      required: [true, 'Tracking identifier is mandatory'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.Mixed, // Supports ObjectId or string user identifier
      required: [true, 'Request must be linked to a citizen user identifier'],
      index: true,
    },
    applicant: {
      fullName: {
        type: String,
        required: [true, 'Applicant name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Applicant email is required'],
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Applicant contact number is required'],
        trim: true,
      },
      nationalId: {
        type: String,
        required: [true, 'Applicant national identification/SSN is required'],
        trim: true,
      },
      dateOfBirth: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Applicant residential address is required'],
        trim: true,
      },
    },
    department: {
      type: String,
      enum: [
        'Civil Registration Bureau',
        'Department of Motor Vehicles',
        'Passport & Immigration Office',
        'Revenue & Taxation Authority',
        'Commerce & Licensing Board',
      ],
      required: [true, 'Target government department is mandatory'],
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        'National Identity Card',
        'Certified Birth Certificate',
        "Driver's License Renewal",
        'International Passport',
        'Vehicle Registration Certificate',
        'Tax Clearance Certificate',
        'Commercial Business Permit',
        'Police Clearance Certificate',
      ],
      required: [true, 'Document type is required'],
    },
    priority: {
      type: String,
      enum: ['standard', 'expedited', 'urgent'],
      default: 'standard',
    },
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'courier'],
      default: 'pickup',
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    pickupCounter: {
      type: String,
      trim: true,
      default: 'Main Civic Center - Service Desk 4',
    },
    status: {
      type: String,
      enum: {
        values: ['submitted', 'under_verification', 'processing', 'ready_for_pickup', 'rejected'],
        message: '{VALUE} is not an authorized milestone state',
      },
      default: 'submitted',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    estimatedCompletionDate: {
      type: Date,
      required: true,
    },
    feesPaid: {
      type: Number,
      default: 25.0,
      min: 0,
    },
    supportingDocuments: [
      {
        name: { type: String, required: true },
        size: { type: String, required: true },
        type: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    auditTrail: [AuditLogEntrySchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for administrative querying and analytics
DocumentRequestSchema.index({ department: 1, status: 1 });
DocumentRequestSchema.index({ userId: 1, createdAt: -1 });
DocumentRequestSchema.index({ createdAt: -1 });

export const DocumentRequestModel: Model<IDocumentRequest> =
  mongoose.models.DocumentRequest ||
  mongoose.model<IDocumentRequest>('DocumentRequest', DocumentRequestSchema);

export default DocumentRequestModel;
