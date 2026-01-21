import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.infrastructureLogging = { level: 'error' };
        return config;
    }
};

export default withNextIntl(nextConfig);
