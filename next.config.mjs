import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.ignoreWarnings = [
            { module: /next-intl\/dist\/esm\/production\/extractor\/format\/index\.js/ }
        ];
        return config;
    }
};

export default withNextIntl(nextConfig);
