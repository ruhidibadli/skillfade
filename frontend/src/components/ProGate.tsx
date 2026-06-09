import React from 'react';
import { Link } from 'react-router-dom';
import { useIsPro } from '../hooks/usePlan';

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback: React.FC = () => (
  <span className="inline-flex items-center gap-2 text-sm text-txt-muted">
    <span className="rounded bg-secondary-400/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-label text-secondary-400">
      PRO
    </span>
    <Link to="/pricing" className="text-accent-400 underline-offset-2 hover:underline">
      Upgrade to unlock
    </Link>
  </span>
);

const ProGate: React.FC<ProGateProps> = ({ children, fallback }) => {
  const isPro = useIsPro();
  if (isPro) return <>{children}</>;
  return <>{fallback ?? <DefaultFallback />}</>;
};

export default ProGate;
