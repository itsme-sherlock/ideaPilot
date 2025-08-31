import { Mail } from "lucide-react";
import { boolean } from "zod";

type FooterProps = {
  needed: boolean;
};

export function Footer({ needed }: FooterProps) {
  console.log("Footer needed prop:", needed);
  return (
    <footer className="w-full py-6 mt-16 text-center text-sm text-muted-foreground border-t">
      Built with <a href="/" className="font-semibold text-primary hover:underline">GoNo-Go</a>

      {needed&& <div className="text-xs text-muted-foreground text-center mt-6">
                <p>Early MVP — your feedback shapes the product</p>
                <div className='flex justify-center items-center gap-1 mt-1'>
                  <Mail className="h-4 w-4 text-primary inline-block mt-1" />
                  <p>Please write to <a href="mailto:info@gono-go.com"><span className="underline text-primary">info@gono-go.com</span></a></p>
                </div>
              </div>
              }
    </footer>
  );
}
