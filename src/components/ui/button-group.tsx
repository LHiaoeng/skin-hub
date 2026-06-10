import * as React from "react";

import { cn } from "@/lib/utils";

function ButtonGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("inline-flex w-fit items-center gap-0", className)}
      data-slot="button-group"
      role="group"
      {...props}
    />
  );
}

export { ButtonGroup };
