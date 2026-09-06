import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { Home } from './pages/Home';
import { Console } from './pages/Console';
import { Monitor } from './pages/Monitor';
import { Benchmark } from './pages/Benchmark';
import { Agents } from './pages/Agents';
import { Requests } from './pages/Requests';
import { Architecture } from './pages/Architecture';
import { Settings } from './pages/Settings';
import './styles/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'console', element: <Console /> },
      { path: 'monitor', element: <Monitor /> },
      { path: 'benchmark', element: <Benchmark /> },
      { path: 'agents', element: <Agents /> },
      { path: 'requests', element: <Requests /> },
      { path: 'architecture', element: <Architecture /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
