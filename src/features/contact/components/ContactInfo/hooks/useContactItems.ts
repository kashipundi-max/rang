import { useTranslations } from "next-intl";
import {
    IconMail,
    IconPhone,
    IconMapPin,
    IconClock,
} from "@tabler/icons-react";

export function useContactItems() {
    const t = useTranslations("ContactSection.info");

    const contactItems = [
        {
            icon: IconMail,
            label: t("email.label"),
            value: t("email.value"),
            href: `mailto:${t("email.value")}`,
        },
        {
            icon: IconPhone,
            label: t("phone.label"),
            value: t("phone.value"),
            href: `tel:${t("phone.value").replace(/\s/g, "")}`,
        },
        {
            icon: IconMapPin,
            label: t("address.label"),
            value: t("address.value"),
        },
        {
            icon: IconClock,
            label: t("hours.label"),
            value: t("hours.value"),
        },
    ];

    return { contactItems, t };
}
