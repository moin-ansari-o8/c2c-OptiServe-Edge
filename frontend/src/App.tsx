import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

export default function App() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Navbar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
