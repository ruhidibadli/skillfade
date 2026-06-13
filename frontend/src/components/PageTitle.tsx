import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Sets the document/tab title for authenticated in-app pages (which don't use the
 * full <SEO> component). Without a per-page title, react-helmet-async leaves the
 * last public page's title in place — which is why the tab could read "Sign In"
 * after navigating into the app. Mirrors SEO's brand suffix.
 */
const PageTitle: React.FC<{ title: string }> = ({ title }) => (
  <Helmet>
    <title>{title === 'SkillFade' ? title : `${title} | SkillFade`}</title>
  </Helmet>
);

export default PageTitle;
