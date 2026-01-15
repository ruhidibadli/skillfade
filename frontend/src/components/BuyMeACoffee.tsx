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
export default function BuyMeACoffee({ variant = 'link', className = '' }: BuyMeACoffeeProps) {
  const coffeeUrl = 'https://buymeacoffee.com/astoicone';

  if (variant === 'card') {
    return (
      <div className={`card-elevated p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0">
            <Coffee className="w-5 h-5 text-white" />
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
                         bg-gradient-to-r from-amber-400 to-orange-400
                         text-white font-medium rounded-lg
                         transition-all duration-200
                         hover:from-amber-500 hover:to-orange-500
                         hover:shadow-lg active:scale-[0.98]"
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
                   text-sm font-medium text-amber-600 dark:text-amber-400
                   bg-amber-50 dark:bg-amber-900/20
                   border border-amber-200 dark:border-amber-800
                   rounded-lg transition-all duration-200
                   hover:bg-amber-100 dark:hover:bg-amber-900/30
                   hover:border-amber-300 dark:hover:border-amber-700
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
                 hover:text-amber-500 dark:hover:text-amber-400
                 transition-colors duration-200 ${className}`}
    >
      <Coffee className="w-3.5 h-3.5" />
      <span>Support</span>
    </a>
  );
}
