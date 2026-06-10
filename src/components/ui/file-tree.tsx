"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Folder, File, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TreeProps {
  children: React.ReactNode;
  className?: string;
}

export function Tree({ children, className }: TreeProps) {
  return <div className={cn("space-y-1", className)}>{children}</div>;
}

interface TreeFolderProps {
  name: React.ReactNode;
  defaultOpen?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function TreeFolder({
  name,
  defaultOpen = false,
  icon: Icon = Folder,
  children,
  className,
}: TreeFolderProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className={className}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50 [&[data-state=open]>svg:first-child]:rotate-90">
        <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-5 mt-1 space-y-1 border-l pl-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface TreeFileProps {
  name: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function TreeFile({
  name,
  icon: Icon = File,
  className,
}: TreeFileProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent/50 cursor-pointer",
        className,
      )}
    >
      <span className="w-4 shrink-0" />
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{name}</span>
    </div>
  );
}
