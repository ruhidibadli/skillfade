import React from 'react';
import { Link } from 'react-router-dom';
import { useIsPro } from '../hooks/usePlan';

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback: React.FC = () => (
  <span className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
      PRO
    </span>
    <Link to="/pricing" className="underline hover:text-gray-700 dark:hover:text-gray-200">
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
