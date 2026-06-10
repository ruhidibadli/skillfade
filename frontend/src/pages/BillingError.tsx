import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';
import { PENDING_ORDER_KEY } from '../services/api';

const BillingError: React.FC = () => {
  useEffect(() => {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
  }, []);

  return (
    <div className="min-h-screen bg-mesh">
      <SEO title="Payment not completed" description="Your SkillFade payment was not completed." canonicalUrl="https://skillfade.website/billing/error" noIndex />
      <PublicHeader />
      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="card-elevated p-10 animate-fade-in">
            <XCircle className="w-12 h-12 text-decayed-base mx-auto mb-5" aria-hidden="true" />
            <h1 className="text-2xl font-display font-semibold text-txt-primary mb-2">
              Payment not completed
            </h1>
            <p className="text-txt-secondary mb-6">
              Your card was not charged. You can try again whenever you&apos;re ready — your
              account is unchanged.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/pricing" className="btn-primary inline-flex items-center gap-2">
                Try again <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default BillingError;
