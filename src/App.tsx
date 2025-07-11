
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Index from "./pages/Index";
import TimetableView from "./pages/TimetableView";
import StaffManagement from "./pages/StaffManagement";
import ClassroomManagement from "./pages/ClassroomManagement";
import ConflictResolution from "./pages/ConflictResolution";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen skct-gradient"
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/timetable" element={<TimetableView />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/classrooms" element={<ClassroomManagement />} />
            <Route path="/conflicts" element={<ConflictResolution />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
