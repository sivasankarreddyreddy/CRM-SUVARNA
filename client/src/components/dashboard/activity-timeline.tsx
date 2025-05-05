import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Check, UserPlus, FileText, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: number;
  type: "email" | "call" | "task" | "lead" | "meeting" | "note";
  title: string;
  time: string;
  isYou?: boolean;
  target?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onViewAll?: () => void;
  isLoading?: boolean;
}

// Function to get the right icon and color based on activity type
const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'email':
      return <Mail size={16} className="text-green-600" />;
    case 'call':
      return <Phone size={16} className="text-blue-600" />;
    case 'task':
      return <Check size={16} className="text-amber-600" />;
    case 'lead':
      return <UserPlus size={16} className="text-indigo-600" />;
    case 'meeting':
      return <Users size={16} className="text-purple-600" />;
    case 'note':
      return <FileText size={16} className="text-slate-600" />;
  }
};

// Function to get background color for the avatar
const getAvatarColor = (type: Activity['type']) => {
  switch (type) {
    case 'email':
      return 'bg-green-100';
    case 'call':
      return 'bg-blue-100';
    case 'task':
      return 'bg-amber-100';
    case 'lead':
      return 'bg-indigo-100';
    case 'meeting':
      return 'bg-purple-100';
    case 'note':
      return 'bg-slate-100';
  }
};

export function ActivityTimeline({ activities, onViewAll, isLoading }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">Recent Activities</CardTitle>
          <Button variant="link" className="text-primary-600 p-0" onClick={onViewAll}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200"></div>
          
          {/* Activity items */}
          <div className="space-y-6">
            {isLoading ? (
              // Loading state
              Array(4).fill(0).map((_, index) => (
                <div key={`skeleton-${index}`} className="relative flex">
                  <Skeleton className="flex-shrink-0 w-10 h-10 rounded-full z-10" />
                  <div className="flex-1 ml-4">
                    <Skeleton className="h-4 w-4/5 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))
            ) : activities.length > 0 ? (
              // Data state
              activities.map((activity) => (
                <div key={activity.id} className="relative flex">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getAvatarColor(activity.type)} border-4 border-white flex items-center justify-center z-10`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 ml-4">
                    <p className="text-sm text-slate-800">
                      {activity.isYou && <span className="font-medium">You</span>}
                      {' '}{activity.title}{' '}
                      {activity.target && <span className="font-medium">{activity.target}</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="py-8 text-center text-slate-500">
                No recent activities found.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
