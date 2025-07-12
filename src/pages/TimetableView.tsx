
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, Plus, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import TimetableGrid from "@/components/TimetableGrid";
import TimetableFilters from "@/components/TimetableFilters";
import AddTimetableEntry from "@/components/AddTimetableEntry";

const TimetableView = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const [viewMode, setViewMode] = useState("department"); // department, staff, general
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role || "");
  }, []);

  const departments = [
    { value: "CSE", label: "Computer Science & Engineering" },
    { value: "ECE", label: "Electronics & Communication" },
    { value: "MECH", label: "Mechanical Engineering" },
    { value: "CIVIL", label: "Civil Engineering" },
    { value: "EEE", label: "Electrical & Electronics" },
  ];

  const semesters = [
    { value: "odd", label: "Odd Semester (July - December)" },
    { value: "even", label: "Even Semester (January - June)" },
  ];

  const viewModes = [
    { value: "department", label: "Department View" },
    { value: "staff", label: "Staff View" },
    { value: "general", label: "General View" },
  ];

  const isAdmin = userRole === "admin";

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Timetable Management</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage department-wise and semester-wise timetables" : "View department-wise and semester-wise timetables"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {isAdmin && (
              <Button
                onClick={() => setShowAddEntry(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            )}
            <Button variant="outline" className="border-border hover:bg-accent/10">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TimetableFilters
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            selectedSemester={selectedSemester}
            setSelectedSemester={setSelectedSemester}
            viewMode={viewMode}
            setViewMode={setViewMode}
            departments={departments}
            semesters={semesters}
            viewModes={viewModes}
          />
        </motion.div>

        {/* Timetable Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <TimetableGrid
            department={selectedDepartment}
            semester={selectedSemester}
            viewMode={viewMode}
          />
        </motion.div>
      </div>

      {/* Add Entry Modal - Only show for admins */}
      {isAdmin && showAddEntry && (
        <AddTimetableEntry
          onClose={() => setShowAddEntry(false)}
          department={selectedDepartment}
          semester={selectedSemester}
        />
      )}
    </div>
  );
};

export default TimetableView;
