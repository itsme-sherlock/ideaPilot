'use server';

import { z } from 'zod';
import { addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateLandingPageContent } from '@/ai/flows/generate-landing-page-content';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

const createPageSchema = z.object({
  productDescription: z.string().min(10),
  email: z.string().email(),
});

export async function createLandingPage(values: z.infer<typeof createPageSchema>) {
  console.log('Entering createLandingPage function.');
  const validatedFields = createPageSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const { productDescription, email } = validatedFields.data;

    console.log('Calling generateLandingPageContent with productDescription:', productDescription);
    const content = await generateLandingPageContent({ productDescription });
    console.log('Received result from generateLandingPageContent:', content);
    const { headline, subHeadline } = content;

    if (!headline || !subHeadline) {
      return { error: 'Failed to generate content. Please try again.' };
    }
    
    let slug = slugify(headline);
    const pagesRef = collection(db, 'pages');
    let q = query(pagesRef, where('slug', '==', slug));
    let querySnapshot = await getDocs(q);
    let counter = 1;
    while (!querySnapshot.empty) {
        slug = `${slugify(headline)}-${counter}`;
        q = query(pagesRef, where('slug', '==', slug));
        querySnapshot = await getDocs(q);
        counter++;
    }

    await addDoc(pagesRef, {
      idea: productDescription,
      creatorEmail: email,
      headline,
      subHeadline,
      slug,
      createdAt: serverTimestamp(),
    });

    revalidatePath(`/p/${slug}`);
    revalidatePath(`/p/${slug}/admin`);

    return { slug };
  } catch (error: any) {
    console.error('Error creating landing page:', error);
    return { error: 'An unexpected error occurred. Could not create landing page.' };
  }
  finally {
    console.log('Exiting createLandingPage function.');
  }
}

const addSignupSchema = z.object({
  email: z.string().email(),
  pageId: z.string(),
});

export async function addSignup(values: z.infer<typeof addSignupSchema>) {
  const validatedFields = addSignupSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }
  const { email, pageId } = validatedFields.data;
  
  try {
    await addDoc(collection(db, 'pages', pageId, 'signups'), {
      email,
      createdAt: serverTimestamp(),
    });
    revalidatePath(`/p/[slug]/admin`, 'page');
    return { success: 'Thank you for signing up!' };
  } catch (error) {
    console.error('Error adding signup:', error);
    return { error: 'Could not add signup. Please try again.' };
  }
}

const addFeedbackSchema = z.object({
  response: z.enum(['yes', 'no']),
  comment: z.string().optional(),
  pageId: z.string(),
});

export async function addFeedback(values: z.infer<typeof addFeedbackSchema>) {
  const validatedFields = addFeedbackSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }
  const { response, comment, pageId } = validatedFields.data;

  try {
    await addDoc(collection(db, 'pages', pageId, 'feedback'), {
      response,
      comment: comment || '',
      createdAt: serverTimestamp(),
    });
    revalidatePath(`/p/[slug]/admin`, 'page');
    return { success: 'Thank you for your feedback!' };
  } catch (error) {
    console.error('Error adding feedback:', error);
    return { error: 'Could not submit feedback. Please try again.' };
  }
}
