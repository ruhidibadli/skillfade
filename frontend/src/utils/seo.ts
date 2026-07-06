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
    url: string;
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
export const generateOrganizationSchema = (baseUrl: string = "https://skillfade.website"): OrganizationSchema => ({
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

export const generateWebSiteSchema = (baseUrl: string = "https://skillfade.website"): WebSiteSchema => ({
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
  datePublished: string,
  dateModified: string = datePublished,
  baseUrl: string = "https://skillfade.website"
): ArticleSchema => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline,
  description,
  author: {
    "@type": "Organization",
    name: "SkillFade",
    url: baseUrl
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
  dateModified
});

// ── Blog schemas ────────────────────────────────────────────────────────────

export interface BlogPostingSchema {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description: string;
  url: string;
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
  image: string;
  author: { "@type": "Organization"; name: string; url: string };
  publisher: {
    "@type": "Organization";
    name: string;
    logo: { "@type": "ImageObject"; url: string };
  };
  datePublished: string;
  dateModified: string;
  keywords?: string;
}

export interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export interface BlogSchema {
  "@context": "https://schema.org";
  "@type": "Blog";
  name: string;
  url: string;
  description: string;
  publisher: { "@type": "Organization"; name: string; logo: { "@type": "ImageObject"; url: string } };
}

export const generateBlogPostingSchema = (
  opts: {
    title: string;
    description: string;
    slug: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    tags?: string[];
  },
  baseUrl: string = "https://skillfade.website"
): BlogPostingSchema => {
  const url = `${baseUrl}/blog/${opts.slug}`;
  const image = opts.image
    ? (opts.image.startsWith("http") ? opts.image : `${baseUrl}${opts.image}`)
    : `${baseUrl}/og-image.png`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image,
    author: { "@type": "Organization", name: "SkillFade", url: baseUrl },
    publisher: {
      "@type": "Organization",
      name: "SkillFade",
      logo: { "@type": "ImageObject", url: `${baseUrl}/logo.svg` }
    },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    ...(opts.tags && opts.tags.length ? { keywords: opts.tags.join(", ") } : {})
  };
};

export const generateBreadcrumbSchema = (
  crumbs: Array<{ name: string; url: string }>
): BreadcrumbListSchema => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: c.url
  }))
});

export const generateBlogSchema = (baseUrl: string = "https://skillfade.website"): BlogSchema => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "SkillFade Blog",
  url: `${baseUrl}/blog`,
  description: "Essays on skill decay, retention, and calm, deliberate learning for developers and self-directed learners.",
  publisher: {
    "@type": "Organization",
    name: "SkillFade",
    logo: { "@type": "ImageObject", url: `${baseUrl}/logo.svg` }
  }
});
