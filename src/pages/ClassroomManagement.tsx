import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Search, Edit, Trash2, Users, Monitor, Beaker, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import EditClassroomModal from "@/components/EditClassroomModal";
import DeleteClassroomModal from "@/components/DeleteClassroomModal";

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: string;
  department?: string;
  equipment: string[];
  isActive: boolean;
  currentBookings: number;
  maxBookings: number;
}

const ClassroomManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    {
      id: "1",
      name: "CSE-101",
      capacity: 60,
      type: "Lecture Hall",
      department: "CSE",
      equipment: ["Projector", "Audio System", "Whiteboard"],
      isActive: true,
      currentBookings: 25,
      maxBookings: 30
    },
    {
      id: "2",
      name: "CSE-Lab1",
      capacity: 30,
      type: "Computer Lab",
      department: "CSE",
      equipment: ["30 Computers", "Server", "Network Equipment"],
      isActive: true,
      currentBookings: 20,
      maxBookings: 25
    },
    {
      id: "3",
      name: "ECE-201",
      capacity: 45,
      type: "Lecture Hall",
      department: "ECE",
      equipment: ["Smart Board", "Audio System"],
      isActive: true,
      currentBookings: 18,
      maxBookings: 30
    },
    {
      id: "4",
      name: "MECH-Workshop",
      capacity: 25,
      type: "Workshop",
      department: "MECH",
      equipment: ["Lathe Machines", "Drilling Machines", "Safety Equipment"],
      isActive: true,
      currentBookings: 15,
      maxBookings: 20
    },
    {
      id: "5",
      name: "Seminar-Hall",
      capacity: 150,
      type: "Seminar Room",
      equipment: ["Stage", "Audio-Visual", "Air Conditioning"],
      isActive: true,
      currentBookings: 8,
      maxBookings: 15
    }
  ]);
  const { toast } = useToast();

  const roomTypes = ["all", "Lecture Hall", "Computer Lab", "Workshop", "Seminar Room"];

  const filteredClassrooms = classrooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.department && room.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || room.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddClassroom = () => {
    toast({
      title: "Add Classroom",
      description: "Opening classroom creation form...",
    });
    console.log("Adding new classroom");
  };

  const handleViewSchedule = (room: Classroom) => {
    toast({
      title: "View Schedule",
      description: `Opening schedule for ${room.name}`,
    });
    console.log("Viewing schedule for room:", room.name);
  };

  const handleBookRoom = (room: Classroom) => {
    toast({
      title: "Book Room",
      description: `Opening booking form for ${room.name}`,
    });
    console.log("Booking room:", room.name);
  };

  const handleEditRoom = (room: Classroom) => {
    console.log("Opening edit form for room:", room.name);
    setSelectedClassroom(room);
    setEditModalOpen(true);
  };

  const handleDeleteRoom = (room: Classroom) => {
    console.log("Opening delete confirmation for room:", room.name);
    setSelectedClassroom(room);
    setDeleteModalOpen(true);
  };

  const handleSaveClassroom = (updatedClassroom: Classroom) => {
    setClassrooms(prev => 
      prev.map(room => 
        room.id === updatedClassroom.id ? updatedClassroom : room
      )
    );
  };

  const handleDeleteClassroom = (classroomId: string) => {
    setClassrooms(prev => prev.filter(room => room.id !== classroomId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Computer Lab":
        return Monitor;
      case "Workshop":
        return Beaker;
      default:
        return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture Hall":
        return "bg-blue-100 text-blue-800";
      case "Computer Lab":
        return "bg-green-100 text-green-800";
      case "Workshop":
        return "bg-orange-100 text-orange-800";
      case "Seminar Room":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUtilizationColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-orange-600";
    return "text-green-600";
  };

  const getUtilizationBg = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "bg-red-100";
    if (percentage >= 75) return "bg-orange-100";
    return "bg-green-100";
  };

  return (
    <div className="min-h-screen skct-gradient">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Classroom Management</h1>
            <p className="text-foreground">
              Organize classrooms, prevent double-booking, and optimize space allocation
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleAddClassroom}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Classroom
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {classrooms.filter(r => r.isActive).length}
                  </p>
                  <p className="text-muted-foreground">Total Rooms</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Monitor className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {classrooms.filter(r => r.type === "Computer Lab").length}
                  </p>
                  <p className="text-muted-foreground">Computer Labs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {classrooms.reduce((sum, room) => sum + room.capacity, 0)}
                  </p>
                  <p className="text-muted-foreground">Total Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Beaker className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {classrooms.filter(r => r.currentBookings >= r.maxBookings * 0.9).length}
                  </p>
                  <p className="text-muted-foreground">High Utilization</p>
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
              placeholder="Search classrooms by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Room Types" : type}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Classroom Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredClassrooms.map((room, index) => {
            const IconComponent = getTypeIcon(room.type);
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-accent/10 p-2 rounded-lg">
                          <IconComponent className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{room.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Capacity: {room.capacity} students
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditRoom(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleDeleteRoom(room)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Type and Department */}
                    <div className="flex items-center justify-between">
                      <Badge className={getTypeColor(room.type)}>
                        {room.type}
                      </Badge>
                      {room.department && (
                        <Badge variant="outline" className="bg-muted">
                          {room.department}
                        </Badge>
                      )}
                    </div>

                    {/* Utilization */}
                    <div className={`p-3 rounded-lg ${getUtilizationBg(room.currentBookings, room.maxBookings)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Weekly Utilization</span>
                        <span className={`text-sm font-bold ${getUtilizationColor(room.currentBookings, room.maxBookings)}`}>
                          {room.currentBookings}/{room.maxBookings} slots
                        </span>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(room.currentBookings / room.maxBookings) * 100}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          className={`h-2 rounded-full ${
                            room.currentBookings >= room.maxBookings * 0.9 ? "bg-red-500" :
                            room.currentBookings >= room.maxBookings * 0.75 ? "bg-orange-500" :
                            "bg-green-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Equipment */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Equipment:</p>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((equipment, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewSchedule(room)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        View Schedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleBookRoom(room)}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Book Room
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredClassrooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No classrooms found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or add new classrooms.</p>
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <EditClassroomModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        classroom={selectedClassroom}
        onSave={handleSaveClassroom}
      />

      {/* Delete Modal */}
      <DeleteClassroomModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        classroom={selectedClassroom}
        onDelete={handleDeleteClassroom}
      />
    </div>
  );
};

export default ClassroomManagement;
