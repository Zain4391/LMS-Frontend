import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

// Lazy-loaded pages — grouped by portal
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))

// Member portal
const MemberLayout = lazy(() => import('@/layouts/MemberLayout'))
const MemberDashboard = lazy(() => import('@/pages/member/Dashboard'))
const MemberBooks = lazy(() => import('@/pages/member/Books'))
const MemberBookDetail = lazy(() => import('@/pages/member/BookDetail'))
const MemberBorrows = lazy(() => import('@/pages/member/Borrows'))
const MemberFines = lazy(() => import('@/pages/member/Fines'))
const MemberPayments = lazy(() => import('@/pages/member/Payments'))
const MemberProfile = lazy(() => import('@/pages/member/Profile'))

// Staff portal
const StaffLayout = lazy(() => import('@/layouts/StaffLayout'))
const StaffDashboard = lazy(() => import('@/pages/staff/Dashboard'))
const StaffBooks = lazy(() => import('@/pages/staff/Books'))
const StaffBookDetail = lazy(() => import('@/pages/staff/BookDetail'))
const StaffBookForm = lazy(() => import('@/pages/staff/BookForm'))
const StaffAuthors = lazy(() => import('@/pages/staff/Authors'))
const StaffGenres = lazy(() => import('@/pages/staff/Genres'))
const StaffPublishers = lazy(() => import('@/pages/staff/Publishers'))
const StaffBookCopies = lazy(() => import('@/pages/staff/BookCopies'))
const StaffUsers = lazy(() => import('@/pages/staff/Users'))
const StaffUserDetail = lazy(() => import('@/pages/staff/UserDetail'))
const StaffLibrarians = lazy(() => import('@/pages/staff/Librarians'))
const StaffBorrows = lazy(() => import('@/pages/staff/Borrows'))
const StaffOverdue = lazy(() => import('@/pages/staff/Overdue'))
const StaffFines = lazy(() => import('@/pages/staff/Fines'))
const StaffPayments = lazy(() => import('@/pages/staff/Payments'))
const StaffProfile = lazy(() => import('@/pages/staff/Profile'))

import { lazy, Suspense } from 'react'

function Spin() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spin />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <S><LandingPage /></S>,
  },
  {
    path: '/login',
    element: <S><LoginPage /></S>,
  },
  {
    path: '/register',
    element: <S><RegisterPage /></S>,
  },

  // ─── Member Portal ────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['USER']} />,
    children: [
      {
        path: '/app',
        element: <S><MemberLayout /></S>,
        children: [
          { index: true, element: <S><MemberDashboard /></S> },
          { path: 'books', element: <S><MemberBooks /></S> },
          { path: 'books/:id', element: <S><MemberBookDetail /></S> },
          { path: 'borrows', element: <S><MemberBorrows /></S> },
          { path: 'fines', element: <S><MemberFines /></S> },
          { path: 'payments', element: <S><MemberPayments /></S> },
          { path: 'profile', element: <S><MemberProfile /></S> },
        ],
      },
    ],
  },

  // ─── Staff Portal ─────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />,
    children: [
      {
        path: '/staff',
        element: <S><StaffLayout /></S>,
        children: [
          { index: true, element: <S><StaffDashboard /></S> },
          { path: 'books', element: <S><StaffBooks /></S> },
          { path: 'books/new', element: <S><StaffBookForm /></S> },
          { path: 'books/:id', element: <S><StaffBookDetail /></S> },
          { path: 'books/:id/edit', element: <S><StaffBookForm /></S> },
          { path: 'authors', element: <S><StaffAuthors /></S> },
          { path: 'genres', element: <S><StaffGenres /></S> },
          { path: 'publishers', element: <S><StaffPublishers /></S> },
          { path: 'book-copies', element: <S><StaffBookCopies /></S> },
          { path: 'users', element: <S><StaffUsers /></S> },
          { path: 'users/:id', element: <S><StaffUserDetail /></S> },
          {
            path: 'librarians',
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [{ index: true, element: <S><StaffLibrarians /></S> }],
          },
          { path: 'borrowed', element: <S><StaffBorrows /></S> },
          { path: 'borrowed/overdue', element: <S><StaffOverdue /></S> },
          { path: 'fines', element: <S><StaffFines /></S> },
          { path: 'payments', element: <S><StaffPayments /></S> },
          { path: 'profile', element: <S><StaffProfile /></S> },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
])
