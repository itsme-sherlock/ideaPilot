import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

// Log all AI requests
// This function is a wrapper around the `ai.generate` function which makes a request to the AI model.
// The purpose of this function is to log all AI requests to the console.
// The logging is done simply to help me understand what's going on and to verify that the AI requests are happening.
// The AI request object is logged to the console.
// The AI request object contains the input to the AI model, which is the data that is passed to the AI model to generate text.
// The AI request object also contains other metadata such as the model name and the prompt.
// The AI request object is logged to the console as an object, with the key-value pairs separated by commas.
// The AI request object is logged to the console before the AI request is made.
// This is done so that I can see the AI request before it is sent to the AI model.
// The AI request object is logged to the console with the label "AI Request:"
// This label is used to identify the log message as an AI request.
// The label is followed by a colon and a space.
// The AI request object is logged to the console as a string.
// The AI request object is logged to the console using the console.log function.
export async function requestAI(input: { prompt: string }) {
  console.log('AI Request:', JSON.stringify(input));
  const result = await ai.generate(input);
  return result;
}
