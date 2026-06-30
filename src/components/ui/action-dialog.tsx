"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Should throw on error — dialog stays open; show toast.error before throwing */
  onConfirm: () => Promise<void> | void;
  actionLabel: string;
  entityName: string;
  entityType: string;
  consequence: string;
  /** Two-step confirmation — use for Decline / Suspend / Delete */
  isDestructive?: boolean;
}

export function ActionDialog({
  isOpen,
  onClose,
  onConfirm,
  actionLabel,
  entityName,
  entityType,
  consequence,
  isDestructive = false,
}: ActionDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setIsLoading(false);
    }
  }, [isOpen]);

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // caller shows the error toast; dialog stays open
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && isOpen && !isLoading) onClose();
  };

  const onStep2 = isDestructive && step === 2;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-card border-stroke shadow-button rounded-2xl w-[90vw] sm:w-[400px] !max-w-[400px]">
        <AlertDialogHeader>
          {onStep2 ? (
            <>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-badge-pending-text shrink-0" />
                <AlertDialogTitle className="text-xl font-bold text-primary-text">Confirm {actionLabel}</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm font-medium text-secondary-text">
                Are you sure you want to <strong>{actionLabel.toLowerCase()}</strong>{" "}
                <strong>&ldquo;{entityName}&rdquo;</strong>?
              </AlertDialogDescription>
            </>
          ) : (
            <>
              <AlertDialogTitle className="text-xl font-bold text-primary-text">
                {actionLabel} {entityType}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium text-secondary-text mt-2">
                You are about to <strong>{actionLabel.toLowerCase()}</strong>{" "}
                <strong>&ldquo;{entityName}&rdquo;</strong>. {consequence}
              </AlertDialogDescription>
            </>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          {onStep2 ? (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="rounded-xl border-stroke"
              >
                ← Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={isLoading}
                className="bg-badge-pending-text text-bg-white rounded-xl shadow-button hover:opacity-90"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {actionLabel}
              </Button>
            </>
          ) : isDestructive ? (
            <>
              <Button variant="outline" onClick={onClose} className="rounded-xl border-stroke">
                Cancel
              </Button>
              <Button
                variant="outline"
                className="border-badge-pending-text text-badge-pending-text hover:bg-badge-pending-bg rounded-xl shadow-button"
                onClick={() => setStep(2)}
              >
                Continue →
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isLoading} className="rounded-xl border-stroke">
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={isLoading} className="bg-primary text-primary-foreground rounded-xl shadow-button hover:opacity-90">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {actionLabel}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
