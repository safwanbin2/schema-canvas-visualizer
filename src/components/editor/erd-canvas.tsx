
import React, { useRef, useState, useEffect } from "react";
import { ERDSchema, Entity, Relationship } from "@/types/erd";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import EntityNode from "./entity-node";
import RelationshipEdge from "./relationship-edge";

interface ERDCanvasProps {
  schema: ERDSchema;
  selectedEntityId?: string;
  setSelectedEntityId: (id?: string) => void;
  onSchemaChange: (schema: ERDSchema) => void;
}

export const ERDCanvas: React.FC<ERDCanvasProps> = ({
  schema,
  selectedEntityId,
  setSelectedEntityId,
  onSchemaChange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState(false);
  const [entityBeingDragged, setEntityBeingDragged] = useState<string | null>(null);
  const [entityDragStart, setEntityDragStart] = useState({ x: 0, y: 0 });

  // Handle zoom actions
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  // Handle canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (dragMode) {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Handle canvas dragging
    if (dragging && dragMode) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
    
    // Handle entity dragging
    if (entityBeingDragged) {
      const entity = schema.entities.find(e => e.id === entityBeingDragged);
      if (!entity) return;
      
      const dx = (e.clientX - entityDragStart.x) / zoom;
      const dy = (e.clientY - entityDragStart.y) / zoom;
      
      const updatedEntity = {
        ...entity,
        position: {
          x: entity.position.x + dx,
          y: entity.position.y + dy,
        },
      };
      
      const updatedSchema = {
        ...schema,
        entities: schema.entities.map(e => 
          e.id === entityBeingDragged ? updatedEntity : e
        ),
      };
      
      onSchemaChange(updatedSchema);
      setEntityDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setDragging(false);
    setEntityBeingDragged(null);
  };

  // Handle entity dragging
  const handleEntityMouseDown = (e: React.MouseEvent, entityId: string) => {
    if (dragMode) return;
    
    e.stopPropagation();
    setSelectedEntityId(entityId);
    setEntityBeingDragged(entityId);
    setEntityDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle click on canvas background (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedEntityId(undefined);
    }
  };

  // Toggle drag mode
  const toggleDragMode = () => {
    setDragMode(!dragMode);
  };

  // Handle mouse wheel for zooming with Ctrl key
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 2));
    }
  };

  // Add wheel event listener
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvasElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Canvas controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={dragMode ? "default" : "secondary"}
          onClick={toggleDragMode}
          title="Pan mode"
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/60 backdrop-blur-sm p-2 rounded-md text-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* Canvas area - removed overflow-hidden */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-default bg-canvas-background"
        style={{ 
          cursor: dragMode ? (dragging ? "grabbing" : "grab") : "default"
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onClick={handleCanvasClick}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Draw relationship edges first so they appear behind entities */}
          <svg
            width="100%"
            height="100%"
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              pointerEvents: "none", 
              overflow: "visible"
            }}
          >
            {schema.relationships.map((relationship) => {
              const sourceEntity = schema.entities.find(
                (e) => e.id === relationship.sourceEntityId
              );
              const targetEntity = schema.entities.find(
                (e) => e.id === relationship.targetEntityId
              );

              if (!sourceEntity || !targetEntity) return null;

              return (
                <RelationshipEdge
                  key={relationship.id}
                  relationship={relationship}
                  sourceEntity={sourceEntity}
                  targetEntity={targetEntity}
                  highlighted={
                    selectedEntityId === relationship.sourceEntityId ||
                    selectedEntityId === relationship.targetEntityId
                  }
                />
              );
            })}
          </svg>

          {/* Draw entities */}
          {schema.entities.map((entity) => (
            <div
              key={entity.id}
              style={{
                position: "absolute",
                left: `${entity.position.x}px`,
                top: `${entity.position.y}px`,
              }}
              onMouseDown={(e) => handleEntityMouseDown(e, entity.id)}
            >
              <EntityNode
                entity={entity}
                isSelected={selectedEntityId === entity.id}
                onSelect={() => setSelectedEntityId(entity.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
