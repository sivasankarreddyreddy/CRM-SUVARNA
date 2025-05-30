import { useQuery } from "@tanstack/react-query";
import { BackupManager } from "@/components/dashboard/backup-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function BackupPage() {
  // Get current user to check permissions
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Only admin users can access backup functionality
  if (user && user.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the database backup functionality. 
              Only administrators can create and manage database backups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you need access to this feature, please contact your system administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Database Backup</h1>
        <p className="text-muted-foreground">
          Create and manage database backups to ensure data safety and recovery capabilities.
        </p>
      </div>

      <BackupManager />
    </div>
  );
}