"use client";
import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import Sidebar from "@/components/ApprovalFlow/Sidebar";
import CustomNode from "@/components/ApprovalFlow/CustomNode";

const nodeTypes = { custom: CustomNode };

let idCounter = 0; // Counter to ensure unique node IDs

export default function Home() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Delete Node Logic
  const onDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  // Handle Connection (with Dashed Line and Arrow)
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { strokeDasharray: "5,5" },
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    []
  );

  // Allow Drag Over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Drop Logic - Allow Same User Multiple Times
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const user = JSON.parse(event.dataTransfer.getData("application/reactflow"));
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node_${idCounter++}`, // Generate a unique ID
        type: "custom",
        position,
        data: {
          id: user.id,
          name: user.name,
          designation: user.designation,
          onDelete: onDeleteNode,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  // Save Flow Logic with Name
  const saveFlow = () => {
    const name = prompt("Enter a name for the flow:");
    if (!name) return;

    const simplifiedNodes = nodes.map((node) => ({
      userId: node.data.id,
      name: node.data.name,
      designation: node.data.designation,
    }));

    const simplifiedEdges = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));

    const flowData = {
      flowName: name,
      nodes: simplifiedNodes,
      connections: simplifiedEdges,
    };

    const json = JSON.stringify(flowData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(" ", "_")}_flow.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dot-background flex">
      <Sidebar
        onDragStart={(event, user) => {
          event.dataTransfer.setData(
            "application/reactflow",
            JSON.stringify({ id: user.id, name: user.name, designation: user.designation })
          );
          event.dataTransfer.effectAllowed = "move";
        }}
      />
      <div style={{ height: "100vh", flexGrow: 1 }} ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />

          </ReactFlow>
        </ReactFlowProvider>
        <button
          onClick={saveFlow}
          className="absolute bottom-4 left-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save Flow as JSON
        </button>
      </div>
    </div>
  );
}
