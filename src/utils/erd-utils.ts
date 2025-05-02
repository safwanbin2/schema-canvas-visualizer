
import { v4 as uuidv4 } from 'uuid';
import { ERDSchema, Entity, Attribute, Relationship, RelationshipType } from '@/types/erd';

// Helper to create a new attribute
export const createAttribute = (name: string, dataType: string = 'varchar', options?: Partial<Attribute>): Attribute => {
  return {
    id: uuidv4(),
    name,
    dataType,
    isPrimaryKey: options?.isPrimaryKey || false,
    isForeignKey: options?.isForeignKey || false,
    isRequired: options?.isRequired || false,
    foreignKeyReference: options?.foreignKeyReference
  };
};

// Alias for backward compatibility
export const createNewAttribute = createAttribute;

// Helper to create a new entity
export const createEntity = (name: string, x: number = 300, y: number = 200): Entity => {
  return {
    id: uuidv4(),
    name,
    attributes: [
      {
        id: uuidv4(),
        name: 'id',
        dataType: 'uuid',
        isPrimaryKey: true,
        isForeignKey: false,
        isRequired: true
      }
    ],
    position: { x, y }
  };
};

// Alias for backward compatibility
export const createNewEntity = createEntity;

// Helper to create a new relationship
export const createRelationship = (
  name: string,
  sourceEntityId: string,
  targetEntityId: string,
  sourceAttribute: string,
  targetAttribute: string,
  type: RelationshipType = 'one-to-many'
): Relationship => {
  return {
    id: uuidv4(),
    name,
    sourceEntityId,
    targetEntityId,
    sourceAttribute,
    targetAttribute,
    type
  };
};

// Alias for backward compatibility
export const createNewRelationship = (
  sourceEntityId: string,
  targetEntityId: string,
  sourceAttribute: string,
  targetAttribute: string,
  type: RelationshipType = 'one-to-many'
): Relationship => {
  return createRelationship(
    `rel_${uuidv4().slice(0, 8)}`,
    sourceEntityId,
    targetEntityId,
    sourceAttribute,
    targetAttribute,
    type
  );
};

// Create a default schema with sample tables
export const createDefaultSchema = (): ERDSchema => {
  // Create sample users entity
  const usersEntity: Entity = createEntity('users', 200, 150);
  
  // Add attributes to users entity
  usersEntity.attributes = [
    createAttribute('id', 'uuid', { isPrimaryKey: true, isRequired: true }),
    createAttribute('username', 'varchar', { isRequired: true }),
    createAttribute('email', 'varchar', { isRequired: true }),
    createAttribute('created_at', 'timestamp', { isRequired: true })
  ];

  // Create sample posts entity
  const postsEntity: Entity = createEntity('posts', 500, 150);
  
  // Add attributes to posts entity
  postsEntity.attributes = [
    createAttribute('id', 'uuid', { isPrimaryKey: true, isRequired: true }),
    createAttribute('title', 'varchar', { isRequired: true }),
    createAttribute('content', 'text', { isRequired: true }),
    createAttribute('user_id', 'uuid', { 
      isRequired: true, 
      isForeignKey: true,
      foreignKeyReference: {
        entityId: usersEntity.id,
        attributeId: usersEntity.attributes[0].id
      }
    }),
    createAttribute('created_at', 'timestamp', { isRequired: true })
  ];

  // Create relationship between users and posts
  const relationship: Relationship = createRelationship(
    'user_posts',
    usersEntity.id,
    postsEntity.id,
    usersEntity.attributes[0].id,
    postsEntity.attributes[3].id,
    'one-to-many'
  );

  return {
    entities: [usersEntity, postsEntity],
    relationships: [relationship]
  };
};

// Add entity to schema
export const addEntity = (schema: ERDSchema, entity: Entity): ERDSchema => {
  return {
    ...schema,
    entities: [...schema.entities, entity]
  };
};

// Update entity in schema
export const updateEntity = (schema: ERDSchema, entity: Entity): ERDSchema => {
  return {
    ...schema,
    entities: schema.entities.map(e => e.id === entity.id ? entity : e)
  };
};

// Delete entity from schema
export const deleteEntity = (schema: ERDSchema, entityId: string): ERDSchema => {
  // Also delete any relationships that reference this entity
  const filteredRelationships = schema.relationships.filter(r => 
    r.sourceEntityId !== entityId && r.targetEntityId !== entityId
  );

  return {
    entities: schema.entities.filter(e => e.id !== entityId),
    relationships: filteredRelationships
  };
};

// Add attribute to entity
export const addAttribute = (schema: ERDSchema, entityId: string, attribute: Attribute): ERDSchema => {
  return {
    ...schema,
    entities: schema.entities.map(entity => {
      if (entity.id === entityId) {
        return {
          ...entity,
          attributes: [...entity.attributes, attribute]
        };
      }
      return entity;
    })
  };
};

// Update attribute in entity
export const updateAttribute = (schema: ERDSchema, entityId: string, attribute: Attribute): ERDSchema => {
  return {
    ...schema,
    entities: schema.entities.map(entity => {
      if (entity.id === entityId) {
        return {
          ...entity,
          attributes: entity.attributes.map(attr => 
            attr.id === attribute.id ? attribute : attr
          )
        };
      }
      return entity;
    })
  };
};

// Delete attribute from entity
export const deleteAttribute = (schema: ERDSchema, entityId: string, attributeId: string): ERDSchema => {
  // Also update any relationships that reference this attribute
  const updatedRelationships = schema.relationships.filter(r => 
    !(r.sourceEntityId === entityId && r.sourceAttribute === attributeId) && 
    !(r.targetEntityId === entityId && r.targetAttribute === attributeId)
  );

  return {
    entities: schema.entities.map(entity => {
      if (entity.id === entityId) {
        return {
          ...entity,
          attributes: entity.attributes.filter(attr => attr.id !== attributeId)
        };
      }
      return entity;
    }),
    relationships: updatedRelationships
  };
};

// Add relationship to schema
export const addRelationship = (schema: ERDSchema, relationship: Relationship): ERDSchema => {
  return {
    ...schema,
    relationships: [...schema.relationships, relationship]
  };
};

// Update relationship in schema
export const updateRelationship = (schema: ERDSchema, relationship: Relationship): ERDSchema => {
  return {
    ...schema,
    relationships: schema.relationships.map(r => 
      r.id === relationship.id ? relationship : r
    )
  };
};

// Delete relationship from schema
export const deleteRelationship = (schema: ERDSchema, relationshipId: string): ERDSchema => {
  return {
    ...schema,
    relationships: schema.relationships.filter(r => r.id !== relationshipId)
  };
};
