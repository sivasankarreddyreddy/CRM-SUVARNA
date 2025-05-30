import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, Database, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function BackupManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // Fetch backup list
  const { data: backups = [], isLoading } = useQuery({
    queryKey: ["/api/backup/list"],
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      setIsCreatingBackup(true);
      return apiRequest("POST", "/api/backup/create", {});
    },
    onSuccess: (data) => {
      toast({
        title: "Backup Created",
        description: "Database backup has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/list"] });
    },
    onError: (error: any) => {
      toast({
        title: "Backup Failed",
        description: error.message || "Failed to create database backup.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreatingBackup(false);
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: async (filename: string) => {
      return apiRequest("DELETE", `/api/backup/${filename}`);
    },
    onSuccess: () => {
      toast({
        title: "Backup Deleted",
        description: "Backup file has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/list"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete backup file.",
        variant: "destructive",
      });
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.mutate();
  };

  const handleDeleteBackup = (filename: string) => {
    deleteBackupMutation.mutate(filename);
  };

  const formatFileSize = (filename: string) => {
    // Extract timestamp from filename and format it
    const timestamp = filename.replace('backup_', '').replace('.sql', '');
    try {
      const date = new Date(timestamp.replace(/-/g, ':').replace(/T/, ' '));
      return date.toLocaleString();
    } catch {
      return filename;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Database className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading backup information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Backup Management
          </CardTitle>
          <CardDescription>
            Create and manage database backups. Only administrators can access this feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Create New Backup</h3>
              <p className="text-sm text-muted-foreground">
                Generate a complete backup of the current database
              </p>
            </div>
            <Button 
              onClick={handleCreateBackup}
              disabled={isCreatingBackup || createBackupMutation.isPending}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {isCreatingBackup ? "Creating..." : "Create Backup"}
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Available Backups</h3>
            
            {backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No backups available</p>
                <p className="text-sm">Create your first backup to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((filename: string) => (
                  <div
                    key={filename}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{filename}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {formatFileSize(filename)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                          // Note: In a real implementation, you'd want to add a download endpoint
                          toast({
                            title: "Download",
                            description: "Download functionality would be implemented here",
                          });
                        }}
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Delete Backup
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this backup file? This action cannot be undone.
                              <br />
                              <br />
                              <strong>File:</strong> {filename}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBackup(filename)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Backup
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-amber-800">
          <p>• Database backups contain all system data including user information</p>
          <p>• Backup files are stored securely on the server</p>
          <p>• Only administrators can create, view, and delete backups</p>
          <p>• Regular backups are recommended to prevent data loss</p>
        </CardContent>
      </Card>
    </div>
  );
}