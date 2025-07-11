
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save, Edit3, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "user@skct.edu",
    role: localStorage.getItem("userRole") || "user",
    profilePicture: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 1MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Mock API call - replace with actual API
    setTimeout(() => {
      localStorage.setItem("userName", profileData.name);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
      setIsEditing(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground";
  };

  const getRoleIcon = (role: string) => {
    return role === "admin" ? Shield : Users;
  };

  return (
    <div className="min-h-screen skct-gradient">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card/95 backdrop-blur-md rounded-lg shadow-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-montserrat font-bold text-2xl text-foreground flex items-center space-x-2">
                <User className="h-6 w-6 text-accent" />
                <span>Profile</span>
              </h1>
              
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-muted-foreground text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Profile Picture */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.profilePicture} alt={profileData.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {profileData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full p-2 shadow-lg transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Role Badge */}
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profileData.role)}`}>
                  {(() => {
                    const RoleIcon = getRoleIcon(profileData.role);
                    return <RoleIcon className="h-4 w-4" />;
                  })()}
                  <span className="capitalize">{profileData.role}</span>
                </div>
              </motion.div>

              {/* Profile Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled={true}
                    className="mt-1 bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. Contact admin for email updates.
                  </p>
                </div>

                <div>
                  <Label className="text-foreground font-medium">
                    Role
                  </Label>
                  <div className="mt-1 p-3 bg-muted/20 rounded-md border border-border">
                    <p className="text-foreground capitalize">{profileData.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {profileData.role === "admin" 
                        ? "Full access to all system features and management capabilities"
                        : "View-only access to timetables and ability to raise issues"
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
