
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FilePlus, Trash, Edit } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load projects from localStorage
    const storedProjects = localStorage.getItem(`erd-projects-${user?.id}`);
    if (storedProjects) {
      try {
        setProjects(JSON.parse(storedProjects));
      } catch (error) {
        console.error('Failed to parse stored projects:', error);
      }
    } else {
      // Create a sample project for new users
      const sampleProject: Project = {
        id: "1",
        name: "Sample Project",
        description: "A demo ERD project to get you started.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects([sampleProject]);
      localStorage.setItem(`erd-projects-${user?.id}`, JSON.stringify([sampleProject]));
    }
  }, [user?.id]);

  const createProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem(`erd-projects-${user?.id}`, JSON.stringify(updatedProjects));
      
      setNewProjectName("");
      setNewProjectDescription("");
      setIsDialogOpen(false);
      setIsLoading(false);
      toast.success("Project created successfully");
    }, 500);
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem(`erd-projects-${user?.id}`, JSON.stringify(updatedProjects));
    toast.success("Project deleted successfully");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name" 
                  placeholder="My ERD Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  placeholder="A brief description of your project"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createProject} disabled={isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                {project.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => deleteProject(project.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate(`/editor/${project.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Open
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6">Create your first ERD project to get started</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <FilePlus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
