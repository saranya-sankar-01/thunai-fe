import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/* =========================
   Root components
========================= */

const Dialog1 = DialogPrimitive.Root;
const DialogTrigger1 = DialogPrimitive.Trigger;
const DialogPortal1 = DialogPrimitive.Portal;
const DialogClose1 = DialogPrimitive.Close;

/* =========================
   Overlay
========================= */

const DialogOverlay1 = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay1.displayName = "DialogOverlay1";

/* =========================
   Content
========================= */

const DialogContent1 = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal1>
    <DialogOverlay1 />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-50",
        "h-screen w-full max-w-lg",
        "bg-background border shadow-lg",
        "grid gap-4 p-6",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        className
      )}
      {...props}
    >
      {children}

      <DialogPrimitive.Close
        className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70",
          "ring-offset-background transition-opacity",
          "hover:opacity-100 focus:outline-none focus:ring-2",
          "focus:ring-ring focus:ring-offset-2"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal1>
));
DialogContent1.displayName = "DialogContent1";

/* =========================
   Header / Footer
========================= */

const DialogHeader1 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader1.displayName = "DialogHeader1";

const DialogFooter1 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter1.displayName = "DialogFooter1";

/* =========================
   Title / Description
========================= */

const DialogTitle1 = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle1.displayName = "DialogTitle1";

const DialogDescription1 = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription1.displayName = "DialogDescription1";

/* =========================
   Exports
========================= */

export {
  Dialog1,
  DialogTrigger1,
  DialogPortal1,
  DialogOverlay1,
  DialogClose1,
  DialogContent1,
  DialogHeader1,
  DialogFooter1,
  DialogTitle1,
  DialogDescription1,
};
