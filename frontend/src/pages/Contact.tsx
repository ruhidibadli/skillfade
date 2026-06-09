import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MessageSquare, LifeBuoy, Shield } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Contact"
        description="Get in touch with SkillFade. Open a support ticket inside the app, email us, or read the privacy policy."
        canonicalUrl="https://skillfade.website/contact"
      />

      <PublicHeader />

      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-400/10 mb-5">
              <MessageSquare className="w-7 h-7 text-accent-400" />
            </div>
            <h1 className="text-display-md text-txt-primary mb-4">Contact</h1>
            <p className="text-lg text-txt-secondary">
              We read every message. No bots, no autoresponders.
            </p>
          </div>

          <div className="card-elevated p-8 space-y-8 animate-slide-up">
            <section className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-400/10 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-txt-primary mb-2">Support tickets (recommended)</h2>
                <p className="text-txt-secondary leading-relaxed mb-3">
                  Have an account? Open a ticket from inside the app — you&apos;ll see replies in one place, and we can look up your account context to help faster.
                </p>
                <Link to="/support" className="btn-secondary inline-flex items-center gap-2 text-sm">
                  Open a ticket <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            <section className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-400/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-txt-primary mb-2">Email</h2>
                <p className="text-txt-secondary leading-relaxed">
                  For anything else — partnerships, press, or questions before you sign up — write to{' '}
                  <a
                    href="mailto:hello@skillfade.website"
                    className="text-accent-400 hover:underline font-medium"
                  >
                    hello@skillfade.website
                  </a>
                  . Replies typically arrive within a couple of business days.
                </p>
              </div>
            </section>

            <section className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-400/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-txt-primary mb-2">Privacy &amp; data requests</h2>
                <p className="text-txt-secondary leading-relaxed">
                  For data export or deletion, the fastest path is the Settings page in your account. For anything beyond that — or if you can&apos;t access your account — see the{' '}
                  <Link to="/privacy" className="text-accent-400 hover:underline">privacy policy</Link>{' '}
                  or email the address above.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">What we promise</h2>
              <ul className="text-txt-secondary space-y-1.5 list-disc pl-5">
                <li>Real humans, not chatbots</li>
                <li>No upsell tricks, no &ldquo;contact sales&rdquo; gates</li>
                <li>No newsletter signups hidden inside support replies</li>
                <li>If we can&apos;t help, we&apos;ll say so plainly</li>
              </ul>
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

export default Contact;
