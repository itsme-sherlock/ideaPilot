"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addFeedback } from "@/app/actions";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";

type FeedbackState = 'idle' | 'commenting' | 'submitting' | 'success';

export function FeedbackWidget({ pageId }: { pageId: string }) {
  const { toast } = useToast();
  const [state, setState] = useState<FeedbackState>('idle');
  const [response, setResponse] = useState<'yes' | 'no' | null>(null);
  const [comment, setComment] = useState("");

  const handleResponse = (res: 'yes' | 'no') => {
    setResponse(res);
    setState('commenting');
  };

  const handleSubmit = async () => {
    if (!response) return;
    setState('submitting');
    const result = await addFeedback({ response, comment, pageId });
    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error });
      setState('commenting');
    } else {
      toast({ title: "Thanks!", description: result.success });
      setState('success');
    }
  };

  if (state === 'success') {
    return <p className="text-center font-medium text-green-600">Thank you for your valuable feedback!</p>;
  }

  if (state === 'idle') {
    return (
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => handleResponse('yes')} className="flex-1 gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700">
          <ThumbsUp className="h-5 w-5" /> Yes
        </Button>
        <Button variant="outline" size="lg" onClick={() => handleResponse('no')} className="flex-1 gap-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700">
          <ThumbsDown className="h-5 w-5" /> No
        </Button>
      </div>
    );
  }

  if (state === 'commenting' || state === 'submitting') {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">You selected: <span className={`font-bold ${response === 'yes' ? 'text-green-600' : 'text-red-600'}`}>{response?.toUpperCase()}</span>. Any comments? (optional)</p>
        <Textarea 
          placeholder="I would buy this if..." 
          value={comment} 
          onChange={(e) => setComment(e.target.value)}
          disabled={state === 'submitting'}
        />
        <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setState('idle')} disabled={state === 'submitting'}>Back</Button>
            <Button onClick={handleSubmit} disabled={state === 'submitting'} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {state === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
            </Button>
        </div>
      </div>
    );
  }

  return null;
}
