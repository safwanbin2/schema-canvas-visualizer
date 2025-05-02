
import { v4 as uuidv4 } from 'uuid';
import { ERDSchema, Entity, Attribute, Relationship, RelationshipType } from '@/types/erd';

// Helper to create a new entity
export const createNewEntity = (name: string, x: number = 300, y: number = 200): Entity => {
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

// Alias for createNewEntity to match what's being imported
export const createEntity = createNewEntity;

// Create a default schema with sample tables
export const createDefaultSchema = (): ERDSchema => {
  // Create sample users entity
  const usersEntity: Entity = {
    id: uuidv4(),
    name: 'users',
    attributes: [
      {
        id: uuidv4(),
        name: 'id',
        dataType: 'uuid',
        isPrimaryKey: true,
        isForeignKey: false,
        isRequired: true
      },
      {
        id: uuidv4(),
        name: 'username',
        dataType: 'varchar',
        isPrimaryKey: false,
        isForeignKey: false,
        isRequired: true
      },
      {
        id: uuidv4(),
        name: 'email',
        dataType: 'varchar',
        isPrimaryKey: false,
        isForeignKey: false,
        isRequired: true
      },
      {
        id: uuidv4(),
        name: 'created_at',
        dataType: 'timestamp',
        isPrimaryKey: false,
        isForeignKey: false,
        isRequired: true
      }
    ],
    position: {
      x: 200,
      y: 150
    }
  };

  // Create sample posts entity
  const postsEntity: Entity = {
    id: uuidv4(),
    name: 'posts',
    attributes: [
      {
        id: uuidv4(),
        name: 'id',
        dataType: 'uuid',
        isPrimaryKey: true,
        isForeignKey: false,
        isRequired: true
      },
      {
        id: uuidv4(),
        name: 'title',
        dataType: 'varchar',
        isPrimaryKey: false,
        isForeignKey: false,
        isRequired: true
      },
      {
        id: uuidv4(),
        name: 'content',
        dataType: 'text',
        isPrimaryKey: false,
        isForeignKey: false,
        isRequired: true
      },
      {
        id: uuidv4(),
        name: 'user_id',
        dataType: 'uuid',
        isPrimaryKey: false,
        isForeignKey: true,
        isRequired: true,
        foreignKeyReference: {
          entityId: usersEntity.id,
          attributeId: usersEntity.attributes[0].id
        }
      },
      {
        id: uuidv4(),
        name: 'created_at',
        dataType: 'timestamp',
        isPrimaryKey: false,
        isForeignKey: false,
        isRequired: true
      }
    ],
    position: {
      x: 500,
      y: 150
    }
  };

  // Create relationship between users and posts
  const relationship: Relationship = {
    id: uuidv4(),
    name: 'user_posts',
    sourceEntityId: usersEntity.id,
    targetEntityId: postsEntity.id,
    sourceAttribute: usersEntity.attributes[0].id,
    targetAttribute: postsEntity.attributes[3].id,
    type: 'one-to-many'
  };

  return {
    entities: [usersEntity, postsEntity],
    relationships: [relationship]
  };
};

// Helper to create a new attribute
export const createNewAttribute = (name: string): Attribute => {
  return {
    id: uuidv4(),
    name,
    dataType: 'varchar',
    isPrimaryKey: false,
    isForeignKey: false,
    isRequired: false
  };
};

// Alias for createNewAttribute to match what's being imported
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

// Helper to create a new relationship
export const createNewRelationship = (
  sourceEntityId: string,
  targetEntityId: string,
  sourceAttribute: string,
  targetAttribute: string,
  type: 'one-to-one' | 'one-to-many' | 'many-to-many' = 'one-to-many'
): Relationship => {
  return {
    id: uuidv4(),
    name: `rel_${uuidv4().slice(0, 8)}`,
    sourceEntityId,
    targetEntityId,
    sourceAttribute,
    targetAttribute,
    type
  };
};

// Alias for createNewRelationship to match what's being imported
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
