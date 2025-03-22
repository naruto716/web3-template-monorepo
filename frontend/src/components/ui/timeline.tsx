import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Timeline = ({ children, className, ...props }: TimelineProps) => {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
};

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  date?: string;
  description?: string;
  icon?: React.ReactNode;
  status?: "waiting" | "accepted" | "paid" | "working" | "finished" | "default";
  isLast?: boolean;
}

export const TimelineItem = ({
  title,
  date,
  description,
  icon,
  status = "default",
  isLast = false,
  className,
  children,
  ...props
}: TimelineItemProps) => {
  // More subtle status colors that better match the overall theme
  const statusStyles = {
    waiting: {
      border: "border-amber-200 dark:border-amber-800",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      dot: "bg-amber-500"
    },
    accepted: {
      border: "border-blue-200 dark:border-blue-800",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      dot: "bg-blue-500"
    },
    paid: {
      border: "border-primary/20 dark:border-primary/30",
      badge: "bg-primary/10 text-primary-foreground dark:bg-primary/20",
      dot: "bg-primary"
    },
    working: {
      border: "border-indigo-200 dark:border-indigo-800",
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      dot: "bg-indigo-500"
    },
    finished: {
      border: "border-green-200 dark:border-green-800",
      badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      dot: "bg-green-500"
    },
    default: {
      border: "border-gray-200 dark:border-gray-800",
      badge: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      dot: "bg-gray-400"
    }
  };

  const statusLabels = {
    waiting: "Awaiting Response",
    accepted: "Accepted",
    paid: "Paid",
    working: "In Progress",
    finished: "Completed",
    default: "Contract"
  };

  return (
    <div className={cn("relative pl-8", className)} {...props}>
      {/* Timeline connector line */}
      {!isLast && (
        <div className="absolute left-3 top-6 h-full w-px -translate-x-1/2 bg-border dark:bg-muted" />
      )}

      {/* Timeline node */}
      <div className={cn(
        "absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full",
        "border bg-background shadow-sm",
        statusStyles[status].border
      )}>
        {icon ? (
          <span className="text-sm">{icon}</span>
        ) : (
          <div className={cn("h-3 w-3 rounded-full", statusStyles[status].dot)} />
        )}
      </div>

      {/* Content card */}
      <div className={cn(
        "rounded-lg border p-4 shadow-sm bg-card",
        statusStyles[status].border
      )}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">{title}</h3>
          {date && (
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(date).toLocaleDateString()}
            </time>
          )}
        </div>
        
        <div className="mb-2">
          <span className={cn(
            "text-xs rounded-full px-2 py-0.5 font-medium",
            statusStyles[status].badge
          )}>
            {statusLabels[status]}
          </span>
        </div>
        
        {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}
        {children}
      </div>
    </div>
  );
}; 