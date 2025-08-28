'use server';

import { z } from 'zod';
import { generateLandingPageContent } from '@/ai/flows/generate-landing-page-content';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
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

  // STEP 1: Validate input
  // Use the safeParse method of the createPageSchema to validate the input.
  // If the input is invalid, return an error message.
  const validatedFields = createPageSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    return { error: 'Invalid input.' };
  }

  // STEP 2: Extract validated fields
  // Extract the validated fields from the createPageSchema.
  // These are the fields that were validated in the previous step.
  const { productDescription, email } = validatedFields.data;
  console.log('Validated fields:', { productDescription, email });

  // STEP 3: CHECK RATE LIMIT FIRST
  // Call the rateLimit function to check if the IP is rate limited.
  // If the IP is rate limited, return an error message.
  console.log('Checking rate limit...');
  const { allowed, timeLeft } = await rateLimit();
  if (!allowed) {
    const minutesLeft = Math.ceil(timeLeft! / 60000);
    console.log(`Rate limited. IP blocked for ${minutesLeft} more minutes.`);
    return { 
      error: `Too many requests. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.` 
    };
  }

  // STEP 4: Create Supabase client
  // Create a new Supabase client.
  // This client will be used to interact with the Supabase database.
  const supabase = createClient();
  console.log('Created Supabase client.');

  try {
    // STEP 5: CALL AI (after rate limit)
    // Call the generateLandingPageContent function to generate content for the landing page.
    // The generateLandingPageContent function will call the AI to generate content.
    // The AI will generate content based on the product description.
    console.log('Calling AI to generate content for:', productDescription);
    const content = await generateLandingPageContent({ productDescription });
    console.log('AI returned:', content);

    // STEP 6: Extract generated content
    // Extract the generated content from the generateLandingPageContent function.
    // The generated content will contain the headline and sub-headline for the landing page.
    const { headline, subHeadline } = content;
    if (!headline || !subHeadline) {
      return { error: 'Failed to generate content. Please try again.' };
    }

    // STEP 7: GENERATE UNIQUE SLUG
    // Generate a unique slug for the landing page.
    // The slug will be used to create a unique URL for the landing page.
    let slug = slugify(headline);
    let counter = 1;

    // STEP 8: CHECK IF SLUG ALREADY EXISTS
    // Check if the generated slug already exists in the database.
    // If the slug already exists, generate a new slug.
    console.log('Checking if slug already exists...');
    let { data: existing } = await supabase
      .from('pages')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    while (existing) {
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

    // STEP 9: INSERT LANDING PAGE
    // Insert the landing page into the database.
    // The landing page will contain the generated headline and sub-headline.
    console.log('Inserting landing page...');
    const now = new Date().toISOString();
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

    // STEP 10: REVALIDATE PATHS
    // Revalidate the paths for the landing page and admin page.
    // This will ensure that the pages are rebuilt with the new data.
    console.log('Revalidating paths...');
    revalidatePath(`/p/${slug}`);
    revalidatePath(`/p/${slug}/admin`);

    // STEP 11: RETURN SLUG
    // Return the generated slug.
    // The slug will be used to redirect the user to the landing page.
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