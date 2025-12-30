import { useRef, useState, useEffect } from 'react';
import { useDashboard } from '@/store/DashboardContext';
import type { DashboardNode } from '@/types';
import { TEMPLATE_DEFINITIONS, CATEGORY_COLORS } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Home, Trash2, Copy, Edit3 } from 'lucide-react';

interface MindMapCanvasProps {
  onNodeSelect: (node: DashboardNode | null) => void;
}

export function MindMapCanvas({ onNodeSelect }: MindMapCanvasProps) {
  const { state, setZoom, setPan, moveNode, deleteNode, duplicateNode, setActiveNode } = useDashboard();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  // Pan canvas with middle mouse or when dragging on empty space
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === canvasRef.current)) {
      setIsDragging(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !dragNode) {
      setPan({
        x: state.pan.x + e.movementX,
        y: state.pan.y + e.movementY,
      });
    } else if (dragNode) {
      const node = state.nodes.find(n => n.id === dragNode);
      if (node) {
        moveNode(dragNode, {
          x: (e.clientX - dragOffset.x - state.pan.x) / state.zoom,
          y: (e.clientY - dragOffset.y - state.pan.y) / state.zoom,
        });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  // Zoom with scroll wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(state.zoom + delta);
    }
  };

  // Node drag start
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = state.nodes.find(n => n.id === nodeId);
    if (node) {
      setDragNode(nodeId);
      setDragOffset({
        x: e.clientX - (node.position.x * state.zoom + state.pan.x),
        y: e.clientY - (node.position.y * state.zoom + state.pan.y),
      });
    }
  };

  // Node click
  const handleNodeClick = (e: React.MouseEvent, node: DashboardNode) => {
    e.stopPropagation();
    setActiveNode(node.id);
    onNodeSelect(node);
  };

  // Node context menu
  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Fit all nodes
  const fitView = () => {
    if (state.nodes.length === 0) return;
    
    const bounds = state.nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x + 280),
        maxY: Math.max(acc.maxY, node.position.y + 100),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 100;
    
    const scaleX = (width - padding * 2) / (bounds.maxX - bounds.minX);
    const scaleY = (height - padding * 2) / (bounds.maxY - bounds.minY);
    const newZoom = Math.min(scaleX, scaleY, 1.5);
    
    setZoom(newZoom);
    setPan({
      x: (width - (bounds.maxX + bounds.minX) * newZoom) / 2,
      y: (height - (bounds.maxY + bounds.minY) * newZoom) / 2,
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f8f9fa]">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#e5e7eb 1px, transparent 1px),
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * state.zoom}px ${20 * state.zoom}px`,
          backgroundPosition: `${state.pan.x}px ${state.pan.y}px`,
        }}
      />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
        onClick={() => {
          setActiveNode(null);
          onNodeSelect(null);
        }}
      >
        {/* Nodes */}
        <div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`,
          }}
        >
          {state.nodes.map(node => {
            const template = TEMPLATE_DEFINITIONS.find(t => t.type === node.type);
            const isActive = state.activeNodeId === node.id;
            
            return (
              <div
                key={node.id}
                className={cn(
                  'absolute w-[280px] bg-white rounded-lg shadow-md cursor-pointer transition-all duration-200',
                  'hover:shadow-lg hover:scale-[1.02]',
                  isActive && 'ring-2 ring-offset-2 shadow-xl',
                  dragNode === node.id && 'opacity-80 scale-105'
                )}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  borderLeft: `4px solid ${node.color || CATEGORY_COLORS[node.category]}`,
                  ['--tw-ring-color' as string]: node.color || CATEGORY_COLORS[node.category],
                }}
                onClick={(e) => handleNodeClick(e, node)}
                onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                onContextMenu={(e) => handleContextMenu(e, node.id)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{template?.icon || '📄'}</span>
                    <h3 className="font-semibold text-gray-800 truncate flex-1">
                      {node.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${CATEGORY_COLORS[node.category]}20`,
                        color: CATEGORY_COLORS[node.category],
                      }}
                    >
                      {node.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(node.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
        <Button variant="ghost" size="icon" onClick={() => setZoom(state.zoom + 0.1)}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setZoom(state.zoom - 0.1)}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="h-px bg-gray-200" />
        <Button variant="ghost" size="icon" onClick={resetView}>
          <Home className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={fitView}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow px-3 py-1 text-sm text-gray-600">
        {Math.round(state.zoom * 100)}%
      </div>

      {/* Empty state */}
      {state.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">Your mind map is empty</p>
            <p className="text-gray-300 text-sm">
              Add templates from the sidebar to get started
            </p>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="absolute bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              const node = state.nodes.find(n => n.id === contextMenu.nodeId);
              if (node) {
                setActiveNode(node.id);
                onNodeSelect(node);
              }
              setContextMenu(null);
            }}
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              duplicateNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
          >
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-rose-600"
            onClick={() => {
              deleteNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
