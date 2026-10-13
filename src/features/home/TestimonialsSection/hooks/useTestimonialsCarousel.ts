"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useTranslations, useLocale } from "next-intl";
import { testimonials, TestimonialItem } from "../config/data";
import { TranslatedTestimonial } from "../config/types";

export interface UseTestimonialsCarouselResult {
    emblaRef: ReturnType<typeof useEmblaCarousel>[0];
    canScrollPrev: boolean;
    canScrollNext: boolean;
    scrollPrev: () => void;
    scrollNext: () => void;
    translatedTestimonials: TranslatedTestimonial[];
    isRTL: boolean;
}

export function useTestimonialsCarousel(): UseTestimonialsCarouselResult {
    const t = useTranslations("TestimonialsSection");
    const locale = useLocale();
    const isRTL = locale === "ar";
    const autoScrollRef = useRef<ReturnType<typeof AutoScroll> | null>(null);

    // Create AutoScroll plugin instance
    const autoScrollPlugin = useMemo(() => {
        const plugin = AutoScroll({
            speed: 1,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            startDelay: 500,
        });
        autoScrollRef.current = plugin;
        return plugin;
    }, []);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "center",
            skipSnaps: false,
            dragFree: false,
            containScroll: "trimSnaps",
            slidesToScroll: 1,
            direction: isRTL ? "rtl" : "ltr",
        },
        [autoScrollPlugin]
    );

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        // Get the root element to add mouse leave listener
        const rootNode = emblaApi.rootNode();

        const handleMouseLeave = () => {
            // Resume auto-scroll when mouse leaves
            // Only play if embla is still mounted and ready
            if (!emblaApi) return;

            const autoScroll = autoScrollRef.current;
            if (autoScroll && typeof autoScroll.play === 'function') {
                try {
                    autoScroll.play();
                } catch {
                    // Ignore errors if plugin is not ready or embla is unmounted
                }
            }
        };

        rootNode.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
            rootNode.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [emblaApi, onSelect]);

    // Get translated testimonials data
    const translatedTestimonials = useMemo<TranslatedTestimonial[]>(() => {
        const atText = t("at");
        // Duplicate testimonials for seamless infinite loop
        const duplicated: TestimonialItem[] = [
            ...testimonials,
            ...testimonials,
            ...testimonials,
        ];

        return duplicated.map((item, index) => ({
            ...item,
            uniqueKey: `${item.id}-${index}`,
            name: t(`testimonials.${item.id}.name`),
            role: t(`testimonials.${item.id}.role`),
            company: t(`testimonials.${item.id}.company`),
            content: t(`testimonials.${item.id}.content`),
            roleAtCompany: `${t(`testimonials.${item.id}.role`)} ${atText} ${t(`testimonials.${item.id}.company`)}`,
        }));
    }, [t]);

    return {
        emblaRef,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext,
        translatedTestimonials,
        isRTL,
    };
}
