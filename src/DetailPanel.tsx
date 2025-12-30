import type { DashboardNode } from '@/types';
import { TEMPLATE_DEFINITIONS } from '@/types';
import { useDashboard } from '@/store/DashboardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { CrumpleAnimation } from '../paper/Paper';
import { X, Trash2, Copy, Printer } from 'lucide-react';

interface DetailPanelProps {
  node: DashboardNode;
  onClose: () => void;
}

export function DetailPanel({ node, onClose }: DetailPanelProps) {
  const { updateNode, deleteNode, duplicateNode, state } = useDashboard();
  const template = TEMPLATE_DEFINITIONS.find(t => t.type === node.type);

  const handleTitleChange = (title: string) => {
    updateNode(node.id, { title });
  };

  const handleDelete = () => {
    deleteNode(node.id);
    onClose();
  };

  const handleDuplicate = () => {
    duplicateNode(node.id);
  };

  const handlePrint = () => {
    // In a real implementation, this would generate a print-ready PDF
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-[#faf9f6]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{template?.icon || '📄'}</span>
          <Input
            value={node.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
            style={{ color: node.color }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrint}
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDuplicate}
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Template Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <CrumpleAnimation isAnimating={state.isAnimating}>
            <TemplateRenderer node={node} />
          </CrumpleAnimation>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between text-xs text-gray-500">
        <span>Created: {new Date(node.createdAt).toLocaleDateString()}</span>
        <span>Last updated: {new Date(node.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}
