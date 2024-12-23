import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from 'lucide-react';
import { FormField } from './FormBuilder';

const ItemTypes = {
  LAYOUT: 'layout',
  FIELD: 'field',
};

export const Layout = ({ layout, index, moveLayout, updateLayout, deleteLayout, moveField, updateField, deleteField }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.LAYOUT,
    item: { index, type: ItemTypes.LAYOUT },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: [ItemTypes.LAYOUT, ItemTypes.FIELD],
    hover: (item, monitor) => {
      if (item.type === ItemTypes.LAYOUT) {
        if (item.index !== index) {
          moveLayout(item.index, index);
          item.index = index;
        }
      } else if (item.type === ItemTypes.FIELD && item.fromSidebar) {
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (hoverClientY < hoverMiddleY) {
          updateLayout(index, {
            ...layout,
            fields: [...layout.fields, { id: Date.now(), type: item.fieldType, label: item.name }],
          });
        }
      }
    },
  }));

  const ref = React.useRef(null);
  const dragDropRef = drag(drop(ref));

  const handleColumnChange = (newColumns) => {
    updateLayout(index, { ...layout, columns: newColumns });
  };

  return (
    <Card ref={dragDropRef} className={`mb-4 ${isDragging ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleColumnChange(1)}>1 Column</Button>
            <Button variant="outline" size="sm" onClick={() => handleColumnChange(2)}>2 Columns</Button>
            <Button variant="outline" size="sm" onClick={() => handleColumnChange(3)}>3 Columns</Button>
            <Button variant="outline" size="sm" onClick={() => handleColumnChange(4)}>4 Columns</Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="cursor-move">
              <GripVertical className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => deleteLayout(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className={`grid gap-4 grid-cols-${layout.columns}`}>
          {Array.from({ length: layout.columns }).map((_, colIndex) => (
            <div key={colIndex} className="space-y-2">
              {layout.fields
                .filter((_, fieldIndex) => fieldIndex % layout.columns === colIndex)
                .map((field, fieldIndex) => (
                  <FormField
                    key={field.id}
                    field={field}
                    index={fieldIndex * layout.columns + colIndex}
                    moveField={(dragIndex, hoverIndex) => {
                      const newFields = [...layout.fields];
                      const [draggedField] = newFields.splice(dragIndex, 1);
                      newFields.splice(hoverIndex, 0, draggedField);
                      updateLayout(index, { ...layout, fields: newFields });
                    }}
                    updateField={(fieldIndex, updatedField) => {
                      const newFields = [...layout.fields];
                      newFields[fieldIndex] = updatedField;
                      updateLayout(index, { ...layout, fields: newFields });
                    }}
                    deleteField={(fieldIndex) => {
                      const newFields = layout.fields.filter((_, i) => i !== fieldIndex);
                      updateLayout(index, { ...layout, fields: newFields });
                    }}
                  />
                ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
