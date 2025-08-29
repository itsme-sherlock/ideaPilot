"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createLandingPage } from "@/app/actions";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  productDescription: z.string().min(10, {
    message: "Please describe your idea in at least 10 characters.",
  }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function IdeaForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productDescription: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("'Generate' button clicked. Form submission started.");
    setIsSubmitting(true);
    try {
      const result = await createLandingPage(values);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else if (result.slug) {
        toast({
          variant: "success",
          title: "Success!",
          description: "Success! Your page is live. Redirecting you to your dashboard... ",
        });
        setTimeout(() => {
          router.push(`/p/${result.slug}/admin`);
        }, 1500); // 1.5 seconds delay before redirect
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-4 rounded-lg no-border shadow-xl">
        <FormField
          control={form.control}
          name="productDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Your Idea</FormLabel>
              <FormControl>
                <Input placeholder="e.g., I'm launching a course on yoga for new moms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Your Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Create My Validation Test Page"
          )}
        </Button>
      </form>
    </Form>
  );
}
