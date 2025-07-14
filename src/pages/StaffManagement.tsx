import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Edit, Trash2, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

interface Staff {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  maxHours: number;
  currentHours: number;
  subjects: string[];
  isActive: boolean;
}

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    console.log("Debug - User Role:", role);
    console.log("Debug - User Email:", email);
    console.log("Debug - Is Admin:", role === "admin");
    setUserRole(role || "");
  }, []);

  const staffData: Staff[] = [
    {
      id: "1",
      name: "Dr. Priya Sharma",
      department: "CSE",
      role: "AsstProf",
      email: "priya.sharma@university.edu",
      maxHours: 18,
      currentHours: 15,
      subjects: ["Data Structures", "Algorithms", "Database Management"],
      isActive: true
    },
    {
      id: "2",
      name: "Prof. Rajesh Kumar",
      department: "CSE",
      role: "Prof",
      email: "rajesh.kumar@university.edu",
      maxHours: 12,
      currentHours: 10,
      subjects: ["Computer Networks", "Operating Systems"],
      isActive: true
    },
    {
      id: "3",
      name: "Dr. Anitha Reddy",
      department: "ECE",
      role: "AsstProf",
      email: "anitha.reddy@university.edu",
      maxHours: 18,
      currentHours: 16,
      subjects: ["Digital Electronics", "Communication Systems"],
      isActive: true
    },
    {
      id: "4",
      name: "Prof. Suresh Nair",
      department: "MECH",
      role: "Prof",
      email: "suresh.nair@university.edu",
      maxHours: 12,
      currentHours: 8,
      subjects: ["Thermodynamics", "Fluid Mechanics"],
      isActive: true
    }
  ];

  const departments = ["all", "CSE", "ECE", "MECH", "CIVIL", "EEE"];

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || staff.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getRoleColor = (role: string) => {
    return role === "Prof" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
  };

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-orange-600";
    return "text-green-600";
  };

  const getWorkloadBg = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "bg-red-100";
    if (percentage >= 75) return "bg-orange-100";
    return "bg-green-100";
  };

  const isAdmin = userRole === "admin";

  const handleEditStaff = (staffId: string) => {
    console.log("Edit staff:", staffId);
    // TODO: Implement edit functionality
  };

  const handleDeleteStaff = (staffId: string) => {
    console.log("Delete staff:", staffId);
    // TODO: Implement delete functionality
  };

  const handleAddStaff = () => {
    console.log("Add new staff");
    // TODO: Implement add staff functionality
  };

  const handleAssignSubject = (staffId: string) => {
    console.log("Assign subject to staff:", staffId);
    // TODO: Implement assign subject functionality
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Debug Info - Remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
            Debug: User Role = "{userRole}" | Is Admin = {isAdmin.toString()}
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Staff Management</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage faculty workload, roles, and assignments for Anna University departments" : "View faculty information and workload for Anna University departments"}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {isAdmin && (
              <Button 
                onClick={handleAddStaff}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-card/80 border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {staffData.filter(s => s.isActive).length}
                  </p>
                  <p className="text-muted-foreground">Active Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {staffData.filter(s => s.role === "Prof").length}
                  </p>
                  <p className="text-muted-foreground">Professors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {staffData.filter(s => s.role === "AsstProf").length}
                  </p>
                  <p className="text-muted-foreground">Asst. Professors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {staffData.filter(s => s.currentHours >= s.maxHours * 0.9).length}
                  </p>
                  <p className="text-muted-foreground">Near Limit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-card/80 border-border"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-card/80 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "all" ? "All Departments" : dept}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Staff Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredStaff.map((staff, index) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow bg-card/80 border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground">{staff.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{staff.email}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-accent/10"
                          onClick={() => handleEditStaff(staff.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Department and Role */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-muted border-border">
                      {staff.department}
                    </Badge>
                    <Badge className={getRoleColor(staff.role)}>
                      {staff.role === "Prof" ? "Professor" : "Assistant Professor"}
                    </Badge>
                  </div>

                  {/* Workload */}
                  <div className={`p-3 rounded-lg ${getWorkloadBg(staff.currentHours, staff.maxHours)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Weekly Workload</span>
                      <span className={`text-sm font-bold ${getWorkloadColor(staff.currentHours, staff.maxHours)}`}>
                        {staff.currentHours}/{staff.maxHours} hrs
                      </span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(staff.currentHours / staff.maxHours) * 100}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className={`h-2 rounded-full ${
                          staff.currentHours >= staff.maxHours * 0.9 ? "bg-red-500" :
                          staff.currentHours >= staff.maxHours * 0.75 ? "bg-orange-500" :
                          "bg-green-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Assigned Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {staff.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-accent/10">
                      View Schedule
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-border hover:bg-accent/10"
                        onClick={() => handleAssignSubject(staff.id)}
                      >
                        Assign Subject
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredStaff.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No staff members found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or add new staff members.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
