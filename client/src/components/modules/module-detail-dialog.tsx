import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Network, Info, Code, Layers } from "lucide-react";

interface ModuleDetailDialogProps {
  module: {
    id: number;
    name: string;
    code?: string;
    description?: string;
    price?: number;
    isActive: boolean;
    createdAt?: string;
    createdBy?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleDetailDialog({ module, isOpen, onClose }: ModuleDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Module Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Module name and status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                <Network className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">{module.name}</h2>
            </div>
            <Badge variant={module.isActive ? "won" : "secondary"}>
              {module.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Module Information */}
          <div className="space-y-4 pt-2">
            <h3 className="text-md font-medium border-b pb-2">Module Information</h3>
            <div className="grid grid-cols-1 gap-4">
              {module.code && (
                <div className="flex items-start">
                  <Code className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Module Code</p>
                    <p className="font-medium">{module.code}</p>
                  </div>
                </div>
              )}

              {module.description && (
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Description</p>
                    <p className="font-medium whitespace-pre-line">{module.description}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-slate-400 mt-0.5 mr-3">₹</span>
                <div>
                  <p className="text-sm text-slate-500">Price</p>
                  <p className="font-medium">
                    {module.price 
                      ? `₹${module.price.toLocaleString()}` 
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products using this module - would come from backend in a real implementation */}
          <div className="space-y-4 pt-2">
            <h3 className="text-md font-medium border-b pb-2">Associated Products</h3>
            <div className="text-sm text-slate-500 italic">
              This information would be populated from product relationships.
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Module ID: #{module.id}</span>
              {module.createdAt && (
                <span>Created: {new Date(module.createdAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}