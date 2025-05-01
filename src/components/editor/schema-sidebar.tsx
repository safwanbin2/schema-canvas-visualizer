
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Entity, Attribute, ERDSchema, Relationship } from "@/types/erd";
import { 
  createEntity, 
  createAttribute, 
  addEntity, 
  updateEntity, 
  deleteEntity,
  addAttribute,
  updateAttribute,
  deleteAttribute,
  createRelationship,
  addRelationship
} from "@/utils/erd-utils";
import { Plus, Trash, Database, Key, Link, Edit, Share2 } from "lucide-react";

interface SchemaSidebarProps {
  schema: ERDSchema;
  onSchemaChange: (schema: ERDSchema) => void;
  selectedEntityId?: string;
  setSelectedEntityId: (id?: string) => void;
}

const dataTypes = [
  "VARCHAR", "TEXT", "INTEGER", "BIGINT", "BOOLEAN", "DATE", "TIMESTAMP", 
  "FLOAT", "DOUBLE", "DECIMAL", "JSON", "UUID", "ENUM"
];

export const SchemaSidebar: React.FC<SchemaSidebarProps> = ({
  schema,
  onSchemaChange,
  selectedEntityId,
  setSelectedEntityId
}) => {
  const [newEntityName, setNewEntityName] = useState("");
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  
  const [attributeDialogOpen, setAttributeDialogOpen] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
  const [newAttribute, setNewAttribute] = useState<Partial<Attribute>>({
    name: "",
    dataType: "VARCHAR",
    isPrimaryKey: false,
    isRequired: false,
    isForeignKey: false
  });

  // Relationship dialog state
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);
  const [newRelationship, setNewRelationship] = useState({
    name: "",
    sourceEntityId: "",
    targetEntityId: "",
    sourceAttribute: "",
    targetAttribute: "",
    type: "one-to-many" as const
  });

  // Entity operations
  const handleAddEntity = () => {
    if (!newEntityName.trim()) {
      toast.error("Entity name is required");
      return;
    }

    const entity = createEntity(newEntityName);
    const updatedSchema = addEntity(schema, entity);
    
    onSchemaChange(updatedSchema);
    setNewEntityName("");
    setEntityDialogOpen(false);
    toast.success(`Entity "${newEntityName}" created`);
  };

  const handleDeleteEntity = (entityId: string) => {
    const entity = schema.entities.find(e => e.id === entityId);
    if (!entity) return;
    
    const updatedSchema = deleteEntity(schema, entityId);
    onSchemaChange(updatedSchema);
    
    if (selectedEntityId === entityId) {
      setSelectedEntityId(undefined);
    }
    
    toast.success(`Entity "${entity.name}" deleted`);
  };

  // Attribute operations
  const handleAddAttribute = () => {
    if (!editingEntityId) return;
    if (!newAttribute.name?.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    if (editingAttributeId) {
      // Update existing attribute
      const attribute = {
        id: editingAttributeId,
        name: newAttribute.name,
        dataType: newAttribute.dataType || "VARCHAR",
        isPrimaryKey: newAttribute.isPrimaryKey || false,
        isRequired: newAttribute.isRequired || false,
        isForeignKey: newAttribute.isForeignKey || false,
        foreignKeyReference: newAttribute.foreignKeyReference
      };

      const updatedSchema = updateAttribute(schema, editingEntityId, attribute as Attribute);
      onSchemaChange(updatedSchema);
      toast.success("Attribute updated");
    } else {
      // Add new attribute
      const attribute = createAttribute(
        newAttribute.name,
        newAttribute.dataType || "VARCHAR",
        {
          isPrimaryKey: newAttribute.isPrimaryKey || false,
          isRequired: newAttribute.isRequired || false,
          isForeignKey: newAttribute.isForeignKey || false,
          foreignKeyReference: newAttribute.foreignKeyReference
        }
      );

      const updatedSchema = addAttribute(schema, editingEntityId, attribute);
      onSchemaChange(updatedSchema);
      toast.success("Attribute added");
    }
    
    // Reset form
    setNewAttribute({
      name: "",
      dataType: "VARCHAR",
      isPrimaryKey: false,
      isRequired: false,
      isForeignKey: false
    });
    setEditingAttributeId(null);
    setAttributeDialogOpen(false);
  };

  const handleDeleteAttribute = (entityId: string, attributeId: string) => {
    const entity = schema.entities.find(e => e.id === entityId);
    const attribute = entity?.attributes.find(a => a.id === attributeId);
    if (!entity || !attribute) return;

    const updatedSchema = deleteAttribute(schema, entityId, attributeId);
    onSchemaChange(updatedSchema);
    toast.success(`Attribute "${attribute.name}" deleted`);
  };

  // Edit attribute
  const handleEditAttribute = (entityId: string, attributeId: string) => {
    const entity = schema.entities.find(e => e.id === entityId);
    if (!entity) return;
    
    const attribute = entity.attributes.find(a => a.id === attributeId);
    if (!attribute) return;

    setEditingEntityId(entityId);
    setEditingAttributeId(attributeId);
    setNewAttribute({
      name: attribute.name,
      dataType: attribute.dataType,
      isPrimaryKey: attribute.isPrimaryKey,
      isRequired: attribute.isRequired,
      isForeignKey: attribute.isForeignKey,
      foreignKeyReference: attribute.foreignKeyReference
    });
    setAttributeDialogOpen(true);
  };

  // Create relationship
  const handleAddRelationship = () => {
    if (
      !newRelationship.name.trim() ||
      !newRelationship.sourceEntityId ||
      !newRelationship.targetEntityId ||
      !newRelationship.sourceAttribute ||
      !newRelationship.targetAttribute
    ) {
      toast.error("All relationship fields are required");
      return;
    }

    const relationship = createRelationship(
      newRelationship.name,
      newRelationship.sourceEntityId,
      newRelationship.targetEntityId,
      newRelationship.sourceAttribute,
      newRelationship.targetAttribute,
      newRelationship.type
    );

    const updatedSchema = addRelationship(schema, relationship);
    onSchemaChange(updatedSchema);
    
    // Reset form
    setNewRelationship({
      name: "",
      sourceEntityId: "",
      targetEntityId: "",
      sourceAttribute: "",
      targetAttribute: "",
      type: "one-to-many"
    });
    setRelationshipDialogOpen(false);
    toast.success("Relationship created");
  };

  // Open dialogs
  const openNewAttributeDialog = (entityId: string) => {
    setEditingEntityId(entityId);
    setEditingAttributeId(null);
    setNewAttribute({
      name: "",
      dataType: "VARCHAR",
      isPrimaryKey: false,
      isRequired: false,
      isForeignKey: false
    });
    setAttributeDialogOpen(true);
  };

  // Open relationship dialog
  const openRelationshipDialog = () => {
    if (schema.entities.length < 2) {
      toast.error("Need at least two entities to create a relationship");
      return;
    }

    // Set defaults
    if (schema.entities.length > 0) {
      setNewRelationship(prev => ({
        ...prev,
        sourceEntityId: schema.entities[0].id
      }));

      if (schema.entities.length > 1) {
        setNewRelationship(prev => ({
          ...prev,
          targetEntityId: schema.entities[1].id
        }));
      }
    }

    setRelationshipDialogOpen(true);
  };

  // Update source or target entity in relationship creation
  const handleEntityChange = (field: 'sourceEntityId' | 'targetEntityId', value: string) => {
    setNewRelationship(prev => ({
      ...prev,
      [field]: value,
      // Reset attribute selection when entity changes
      [field === 'sourceEntityId' ? 'sourceAttribute' : 'targetAttribute']: ""
    }));
  };

  return (
    <div className="w-80 border-r h-full bg-sidebar flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Schema Editor
        </h2>
        
        <div className="flex gap-2">
          <Dialog open={entityDialogOpen} onOpenChange={setEntityDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Entity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Entity</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="entityName">Entity Name</Label>
                <Input
                  id="entityName"
                  placeholder="e.g. User, Product, Order"
                  value={newEntityName}
                  onChange={(e) => setNewEntityName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddEntity}>Add Entity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" variant="outline" onClick={openRelationshipDialog}>
            <Share2 className="h-4 w-4 mr-1" /> Relation
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {schema.entities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No entities yet</p>
              <p className="text-sm mt-2">
                Click the "Entity" button above to add your first entity
              </p>
            </div>
          )}
          
          <Accordion 
            type="multiple" 
            defaultValue={selectedEntityId ? [selectedEntityId] : []}
            className="space-y-2"
          >
            {schema.entities.map((entity) => (
              <AccordionItem 
                key={entity.id} 
                value={entity.id}
                className={`border rounded-md ${selectedEntityId === entity.id ? 'border-primary' : 'border-border'}`}
              >
                <div className="flex items-center">
                  <AccordionTrigger 
                    className="hover:no-underline px-3 py-2 flex-1"
                    onClick={() => setSelectedEntityId(entity.id)}
                  >
                    <span className="text-left font-medium">{entity.name}</span>
                  </AccordionTrigger>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2 h-8 w-8 p-0" 
                    onClick={() => handleDeleteEntity(entity.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <AccordionContent className="px-3 pb-3">
                  {entity.attributes.length > 0 ? (
                    <div className="space-y-3 mb-3">
                      {entity.attributes.map((attr) => (
                        <div 
                          key={attr.id}
                          className="flex items-center justify-between text-sm p-2 rounded-md bg-muted"
                        >
                          <div className="flex items-center space-x-2">
                            {attr.isPrimaryKey && (
                              <Key className="h-3 w-3 text-yellow-500" />
                            )}
                            {attr.isForeignKey && (
                              <Link className="h-3 w-3 text-blue-500" />
                            )}
                            <span>{attr.name}</span>
                            <span className="text-xs text-muted-foreground">{attr.dataType}</span>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditAttribute(entity.id, attr.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDeleteAttribute(entity.id, attr.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">No attributes</p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => openNewAttributeDialog(entity.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Attribute
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
      
      {/* Attribute Dialog */}
      <Dialog open={attributeDialogOpen} onOpenChange={setAttributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAttributeId ? 'Edit Attribute' : 'Add New Attribute'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="attributeName">Name</Label>
              <Input
                id="attributeName"
                placeholder="e.g. id, username, email"
                value={newAttribute.name || ""}
                onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataType">Data Type</Label>
              <Select 
                value={newAttribute.dataType || "VARCHAR"}
                onValueChange={(value) => setNewAttribute({...newAttribute, dataType: value})}
              >
                <SelectTrigger id="dataType">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrimaryKey"
                  checked={newAttribute.isPrimaryKey || false}
                  onCheckedChange={(checked) => 
                    setNewAttribute({...newAttribute, isPrimaryKey: checked})
                  }
                />
                <Label htmlFor="isPrimaryKey" className="cursor-pointer">Primary Key</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRequired"
                  checked={newAttribute.isRequired || false}
                  onCheckedChange={(checked) => 
                    setNewAttribute({...newAttribute, isRequired: checked})
                  }
                />
                <Label htmlFor="isRequired" className="cursor-pointer">Required (NOT NULL)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isForeignKey"
                  checked={newAttribute.isForeignKey || false}
                  onCheckedChange={(checked) => 
                    setNewAttribute({...newAttribute, isForeignKey: checked})
                  }
                />
                <Label htmlFor="isForeignKey" className="cursor-pointer">Foreign Key</Label>
              </div>
              
              {newAttribute.isForeignKey && (
                <div className="space-y-2 pl-6">
                  <Label>References</Label>
                  <Select
                    value={newAttribute.foreignKeyReference?.entityId || ""}
                    onValueChange={(value) => setNewAttribute({
                      ...newAttribute,
                      foreignKeyReference: {
                        entityId: value,
                        attributeId: ""
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {schema.entities
                        .filter(e => e.id !== editingEntityId)
                        .map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  {newAttribute.foreignKeyReference?.entityId && (
                    <Select
                      value={newAttribute.foreignKeyReference?.attributeId || ""}
                      onValueChange={(value) => setNewAttribute({
                        ...newAttribute,
                        foreignKeyReference: {
                          ...newAttribute.foreignKeyReference!,
                          attributeId: value
                        }
                      })}
                      className="mt-2"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select attribute" />
                      </SelectTrigger>
                      <SelectContent>
                        {schema.entities
                          .find(e => e.id === newAttribute.foreignKeyReference?.entityId)
                          ?.attributes.map((attr) => (
                            <SelectItem key={attr.id} value={attr.id}>
                              {attr.name} ({attr.dataType})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddAttribute}>
              {editingAttributeId ? 'Update' : 'Add'} Attribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Relationship Dialog */}
      <Dialog open={relationshipDialogOpen} onOpenChange={setRelationshipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Relationship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="relationshipName">Relationship Name</Label>
              <Input
                id="relationshipName"
                placeholder="e.g. UserPosts, OrderItems"
                value={newRelationship.name}
                onChange={(e) => setNewRelationship({...newRelationship, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationType">Relationship Type</Label>
              <Select
                value={newRelationship.type}
                onValueChange={(value: Relationship['type']) => 
                  setNewRelationship({...newRelationship, type: value})
                }
              >
                <SelectTrigger id="relationType">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-to-one">One-to-One</SelectItem>
                  <SelectItem value="one-to-many">One-to-Many</SelectItem>
                  <SelectItem value="many-to-many">Many-to-Many</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceEntity">Source Entity</Label>
                <Select
                  value={newRelationship.sourceEntityId}
                  onValueChange={(value) => handleEntityChange('sourceEntityId', value)}
                >
                  <SelectTrigger id="sourceEntity">
                    <SelectValue placeholder="Select source entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {schema.entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newRelationship.sourceEntityId && (
                <div className="space-y-2">
                  <Label htmlFor="sourceAttribute">Source Attribute</Label>
                  <Select
                    value={newRelationship.sourceAttribute}
                    onValueChange={(value) => 
                      setNewRelationship({...newRelationship, sourceAttribute: value})
                    }
                  >
                    <SelectTrigger id="sourceAttribute">
                      <SelectValue placeholder="Select source attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {schema.entities
                        .find(e => e.id === newRelationship.sourceEntityId)
                        ?.attributes.map((attr) => (
                          <SelectItem key={attr.id} value={attr.id}>
                            {attr.name} ({attr.dataType})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetEntity">Target Entity</Label>
                <Select
                  value={newRelationship.targetEntityId}
                  onValueChange={(value) => handleEntityChange('targetEntityId', value)}
                >
                  <SelectTrigger id="targetEntity">
                    <SelectValue placeholder="Select target entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {schema.entities
                      .filter(e => e.id !== newRelationship.sourceEntityId)
                      .map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newRelationship.targetEntityId && (
                <div className="space-y-2">
                  <Label htmlFor="targetAttribute">Target Attribute</Label>
                  <Select
                    value={newRelationship.targetAttribute}
                    onValueChange={(value) => 
                      setNewRelationship({...newRelationship, targetAttribute: value})
                    }
                  >
                    <SelectTrigger id="targetAttribute">
                      <SelectValue placeholder="Select target attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {schema.entities
                        .find(e => e.id === newRelationship.targetEntityId)
                        ?.attributes.map((attr) => (
                          <SelectItem key={attr.id} value={attr.id}>
                            {attr.name} ({attr.dataType})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddRelationship}>Create Relationship</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
