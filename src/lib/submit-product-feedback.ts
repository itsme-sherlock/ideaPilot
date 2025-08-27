// app/actions/submit-tool-feedback.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitToolFeedback(formData: FormData) {
  const slug = formData.get('slug') as string;
  const feedback = formData.get('feedback') as string;

  // Validate input
  if (!feedback || feedback.trim().length < 10) {
    return { error: 'Please provide meaningful feedback (at least 10 characters).' };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('tool_feedback')
      .insert({
        slug,
        feedback: feedback.trim()
        // created_at is handled by DB default
      });

    if (error) {
      console.error('Supabase insert error:', error);
      return { error: 'Could not save feedback. Please try again.' };
    }

    // Optional: Revalidate admin page
    revalidatePath(`/p/[slug]/admin`, 'page');

    return { success: 'Thank you for your feedback! We’ll use it to improve IdeaPilot.' };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}