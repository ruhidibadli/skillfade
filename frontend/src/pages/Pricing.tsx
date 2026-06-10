import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { billing, PENDING_ORDER_KEY } from '../services/api';

const PRO_FEATURES = [
  'Unlimited skills, categories & templates',
  'Full history — no 30-day window',
  'Skill dependencies & prerequisites',
  'Per-skill freshness targets & notes',
  'Advanced analytics: period comparisons, category stats, personal records',
  'Data export & backup',
  'One-time payment — lifetime access, no subscription',
];

const Pricing: React.FC = () => {
  const { isPro, loading: planLoading } = usePlan();
  const { isAuthenticated } = useAuth();
  const [price, setPrice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    billing
      .pricing()
      .then((res) => setPrice(res.data.lifetime_price_azn))
      .catch(() => setPrice(null));
  }, []);

  const startCheckout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await billing.checkout();
      sessionStorage.setItem(PENDING_ORDER_KEY, data.order_id);
      window.location.href = data.redirect_url;
    } catch {
      setError('We could not start the checkout. Please try again in a moment.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Pricing"
        description="SkillFade PRO is a one-time payment for lifetime access — unlimited skills, advanced analytics, dependencies, notes, and data export. No subscription."
        canonicalUrl="https://skillfade.website/pricing"
      />
      <PublicHeader />

      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary-400/10 mb-5">
              <Sparkles className="w-7 h-7 text-secondary-400" />
            </div>
            <h1 className="text-display-md text-txt-primary mb-4">SkillFade PRO</h1>
            <p className="text-lg text-txt-secondary">
              Pay once. Keep it forever. No subscription, ever.
            </p>
          </div>

          <div className="card-elevated p-8 animate-slide-up">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-display font-semibold text-txt-primary">
                {price ? `${price} ₼` : '—'}
              </span>
              <span className="text-txt-muted">one-time · lifetime</span>
            </div>

            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-txt-secondary">
                  <Check className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <div className="mb-4 rounded-lg border border-decayed-base/30 bg-decayed-base/10 px-4 py-3 text-sm text-decayed-base">
                {error}
              </div>
            )}

            {planLoading ? (
              <div className="btn-primary w-full justify-center inline-flex items-center gap-2 opacity-70">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading…
              </div>
            ) : isPro ? (
              <div className="rounded-lg border border-accent-400/30 bg-accent-400/10 px-4 py-3 text-center text-accent-400 font-medium">
                You already have PRO — thank you!
              </div>
            ) : !isAuthenticated ? (
              <Link to="/register" className="btn-primary w-full justify-center inline-flex items-center gap-2">
                Create an account to upgrade <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={startCheckout}
                disabled={submitting}
                className="btn-primary w-full justify-center inline-flex items-center gap-2 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Redirecting…
                  </>
                ) : (
                  <>
                    Upgrade to PRO <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            )}

            <p className="mt-4 text-center text-xs text-txt-muted">
              Secure payment via Epoint. Prices in Azerbaijani manat (AZN).
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link to="/features" className="text-accent-400 hover:underline text-sm">
              See everything SkillFade does
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default Pricing;
