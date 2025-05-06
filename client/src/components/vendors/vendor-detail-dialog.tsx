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
import { Building, Mail, Phone, Globe, MapPin, User } from "lucide-react";

interface VendorDetailDialogProps {
  vendor: {
    id: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    isActive: boolean;
    createdAt?: string;
    createdBy?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function VendorDetailDialog({ vendor, isOpen, onClose }: VendorDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Vendor Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Vendor name and status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                <Building className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">{vendor.name}</h2>
            </div>
            <Badge variant={vendor.isActive ? "won" : "secondary"}>
              {vendor.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 pt-2">
            <h3 className="text-md font-medium border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.contactPerson && (
                <div className="flex items-start">
                  <User className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Contact Person</p>
                    <p className="font-medium">{vendor.contactPerson}</p>
                  </div>
                </div>
              )}

              {vendor.email && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{vendor.email}</p>
                  </div>
                </div>
              )}

              {vendor.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{vendor.phone}</p>
                  </div>
                </div>
              )}

              {vendor.website && (
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Website</p>
                    <p className="font-medium">
                      <a 
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {vendor.website}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            {vendor.address && (
              <div className="pt-2">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium whitespace-pre-line">{vendor.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Vendor ID: #{vendor.id}</span>
              {vendor.createdAt && (
                <span>Created: {new Date(vendor.createdAt).toLocaleDateString()}</span>
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