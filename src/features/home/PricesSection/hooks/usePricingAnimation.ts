"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useDirection } from "@/hooks/locale/useDirection";

export function usePricingAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { isRTL } = useDirection();

    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return;

        // Skip GSAP animations on mobile devices
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            // On mobile, just show cards without animation
            const container = containerRef.current;
            const cards = container.querySelectorAll(".price-card-wrapper");
            cards.forEach((card) => {
                const el = card as HTMLElement;
                el.style.opacity = "1";
                el.style.transform = "none";
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const container = containerRef.current;
        const cards = container.querySelectorAll(".price-card-wrapper");
        if (!cards.length) return;

        let scrollTriggerInstance: ScrollTrigger | null = null;
        let hasInitialized = false;

        // Set initial state immediately with CSS to prevent flash
        cards.forEach((card, index) => {
            const position = index % 3;
            const el = card as HTMLElement;
            el.style.opacity = "0";
            el.style.willChange = "transform, opacity";
            if (position === 0) {
                el.style.transform = `translateX(${isRTL ? 100 : -100}px)`;
            } else if (position === 1) {
                el.style.transform = `translateY(100px)`;
            } else {
                el.style.transform = `translateX(${isRTL ? -100 : 100}px)`;
            }
        });

        // Function to initialize the scroll animation
        const initScrollAnimation = () => {
            if (hasInitialized) return;
            hasInitialized = true;

            // Get current scroll position relative to container
            const containerRect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate initial progress based on current position
            const totalDistance = viewportHeight + containerRect.height;
            const traveled = viewportHeight - containerRect.top;
            const initialProgress = Math.max(0, Math.min(1, traveled / totalDistance));

            scrollTriggerInstance = ScrollTrigger.create({
                trigger: container,
                start: "top bottom",
                end: "center center",
                scrub: 0.3,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const progress = self.progress;

                    cards.forEach((card, index) => {
                        const position = index % 3;
                        const el = card as HTMLElement;

                        // Calculate individual card progress with stagger
                        const staggerDelay = position * 0.08;
                        const cardProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay * 2)));

                        // Apply easing for smoother animation
                        const easedProgress = 1 - Math.pow(1 - cardProgress, 3); // ease-out cubic

                        // Apply transforms based on progress
                        let x = 0;
                        let y = 0;

                        if (position === 0) {
                            x = (isRTL ? 100 : -100) * (1 - easedProgress);
                        } else if (position === 1) {
                            y = 100 * (1 - easedProgress);
                        } else {
                            x = (isRTL ? -100 : 100) * (1 - easedProgress);
                        }

                        el.style.opacity = String(easedProgress);
                        el.style.transform = `translate(${x}px, ${y}px)`;
                    });
                },
            });

            // If we're already past the start, update immediately
            if (initialProgress > 0) {
                ScrollTrigger.refresh(true);
            }
        };

        // Use Intersection Observer to detect when section becomes visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Section is now visible, initialize animation
                        initScrollAnimation();
                        // Stop observing once initialized
                        observer.disconnect();
                    }
                });
            },
            {
                // Trigger when any part of the container enters the viewport
                rootMargin: "100px 0px",
                threshold: 0,
            }
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
            if (scrollTriggerInstance) {
                scrollTriggerInstance.kill();
            }
            // Reset card styles
            cards.forEach((card) => {
                const el = card as HTMLElement;
                el.style.willChange = "";
            });
        };
    }, [isRTL]);

    return containerRef;
}
