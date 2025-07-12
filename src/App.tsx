
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen relative">
          {/* Enhanced Background with Multiple Layers */}
          <div 
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80')`
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
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/timetable" element={<TimetableView />} />
              <Route path="/staff" element={<StaffManagement />} />
              <Route path="/classrooms" element={<ClassroomManagement />} />
              <Route path="/conflicts" element={<ConflictResolution />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
