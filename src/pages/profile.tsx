
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { User, Upload } from "lucide-react";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  
  // Function to handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Only image files are allowed");
      return;
    }
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    
    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Store base64 string
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user data
      updateUser({
        name,
        avatar: avatarPreview || undefined
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  // Project statistics (for demonstration)
  const projectCount = 3;
  const recentProjects = [
    { id: "1", name: "E-commerce Database", updatedAt: new Date().toISOString() },
    { id: "2", name: "Blog System", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "3", name: "School Management", updatedAt: new Date(Date.now() - 172800000).toISOString() }
  ];

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <div className="grid gap-8">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={name} />
                  ) : (
                    <AvatarFallback className="text-xl">
                      {name ? getInitials(name) : <User className="h-12 w-12" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex items-center">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-2 rounded-md text-sm">
                      <Upload className="h-4 w-4" />
                      <span>Upload Avatar</span>
                    </div>
                    <Input 
                      id="avatar-upload" 
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Projects Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>ERD projects you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{projectCount}</div>
            
            {recentProjects.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Recent Projects</h4>
                <div className="space-y-2">
                  {recentProjects.map(project => (
                    <div key={project.id} className="flex justify-between items-center p-2 rounded bg-muted/50">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
