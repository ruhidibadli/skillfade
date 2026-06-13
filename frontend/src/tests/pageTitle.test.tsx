import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import type { HelmetServerState } from 'react-helmet-async';
import PageTitle from '../components/PageTitle';

const APP_DEFAULT = 'SkillFade — Skill Decay Tracker';

/** Render a tree inside a HelmetProvider and return the resolved <title> markup. */
function resolvedTitle(node: React.ReactNode): string {
  const context: { helmet?: HelmetServerState } = {};
  renderToStaticMarkup(<HelmetProvider context={context}>{node}</HelmetProvider>);
  return context.helmet!.title.toString();
}

describe('PageTitle', () => {
  it('suffixes the page name with the brand', () => {
    expect(resolvedTitle(<PageTitle title="Dashboard" />)).toContain('Dashboard | SkillFade');
  });

  it('does not double-suffix the bare brand', () => {
    const title = resolvedTitle(<PageTitle title="SkillFade" />);
    expect(title).toContain('>SkillFade<');
    expect(title).not.toContain('SkillFade | SkillFade');
  });
});

describe('app default-title backstop', () => {
  it('falls back to the app default when a page sets no title (the Sign-In-stuck bug)', () => {
    const title = resolvedTitle(
      <>
        <Helmet defaultTitle={APP_DEFAULT} />
        <div>an in-app page with no title</div>
      </>,
    );
    expect(title).toContain(APP_DEFAULT);
  });

  it('lets a page title override the default', () => {
    const title = resolvedTitle(
      <>
        <Helmet defaultTitle={APP_DEFAULT} />
        <PageTitle title="Analytics" />
      </>,
    );
    expect(title).toContain('Analytics | SkillFade');
    expect(title).not.toContain('Skill Decay Tracker');
  });
});
