import React from "react";
import { Handle, Position } from "reactflow";

const CustomNode = ({ id, data }) => {
  const { name, designation, onDelete } = data;

  return (
    <div
      className="group relative p-4 bg-white border border-gray-200 shadow-lg rounded-md text-center hover:shadow-xl transition-shadow duration-200"
      style={{
        minWidth: "160px",
        fontFamily: "Arial, sans-serif",
        fontSize: "0.9rem",
      }}
    >
      {/* User Information */}
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-xs text-gray-500 mt-1">{designation}</p>

      {/* Delete Button on Hover */}
      {onDelete && (
        <button
          onClick={() => onDelete(id)}
          className="absolute hidden group-hover:block top-0 right-0 px-2 bg-red-600 text-white text-xs rounded"
          style={{ transform: "translate(50%, -50%)" }}
        >
          ✖
        </button>
      )}

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;
