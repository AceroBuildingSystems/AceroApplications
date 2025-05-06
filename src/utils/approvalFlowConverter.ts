import { Types } from 'mongoose';
import { Node, Edge } from 'reactflow';
import { ApproverNodeData } from '@/components/approval-flow/FlowDesigner';

/**
 * Converts a visual approval flow template to a logical approval flow
 * @param templateName The name of the template
 * @param entityType The entity type this template applies to
 * @param nodes The ReactFlow nodes from the visual designer
 * @param edges The ReactFlow edges from the visual designer
 * @param createdBy User ID of the creator
 * @returns A structured approval flow ready to be saved
 */
export function convertTemplateToApprovalFlow(
  templateName: string,
  entityType: string,
  nodes: Node<ApproverNodeData>[],
  edges: Edge[],
  createdBy: string,
) {
  if (!nodes.length) {
    throw new Error('No nodes provided for the flow');
  }

  // Sort the nodes based on their connections (topological sort)
  const sortedNodes = sortNodesTopologically(nodes, edges);
  
  // Convert to approval flow steps
  const steps = sortedNodes.map((node, index) => {
    const nodeData = node.data;
    
    return {
      order: index,
      role: new Types.ObjectId(nodeData.type === 'role' ? nodeData.entityId : undefined),
      department: nodeData.type === 'department' ? new Types.ObjectId(nodeData.entityId) : undefined,
      approvalType: 'Any', // Default
      actionName: `${nodeData.label} Approval`,
      isOptional: false,
      allowSkip: false,
      allowDelegate: true,
      notifyEmails: [], 
      escalationTime: undefined,
      escalateTo: undefined,
    };
  });
  
  return {
    name: templateName,
    description: `Approval flow for ${entityType}`,
    entityType,
    isActive: true,
    steps,
    createdBy: new Types.ObjectId(createdBy),
    updatedBy: new Types.ObjectId(createdBy),
  };
}

/**
 * Sort nodes topologically based on their connections
 * @param nodes The ReactFlow nodes
 * @param edges The ReactFlow edges connecting the nodes
 * @returns Sorted array of nodes
 */
function sortNodesTopologically(
  nodes: Node<ApproverNodeData>[],
  edges: Edge[]
): Node<ApproverNodeData>[] {
  // Create a map of nodes by ID for quick lookup
  const nodeMap = new Map<string, Node<ApproverNodeData>>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Create an adjacency list
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach(node => adjacencyList.set(node.id, []));
  
  // Fill the adjacency list
  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    const targets = adjacencyList.get(sourceId) || [];
    targets.push(targetId);
    adjacencyList.set(sourceId, targets);
  });
  
  // Find starting nodes (nodes with no incoming edges)
  const incomingEdges = new Map<string, number>();
  nodes.forEach(node => incomingEdges.set(node.id, 0));
  
  edges.forEach(edge => {
    const targetId = edge.target;
    incomingEdges.set(targetId, (incomingEdges.get(targetId) || 0) + 1);
  });
  
  const startNodes = nodes.filter(node => (incomingEdges.get(node.id) || 0) === 0);
  
  // If no start nodes were found, use the first node as a fallback
  if (startNodes.length === 0 && nodes.length > 0) {
    return nodes;
  }
  
  // Perform topological sort
  const visited = new Set<string>();
  const result: Node<ApproverNodeData>[] = [];
  
  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor);
    }
    
    const node = nodeMap.get(nodeId);
    if (node) {
      result.unshift(node); // Add to beginning for correct order
    }
  }
  
  startNodes.forEach(node => dfs(node.id));
  
  // Handle disconnected nodes
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      result.push(node);
    }
  });
  
  return result;
} 