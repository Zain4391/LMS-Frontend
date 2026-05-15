import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().min(1).max(15),
  address: z.string().min(1).max(200),
  membershipDate: z.string().min(1, 'Membership date is required'),
})

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ─── User ─────────────────────────────────────────────────────────────────────

export const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(50),
  password: z.string().min(6).optional().or(z.literal('')),
  phoneNumber: z.string().min(1).max(15),
  address: z.string().min(1).max(200),
  membershipDate: z.string().min(1),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

// ─── Librarian ────────────────────────────────────────────────────────────────

export const librarianSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(50),
  password: z.string().min(6).optional().or(z.literal('')),
  phoneNumber: z.string().min(1).max(15),
  address: z.string().min(1).max(200),
  role: z.enum(['ADMIN', 'STAFF']).optional(),
  hireDate: z.string().min(1),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

// ─── Author ───────────────────────────────────────────────────────────────────

export const authorSchema = z.object({
  name: z.string().min(1).max(200),
  biography: z.string().max(2000).optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  nationality: z.string().max(100).optional().or(z.literal('')),
})

// ─── Genre ────────────────────────────────────────────────────────────────────

export const genreSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().or(z.literal('')),
})

// ─── Publisher ────────────────────────────────────────────────────────────────

export const publisherSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(300).optional().or(z.literal('')),
  email: z.string().email().max(50).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
})

// ─── Book ─────────────────────────────────────────────────────────────────────

export const bookSchema = z.object({
  isbn: z.string().min(1).max(20),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional().or(z.literal('')),
  publicationDate: z.string().optional().or(z.literal('')),
  language: z.string().max(50).optional().or(z.literal('')),
  pageCount: z.coerce.number().int().positive().optional(),
  publisherId: z.coerce.number().int().positive({ message: 'Publisher is required' }),
  authorIds: z.array(z.number()).min(1, 'At least one author is required'),
  genreIds: z.array(z.number()).min(1, 'At least one genre is required'),
})

// ─── Book Copy ────────────────────────────────────────────────────────────────

export const bookCopySchema = z.object({
  barcode: z.string().min(1).max(50),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  status: z.enum(['AVAILABLE', 'BORROWED', 'UNAVAILABLE']).optional(),
  acquisitionDate: z.string().optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  bookId: z.coerce.number().int().positive({ message: 'Book is required' }),
})

// ─── Borrow ───────────────────────────────────────────────────────────────────

export const borrowSchema = z.object({
  userId: z.coerce.number().int().positive({ message: 'User is required' }),
  bookCopyId: z.coerce.number().int().positive({ message: 'Book copy is required' }),
  borrowDate: z.string().min(1, { message: 'Borrow date is required' }),
})

// ─── Fine ─────────────────────────────────────────────────────────────────────

export const fineSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  assessedDate: z.string().min(1),
  reason: z.string().max(500).optional().or(z.literal('')),
  borrowedId: z.coerce.number().int().positive({ message: 'Borrow record is required' }),
})

// ─── Payment ──────────────────────────────────────────────────────────────────

export const paymentSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  paymentDate: z.string().min(1),
  paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE']),
  transactionId: z.string().max(100).optional().or(z.literal('')),
  fineId: z.coerce.number().int().positive({ message: 'Fine is required' }),
})

// Inferred types
export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type UserFormValues = z.infer<typeof userSchema>
export type LibrarianFormValues = z.infer<typeof librarianSchema>
export type AuthorFormValues = z.infer<typeof authorSchema>
export type GenreFormValues = z.infer<typeof genreSchema>
export type PublisherFormValues = z.infer<typeof publisherSchema>
export type BookFormValues = z.infer<typeof bookSchema>
export type BookCopyFormValues = z.infer<typeof bookCopySchema>
export type BorrowFormValues = z.infer<typeof borrowSchema>
export type FineFormValues = z.infer<typeof fineSchema>
export type PaymentFormValues = z.infer<typeof paymentSchema>
