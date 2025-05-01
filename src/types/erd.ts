
// Entity and attribute types
export interface Attribute {
  id: string;
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isRequired: boolean;
  foreignKeyReference?: {
    entityId: string;
    attributeId: string;
  };
}

export interface Entity {
  id: string;
  name: string;
  attributes: Attribute[];
  position: {
    x: number;
    y: number;
  };
}

// Relationship types
export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';

export interface Relationship {
  id: string;
  name: string;
  sourceEntityId: string;
  targetEntityId: string;
  sourceAttribute: string;
  targetAttribute: string;
  type: RelationshipType;
}

// Schema and project types
export interface ERDSchema {
  entities: Entity[];
  relationships: Relationship[];
}

export interface ERDProject {
  id: string;
  name: string;
  description: string;
  schema: ERDSchema;
  createdAt: string;
  updatedAt: string;
}

// Canvas state
export interface CanvasState {
  zoom: number;
  position: {
    x: number;
    y: number;
  };
  selectedEntityId?: string;
}

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

