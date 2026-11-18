"use client";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Detail sheet — now a shadcn/ui Dialog (Radix). Callers keep the same API:
 *  render <DetailModal title onClose>children</DetailModal> when open. */
export function DetailModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[92vh] gap-4 p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-10">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export const QUICK_MESSAGES = ["Hi! Is this still available?", "Hi! I’d love to see the place this weekend.", "Hi! My budget and timings match — can we chat?"];
