import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import AddSubject from "@/components/AddSubject";
import EditSubject from "@/components/EditSubject";
import DeleteSubject from "@/components/DeleteSubject";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

interface UserProfile {
  role: string;
}

const SubjectManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subjectData, setSubjectData] = useState<Tables<"subjects">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Tables<"subjects"> | null>(null);

  // Fetch user authentication and subject data
  useEffect(() => {
    let mounted = true;

    const checkAuthAndFetchData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Auth error:', error);
          toast.error("Authentication failed");
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

          await fetchSubjects();
        } else {
          toast.error("No user session found. Please log in.");
        }
      } catch (error) {
        console.error('Error in checkAuthAndFetchData:', error);
        toast.error("Failed to initialize data");
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
          setSubjectData([]);
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

  // Fetch subjects from Supabase
  const fetchSubjects = async () => {
    try {
      const { data: subjectResult, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectError) throw subjectError;

      setSubjectData(subjectResult || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error("Failed to fetch subject data");
    }
  };

  // Define departments
  const departments = ["all", "CSE", "ECE", "MECH", "CIVIL", "EEE"];

  // Filter subjects based on search and department
  const filteredSubjects = subjectData.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || subject.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Determine badge color for active status
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  // Check if user is admin
  const isAdmin = userProfile?.role === "admin";

  // Handle modal actions
  const handleAddSubject = () => {
    setShowAddModal(true);
  };

  const handleEditSubject = (subjectId: string) => {
    const subject = subjectData.find(s => s.id === subjectId);
    if (subject) {
      setSelectedSubject(subject);
      setShowEditModal(true);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    const subject = subjectData.find(s => s.id === subjectId);
    if (subject) {
      setSelectedSubject(subject);
      setShowDeleteModal(true);
    }
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedSubject(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              <p className="text-muted-foreground">Loading subject data...</p>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Subject Management</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage subjects for Anna University departments" : "View subject information for Anna University departments"}
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
                onClick={handleAddSubject}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-card/80 border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {subjectData.length}
                  </p>
                  <p className="text-muted-foreground">Total Subjects</p>
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
                    {subjectData.filter(s => s.is_active).length}
                  </p>
                  <p className="text-muted-foreground">Active Subjects</p>
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
                    {[...new Set(subjectData.map(s => s.department))].length}
                  </p>
                  <p className="text-muted-foreground">Departments</p>
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
              placeholder="Search subjects by name or code..."
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

        {/* Subject Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow bg-card/80 border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground">{subject.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{subject.code}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSubject(subject.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-muted border-border">
                      {subject.department}
                    </Badge>
                    <Badge className={getStatusColor(subject.is_active)}>
                      {subject.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Credits: {subject.credits}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredSubjects.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No subjects found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria{isAdmin ? " or add new subjects" : ""}.</p>
          </motion.div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddSubject onClose={handleCloseModals} onSave={() => { handleCloseModals(); fetchSubjects(); }} />
        )}
        {showEditModal && selectedSubject && (
          <EditSubject
            subject={selectedSubject}
            onClose={handleCloseModals}
            onSave={() => { handleCloseModals(); fetchSubjects(); }}
          />
        )}
        {showDeleteModal && selectedSubject && (
          <DeleteSubject
            subject={selectedSubject}
            onClose={handleCloseModals}
            onDelete={() => { handleCloseModals(); fetchSubjects(); }}
          />
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;