import { useEffect } from 'react';

export type SeoOptions = {
  title?: string;
  description?: string;
  path?: string; // override current path if needed
};

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'CARDHAVI';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://your-domain.com';

function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOG(property: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  if (!url) return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function useSEO(opts: SeoOptions) {
  useEffect(() => {
    const title = opts.title ? `${opts.title} · ${SITE_NAME}` : SITE_NAME;
    document.title = title;

    const path = opts.path || window.location.pathname + window.location.search;
    const canonicalUrl = `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
    setCanonical(canonicalUrl);

    if (opts.description) {
      setMeta('description', opts.description);
      setOG('og:description', opts.description);
      setMeta('twitter:description', opts.description);
    }

    // Basic OG/Twitter alignment
    setOG('og:type', 'website');
    setOG('og:url', canonicalUrl);
    setOG('og:title', title);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);

  }, [opts.title, opts.description, opts.path]);
}
