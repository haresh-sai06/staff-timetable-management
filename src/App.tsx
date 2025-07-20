
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthGuard from "./components/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Issues from "./pages/Issues";
import TimetableView from "./pages/TimetableView";
import StaffManagement from "./pages/StaffManagement";
import ClassroomManagement from "./pages/ClassroomManagement";
import ConflictResolution from "./pages/ConflictResolution";
import NotFound from "./pages/NotFound";
import MobileSidebar from "./components/MobileSidebar";
import SubjectManagement from "./pages/SubjectManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="skct-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen relative">
            {/* Enhanced Background with Multiple Layers */}
            <div 
              className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('https://image-static.collegedunia.com/public/reviewPhotos/389741/sri-krishna-college-of-technology-coimbatore-215488.jpg')`,
                backgroundPosition: "center 70%"
              }}
            />
            
            {/* Primary gradient overlay */}
            <div className="fixed inset-0 z-10 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/40" />
            
            {/* Secondary glassmorphism layer */}
            <div className="fixed inset-0 z-15 backdrop-blur-[2px] bg-gradient-to-b from-transparent via-primary/10 to-primary/20" />
            
            {/* SKCT Logo Watermark */}
            <div className="fixed inset-0 z-16 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 opacity-[0.03] bg-accent/20 rounded-full blur-3xl" />
            </div>
            
            {/* Mobile Sidebar */}
            <MobileSidebar />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-20 min-h-screen"
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                } />
                <Route path="/profile" element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                } />
                <Route path="/issues" element={
                  <AuthGuard>
                    <Issues />
                  </AuthGuard>
                } />
                <Route path="/timetable" element={
                  <AuthGuard>
                    <TimetableView />
                  </AuthGuard>
                } />
                <Route path="/staff" element={
                  <AuthGuard>
                    <StaffManagement />
                  </AuthGuard>
                } />
                <Route path="/classrooms" element={
                  <AuthGuard>
                    <ClassroomManagement />
                  </AuthGuard>
                } />
                <Route path="/subjects" element={
                  <AuthGuard>
                    <SubjectManagement />
                  </AuthGuard>
                } />
                <Route path="/conflicts" element={
                  <AuthGuard>
                    <ConflictResolution />
                  </AuthGuard>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
