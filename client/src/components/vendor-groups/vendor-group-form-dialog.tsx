import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VendorGroupForm, VendorGroupFormValues } from "./vendor-group-form";
import { VendorGroup } from "@shared/schema";

interface VendorGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VendorGroupFormValues) => void;
  initialData?: VendorGroup;
  title: string;
}

export function VendorGroupFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
}: VendorGroupFormDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = (data: VendorGroupFormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <VendorGroupForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}