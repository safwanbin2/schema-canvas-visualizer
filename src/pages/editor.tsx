
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { SchemaSidebar } from "@/components/editor/schema-sidebar";
import { ERDCanvas } from "@/components/editor/erd-canvas";
import { ERDSchema, ERDProject } from "@/types/erd";
import { createDefaultSchema } from "@/utils/erd-utils";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<ERDProject | null>(null);
  const [schema, setSchema] = useState<ERDSchema>({ entities: [], relationships: [] });
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // Load project
  useEffect(() => {
    if (!id || !user?.id) return;

    setLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const storedProjects = localStorage.getItem(`erd-projects-${user.id}`);
      if (storedProjects) {
        try {
          const projects: ERDProject[] = JSON.parse(storedProjects);
          const currentProject = projects.find(p => p.id === id);
          
          if (currentProject) {
            setProject(currentProject);
            // If the project has an existing schema, use that, otherwise create a default
            if (currentProject.schema && 
                currentProject.schema.entities && 
                currentProject.schema.entities.length > 0) {
              setSchema(currentProject.schema);
            } else {
              setSchema(createDefaultSchema());
            }
          } else {
            toast.error("Project not found");
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Failed to parse stored projects:', error);
          toast.error("Failed to load project");
        }
      } else {
        toast.error("No projects found");
        navigate('/dashboard');
      }
      
      setLoading(false);
    }, 500);
  }, [id, user?.id, navigate]);
  
  // Save project
  const saveProject = () => {
    if (!project || !user?.id) return;
    
    const updatedProject = {
      ...project,
      schema,
      updatedAt: new Date().toISOString(),
    };
    
    const storedProjects = localStorage.getItem(`erd-projects-${user.id}`);
    if (storedProjects) {
      try {
        const projects: ERDProject[] = JSON.parse(storedProjects);
        const updatedProjects = projects.map(p => 
          p.id === project.id ? updatedProject : p
        );
        
        localStorage.setItem(`erd-projects-${user.id}`, JSON.stringify(updatedProjects));
        setProject(updatedProject);
        toast.success("Project saved successfully");
      } catch (error) {
        console.error('Failed to save project:', error);
        toast.error("Failed to save project");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Project not found</h1>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Schema editor sidebar */}
      <SchemaSidebar 
        schema={schema} 
        onSchemaChange={setSchema}
        selectedEntityId={selectedEntityId}
        setSelectedEntityId={setSelectedEntityId}
      />
      
      {/* Main editor area - make sure this takes the full available width */}
      <div className="flex flex-col flex-1 h-full w-full">
        {/* Editor toolbar */}
        <div className="p-4 border-b flex justify-between items-center bg-background">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          </div>
          
          <Button onClick={saveProject}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
        
        {/* Canvas area - ensure full width and height */}
        <div className="flex-1 w-full h-full overflow-hidden">
          <ERDCanvas 
            schema={schema} 
            selectedEntityId={selectedEntityId}
            setSelectedEntityId={setSelectedEntityId}
            onSchemaChange={setSchema}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
