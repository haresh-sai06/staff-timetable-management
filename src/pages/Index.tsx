
import { motion } from "framer-motion";
import { Calendar, Users, MapPin, AlertTriangle, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Timetable Management",
      description: "Manage department-wise and semester-wise timetables for Anna University structure",
      action: () => navigate("/timetable"),
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Manage staff roles, workload limits (18hrs for Asst Prof, 12hrs for Prof)",
      action: () => navigate("/staff"),
      color: "bg-green-500"
    },
    {
      icon: MapPin,
      title: "Classroom Management",
      description: "Organize classrooms, prevent double-booking, and optimize space allocation",
      action: () => navigate("/classrooms"),
      color: "bg-purple-500"
    },
    {
      icon: AlertTriangle,
      title: "Conflict Resolution",
      description: "Detect and resolve scheduling conflicts automatically",
      action: () => navigate("/conflicts"),
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-indigo-600 p-3 rounded-2xl mr-4"
            >
              <BookOpen className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
              Anna University
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-indigo-600 mb-4">
            Staff Timetable Management System
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline academic scheduling with department-wise organization, 
            conflict resolution, and mobile-optimized interface designed for Anna University's structure.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">18/12</div>
              <p className="text-gray-600">Hours/Week Limit</p>
              <p className="text-sm text-gray-500">Asst Prof / Prof</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">2</div>
              <p className="text-gray-600">Semesters</p>
              <p className="text-sm text-gray-500">Odd & Even</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">Multi</div>
              <p className="text-gray-600">Departments</p>
              <p className="text-sm text-gray-500">CSE, ECE, Mech</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`${feature.color} p-3 rounded-xl`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={feature.action}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Anna University Specific Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-800">
                Built for Anna University
              </CardTitle>
              <CardDescription className="text-lg">
                Tailored specifically for Anna University's academic structure and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <h4 className="font-semibold text-indigo-700">Academic Calendar</h4>
                  <p className="text-sm text-gray-600">• Odd Semester: July - December</p>
                  <p className="text-sm text-gray-600">• Even Semester: January - June</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-indigo-700">Staff Workload</h4>
                  <p className="text-sm text-gray-600">• Assistant Professor: 18 hours/week</p>
                  <p className="text-sm text-gray-600">• Professor: 12 hours/week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
