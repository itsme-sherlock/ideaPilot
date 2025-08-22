'use server';

/**
 * @fileOverview Generates content for a landing page based on a product idea.
 *
 * - generateLandingPageContent - A function that generates the landing page content.
 * - GenerateLandingPageContentInput - The input type for the generateLandingPageContent function.
 * - GenerateLandingPageContentOutput - The return type for the generateLandingPageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLandingPageContentInputSchema = z.object({
  productDescription: z
    .string()
    .describe('A description of the product or idea for the landing page.'),
});
export type GenerateLandingPageContentInput = z.infer<
  typeof GenerateLandingPageContentInputSchema
>;

const GenerateLandingPageContentOutputSchema = z.object({
  headline: z.string().describe('The generated headline for the landing page.'),
  subHeadline: z.string().describe('The generated sub-headline for the landing page.'),
});
export type GenerateLandingPageContentOutput = z.infer<
  typeof GenerateLandingPageContentOutputSchema
>;

export async function generateLandingPageContent(
  input: GenerateLandingPageContentInput
): Promise<GenerateLandingPageContentOutput> {
  return generateLandingPageContentFlow(input);
}

const generateLandingPageContentPrompt = ai.definePrompt({
  name: 'generateLandingPageContentPrompt',
  input: {schema: GenerateLandingPageContentInputSchema},
  output: {schema: GenerateLandingPageContentOutputSchema},
  prompt: `You are a marketing expert who specializes in creating compelling landing page content. Generate a short and attention-grabbing headline and sub-headline for a landing page based on the following product description:

Product Description: {{{productDescription}}}

Headline:`, // Removed example text.
});

const generateLandingPageContentFlow = ai.defineFlow(
  {
    name: 'generateLandingPageContentFlow',
    inputSchema: GenerateLandingPageContentInputSchema,
    outputSchema: GenerateLandingPageContentOutputSchema,
  },
  async input => {
    const {output} = await generateLandingPageContentPrompt(input);
    return output!;
  }
);
