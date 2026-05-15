import React, { useCallback, useEffect, useState } from 'react';
import { Tag, Save, Loader2, AlertCircle, CheckCircle, Database, Cog } from 'lucide-react';
import { admin } from '../../services/api';
import type { AdminPricing as AdminPricingType } from '../../types';

const AdminPricing: React.FC = () => {
  const [pricing, setPricing] = useState<AdminPricingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [lifetime, setLifetime] = useState('');
  const [earlyBird, setEarlyBird] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await admin.getPricing();
      setPricing(res.data);
      setLifetime(res.data.lifetime_price_azn);
      setEarlyBird(res.data.early_bird_price_azn);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load pricing');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const payload: { lifetime_price_azn?: string; early_bird_price_azn?: string } = {};
      if (pricing && lifetime !== pricing.lifetime_price_azn) payload.lifetime_price_azn = lifetime.trim();
      if (pricing && earlyBird !== pricing.early_bird_price_azn) payload.early_bird_price_azn = earlyBird.trim();

      if (Object.keys(payload).length === 0) {
        setSuccess('No changes to save.');
        return;
      }

      const res = await admin.updatePricing(payload);
      setPricing(res.data);
      setLifetime(res.data.lifetime_price_azn);
      setEarlyBird(res.data.early_bird_price_azn);
      setSuccess('Pricing saved.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent-400/10 flex items-center justify-center">
          <Tag className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Pricing</h1>
          <p className="text-sm text-txt-muted">Lifetime PRO price + early-bird promo. Saved values override the env defaults.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-txt-muted">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-2 text-sm text-decayed-base bg-decayed-base/10 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 text-sm text-fresh-base bg-fresh-base/10 rounded-lg p-3">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <PriceField
            label="Lifetime PRO price (AZN)"
            help="Charged for normal lifetime purchases."
            value={lifetime}
            onChange={setLifetime}
            source={pricing?.lifetime_source ?? 'env'}
          />

          <PriceField
            label="Early-bird price (AZN)"
            help="Promotional price for launch. Set equal to lifetime when the promo ends."
            value={earlyBird}
            onChange={setEarlyBird}
            source={pricing?.early_bird_source ?? 'env'}
          />

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save changes
            </button>
            <button type="button" className="btn-ghost" onClick={load} disabled={saving}>
              Reset
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

interface PriceFieldProps {
  label: string;
  help: string;
  value: string;
  onChange: (v: string) => void;
  source: 'db' | 'env';
}

const PriceField: React.FC<PriceFieldProps> = ({ label, help, value, onChange, source }) => (
  <div>
    <label className="block text-sm font-medium text-txt-primary mb-1.5">{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          inputMode="decimal"
          className="input pr-14"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="49.00"
          required
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-txt-muted">AZN</span>
      </div>
      <span
        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
          source === 'db'
            ? 'text-fresh-base bg-fresh-base/10'
            : 'text-txt-muted bg-surface-300'
        }`}
        title={source === 'db' ? 'Override stored in app_settings table' : 'Falling back to env-var default'}
      >
        {source === 'db' ? <Database className="w-3 h-3" /> : <Cog className="w-3 h-3" />}
        {source === 'db' ? 'DB' : 'env'}
      </span>
    </div>
    <p className="text-xs text-txt-muted mt-1.5">{help}</p>
  </div>
);

export default AdminPricing;
