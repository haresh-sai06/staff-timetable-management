
import { motion } from "framer-motion";
import { Calendar, Users, MapPin, AlertTriangle, Clock, BookOpen, Award, Building2, Trophy } from "lucide-react";
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
      description: "Manage department-wise and semester-wise timetables for SKCT's 11 UG and 4 PG programs",
      action: () => navigate("/timetable"),
      color: "bg-primary"
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Manage faculty workload limits (18hrs for Asst Prof, 12hrs for Prof) across departments",
      action: () => navigate("/staff"),
      color: "bg-accent"
    },
    {
      icon: MapPin,
      title: "Classroom Management",
      description: "Organize classrooms across SKCT's 11.5-acre campus and prevent double-booking",
      action: () => navigate("/classrooms"),
      color: "bg-primary"
    },
    {
      icon: AlertTriangle,
      title: "Conflict Resolution",
      description: "Detect and resolve scheduling conflicts automatically with smart suggestions",
      action: () => navigate("/conflicts"),
      color: "bg-accent"
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
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-primary/90 backdrop-blur-sm p-4 rounded-2xl mr-4 shadow-lg border border-border"
            >
              <BookOpen className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-accent font-montserrat">
                SKCT
              </h1>
              <p className="text-lg text-accent/80 font-montserrat">Timetable Management</p>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 font-montserrat">
            Sri Krishna College of Technology
          </h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-accent/20 backdrop-blur-sm text-accent rounded-full text-sm font-medium border border-accent/30">
              Autonomous
            </span>
            <span className="px-3 py-1 bg-accent/20 backdrop-blur-sm text-accent rounded-full text-sm font-medium border border-accent/30">
              Anna University Affiliated
            </span>
            <span className="px-3 py-1 bg-accent/20 backdrop-blur-sm text-accent rounded-full text-sm font-medium border border-accent/30">
              NIRF Rank 83 (2024)
            </span>
            <span className="px-3 py-1 bg-accent/20 backdrop-blur-sm text-accent rounded-full text-sm font-medium border border-accent/30">
              7 NBA Accredited Programs
            </span>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Streamline academic scheduling for SKCT's comprehensive programs with 
            department-wise organization, conflict resolution, and mobile-optimized interface 
            designed for our autonomous institution.
          </p>
        </motion.div>

        {/* SKCT Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="text-center hover:shadow-xl transition-shadow bg-card/90 backdrop-blur-md border-border/50">
            <CardContent className="pt-6">
              <Award className="h-12 w-12 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-accent font-montserrat">1998</div>
              <p className="text-foreground">Established</p>
              <p className="text-sm text-muted-foreground">25+ Years Excellence</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-xl transition-shadow bg-card/90 backdrop-blur-md border-border/50">
            <CardContent className="pt-6">
              <Building2 className="h-12 w-12 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-accent font-montserrat">11.5</div>
              <p className="text-foreground">Acres Campus</p>
              <p className="text-sm text-muted-foreground">Modern Facilities</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-xl transition-shadow bg-card/90 backdrop-blur-md border-border/50">
            <CardContent className="pt-6">
              <BookOpen className="h-12 w-12 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-accent font-montserrat">15</div>
              <p className="text-foreground">Programs</p>
              <p className="text-sm text-muted-foreground">11 UG + 4 PG</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-xl transition-shadow bg-card/90 backdrop-blur-md border-border/50">
            <CardContent className="pt-6">
              <Trophy className="h-12 w-12 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-accent font-montserrat">83</div>
              <p className="text-foreground">NIRF Rank</p>
              <p className="text-sm text-muted-foreground">Engineering 2024</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
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
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 bg-card/90 backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`${feature.color}/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-border/30`}>
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground font-montserrat">{feature.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={feature.action}
                    className="w-full bg-primary/90 hover:bg-primary backdrop-blur-sm text-primary-foreground font-medium transition-all duration-300 border border-border/30"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* SKCT Specific Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-card/90 backdrop-blur-md border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-accent font-montserrat">
                Built for SKCT Excellence
              </CardTitle>
              <CardDescription className="text-lg text-foreground">
                Tailored for Sri Krishna College of Technology's autonomous academic structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="space-y-2">
                  <h4 className="font-semibold text-accent font-montserrat">Academic Calendar</h4>
                  <p className="text-sm text-muted-foreground">• Odd Semester: July - December</p>
                  <p className="text-sm text-muted-foreground">• Even Semester: January - June</p>
                  <p className="text-sm text-muted-foreground">• CBCS Curriculum Support</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-accent font-montserrat">Faculty Workload</h4>
                  <p className="text-sm text-muted-foreground">• Assistant Professor: 18 hours/week</p>
                  <p className="text-sm text-muted-foreground">• Professor: 12 hours/week</p>
                  <p className="text-sm text-muted-foreground">• Real-time workload tracking</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-accent font-montserrat">SKCT Departments</h4>
                  <p className="text-sm text-muted-foreground">• CSE, ECE, Mechanical, IT</p>
                  <p className="text-sm text-muted-foreground">• AI & DS, Civil, EEE</p>
                  <p className="text-sm text-muted-foreground">• 7 NBA Accredited Programs</p>
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
