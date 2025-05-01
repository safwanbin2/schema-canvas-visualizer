
import React from "react";
import { Entity, Attribute } from "@/types/erd";
import { cn } from "@/lib/utils";
import { Key, Link } from "lucide-react";

interface EntityNodeProps {
  entity: Entity;
  isSelected: boolean;
  onSelect: () => void;
}

const EntityNode: React.FC<EntityNodeProps> = ({
  entity,
  isSelected,
  onSelect,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      className={cn(
        "w-64 rounded-md shadow-md bg-entity overflow-hidden",
        "border-2 transition-all duration-200",
        isSelected
          ? "border-entity-selected ring-2 ring-entity-selected ring-opacity-50"
          : "border-entity-border"
      )}
      onClick={handleClick}
    >
      {/* Entity Header */}
      <div className="bg-entity-header text-entity-header-foreground p-3">
        <h3 className="font-medium text-center">{entity.name}</h3>
      </div>

      {/* Entity Attributes */}
      <div className="bg-entity text-entity-foreground">
        {entity.attributes.map((attribute) => (
          <div key={attribute.id} className="entity-column">
            <div className="entity-column-key">
              {attribute.isPrimaryKey && (
                <Key className="entity-column-pk h-3 w-3" />
              )}
              {attribute.isForeignKey && (
                <Link className="entity-column-fk h-3 w-3" />
              )}
              <span>{attribute.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {attribute.dataType}
              {attribute.isRequired ? " NN" : ""}
            </span>
          </div>
        ))}

        {entity.attributes.length === 0 && (
          <div className="p-3 text-sm text-center text-muted-foreground">
            No attributes
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityNode;
