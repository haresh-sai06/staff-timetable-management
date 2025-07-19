import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, Plus, Download, Eye, Search, X } from "lucide-react";
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
import AutoScheduleForm from "@/components/AutoScheduleForm";
import TimetablePreview from "@/components/TimetablePreview";
import ThemeToggle from "@/components/ThemeToggle";
import ExportTimetable from "@/components/ExportTimetable";
import EditClassModal from "@/components/EditClassModal";
import AddClassModal from "@/components/AddClassModal";

const TimetableView = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const [viewMode, setViewMode] = useState("department"); // department, staff, general
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("grid");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [schedulingConflicts, setSchedulingConflicts] = useState([]);
  const [addClassContext, setAddClassContext] = useState({ day: "", timeSlot: "" });
  const [editClassContext, setEditClassContext] = useState({ entryId: "", isOpen: false });

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

  const handleAutoGenerate = async (department: string, year: string, semester: string, conditions: any, staffData?: any[]) => {
    setIsGenerating(true);
    
    console.log("Generating with conditions:", conditions);
    console.log("Staff allocation data:", staffData);
    
    // Use provided staff data or mock data for demo
    const mockStaff = staffData && staffData.length > 0 ? staffData : [
      { id: "1", name: "Dr. Priya Sharma", role: "AsstProf" as const, department, max_hours: 18, current_hours: 12 },
      { id: "2", name: "Prof. Rajesh Kumar", role: "Prof" as const, department, max_hours: 12, current_hours: 8 },
    ];

    const mockSubjects = [
      { id: "1", name: "Data Structures", code: "CS8391", type: "theory" as const, credits: 3, department, year, semester, priority: conditions.timePreference || "morning" as const },
      { id: "2", name: "Database Lab", code: "CS8392", type: "lab" as const, credits: 2, department, year, semester, priority: conditions.prioritizeLabsInAfternoon ? "afternoon" as const : "morning" as const },
    ];

    const mockClassrooms = [
      { id: "1", name: "CSE-101", type: "lecture" as const, capacity: 60, department },
      { id: "2", name: "CSE-Lab1", type: "lab" as const, capacity: 30, department },
    ];

    const mockStudentGroups = [
      { id: "1", name: `${department}-${year}A`, department, year, strength: 60 },
    ];

    // Simulate API call delay
    setTimeout(async () => {
      try {
        const { timetableScheduler } = await import("../utils/timetableScheduler");
        const result = await timetableScheduler.generateTimetable(
          mockSubjects,
          mockStaff,
          mockClassrooms,
          mockStudentGroups,
          department,
          year,
          semester
        );

        setGeneratedTimetable(result.timetable);
        setSchedulingConflicts(result.conflicts);
        setIsGenerating(false);
        setActiveTab("preview");
      } catch (error) {
        console.error("Scheduling error:", error);
        setSchedulingConflicts([
          { type: "system_error", description: "Failed to generate timetable. Please try again.", severity: "high" }
        ]);
        setIsGenerating(false);
      }
    }, 2000);
  };

  const handleSaveGenerated = () => {
    console.log("Saving generated timetable:", generatedTimetable);
  };

  const handleEditEntry = (entryId: string, updates: any) => {
    console.log("Editing entry:", entryId, updates);
  };

  const handleAddClassFromGrid = (day: string, timeSlot: string) => {
    setAddClassContext({ day, timeSlot });
    setShowAddClassModal(true);
  };

  const handleEditClassFromGrid = (entryId: string) => {
    console.log("Opening edit modal for entry:", entryId);
    setEditClassContext({ entryId, isOpen: true });
  };

  const handleDeleteClassFromGrid = (entryId: string) => {
    console.log("Deleting class entry:", entryId);
    // TODO: Implement actual deletion logic with database call
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
            <p className="text-foreground">
              {isAdmin ? "Manage department-wise and semester-wise timetables with automated scheduling" : "View department-wise and semester-wise timetables"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0 items-center">
            <ThemeToggle />
            <ExportTimetable 
              department={selectedDepartment} 
              semester={selectedSemester} 
            />
            {isAdmin && (
              <>
                <Button
                  onClick={() => setShowAutoSchedule(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Auto Generate
                </Button>
                <Button
                  onClick={() => setShowAddEntry(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <StaffSearchBar onSearch={handleStaffSearch} onClear={handleClearSearch} />

        {showAutoSchedule && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <Card className="glassmorphism-strong border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Automated Timetable Generation</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAutoSchedule(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <AutoScheduleForm
                    onGenerate={handleAutoGenerate}
                    isGenerating={isGenerating}
                    generatedTimetable={generatedTimetable}
                    conflicts={schedulingConflicts}
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grid" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Grid View</span>
            </TabsTrigger>
            <TabsTrigger value="department-year" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Department by Year</span>
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedTimetable} className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="search" disabled={!searchResults} className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TimetableGrid
                department={selectedDepartment}
                semester={selectedSemester}
                viewMode={viewMode}
                onAddClass={handleAddClassFromGrid}
                onEditClass={handleEditClassFromGrid}
                onDeleteClass={handleDeleteClassFromGrid}
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

          <TabsContent value="preview" className="space-y-6">
            {generatedTimetable && (
              <TimetablePreview
                timetableData={generatedTimetable}
                onSave={() => console.log("Saving generated timetable:", generatedTimetable)}
                onEdit={(entryId: string, updates: any) => console.log("Editing entry:", entryId, updates)}
                isEditable={isAdmin}
              />
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <StaffSearchResults 
              results={searchResults} 
              isLoading={isSearching}
            />
          </TabsContent>
        </Tabs>
      </div>

      {isAdmin && showAddEntry && (
        <AddTimetableEntry
          onClose={() => setShowAddEntry(false)}
          department={selectedDepartment}
          semester={selectedSemester}
        />
      )}

      <AddClassModal
        isOpen={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        department={selectedDepartment}
        day={addClassContext.day}
        timeSlot={addClassContext.timeSlot}
      />

      <EditClassModal
        isOpen={editClassContext.isOpen}
        onClose={() => setEditClassContext({ entryId: "", isOpen: false })}
        entryId={editClassContext.entryId}
        department={selectedDepartment}
      />
    </div>
  );
};

export default TimetableView;
