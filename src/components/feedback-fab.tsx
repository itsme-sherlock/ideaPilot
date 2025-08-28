"use client";

import React, { useState, useTransition } from "react";
import { submitToolFeedback } from "@/lib/submit-product-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

type FeedbackFabProps = {
  slug: string;
};

export function FeedbackFab({ slug }: FeedbackFabProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile()

  const validate = (text: string) => text.trim().length >= 10;

  const handleSubmit = () => {
    setErrorMsg(null);

    if (!validate(feedbackText)) {
      setErrorMsg("Please provide meaningful feedback (at least 10 characters).");
      return;
    }

    const form = new FormData();
    form.append("feedback", feedbackText);
    form.append("slug", slug);

    startTransition(async () => {
      const result = await submitToolFeedback(form);
      if ((result as any)?.error) {
        setErrorMsg((result as any).error as string);
      } else {
        setOpen(false);
        setFeedbackText("");
        toast({ title: "Feedback received", description: "Thanks! We’ll use it to improve IdeaPilot." });
      }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => {
          setFeedbackText("");
          setErrorMsg(null);
          setOpen(true);
        }}
        className="px-4 py-2 rounded-full text-sm"
      >
        {isMobile ? (
          "💬"// Render only the icon on mobile view
        ) : (
          <span>
            💬
            Feedback to creators
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send product feedback</DialogTitle>
            <DialogDescription>
              Tell us how we can improve IdeaPilot. Minimum 10 characters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your feedback..."
              rows={5}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {feedbackText.trim().length} characters
              </span>
              {!validate(feedbackText) && feedbackText.length > 0 && (
                <span className="text-destructive">
                  At least 10 characters required
                </span>
              )}
            </div>

            {errorMsg && (
              <p className="text-sm text-destructive" role="alert">
                {errorMsg}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !validate(feedbackText)}
            >
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}