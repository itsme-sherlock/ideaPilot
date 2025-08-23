import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { landingPagePrompt } from '@/ai/prompts/landingPagePrompt';

const GenerateLandingPageContentInputSchema = z.object({
  productDescription: z.string().describe('A description of the product or idea.'),
});

const GenerateLandingPageContentOutputSchema = z.object({
  headline: z.string().describe('The generated headline.'),
  subHeadline: z.string().describe('The generated sub-headline.'),
});

const generateLandingPageContentPrompt = ai.definePrompt({
  name: 'generateLandingPageContentPrompt',
  input: { schema: GenerateLandingPageContentInputSchema },
  output: { schema: GenerateLandingPageContentOutputSchema },
  prompt: landingPagePrompt,
});

export const generateLandingPageContentFlow = ai.defineFlow(
  {
    name: 'generateLandingPageContentFlow',
    inputSchema: GenerateLandingPageContentInputSchema,
    outputSchema: GenerateLandingPageContentOutputSchema,
  },
  async (input) => {
    const result = await generateLandingPageContentPrompt(input);
    return result.output!;
  }
);

export async function generateLandingPageContent(
  input: z.infer<typeof GenerateLandingPageContentInputSchema>
) {
  return await generateLandingPageContentFlow(input);
}