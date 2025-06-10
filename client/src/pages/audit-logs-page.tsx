import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Trash2, User, Calendar, Filter, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";

interface AuditLog {
  id: number;
  tableName: string;
  recordId: number;
  recordData: any;
  deletedAt: string;
  deletedBy: number;
  reason?: string;
}

const tableDisplayNames: Record<string, string> = {
  contacts: "Contacts",
  companies: "Companies",
  leads: "Leads",
  opportunities: "Opportunities",
  quotations: "Quotations",
  tasks: "Tasks",
  activities: "Activities",
  users: "Users",
  products: "Products",
  sales_orders: "Sales Orders",
  vendors: "Vendors",
  teams: "Teams"
};

const getTableIcon = (tableName: string) => {
  switch (tableName) {
    case "contacts":
      return <User className="h-4 w-4" />;
    case "companies":
      return <FileText className="h-4 w-4" />;
    case "leads":
      return <User className="h-4 w-4" />;
    case "opportunities":
      return <FileText className="h-4 w-4" />;
    case "quotations":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTableBadgeColor = (tableName: string) => {
  switch (tableName) {
    case "contacts":
      return "bg-blue-100 text-blue-800";
    case "companies":
      return "bg-green-100 text-green-800";
    case "leads":
      return "bg-yellow-100 text-yellow-800";
    case "opportunities":
      return "bg-purple-100 text-purple-800";
    case "quotations":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<AuditLog | null>(null);

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
    enabled: !!user && user.role === 'admin'
  });

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Trash2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to view audit logs.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredLogs = selectedTable === "all" 
    ? auditLogs || []
    : (auditLogs || []).filter((log: AuditLog) => log.tableName === selectedTable);

  const getRecordTitle = (log: AuditLog) => {
    const data = log.recordData;
    if (!data) return `Record #${log.recordId}`;
    
    // Try different common field names for title/name
    return data.name || data.title || data.fullName || data.companyName || data.email || `Record #${log.recordId}`;
  };

  const formatRecordData = (data: any) => {
    if (!data) return {};
    
    // Filter out null/undefined values and format the data nicely
    const filtered = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    return filtered;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">Track all deleted records across the system</p>
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {Object.entries(tableDisplayNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deletions</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLogs?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tables Affected</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(auditLogs?.map((log: AuditLog) => log.tableName)).size || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auditLogs?.filter((log: AuditLog) => {
                  const logDate = new Date(log.deletedAt);
                  const now = new Date();
                  return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
                }).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredLogs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Deleted Records</CardTitle>
            <CardDescription>
              Complete history of all deleted records with their original data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deleted records found</h3>
                <p className="text-gray-600">
                  {selectedTable === "all" 
                    ? "No records have been deleted yet."
                    : `No records have been deleted from ${tableDisplayNames[selectedTable]}.`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>Deleted At</TableHead>
                      <TableHead>Deleted By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log: AuditLog) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTableIcon(log.tableName)}
                            <Badge variant="secondary" className={getTableBadgeColor(log.tableName)}>
                              {tableDisplayNames[log.tableName] || log.tableName}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{getRecordTitle(log)}</div>
                          <div className="text-sm text-gray-500">ID: {log.recordId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {format(new Date(log.deletedAt), "MMM dd, yyyy")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(log.deletedAt), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>User #{log.deletedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.reason ? (
                            <span className="text-sm">{log.reason}</span>
                          ) : (
                            <span className="text-sm text-gray-400">No reason provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedRecord(log)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Data
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Deleted Record Data</DialogTitle>
                                <DialogDescription>
                                  Original data from {tableDisplayNames[log.tableName] || log.tableName} record #{log.recordId}
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-96">
                                <div className="space-y-4">
                                  {Object.entries(formatRecordData(log.recordData)).map(([key, value]) => (
                                    <div key={key} className="flex flex-col space-y-1">
                                      <label className="text-sm font-medium text-gray-700 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                      </label>
                                      <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}