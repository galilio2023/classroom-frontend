import React from "react";

export const ModuleItem = ({ module, isStaff, onEdit, onDelete }: any) => {
  return (
    <div className="p-4 border rounded-xl">
      <div className="flex justify-between items-center">
        <h4 className="font-bold">{module.title}</h4>
        {isStaff && (
          <div className="flex gap-2">
            <button onClick={onEdit}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};
