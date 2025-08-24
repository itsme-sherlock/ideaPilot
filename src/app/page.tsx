'use client';

import { useState } from 'react';
import { IdeaForm } from '@/components/idea-form';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { TypingText } from '@/components/typing-text';

export default function Home() {
  // State to control whether the example preview is visible or not
  const [showExample, setShowExample] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      {/* Branding Section */}
      <div className="w-full max-w-md md:max-w-2xl text-center space-y-6">
        {/* Brand Name and Icon */}
        <div className="flex justify-center">
          {/* The brand name is an inline-flex container with a gap of 2px between the icon and the text. */}
          {/* The icon is a lightbulb from Lucide Icons. */}
          {/* The text is "IdeaPilot" in a rounded-full background with a primary color. */}
          {/* The entire container is given a shadow effect to make it stand out. */}
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium shadow-sm">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
            <span>IdeaPilot</span>
          </div>
        </div>

        {/* Headline */}
        {/* The headline is a heading element with a font size of 3xl on small screens, 4xl on medium screens, and 5xl on large screens. */}
        {/* The headline is also given a font-bold class to make it stand out. */}
        {/* The text is "Turn Your Idea Into a Live Landing Page". */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Turn Your Idea Into a Live Landing Page
        </h1>

        {/* Dynamic Subheadline */}
        {/* The subheadline is a component that dynamically changes its text based on the user's input. */}
        {/* The subheadline is not given any classes, so it will inherit the default font styles. */}
        <TypingText />

        {/* Form Guidance */}
        {/* The form guidance is a paragraph element with a font size of sm and a text color of foreground/80. */}
        {/* The text is "Enter your idea below → we’ll generate a live landing page in seconds.". */}
        <p className="text-sm text-foreground/80">
          Enter your idea below → we’ll generate a live landing page in seconds.
        </p>

        {/* Main CTA */}
        {/* The main CTA is an IdeaForm component, which is a custom form component that I created. */}
        {/* The IdeaForm component takes care of rendering the form fields and the submit button. */}
        {/* The IdeaForm component also handles the form submission and displays an error message if the input is invalid. */}
        <IdeaForm />

        {/* “See Example” Button */}
        {/* The "See Example" button is a button element with a type of "button". */}
        {/* The button element has an onClick event handler that toggles the showExample state variable. */}
        {/* The button element also has a className of "text-primary hover:underline font-medium inline-flex items-center". */}
        {/* The button element contains a text node with the text "See a real example". */}
        {/* The button element also contains an ArrowRight icon from Lucide Icons. */}
        {/* The icon is given a className of "ml-1 h-4 w-4 transition-transform duration-200". */}
        {/* The icon is also given a conditional className of "rotate-90" if the showExample state variable is true. */}
        <p className="text-sm">
          <button
            type="button"
            onClick={() => setShowExample((prev) => !prev)}
            className="text-primary hover:underline font-medium inline-flex items-center"
          >
            {showExample ? 'Hide example' : 'See a real example'}
            <ArrowRight
              className={`ml-1 h-4 w-4 transition-transform duration-200 ${showExample ? 'rotate-90' : ''
                }`}
            />
          </button>
        </p>

        {/* Example Preview (Visual) */}
        {/* The example preview is a container element with a className of "mt-4". */}
        {/* The container element contains a div element with a className of "p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-left text-xs max-w-xs mx-auto". */}
        {/* The div element contains a flex container with three div elements, each with a className of "w-2 h-2 bg-[color] rounded-full". */}
        {/* The colors are red-400, yellow-400, and green-400. */}
        {/* The div element also contains a heading element with a className of "font-bold text-gray-900 mb-1". */}
        {/* The heading element contains a text node with the text "Mindful Dad". */}
        {/* The div element also contains a paragraph element with a className of "text-gray-600 mb-2". */}
        {/* The paragraph element contains a text node with the text "Daily 5-minute practices for dads who want to be calm, not perfect.". */}
        {/* The div element also contains a div element with a className of "text-green-600 font-mono bg-green-50 px-1 py-0.5 rounded border text-[10px]". */}
        {/* The div element contains a text node with the text "/p/mindful-dad". */}
        {/* The container element also contains a paragraph element with a className of "text-xs text-muted-foreground mt-2 text-center". */}
        {/* The paragraph element contains a text node with the text "This page got 12 signups in 2 days.". */}
        {/* Example Preview (Collapsible) */}
        {showExample && (
          <div className="mt-4 text-left bg-muted/50 p-4 rounded-lg border border-muted shadow-sm space-y-3">
            {/* Context / Benefit */}
            <p className="text-sm font-medium text-foreground">
              Here’s what your page could look like:
            </p>

            {/* Mini Landing Page Preview */}
            <div className="border border-muted rounded p-3 bg-background shadow-sm space-y-1">
              <h3 className="font-bold text-base text-foreground">Mindful Dad</h3>
              <p className="text-sm text-muted-foreground">
                Daily 5-minute practices for dads who want to be calm, not perfect.
              </p>
              <div className="flex items-center gap-2 text-xs text-green-600 font-mono bg-green-50 px-2 py-1 rounded">
                <span>→</span>
                <span>/p/mindful-dad</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Result: This page collected 12 signups in 2 days.
              </p>
            </div>

            {/* Reassurance */}
            <p className="text-xs text-muted-foreground">
              You’ll get a similar simple, shareable page to test your idea fast — no coding or design skills required.
            </p>
          </div>
        )}

        {/* Post-Submit Hint */}
        {/* The post-submit hint is a paragraph element with a className of "text-xs text-muted-foreground mt-4". */}
        {/* The paragraph element contains a text node with the text "You’ll get a link like". */}
        {/* The paragraph element also contains a span element with a className of "text-foreground font-mono". */}
        {/* The span element contains a text node with the text "/p/ai-course-for-busy-parents". */}
        {/* The paragraph element also contains a text node with the text " — share it to validate your idea.". */}
        <p className="text-xs text-muted-foreground mt-4">
          You’ll get a link like{' '}
          <span className="text-foreground font-mono">/p/ai-course-for-busy-parents</span> — share it
          to validate your idea.
        </p>
      </div>

      {/* Soft Background Decoration (Desktop) */}
      {/* The soft background decoration is a div element with an aria-hidden attribute of "true". */}
      {/* The div element is given a className of "pointer-events-none fixed inset-0 -z-10 hidden md:block". */}
      {/* The div element is also given a style attribute with a background image gradient. */}
      {/* The gradient is a radial gradient with two colors: rgba(59, 130, 246, 0.05) and transparent. */}
      {/* The gradient is repeated twice, once at 20% 30% and once at 80% 70%. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 hidden md:block"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
          `,
        }}
      />
    </main>
  );
}
