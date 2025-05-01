
import { Attribute, Entity, Relationship, ERDSchema } from "@/types/erd";
import { v4 as uuidv4 } from "uuid";

// Create new entities, attributes and relationships
export const createEntity = (name: string, x: number = 100, y: number = 100): Entity => {
  return {
    id: uuidv4(),
    name,
    attributes: [],
    position: { x, y },
  };
};

export const createAttribute = (name: string, dataType: string = "VARCHAR", options: Partial<Attribute> = {}): Attribute => {
  return {
    id: uuidv4(),
    name,
    dataType,
    isPrimaryKey: options.isPrimaryKey || false,
    isForeignKey: options.isForeignKey || false,
    isRequired: options.isRequired || false,
    foreignKeyReference: options.foreignKeyReference,
  };
};

export const createRelationship = (
  name: string,
  sourceEntityId: string,
  targetEntityId: string,
  sourceAttribute: string,
  targetAttribute: string,
  type: Relationship["type"] = "one-to-many"
): Relationship => {
  return {
    id: uuidv4(),
    name,
    sourceEntityId,
    targetEntityId,
    sourceAttribute,
    targetAttribute,
    type,
  };
};

// Helper functions for managing schema
export const addEntity = (schema: ERDSchema, entity: Entity): ERDSchema => {
  return {
    ...schema,
    entities: [...schema.entities, entity],
  };
};

export const updateEntity = (schema: ERDSchema, updatedEntity: Entity): ERDSchema => {
  return {
    ...schema,
    entities: schema.entities.map(entity => 
      entity.id === updatedEntity.id ? updatedEntity : entity
    ),
  };
};

export const deleteEntity = (schema: ERDSchema, entityId: string): ERDSchema => {
  // Remove entity
  const updatedEntities = schema.entities.filter(entity => entity.id !== entityId);
  
  // Remove relationships connected to this entity
  const updatedRelationships = schema.relationships.filter(
    rel => rel.sourceEntityId !== entityId && rel.targetEntityId !== entityId
  );
  
  return {
    entities: updatedEntities,
    relationships: updatedRelationships,
  };
};

export const addAttribute = (schema: ERDSchema, entityId: string, attribute: Attribute): ERDSchema => {
  return {
    ...schema,
    entities: schema.entities.map(entity => {
      if (entity.id === entityId) {
        return {
          ...entity,
          attributes: [...entity.attributes, attribute],
        };
      }
      return entity;
    }),
  };
};

export const updateAttribute = (
  schema: ERDSchema, 
  entityId: string, 
  updatedAttribute: Attribute
): ERDSchema => {
  return {
    ...schema,
    entities: schema.entities.map(entity => {
      if (entity.id === entityId) {
        return {
          ...entity,
          attributes: entity.attributes.map(attr => 
            attr.id === updatedAttribute.id ? updatedAttribute : attr
          ),
        };
      }
      return entity;
    }),
  };
};

export const deleteAttribute = (schema: ERDSchema, entityId: string, attributeId: string): ERDSchema => {
  // First update the entity to remove the attribute
  const updatedEntities = schema.entities.map(entity => {
    if (entity.id === entityId) {
      return {
        ...entity,
        attributes: entity.attributes.filter(attr => attr.id !== attributeId),
      };
    }
    return entity;
  });
  
  // Also update any foreign key references to this attribute
  const updatedEntitiesWithFixedReferences = updatedEntities.map(entity => {
    return {
      ...entity,
      attributes: entity.attributes.map(attr => {
        if (attr.foreignKeyReference?.attributeId === attributeId &&
            attr.foreignKeyReference?.entityId === entityId) {
          // Remove the foreign key reference and mark as not a foreign key
          return {
            ...attr,
            isForeignKey: false,
            foreignKeyReference: undefined,
          };
        }
        return attr;
      }),
    };
  });
  
  // Also remove any relationships that reference this attribute
  const updatedRelationships = schema.relationships.filter(
    rel => !(
      (rel.sourceEntityId === entityId && rel.sourceAttribute === attributeId) ||
      (rel.targetEntityId === entityId && rel.targetAttribute === attributeId)
    )
  );
  
  return {
    entities: updatedEntitiesWithFixedReferences,
    relationships: updatedRelationships,
  };
};

export const addRelationship = (schema: ERDSchema, relationship: Relationship): ERDSchema => {
  return {
    ...schema,
    relationships: [...schema.relationships, relationship],
  };
};

export const updateRelationship = (schema: ERDSchema, updatedRelationship: Relationship): ERDSchema => {
  return {
    ...schema,
    relationships: schema.relationships.map(rel => 
      rel.id === updatedRelationship.id ? updatedRelationship : rel
    ),
  };
};

export const deleteRelationship = (schema: ERDSchema, relationshipId: string): ERDSchema => {
  return {
    ...schema,
    relationships: schema.relationships.filter(rel => rel.id !== relationshipId),
  };
};

// Helper to create a default schema
export const createDefaultSchema = (): ERDSchema => {
  const userEntity = createEntity("User", 100, 100);
  userEntity.attributes = [
    createAttribute("id", "INTEGER", { isPrimaryKey: true, isRequired: true }),
    createAttribute("username", "VARCHAR", { isRequired: true }),
    createAttribute("email", "VARCHAR", { isRequired: true }),
    createAttribute("created_at", "TIMESTAMP", { isRequired: true }),
  ];
  
  const postEntity = createEntity("Post", 500, 100);
  postEntity.attributes = [
    createAttribute("id", "INTEGER", { isPrimaryKey: true, isRequired: true }),
    createAttribute("title", "VARCHAR", { isRequired: true }),
    createAttribute("content", "TEXT", { isRequired: true }),
    createAttribute("user_id", "INTEGER", { 
      isRequired: true, 
      isForeignKey: true,
      foreignKeyReference: {
        entityId: userEntity.id,
        attributeId: userEntity.attributes[0].id
      }
    }),
    createAttribute("created_at", "TIMESTAMP", { isRequired: true }),
  ];
  
  const userPostRelationship = createRelationship(
    "UserPosts",
    userEntity.id,
    postEntity.id,
    userEntity.attributes[0].id,
    postEntity.attributes[3].id,
    "one-to-many"
  );
  
  return {
    entities: [userEntity, postEntity],
    relationships: [userPostRelationship],
  };
};
