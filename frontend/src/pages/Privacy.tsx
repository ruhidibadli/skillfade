import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

const Privacy: React.FC = () => {
  const resetConsent = () => {
    try {
      localStorage.removeItem('analytics_consent');
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Privacy Policy"
        description="SkillFade privacy policy. What we collect, what we don't, and how to opt out. We use Google Analytics on marketing pages only to count page views by country. Your in-app activity is never tracked."
        canonicalUrl="https://skillfade.website/privacy"
      />

      {/* Header */}
      <PublicHeader />

      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-400/10 mb-5">
              <Shield className="w-7 h-7 text-accent-400" />
            </div>
            <h1 className="text-display-md text-txt-primary mb-4">Privacy Policy</h1>
            <p className="text-lg text-txt-secondary">
              Last updated: May 14, 2026
            </p>
          </div>

          <div className="card-elevated p-8 space-y-8 animate-slide-up">
            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">The short version</h2>
              <p className="text-txt-secondary leading-relaxed">
                We use Google Analytics on our public marketing pages to count visitors and see which countries they come from. We never track what you do inside the app. We don&apos;t sell data, run ads, or share anything with third parties beyond Google Analytics on the pages listed below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">What we collect on marketing pages</h2>
              <p className="text-txt-secondary leading-relaxed mb-3">
                On the following public pages only, Google Analytics 4 collects:
              </p>
              <ul className="text-txt-secondary space-y-1.5 list-disc pl-5 mb-3">
                <li>Anonymized IP address (truncated by Google before storage)</li>
                <li>Approximate country and city</li>
                <li>Page URL you visited</li>
                <li>Referrer (the link that brought you here)</li>
                <li>Browser, operating system, and device type</li>
                <li>Session duration</li>
              </ul>
              <p className="text-txt-secondary leading-relaxed mb-2">
                Pages where analytics fires:
              </p>
              <p className="text-txt-muted text-sm font-mono leading-relaxed">
                / · /features · /faq · /what-is-learning-decay · /use-cases · /comparisons · /login · /register · /forgot-password · /reset-password · /privacy · /about · /contact
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">What we don&apos;t collect</h2>
              <ul className="text-txt-secondary space-y-1.5 list-disc pl-5">
                <li>Anything you do inside the app: dashboards, skills, events, settings, support tickets, admin pages</li>
                <li>Skill names, notes, learning events, or practice events</li>
                <li>Personally identifying information beyond what you give us at signup (email)</li>
                <li>Cross-site behavior — Google Analytics is configured with ad personalization disabled</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">Cookies</h2>
              <p className="text-txt-secondary leading-relaxed">
                We store one authentication token in <code className="text-xs bg-surface-300 px-1.5 py-0.5 rounded">localStorage</code> after you sign in and one cookie-consent preference. If you accept the cookie banner, Google Analytics also stores its own first-party cookies (<code className="text-xs bg-surface-300 px-1.5 py-0.5 rounded">_ga</code>, <code className="text-xs bg-surface-300 px-1.5 py-0.5 rounded">_ga_*</code>) for visitor counting. If you decline, no analytics cookies are set.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">Data retention</h2>
              <p className="text-txt-secondary leading-relaxed">
                Google Analytics retains visitor data for 14 months, then deletes it automatically. The data you put into the app (skills, events, notes) is retained until you delete your account, which is permanent and instant.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">Your controls</h2>
              <ul className="text-txt-secondary space-y-2 list-disc pl-5">
                <li>Decline the cookie banner — no analytics cookies are set.</li>
                <li>Use a browser extension that blocks Google Analytics (uBlock Origin, Privacy Badger).</li>
                <li>Export all your in-app data as JSON from Settings.</li>
                <li>Delete your account permanently from Settings — all skills, events, and notes are removed.</li>
              </ul>
              <button onClick={resetConsent} className="btn-secondary mt-5 text-sm">
                Reset cookie preference
              </button>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">Contact</h2>
              <p className="text-txt-secondary leading-relaxed">
                Questions about privacy? Open a ticket from the in-app Support page, or email the address in the footer of the GitHub repository.
              </p>
            </section>
          </div>

          <div className="mt-10 text-center">
            <Link to="/" className="text-accent-400 hover:underline text-sm">
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default Privacy;
