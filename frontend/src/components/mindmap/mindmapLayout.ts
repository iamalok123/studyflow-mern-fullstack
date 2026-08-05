export const branchColors = [
  {
    line: '#3B82F6', // Blue
    border: 'border-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  {
    line: '#22C55E', // Green
    border: 'border-green-400',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  {
    line: '#14B8A6', // Teal
    border: 'border-teal-400',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  {
    line: '#6366F1', // Indigo
    border: 'border-indigo-400',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  {
    line: '#F59E0B', // Amber
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  {
    line: '#EC4899', // Pink
    border: 'border-pink-400',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    dot: 'bg-pink-500',
  }
];

export const getColor = (index) => branchColors[index % branchColors.length];

// Constants for layout
const X_SPACING = {
  0: 0,
  1: 550,
  2: 950,
  3: 1300,
  4: 1600
};

const Y_SPACING = 120; // Minimum vertical space per leaf node

/**
 * Traverses the mindmap data and builds an array of visible nodes and edges,
 * computing their exact X,Y positions for a horizontal split-tree layout.
 */
export const buildReactFlowGraph = (mindmapData, collapsedNodeIds = new Set()) => {
  const nodes = [];
  const edges = [];

  if (!mindmapData || !mindmapData.title) {
    return { nodes, edges };
  }

  // 1. First pass: annotate the tree with sizes and assign IDs
  let idCounter = 1;
  const root = {
    id: 'root',
    title: mindmapData.title,
    depth: 0,
    direction: 'center', // 'center', 'left', or 'right'
    colorIndex: 0,
    children: [],
    height: 0, // total vertical space needed for this subtree
  };

  const processNode = (dataNode, parentRef, depth, direction, colorIndex) => {
    const nodeRef = {
      id: `node-${idCounter++}`,
      title: dataNode.title,
      depth,
      direction,
      colorIndex,
      children: [],
      isCollapsed: collapsedNodeIds.has(`node-${idCounter - 1}`),
      hasChildren: Array.isArray(dataNode.children) && dataNode.children.length > 0,
      height: 0
    };

    if (nodeRef.hasChildren) {
      dataNode.children.forEach(child => {
        const childRef = processNode(child, nodeRef, depth + 1, direction, colorIndex);
        nodeRef.children.push(childRef);
      });
    }
    
    // Calculate vertical height needed for this subtree (if visible)
    if (nodeRef.isCollapsed || !nodeRef.hasChildren) {
      nodeRef.height = Y_SPACING;
    } else {
      nodeRef.height = Math.max(Y_SPACING, nodeRef.children.reduce((sum, child) => sum + child.height, 0));
    }

    return nodeRef;
  };

  // Process top-level branches (split left and right)
  if (Array.isArray(mindmapData.children)) {
    mindmapData.children.forEach((child, index) => {
      const direction = index % 2 === 0 ? 'left' : 'right';
      const colorIndex = index;
      const childRef = processNode(child, root, 1, direction, colorIndex);
      root.children.push(childRef);
    });
  }

  // Calculate root height (max of left vs right heights)
  const leftChildren = root.children.filter(c => c.direction === 'left');
  const rightChildren = root.children.filter(c => c.direction === 'right');
  const leftHeight = leftChildren.reduce((sum, c) => sum + c.height, 0);
  const rightHeight = rightChildren.reduce((sum, c) => sum + c.height, 0);
  
  // 2. Second pass: assign X, Y coordinates and create ReactFlow objects
  
  // Create Root Node
  nodes.push({
    id: root.id,
    type: 'mindmapCenter',
    position: { x: 0, y: 0 },
    data: { 
      label: root.title, 
      isCollapsed: collapsedNodeIds.has(root.id),
      hasChildren: root.children.length > 0
    }
  });

  const positionSubtree = (node, startY) => {
    let currentY = startY;
    
    node.children.forEach(child => {
      // The Y center for this child
      const childCenterY = currentY + (child.height / 2);
      
      // X position based on depth and direction
      const xOffset = X_SPACING[child.depth] || X_SPACING[3];
      const childX = child.direction === 'left' ? -xOffset : xOffset;

      // Add edge from node to child
      edges.push({
        id: `e-${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
        sourceHandle: child.direction === 'left' ? 'left' : 'right',
        targetHandle: child.direction === 'left' ? 'right' : 'left',
        type: 'smoothstep', // smooth curves for mindmaps
        animated: false,
        style: { 
          stroke: getColor(child.colorIndex).line, 
          strokeWidth: 4 - Math.min(child.depth, 2) // Thinner lines for deeper branches
        },
      });

      // Add child node
      nodes.push({
        id: child.id,
        type: 'mindmapBranch',
        position: { x: childX, y: childCenterY },
        data: {
          id: child.id,
          label: child.title,
          direction: child.direction,
          color: getColor(child.colorIndex),
          depth: child.depth,
          isCollapsed: child.isCollapsed,
          hasChildren: child.hasChildren
        }
      });

      // Recurse if not collapsed
      if (!child.isCollapsed && child.hasChildren) {
        positionSubtree(child, currentY);
      }

      currentY += child.height;
    });
  };

  // Position left subtree
  const startLeftY = -(leftHeight / 2);
  if (!collapsedNodeIds.has(root.id)) {
    positionSubtree({ ...root, children: leftChildren }, startLeftY);
  }

  // Position right subtree
  const startRightY = -(rightHeight / 2);
  if (!collapsedNodeIds.has(root.id)) {
    positionSubtree({ ...root, children: rightChildren }, startRightY);
  }

  return { nodes, edges };
};
