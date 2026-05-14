import { z } from 'zod';

/**
 * User Data Validation Schemas
 * Using Zod for form validation across all user profile sections
 */

// ==================== PERSONAL DETAILS SCHEMA ====================
export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  fatherName: z.string().min(1, "Father's name is required").trim(),
  dob: z.string({required_error: 'Date of birth is required'}),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], {
    errorMap: () => ({ message: 'Please select marital status' }),
  }),
  education: z.string().min(1, 'Education qualification is required').trim(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  altPhoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid alternate phone number')
    .optional()
    .or(z.literal('')),
  designation: z.string().optional(),
  dateOfJoining: z.string().nullable().optional(),
  salary: z.union([z.string(), z.number()])
    .transform((val) => (val === '' ? undefined : Number(val)))
    .pipe(z.number().positive('Salary must be positive').optional()),
  panCardNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card number')
    .optional()
    .or(z.literal('')),
  aadharNumber: z
    .string()
    .regex(/^\d{12}$/, 'Aadhar number must be 12 digits')
    .optional()
    .or(z.literal('')),
  drivingLicenseNumber: z.string().optional(),
  hasUan: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please select an option' }),
  }),
  uanNumber: z.string().optional(),
  esicNumber: z.string().optional(),
});

// ==================== ADDRESS SCHEMA ====================
export const addressSchema = z.object({
  type: z.enum(['Permanent', 'Current'], {
    errorMap: () => ({ message: 'Please select address type' }),
  }),
  addressLine: z.string().min(1, 'Address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  country: z.string().min(1, 'Country is required').trim().default('India'),
});

// ==================== BANK DETAILS SCHEMA ====================
export const bankDetailsSchema = z.object({
  accountNumber: z
    .string()
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number must not exceed 18 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  confirmAccountNumber: z
    .string()
    .min(1, 'Please confirm account number'),
  ifscCode: z
    .string()
    .length(11, 'IFSC code must be 11 characters')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  bankName: z.string().min(1, 'Bank name is required').trim(),
  branchName: z.string().optional(),
  accountHolderName: z.string().min(1, 'Account holder name is required').trim(),
  accountType: z.enum(['Savings', 'Current'], {
    errorMap: () => ({ message: 'Please select account type' }),
  }),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ["confirmAccountNumber"],
});

// ==================== EMERGENCY CONTACT SCHEMA ====================
export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  relation: z.string().min(1, 'Relationship is required').trim(),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
});

// ==================== FAMILY MEMBER SCHEMA ====================
export const familyMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  relation: z.enum(['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'], {
    errorMap: () => ({ message: 'Please select relationship' }),
  }),
  dob: z.string().min(1, 'Date of birth is required'),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Aadhar number must be 12 digits'),
  occupation: z.string().optional(),
  isDependent: z.boolean().default(false),
  isMarried: z.boolean().default(false),
});

// ==================== NOMINEE SCHEMA ====================
export const nomineeSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  relation: z.string().min(1, 'Relationship is required').trim(),
  dob: z.string().min(1, 'Date of birth is required'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  address: z.string().min(1, 'Address is required').trim(),
  sharePercentage: z
    .number()
    .min(1, 'Share percentage must be at least 1')
    .max(100, 'Share percentage cannot exceed 100'),
  state: z.string().min(1, 'State is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
});

// ==================== DOCUMENT UPLOAD SCHEMA ====================
export const documentUploadSchema = z.object({
  aadhar: z
    .instanceof(File, { message: 'Please upload Aadhar card' })
    .optional(),
  panCard: z
    .instanceof(File, { message: 'Please upload PAN card' })
    .optional(),
  drivingLicense: z
    .instanceof(File, { message: 'Please upload Driving License' })
    .optional(),
});

// File type validation helper
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']) => {
  if (!file) return true;
  return allowedTypes.includes(file.type);
};

// File size validation helper (max 5MB)
export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) return true;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
