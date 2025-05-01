
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ERDProject } from "@/types/erd";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FileIcon, ImageIcon, Pencil } from "lucide-react";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ERDProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  // Load user projects
  useEffect(() => {
    if (!user?.id) return;

    try {
      const storedProjects = localStorage.getItem(`erd-projects-${user.id}`);
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Create updated user data
      const updatedUser = {
        ...user,
        name: name
      };

      // If there's a new avatar, add it to the user data
      if (avatarFile && avatarPreview) {
        updatedUser.avatar = avatarPreview;
      }

      // Update the user
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || undefined} alt={user?.name || "User"} />
                    <AvatarFallback className="text-lg">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <Label
                        htmlFor="avatar-upload"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="sr-only"
                      />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-medium">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Your name"
                    />
                  ) : (
                    <div className="flex items-center justify-between rounded-md border p-2">
                      <span>{user?.name || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center justify-between rounded-md border p-2 text-muted-foreground">
                    {user?.email || "No email set"}
                  </div>
                </div>

                <div className="pt-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button type="submit">Save Changes</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setName(user?.name || "");
                          setAvatarPreview(user?.avatar || null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                You have {projects.length} project{projects.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button onClick={() => navigate("/dashboard")}>View All</Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FileIcon className="h-12 w-12 mx-auto text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-medium">No projects yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first ERD project to get started.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate("/dashboard")}
                >
                  Create New Project
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {projects.slice(0, 5).map((project) => (
                  <div 
                    key={project.id} 
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 px-2 rounded-md"
                    onClick={() => navigate(`/editor/${project.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-md border flex items-center justify-center bg-background">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {project.schema.entities.length} entities
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
