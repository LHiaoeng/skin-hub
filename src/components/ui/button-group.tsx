import * as React from "react";

import { cn } from "@/lib/utils";

function ButtonGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex w-fit items-center",
        "[&>[data-slot=button]]:relative [&>[data-slot=button]]:rounded-none",
        "[&>[data-slot=button]:first-child]:rounded-l-md [&>[data-slot=button]:last-child]:rounded-r-md",
        "[&>[data-slot=button]:not(:first-child)]:-ml-px [&>[data-slot=button]:focus-visible]:z-10",
        className,
      )}
      data-slot="button-group"
      role="group"
      {...props}
    />
  );
}

export { ButtonGroup };
