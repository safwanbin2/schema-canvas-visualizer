
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span>ERD Visualizer</span>
        </div>
        <ThemeToggle />
      </header>
      
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <Outlet />
        </div>
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>© 2025 ERD Visualizer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
