
import React from "react";
import { Relationship, Entity } from "@/types/erd";
import { cn } from "@/lib/utils";

interface RelationshipEdgeProps {
  relationship: Relationship;
  sourceEntity: Entity;
  targetEntity: Entity;
  highlighted?: boolean;
}

const RelationshipEdge: React.FC<RelationshipEdgeProps> = ({
  relationship,
  sourceEntity,
  targetEntity,
  highlighted = false,
}) => {
  // Calculate edge start and end points
  const sourceWidth = 256; // Width of entity boxes
  const sourceHeight = 36 + sourceEntity.attributes.length * 33; // Height of header + attributes
  const targetHeight = 36 + targetEntity.attributes.length * 33;

  // Calculate center points of entities
  const sourceX = sourceEntity.position.x + sourceWidth / 2;
  const sourceY = sourceEntity.position.y + sourceHeight / 2;
  const targetX = targetEntity.position.x + sourceWidth / 2;
  const targetY = targetEntity.position.y + targetHeight / 2;

  // Calculate the angle between the two points
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);

  // Calculate connection points at the edges of the entity boxes
  const halfSourceWidth = sourceWidth / 2;
  const halfSourceHeight = sourceHeight / 2;
  const halfTargetWidth = sourceWidth / 2;
  const halfTargetHeight = targetHeight / 2;

  // Determine which side of the boxes to connect to
  let sourceConnectX, sourceConnectY, targetConnectX, targetConnectY;

  // Entity box sides
  const sourceSides = {
    top: { y: sourceEntity.position.y, x: sourceEntity.position.x + halfSourceWidth },
    right: { x: sourceEntity.position.x + sourceWidth, y: sourceEntity.position.y + halfSourceHeight },
    bottom: { y: sourceEntity.position.y + sourceHeight, x: sourceEntity.position.x + halfSourceWidth },
    left: { x: sourceEntity.position.x, y: sourceEntity.position.y + halfSourceHeight },
  };

  const targetSides = {
    top: { y: targetEntity.position.y, x: targetEntity.position.x + halfTargetWidth },
    right: { x: targetEntity.position.x + sourceWidth, y: targetEntity.position.y + halfTargetHeight },
    bottom: { y: targetEntity.position.y + targetHeight, x: targetEntity.position.x + halfTargetWidth },
    left: { x: targetEntity.position.x, y: targetEntity.position.y + halfTargetHeight },
  };

  // Find the best connection points
  if (Math.abs(sourceEntity.position.x - targetEntity.position.x) > Math.abs(sourceEntity.position.y - targetEntity.position.y)) {
    // Entities are more horizontal than vertical
    if (sourceEntity.position.x < targetEntity.position.x) {
      // Source is left of target
      sourceConnectX = sourceSides.right.x;
      sourceConnectY = sourceSides.right.y;
      targetConnectX = targetSides.left.x;
      targetConnectY = targetSides.left.y;
    } else {
      // Source is right of target
      sourceConnectX = sourceSides.left.x;
      sourceConnectY = sourceSides.left.y;
      targetConnectX = targetSides.right.x;
      targetConnectY = targetSides.right.y;
    }
  } else {
    // Entities are more vertical than horizontal
    if (sourceEntity.position.y < targetEntity.position.y) {
      // Source is above target
      sourceConnectX = sourceSides.bottom.x;
      sourceConnectY = sourceSides.bottom.y;
      targetConnectX = targetSides.top.x;
      targetConnectY = targetSides.top.y;
    } else {
      // Source is below target
      sourceConnectX = sourceSides.top.x;
      sourceConnectY = sourceSides.top.y;
      targetConnectX = targetSides.bottom.x;
      targetConnectY = targetSides.bottom.y;
    }
  }

  // Control points for the bezier curve
  const dx = Math.abs(targetConnectX - sourceConnectX) * 0.3;
  const controlPoint1X = sourceConnectX + (sourceConnectX < targetConnectX ? dx : -dx);
  const controlPoint1Y = sourceConnectY;
  const controlPoint2X = targetConnectX + (targetConnectX < sourceConnectX ? dx : -dx);
  const controlPoint2Y = targetConnectY;

  // Path for curve
  const path = `
    M ${sourceConnectX} ${sourceConnectY}
    C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetConnectX} ${targetConnectY}
  `;

  // Calculate midpoint for label
  const midX = (sourceConnectX + targetConnectX) / 2;
  const midY = (sourceConnectY + targetConnectY) / 2 - 10;

  // Determine the relationship symbol
  const getRelationshipMarker = () => {
    switch (relationship.type) {
      case "one-to-one":
        return (
          <>
            <circle cx={sourceConnectX} cy={sourceConnectY} r="4" fill="white" stroke="currentColor" strokeWidth="2" />
            <circle cx={targetConnectX} cy={targetConnectY} r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          </>
        );
      case "one-to-many":
        return (
          <>
            <circle cx={sourceConnectX} cy={sourceConnectY} r="4" fill="white" stroke="currentColor" strokeWidth="2" />
            <polygon 
              points={`${targetConnectX-8},${targetConnectY-6} ${targetConnectX},${targetConnectY} ${targetConnectX-8},${targetConnectY+6}`} 
              fill="currentColor" 
            />
            <polygon 
              points={`${targetConnectX-6},${targetConnectY-4} ${targetConnectX+2},${targetConnectY} ${targetConnectX-6},${targetConnectY+4}`} 
              fill="currentColor" 
            />
          </>
        );
      case "many-to-many":
        return (
          <>
            <polygon 
              points={`${sourceConnectX+8},${sourceConnectY-6} ${sourceConnectX},${sourceConnectY} ${sourceConnectX+8},${sourceConnectY+6}`} 
              fill="currentColor" 
            />
            <polygon 
              points={`${sourceConnectX+6},${sourceConnectY-4} ${sourceConnectX-2},${sourceConnectY} ${sourceConnectX+6},${sourceConnectY+4}`} 
              fill="currentColor" 
            />
            <polygon 
              points={`${targetConnectX-8},${targetConnectY-6} ${targetConnectX},${targetConnectY} ${targetConnectX-8},${targetConnectY+6}`} 
              fill="currentColor" 
            />
            <polygon 
              points={`${targetConnectX-6},${targetConnectY-4} ${targetConnectX+2},${targetConnectY} ${targetConnectX-6},${targetConnectY+4}`} 
              fill="currentColor" 
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <g 
      className={cn(
        "text-muted-foreground transition-all duration-300",
        highlighted && "text-primary animate-pulse-connection"
      )}
    >
      <path 
        d={path} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        className={cn(
          "transition-all duration-300",
          highlighted ? "stroke-primary stroke-[3px]" : "stroke-muted-foreground stroke-[2px]"
        )}
      />
      
      {getRelationshipMarker()}
      
      {/* Relationship label */}
      <foreignObject 
        x={midX - 40} 
        y={midY - 12}
        width="80" 
        height="24"
        className="pointer-events-none"
      >
        <div 
          xmlns="http://www.w3.org/1999/xhtml"
          className={cn(
            "text-xs px-2 py-1 rounded-md text-center bg-background/80 backdrop-blur-sm",
            highlighted ? "text-primary font-medium" : "text-muted-foreground"
          )}
        >
          {relationship.type}
        </div>
      </foreignObject>
    </g>
  );
};

export default RelationshipEdge;
