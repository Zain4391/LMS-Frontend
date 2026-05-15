// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserStatus = 'ACTIVE' | 'INACTIVE'
export type LibrarianRole = 'ADMIN' | 'STAFF'
export type LibrarianStatus = 'ACTIVE' | 'INACTIVE'
export type BookStatus = 'AVAILABLE' | 'UNAVAILABLE'
export type BookCopyCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR'
export type BookCopyStatus = 'AVAILABLE' | 'BORROWED' | 'UNAVAILABLE'
export type BorrowStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE'
export type FineStatus = 'PENDING' | 'PAID' | 'WAIVED'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE'
export type AuthRole = 'USER' | 'STAFF' | 'ADMIN'

// ─── Pagination wrapper ───────────────────────────────────────────────────────

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface PaginationParams {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number
  email: string
  name: string
  role: AuthRole
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  id: number
  name: string
  email: string
  role: AuthRole
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phoneNumber: string
  address: string
  membershipDate: string
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  phoneNumber: string
  address: string
  membershipDate: string
  status: UserStatus
}

export interface UserRequest {
  name: string
  email: string
  password?: string
  phoneNumber: string
  address: string
  membershipDate: string
  status?: UserStatus
}

export interface UserPatch {
  email: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// ─── Librarian ────────────────────────────────────────────────────────────────

export interface Librarian {
  id: number
  name: string
  email: string
  phoneNumber: string
  address: string
  role: LibrarianRole
  hireDate: string
  status: LibrarianStatus
}

export interface LibrarianRequest {
  name: string
  email: string
  password?: string
  phoneNumber: string
  address: string
  role?: LibrarianRole
  hireDate: string
  status?: LibrarianStatus
}

// ─── Author ───────────────────────────────────────────────────────────────────

export interface Author {
  id: number
  name: string
  biography?: string
  birthDate?: string
  nationality?: string
}

export interface AuthorRequest {
  name: string
  biography?: string
  birthDate?: string
  nationality?: string
}

// ─── Genre ────────────────────────────────────────────────────────────────────

export interface Genre {
  id: number
  name: string
  description?: string
}

export interface GenreRequest {
  name: string
  description?: string
}

// ─── Publisher ────────────────────────────────────────────────────────────────

export interface Publisher {
  id: number
  name: string
  address?: string
  email?: string
  country?: string
}

export interface PublisherRequest {
  name: string
  address?: string
  email?: string
  country?: string
}

// ─── Book ─────────────────────────────────────────────────────────────────────

export interface Book {
  id: number
  isbn: string
  title: string
  description?: string
  publicationDate?: string
  language?: string
  pageCount?: number
  status: BookStatus
  publisher?: Publisher
  authors: Author[]
  genres: Genre[]
}

export interface BookRequest {
  isbn: string
  title: string
  description?: string
  publicationDate?: string
  language?: string
  pageCount?: number
  publisherId: number
  authorIds: number[]
  genreIds: number[]
}

// ─── Book Copy ────────────────────────────────────────────────────────────────

export interface BookCopy {
  id: number
  barcode: string
  condition: BookCopyCondition
  status: BookCopyStatus
  acquisitionDate?: string
  location?: string
  book: Book
}

export interface BookCopyRequest {
  barcode: string
  condition?: BookCopyCondition
  status?: BookCopyStatus
  acquisitionDate?: string
  location?: string
  bookId: number
}

// ─── Borrowed ─────────────────────────────────────────────────────────────────

export interface Borrowed {
  id: number
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: BorrowStatus
  user: User
  bookCopy: BookCopy
}

export interface BorrowedRequest {
  userId: number
  bookCopyId: number
  borrowDate: string
}

// ─── Fine ─────────────────────────────────────────────────────────────────────

export interface Fine {
  id: number
  amount: number
  assessedDate: string
  status: FineStatus
  reason?: string
  borrowed: Borrowed
}

export interface FineRequest {
  amount: number
  assessedDate: string
  reason?: string
  borrowedId: number
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: number
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  transactionId?: string
  status: PaymentStatus
  fine: Fine
}

export interface PaymentRequest {
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  transactionId?: string
  fineId: number
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number
  message: string
  timestamp?: string
}
