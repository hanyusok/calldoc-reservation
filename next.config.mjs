import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.infrastructureLogging = { level: 'error' };
        return config;
    }
};

const withPWA = (await import("@ducanh2912/next-pwa")).default({
    dest: "public",
    register: true,
    skipWaiting: true,
});

export default withPWA(withNextIntl(nextConfig));
