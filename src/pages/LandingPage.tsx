import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex items-center gap-3">
        <BookOpen className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Library Management System</h1>
      </div>
      <p className="max-w-md text-center text-muted-foreground">
        Discover, borrow, and manage books with ease.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Register
        </Link>
      </div>
    </div>
  )
}
