
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Timetable Management</h1>
            <p className="text-gray-600">
              Manage department-wise and semester-wise timetables for Anna University
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button
              onClick={() => setShowAddEntry(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
            <Button variant="outline">
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

      {/* Add Entry Modal */}
      {showAddEntry && (
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
