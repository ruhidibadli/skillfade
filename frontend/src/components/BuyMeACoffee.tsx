import { Coffee } from 'lucide-react';

interface BuyMeACoffeeProps {
  variant?: 'link' | 'button' | 'card';
  className?: string;
}

/**
 * Subtle Buy Me a Coffee component that fits the calm design philosophy.
 * - link: Simple text link with icon (for footers)
 * - button: Small button style (for more prominent placement)
 * - card: Card with description (for settings page)
 */
export const coffeeUrl = 'https://buymeacoffee.com/astoicone';

export default function BuyMeACoffee({ variant = 'link', className = '' }: BuyMeACoffeeProps) {

  if (variant === 'card') {
    return (
      <div className={`card-elevated p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aging-base to-secondary-400 flex items-center justify-center flex-shrink-0">
            <Coffee className="w-5 h-5 text-surface-50" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-txt-primary mb-1">Support SkillFade</h3>
            <p className="text-sm text-txt-muted mb-4">
              If SkillFade helps you track and maintain your skills, consider supporting its development.
            </p>
            <a
              href={coffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2
                         bg-aging-base text-surface-50 font-semibold rounded-lg
                         transition-all duration-200
                         hover:bg-aging-glow hover:shadow-glow-aging active:scale-[0.98]"
            >
              <Coffee className="w-4 h-4" />
              Buy me a coffee
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <a
        href={coffeeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3 py-1.5
                   text-sm font-medium text-aging-base
                   bg-aging-base/10 border border-aging-base/25
                   rounded-lg transition-all duration-200
                   hover:bg-aging-base/20 hover:border-aging-base/40
                   ${className}`}
      >
        <Coffee className="w-4 h-4" />
        Support
      </a>
    );
  }

  // Default: link variant
  return (
    <a
      href={coffeeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-txt-muted
                 hover:text-aging-base
                 transition-colors duration-200 ${className}`}
    >
      <Coffee className="w-3.5 h-3.5" />
      <span>Support</span>
    </a>
  );
}
