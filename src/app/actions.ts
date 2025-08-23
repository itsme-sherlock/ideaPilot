'use server';

import { z } from 'zod';
import { generateLandingPageContent } from '@/ai/flows/generate-landing-page-content';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { getClientIp } from '@/lib/get-ip';

// -------------------------
// SCHEMAS
// -------------------------

const createPageSchema = z.object({
  productDescription: z.string().min(10, 'Description must be at least 10 characters'),
  email: z.string().email('Please enter a valid email'),
});

const addSignupSchema = z.object({
  email: z.string().email('Invalid email'),
  pageId: z.string().min(1),
});

const addFeedbackSchema = z.object({
  response: z.enum(['yes', 'no']),
  comment: z.string().optional(),
  pageId: z.string().min(1),
});

// -------------------------
// MAIN ACTION: Create Landing Page
// -------------------------

export async function createLandingPage(values: z.infer<typeof createPageSchema>) {
  console.log('Entering createLandingPage function.');
  const validatedFields = createPageSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    return { error: 'Invalid input.' };
  }

  const { productDescription, email } = validatedFields.data;
  const supabase = createClient();

  try {
    console.log('Calling AI to generate content for:', productDescription);
    const content = await generateLandingPageContent({ productDescription });
    //commenting the code to save api call
    // const content = { headline: 'Headline', subHeadline: 'Subheadline' };
    console.log('AI returned:', content);

    const { headline, subHeadline } = content;
    if (!headline || !subHeadline) {
      return { error: 'Failed to generate content. Please try again.' };
    }

    // Generate unique slug
    let slug = slugify(headline);
    let counter = 1;

    console.log('Checking slug availability:', slug);
    let { data: existing } = await supabase
      .from('pages')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    while (existing) {
      console.log(`Slug "${slug}" taken. Trying next...`);
      slug = `${slugify(headline)}-${counter}`;
      const { data: nextData } = await supabase
        .from('pages')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();
      existing = nextData;
      counter++;
    }
    console.log('Final slug:', slug);

    // Insert into Supabase
    const now = new Date().toISOString();
    console.log('Inserting new page into Supabase:', { headline, subHeadline, slug, email });

    const { error: insertError } = await supabase.from('pages').insert({
      idea: productDescription,
      creator_email: email,
      headline,
      sub_headline: subHeadline,
      slug,
      created_at: now,
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return { error: 'Could not save landing page.' };
    }

    // Revalidate dynamic routes
    revalidatePath(`/p/${slug}`);
    revalidatePath(`/p/${slug}/admin`);

    return { slug };
  } catch (error: any) {
    console.error('Error in createLandingPage:', error);
    return { error: 'An unexpected error occurred. Could not create landing page.' };
  } finally {
    console.log('Exiting createLandingPage function.');
  }
}

// -------------------------
// ACTION: Add Email Signup
// -------------------------

export async function addSignup(values: z.infer<typeof addSignupSchema>) {
  const validated = addSignupSchema.safeParse(values);
  if (!validated.success) {
    return { error: 'Invalid input.' };
  }

  const { email, pageId } = validated.data;
  const supabase = createClient();

  try {
    const { error } = await supabase.from('signups').insert({
      page_id: pageId,
      email,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath(`/p/[slug]/admin`, 'page');
    return { success: 'Thank you for signing up!' };
  } catch (error: any) {
    console.error('Error adding signup:', error);
    return { error: 'Could not add signup. Please try again.' };
  }
}

// -------------------------
// ACTION: Add Feedback
// -------------------------

export async function addFeedback(values: z.infer<typeof addFeedbackSchema>) {
  const validated = addFeedbackSchema.safeParse(values);
  if (!validated.success) {
    return { error: 'Invalid input.' };
  }

  const { response, comment, pageId } = validated.data;
  const supabase = createClient();

  try {
    const { error } = await supabase.from('feedback').insert({
      page_id: pageId,
      response,
      comment: comment || '',
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath(`/p/[slug]/admin`, 'page');
    return { success: 'Thank you for your feedback!' };
  } catch (error: any) {
    console.error('Error adding feedback:', error);
    return { error: 'Could not submit feedback. Please try again.' };
  }
}