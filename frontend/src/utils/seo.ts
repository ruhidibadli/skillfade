// Schema.org type definitions and generators for AI-readability

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
}

export interface SoftwareApplicationSchema {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
  };
  description: string;
  featureList: string[];
}

export interface FAQPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
}

export interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  author: {
    "@type": "Organization";
    name: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
}

// Generator functions
export const generateOrganizationSchema = (baseUrl: string = "https://skillfade.app"): OrganizationSchema => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SkillFade",
  url: baseUrl,
  logo: `${baseUrl}/logo.svg`,
  description: "SkillFade is a skill decay tracking application that helps developers and self-directed learners visualize learning decay, practice scarcity, and input/output imbalance."
});

export const generateSoftwareApplicationSchema = (): SoftwareApplicationSchema => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SkillFade",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  description: "SkillFade is a skill decay tracking tool for developers and self-directed learners. It tracks learning decay, practice scarcity, and input/output imbalance without gamification. A calm mirror, not a coach.",
  featureList: [
    "Skill freshness tracking with 0-100% decay calculation",
    "Learning event logging (reading, videos, courses, tutorials)",
    "Practice event logging (projects, exercises, work, teaching)",
    "Input/output balance ratio analytics",
    "Calm email alerts without gamification",
    "Privacy-first design with no third-party analytics",
    "Self-hosted option with full data ownership",
    "Full data export and permanent account deletion"
  ]
});

export const generateWebSiteSchema = (baseUrl: string = "https://skillfade.app"): WebSiteSchema => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SkillFade",
  url: baseUrl,
  description: "SkillFade is a skill decay tracking application for developers and self-directed learners. Track learning decay, practice scarcity, and input/output imbalance."
});

export const generateFAQSchema = (faqItems: Array<{ question: string; answer: string }>): FAQPageSchema => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
});

export const generateArticleSchema = (
  headline: string,
  description: string,
  datePublished: string = "2024-01-01",
  baseUrl: string = "https://skillfade.app"
): ArticleSchema => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline,
  description,
  author: {
    "@type": "Organization",
    name: "SkillFade"
  },
  publisher: {
    "@type": "Organization",
    name: "SkillFade",
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.svg`
    }
  },
  datePublished,
  dateModified: new Date().toISOString().split('T')[0]
});
