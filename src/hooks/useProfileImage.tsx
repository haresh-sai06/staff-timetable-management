
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProfileImage = () => {
  const [profileImage, setProfileImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to get from database first
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (profile?.avatar_url) {
        setProfileImage(profile.avatar_url);
      } else {
        // Fallback to localStorage for demo
        const stored = localStorage.getItem(`profile-image-${user.id}`);
        if (stored) {
          setProfileImage(stored);
        }
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // For demo purposes, convert to base64 and store locally
      // In production, you'd upload to Supabase storage
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
          try {
            const imageUrl = event.target?.result as string;
            
            // Store in localStorage for demo
            localStorage.setItem(`profile-image-${user.id}`, imageUrl);
            
            // Try to update database
            await supabase
              .from('profiles')
              .update({ avatar_url: imageUrl })
              .eq('id', user.id);

            setProfileImage(imageUrl);
            
            toast({
              title: "Success",
              description: "Profile picture updated successfully",
            });
            
            resolve(imageUrl);
          } catch (error) {
            console.error("Error saving image:", error);
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    profileImage,
    isUploading,
    uploadProfileImage,
    loadProfileImage,
  };
};
