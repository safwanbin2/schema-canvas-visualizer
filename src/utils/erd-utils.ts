
import { v4 as uuidv4 } from 'uuid';
import { ERDSchema, Entity, Attribute, Relationship } from '@/types/erd';

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
