/**
 * Step 1: Database Schemas & Architecture
 * User Schema & Model (MongoDB / Mongoose)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'officer';
  department?: string;
  badgeNumber?: string;
  nationalId?: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'User full name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    role: {
      type: String,
      enum: {
        values: ['citizen', 'admin', 'officer'],
        message: '{VALUE} is not a valid role',
      },
      default: 'citizen',
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
      required: function (this: IUser) {
        return this.role === 'officer';
      },
    },
    badgeNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    nationalId: {
      type: String,
      trim: true,
      sparse: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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

// Indexes for fast administrative lookups
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
