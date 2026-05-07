import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppShell from '@/components/AppShell';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/hooks/AuthProvider';
import { queryClient } from '@/lib/queryClient';

import Library from '@/pages/Library';
import Login from '@/pages/Login';
import Me from '@/pages/Me';
import Queue from '@/pages/Queue';
import Search from '@/pages/Search';
import Watchlist from '@/pages/Watchlist';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Library />} />
                <Route path="search" element={<Search />} />
                <Route path="queue" element={<Queue />} />
                <Route path="watchlist" element={<Watchlist />} />
                <Route path="me" element={<Me />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
