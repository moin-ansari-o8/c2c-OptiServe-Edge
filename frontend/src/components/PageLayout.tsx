import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`lg:ml-[220px] min-h-screen ${className}`}>
      <div className="max-w-[1400px] mx-auto px-6 py-8 lg:px-12 lg:py-12">
        {children}
      </div>
    </div>
  );
}
