import { z } from 'zod';

/**
 * Authentication Validation Schemas
 * Using Zod for form validation
 */

// ==================== LOGIN SCHEMA ====================
export const loginSchema = z.object({
  empCode: z
    .string()
    .min(1, 'Employee Code is required')
    .trim(),
});

// ==================== PASSWORD LOGIN SCHEMA ====================
export const passwordLoginSchema = z.object({
  empCode: z
    .string()
    .min(1, 'Employee Code is required')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// ==================== OTP VERIFICATION SCHEMA ====================
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

// ==================== PASSWORD SCHEMA ====================
export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ==================== PASSWORD STRENGTH HELPER ====================
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: 'default' };
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Character type checks
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  // Return strength assessment
  if (strength <= 2) return { strength: 1, label: 'Weak', color: 'danger' };
  if (strength <= 4) return { strength: 2, label: 'Medium', color: 'warning' };
  if (strength <= 5) return { strength: 3, label: 'Strong', color: 'success' };
  return { strength: 4, label: 'Very Strong', color: 'success' };
};
