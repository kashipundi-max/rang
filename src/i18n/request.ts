import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    // Load messages from split files
    const homeMessages = (await import(`../../messages/home/${locale}.json`))
        .default;
    const layoutMessages = (await import(`../../messages/layout/${locale}.json`))
        .default;
    const contactMessages = (await import(`../../messages/contact/${locale}.json`))
        .default;
    const blogMessages = (await import(`../../messages/blog/${locale}.json`))
        .default;
    const pricingMessages = (await import(`../../messages/pricing/${locale}.json`))
        .default;
    const authMessages = (await import(`../../messages/auth/${locale}.json`))
        .default;
    const legalMessages = (await import(`../../messages/legal/${locale}.json`))
        .default;

    return {
        locale,
        messages: {
            ...homeMessages,
            ...layoutMessages,
            ...contactMessages,
            ...blogMessages,
            ...pricingMessages,
            ...authMessages,
            ...legalMessages,
        },
    };
});
