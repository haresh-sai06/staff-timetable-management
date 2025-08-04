
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import StaffForm from "@/components/StaffForm";
import StaffActions from "@/components/StaffActions";
import TutorAssignmentModal from "@/components/TutorAssignmentModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Staff {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  max_hours: number;
  current_hours: number;
  subjects: string[];
  is_active: boolean;
  tutor_assignments?: Array<{
    id: string;
    classroom: string;
    academic_year: string;
    semester: string;
  }>;
}

interface UserProfile {
  role: string;
}

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [selectedStaffForTutor, setSelectedStaffForTutor] = useState<Staff | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkAuthAndFetchData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Auth error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (!profileError && profile) {
              setUserProfile(profile);
            } else {
              setUserProfile({
                role: session.user.email?.includes('admin') ? 'admin' : 'user'
              });
            }
          } catch (err) {
            console.error('Profile fetch error:', err);
            setUserProfile({
              role: session.user.email?.includes('admin') ? 'admin' : 'user'
            });
          }

          await fetchStaff();
          await fetchSubjects();
        }
      } catch (error) {
        console.error('Error in checkAuthAndFetchData:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuthAndFetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setUserProfile(null);
          setStaffData([]);
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          
          setTimeout(async () => {
            if (mounted) {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('id', session.user.id)
                  .single();
                
                setUserProfile(profile || {
                  role: session.user.email?.includes('admin') ? 'admin' : 'user'
                });
                
                await fetchStaff();
                await fetchSubjects();
              } catch (err) {
                console.error('Error fetching profile on auth change:', err);
              }
            }
          }, 100);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchStaff = async () => {
    try {
      const { data: staffResult, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('name');

      if (staffError) throw staffError;

      // Fetch tutor assignments for each staff member
      const staffWithTutors = await Promise.all(
        (staffResult || []).map(async (staff) => {
          const { data: tutorAssignments } = await supabase
            .from('tutor_assignments')
            .select('id, classroom, academic_year, semester')
            .eq('staff_id', staff.id)
            .eq('is_active', true);

          return {
            ...staff,
            tutor_assignments: tutorAssignments || []
          };
        })
      );

      setStaffData(staffWithTutors);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to fetch staff data",
        variant: "destructive",
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
    }
  };

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

  const isAdmin = userProfile?.role === "admin";

  const handleEditStaff = (staffId: string) => {
    const staff = staffData.find(s => s.id === staffId);
    if (staff) {
      setEditingStaff(staff);
      setShowForm(true);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete staff members",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        const { error } = await supabase
          .from('staff')
          .delete()
          .eq('id', staffId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Staff member deleted successfully",
        });

        fetchStaff();
      } catch (error: any) {
        console.error('Error deleting staff:', error);
        toast({
          title: "Error",
          description: "Failed to delete staff member",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setShowForm(true);
  };

  const handleViewStaff = (staffId: string) => {
    toast({
      title: "View Details",
      description: "Staff details view will be implemented",
    });
  };

  const handleAssignTutor = (staffId: string) => {
    const staff = staffData.find(s => s.id === staffId);
    if (staff) {
      setSelectedStaffForTutor(staff);
      setShowTutorModal(true);
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingStaff(null);
    fetchStaff();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  const handleTutorModalClose = () => {
    setShowTutorModal(false);
    setSelectedStaffForTutor(null);
  };

  const handleTutorAssignmentSuccess = () => {
    fetchStaff();
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              <p className="text-muted-foreground">Loading staff data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <StaffForm
            initialData={editingStaff ? {
              name: editingStaff.name,
              email: editingStaff.email,
              department: editingStaff.department,
              role: editingStaff.role,
              subjects: editingStaff.subjects,
              maxHours: editingStaff.max_hours
            } : undefined}
            onSubmit={async (data) => {
              try {
                if (editingStaff) {
                  // Update existing staff
                  const { error } = await supabase
                    .from('staff')
                    .update({
                      name: data.name,
                      email: data.email,
                      department: data.department,
                      role: data.role,
                      subjects: data.subjects || [],
                      max_hours: data.maxHours || 18
                    })
                    .eq('id', editingStaff.id);

                  if (error) {
                    console.error('Error updating staff:', error);
                    throw error;
                  }

                  toast({
                    title: "Success",
                    description: "Staff member updated successfully",
                  });
                } else {
                  // Create new staff
                  const { error } = await supabase
                    .from('staff')
                    .insert({
                      name: data.name,
                      email: data.email,
                      department: data.department,
                      role: data.role,
                      subjects: data.subjects || [],
                      max_hours: data.maxHours || 18,
                      current_hours: 0,
                      is_active: true
                    });

                  if (error) throw error;

                  toast({
                    title: "Success",
                    description: "Staff member added successfully",
                  });
                }
                handleFormSave();
              } catch (error: any) {
                console.error('Error saving staff:', error);
                toast({
                  title: "Error",
                  description: "Failed to save staff member",
                  variant: "destructive",
                });
              }
            }}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Staff Management</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage faculty workload, roles, tutor assignments for Anna University departments" : "View faculty information and workload for Anna University departments"}
            </p>
            {userProfile && (
              <div className="mt-2">
                <Badge variant={isAdmin ? "destructive" : "secondary"}>
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} Access
                </Badge>
              </div>
            )}
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
                    {staffData.filter(s => s.is_active).length}
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
                    {staffData.filter(s => s.current_hours >= s.max_hours * 0.9).length}
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
                    <StaffActions
                      staffId={staff.id}
                      isAdmin={isAdmin}
                      onEdit={handleEditStaff}
                      onDelete={handleDeleteStaff}
                      onView={handleViewStaff}
                      onAssignTutor={handleAssignTutor}
                    />
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
                  <div className={`p-3 rounded-lg ${getWorkloadBg(staff.current_hours, staff.max_hours)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Weekly Workload</span>
                      <span className={`text-sm font-bold ${getWorkloadColor(staff.current_hours, staff.max_hours)}`}>
                        {staff.current_hours}/{staff.max_hours} hrs
                      </span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((staff.current_hours / staff.max_hours) * 100, 100)}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className={`h-2 rounded-full ${
                          staff.current_hours >= staff.max_hours * 0.9 ? "bg-red-500" :
                          staff.current_hours >= staff.max_hours * 0.75 ? "bg-orange-500" :
                          "bg-green-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Tutor Assignments */}
                  {staff.tutor_assignments && staff.tutor_assignments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Tutor for Classrooms:</p>
                      <div className="flex flex-wrap gap-1">
                        {staff.tutor_assignments.map((assignment, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {assignment.classroom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subjects */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Assigned Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {staff.subjects.map((subjectId, idx) => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return (
                          <Badge key={idx} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                            {subject ? `${subject.name} (${subject.code})` : subjectId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredStaff.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No staff members found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria{isAdmin ? " or add new staff members" : ""}.</p>
          </motion.div>
        )}
      </div>

      {/* Tutor Assignment Modal */}
      {selectedStaffForTutor && (
        <TutorAssignmentModal
          staffId={selectedStaffForTutor.id}
          staffName={selectedStaffForTutor.name}
          department={selectedStaffForTutor.department}
          isOpen={showTutorModal}
          onClose={handleTutorModalClose}
          onSuccess={handleTutorAssignmentSuccess}
        />
      )}
    </div>
  );
};

export default StaffManagement;
