import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

// NOTE: This is a plain-language starting draft, not legal advice. Have it reviewed
// against your jurisdiction (Azerbaijan / your payment processor terms) before relying on it.
const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Terms of Service"
        description="SkillFade Terms of Service — the agreement covering your use of the app, accounts, acceptable use, and the one-time SkillFade PRO purchase."
        canonicalUrl="https://skillfade.website/terms"
      />

      <PublicHeader />

      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-400/10 mb-5">
              <FileText className="w-7 h-7 text-accent-400" />
            </div>
            <h1 className="text-display-md text-txt-primary mb-4">Terms of Service</h1>
            <p className="text-lg text-txt-secondary">Last updated: July 7, 2026</p>
          </div>

          <div className="card-elevated p-8 space-y-8 animate-slide-up">
            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">1. Agreement</h2>
              <p className="text-txt-secondary leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of SkillFade
                (the &quot;Service&quot;). By creating an account or using the Service, you agree to these
                Terms. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">2. The Service</h2>
              <p className="text-txt-secondary leading-relaxed">
                SkillFade is a skill-decay tracking application. It lets you log skills, learning
                events, and practice events, and it estimates a freshness score for each skill. The
                Service is provided on an ongoing basis and may change, expand, or be discontinued
                over time. It is a tool for personal insight and does not constitute professional,
                educational, or career advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">3. Your account</h2>
              <p className="text-txt-secondary leading-relaxed">
                You are responsible for the security of your account and for all activity under it.
                Provide accurate information at signup and keep your credentials confidential. You
                must be old enough to form a binding contract in your jurisdiction to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">4. Acceptable use</h2>
              <p className="text-txt-secondary leading-relaxed mb-3">You agree not to:</p>
              <ul className="text-txt-secondary space-y-1.5 list-disc pl-5">
                <li>Use the Service for any unlawful purpose or in violation of these Terms.</li>
                <li>Attempt to disrupt, overload, reverse-engineer, or gain unauthorized access to the Service or its infrastructure.</li>
                <li>Upload content that is illegal, infringing, or harmful.</li>
                <li>Resell or commercially exploit the Service without permission.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">5. SkillFade PRO and payments</h2>
              <p className="text-txt-secondary leading-relaxed">
                SkillFade&apos;s core is free to use. SkillFade PRO is an optional one-time purchase
                that unlocks additional features (such as unlimited skills, full history, dependencies,
                notes, and advanced analytics) for the lifetime of the Service. Prices are shown on the
                <Link to="/pricing" className="text-accent-400 hover:underline"> pricing page</Link> in
                Azerbaijani manat (AZN). Payments are processed by our third-party payment provider; by
                purchasing, you also agree to that provider&apos;s terms. &quot;Lifetime&quot; refers to
                the lifetime of the Service and does not guarantee the Service will operate indefinitely.
                Refunds, where offered, are handled on a case-by-case basis — contact us if something is
                wrong with your purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">6. Your data</h2>
              <p className="text-txt-secondary leading-relaxed">
                You own the data you enter. You can export all of it as JSON and permanently delete your
                account at any time from Settings. Our handling of data is described in the
                <Link to="/privacy" className="text-accent-400 hover:underline"> Privacy Policy</Link>,
                which forms part of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">7. Intellectual property</h2>
              <p className="text-txt-secondary leading-relaxed">
                The Service, its branding, and its content (excluding data you provide) are owned by
                SkillFade or its licensors. These Terms do not grant you any right to our trademarks or
                branding.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">8. Disclaimers</h2>
              <p className="text-txt-secondary leading-relaxed">
                The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties
                of any kind, whether express or implied. Freshness scores and other outputs are estimates
                and may be inaccurate. We do not warrant that the Service will be uninterrupted, error-free,
                or secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">9. Limitation of liability</h2>
              <p className="text-txt-secondary leading-relaxed">
                To the maximum extent permitted by law, SkillFade shall not be liable for any indirect,
                incidental, or consequential damages arising from your use of the Service. Our total
                liability for any claim shall not exceed the amount you paid us in the twelve months
                before the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">10. Termination</h2>
              <p className="text-txt-secondary leading-relaxed">
                You may stop using the Service and delete your account at any time. We may suspend or
                terminate access if you violate these Terms or to protect the Service. Sections that by
                their nature should survive termination (such as intellectual property, disclaimers, and
                limitation of liability) will survive.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">11. Changes to these Terms</h2>
              <p className="text-txt-secondary leading-relaxed">
                We may update these Terms from time to time. Material changes will be reflected by updating
                the &quot;Last updated&quot; date above. Continued use of the Service after changes take
                effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">12. Contact</h2>
              <p className="text-txt-secondary leading-relaxed">
                Questions about these Terms? Reach us through the
                <Link to="/contact" className="text-accent-400 hover:underline"> contact page</Link> or the
                in-app Support page.
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

export default Terms;
