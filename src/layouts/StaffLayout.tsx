import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Users, BookMarked, AlertCircle,
  CreditCard, User, LogOut, Library, Tag, Building2, Copy, UserCog, Clock, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const nav = [
  { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/staff/books', label: 'Books', icon: BookOpen },
  { to: '/staff/authors', label: 'Authors', icon: User },
  { to: '/staff/genres', label: 'Genres', icon: Tag },
  { to: '/staff/publishers', label: 'Publishers', icon: Building2 },
  { to: '/staff/book-copies', label: 'Book Copies', icon: Copy },
  { to: '/staff/users', label: 'Members', icon: Users },
  { to: '/staff/borrowed', label: 'Borrows', icon: BookMarked },
  { to: '/staff/borrowed/overdue', label: 'Overdue', icon: Clock },
  { to: '/staff/fines', label: 'Fines', icon: AlertCircle },
  { to: '/staff/payments', label: 'Payments', icon: CreditCard },
]

const adminNav = [{ to: '/staff/librarians', label: 'Librarians', icon: UserCog }]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
    isActive
      ? 'bg-primary/10 text-primary font-medium'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`
}

export default function StaffLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const isAdmin = user?.role === 'ADMIN'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 border-b border-border px-4 py-5">
        <Library className="h-5 w-5 text-primary" aria-hidden="true" />
        <span className="font-semibold text-sm">LMS Staff</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Staff navigation">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={() => setOpen(false)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="mb-1 mt-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Admin
            </div>
            {adminNav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass} onClick={() => setOpen(false)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="border-t border-border p-3">
        <div className="truncate px-2 text-xs text-muted-foreground" title={user?.name}>
          {user?.name}
        </div>
        <div className="mb-2 px-2 text-xs font-medium text-primary">{user?.role}</div>
        <NavLink to="/staff/profile" className={navLinkClass} onClick={() => setOpen(false)}>
          <User className="h-4 w-4" aria-hidden="true" />
          Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-in sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="font-semibold text-sm">LMS Staff</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto" id="main-content">
          <div className="mx-auto max-w-6xl p-4 md:p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
