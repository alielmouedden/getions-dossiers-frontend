import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import FilesPage from "./pages/FilesPage";
import TransfersPage from "./pages/TransfersPage";
import MyTransfersPage from "./pages/MyTransfersPage";
import ReferFilePage from "./pages/ReferFilePage";
import SystemLogsPage from "./pages/SystemLogsPage";
import NotFound from "./pages/NotFound";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/transfers" element={<ProtectedRoute allowedRoles={['admin']}><TransfersPage /></ProtectedRoute>} />
            <Route path="/my-transfers" element={<MyTransfersPage />} />
            <Route path="/refer-file" element={<ReferFilePage />} />
            <Route path="/system-logs" element={<ProtectedRoute allowedRoles={['admin']}><SystemLogsPage /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
