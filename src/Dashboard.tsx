import { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard } from '@/store/DashboardContext';
import { Sidebar } from '../sidebar/Sidebar';
import { MindMapCanvas } from '../canvas/MindMapCanvas';
import { DetailPanel } from '../detail/DetailPanel';
import type { DashboardNode } from '@/types';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/sonner';

function DashboardContent() {
  const { state, setActiveNode } = useDashboard();
  const [selectedNode, setSelectedNode] = useState<DashboardNode | null>(null);

  const handleNodeSelect = (node: DashboardNode | null) => {
    setSelectedNode(node);
  };

  const handleCloseDetail = () => {
    setSelectedNode(null);
    setActiveNode(null);
  };

  // Sync selected node with state changes
  useEffect(() => {
    if (selectedNode) {
      const updatedNode = state.nodes.find(n => n.id === selectedNode.id);
      if (updatedNode) {
        setSelectedNode(updatedNode);
      }
    }
  }, [state.nodes, selectedNode?.id]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex">
        {selectedNode ? (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={40} minSize={30}>
              <MindMapCanvas onNodeSelect={handleNodeSelect} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60} minSize={40}>
              <DetailPanel node={selectedNode} onClose={handleCloseDetail} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <MindMapCanvas onNodeSelect={handleNodeSelect} />
        )}
      </div>

      <Toaster />
    </div>
  );
}

export function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
