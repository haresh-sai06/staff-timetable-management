
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, Plus, Download, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import TimetableGrid from "@/components/TimetableGrid";
import TimetableFilters from "@/components/TimetableFilters";
import AddTimetableEntry from "@/components/AddTimetableEntry";
import StaffSearchBar from "@/components/StaffSearchBar";
import StaffSearchResults from "@/components/StaffSearchResults";
import DepartmentYearTimetable from "@/components/DepartmentYearTimetable";

const TimetableView = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const [viewMode, setViewMode] = useState("department"); // department, staff, general
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("grid");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleStaffSearch = async (query: string) => {
    setIsSearching(true);
    // Simulate API call - replace with actual API call
    setTimeout(() => {
      const mockResults = {
        staff: {
          id: "1",
          name: query,
          department: "CSE",
          role: "AsstProf",
          email: "staff@skct.edu",
          currentHours: 15,
          maxHours: 18
        },
        timetables: [
          {
            id: "1",
            subject: "Data Structures",
            subjectCode: "CS8391",
            day: "Monday",
            timeSlot: "09:00-10:00",
            classroom: "CSE-101",
            studentGroup: "CSE-3A",
            department: "CSE",
            year: "3rd",
            semester: "odd"
          }
        ],
        reports: [
          {
            id: "1",
            issueType: "Timetable Conflict",
            description: "Overlapping classes reported",
            status: "pending",
            createdAt: "2024-01-15"
          }
        ],
        conflicts: [
          {
            id: "1",
            type: "Schedule Overlap",
            description: "Multiple classes scheduled at same time",
            severity: "high",
            status: "unresolved"
          }
        ]
      };
      setSearchResults(mockResults);
      setIsSearching(false);
      setActiveTab("search");
    }, 1000);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setActiveTab("grid");
  };

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

        {/* Staff Search Bar */}
        <StaffSearchBar onSearch={handleStaffSearch} onClear={handleClearSearch} />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grid" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Grid View</span>
            </TabsTrigger>
            <TabsTrigger value="department-year" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Department by Year</span>
            </TabsTrigger>
            <TabsTrigger value="search" disabled={!searchResults} className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
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
            >
              <TimetableGrid
                department={selectedDepartment}
                semester={selectedSemester}
                viewMode={viewMode}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="department-year" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DepartmentYearTimetable
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                departments={departments}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <StaffSearchResults 
              results={searchResults} 
              isLoading={isSearching}
            />
          </TabsContent>
        </Tabs>
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
