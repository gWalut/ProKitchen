import { useEffect } from 'react';

export interface SEOOptions {
    title: string;
    description?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    noIndex?: boolean;
    jsonLd?: Record<string, unknown>;
}

const BASE_TITLE = 'ProKitchen — Ассистент повара';
const BASE_DESCRIPTION =
    'ProKitchen — профессиональный помощник повара: калькулятор себестоимости блюд, матрица аллергенов, печать этикеток и управление рецептами.';
const SITE_URL = 'https://prokitchen.app';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const useSEO = (options: SEOOptions) => {
    const {
        title,
        description = BASE_DESCRIPTION,
        canonical,
        ogTitle,
        ogDescription,
        ogImage = OG_IMAGE,
        ogType = 'website',
        noIndex = false,
        jsonLd,
    } = options;

    const fullTitle = title === BASE_TITLE ? title : `${title} | ProKitchen`;

    useEffect(() => {
        document.title = fullTitle;

        const setMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        const setLink = (rel: string, href: string) => {
            let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        };

        setMeta('description', description);
        setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

        const canonicalUrl = canonical ?? `${SITE_URL}${window.location.pathname}`;
        setLink('canonical', canonicalUrl);

        setMeta('og:type', ogType, true);
        setMeta('og:title', ogTitle ?? fullTitle, true);
        setMeta('og:description', ogDescription ?? description, true);
        setMeta('og:image', ogImage, true);
        setMeta('og:url', canonicalUrl, true);
        setMeta('og:locale', 'ru_RU', true);
        setMeta('og:site_name', 'ProKitchen', true);

        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', ogTitle ?? fullTitle);
        setMeta('twitter:description', ogDescription ?? description);
        setMeta('twitter:image', ogImage);

        const existingLd = document.getElementById('json-ld-main');
        if (jsonLd) {
            if (existingLd) {
                existingLd.textContent = JSON.stringify(jsonLd);
            } else {
                const script = document.createElement('script');
                script.id = 'json-ld-main';
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(jsonLd);
                document.head.appendChild(script);
            }
        } else if (existingLd) {
            existingLd.remove();
        }

        return () => {
            document.title = BASE_TITLE;
        };
    }, [fullTitle, description, canonical, ogTitle, ogDescription, ogImage, ogType, noIndex, jsonLd]);
};
