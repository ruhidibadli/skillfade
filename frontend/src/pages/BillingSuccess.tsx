import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';
import { usePlan } from '../context/PlanContext';
import { billing, PENDING_ORDER_KEY } from '../services/api';

type State = 'checking' | 'active' | 'pending';

const MAX_ATTEMPTS = 5;

const BillingSuccess: React.FC = () => {
  const { refresh } = usePlan();
  const [state, setState] = useState<State>('checking');
  const attempts = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const orderId = sessionStorage.getItem(PENDING_ORDER_KEY);

    const poll = async () => {
      attempts.current += 1;
      try {
        if (orderId) {
          const { data } = await billing.status(orderId);
          if (!cancelled && data.is_pro) {
            sessionStorage.removeItem(PENDING_ORDER_KEY);
            await refresh();
            setState('active');
            return;
          }
        } else {
          // No stored order — fall back to the plan endpoint.
          await refresh();
        }
      } catch {
        /* keep polling */
      }
      if (cancelled) return;
      if (attempts.current >= MAX_ATTEMPTS) {
        setState('pending');
        return;
      }
      setTimeout(poll, 2000);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <div className="min-h-screen bg-mesh">
      <SEO title="Payment complete" description="Your SkillFade PRO upgrade." canonicalUrl="https://skillfade.website/billing/success" noIndex />
      <PublicHeader />
      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          {state === 'checking' && (
            <div className="card-elevated p-10 animate-fade-in">
              <Loader2 className="w-10 h-10 text-accent-400 animate-spin mx-auto mb-5" aria-hidden="true" />
              <h1 className="text-xl font-semibold text-txt-primary mb-2">Confirming your payment…</h1>
              <p className="text-txt-secondary">This only takes a moment.</p>
            </div>
          )}

          {state === 'active' && (
            <div className="card-elevated p-10 animate-slide-up">
              <CheckCircle2 className="w-12 h-12 text-accent-400 mx-auto mb-5" aria-hidden="true" />
              <h1 className="text-2xl font-display font-semibold text-txt-primary mb-2">You&apos;re PRO!</h1>
              <p className="text-txt-secondary mb-6">
                Thank you. Every PRO feature is now unlocked on your account — for good.
              </p>
              <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                Go to dashboard <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          {state === 'pending' && (
            <div className="card-elevated p-10 animate-fade-in">
              <Loader2 className="w-10 h-10 text-secondary-400 mx-auto mb-5" aria-hidden="true" />
              <h1 className="text-xl font-semibold text-txt-primary mb-2">Almost there</h1>
              <p className="text-txt-secondary mb-6">
                Your payment is being finalized. PRO unlocks automatically as soon as it&apos;s
                confirmed — usually within a minute. You can safely return to your dashboard.
              </p>
              <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2">
                Go to dashboard <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default BillingSuccess;
