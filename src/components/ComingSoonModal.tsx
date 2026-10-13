"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  contactFormId?: string;
  ariaLabels?: {
    closeButton?: string;
    contactButton?: string;
    continueButton?: string;
  };
}

export function ComingSoonModal({
  isOpen,
  onClose,
  title = "Coming Soon",
  description = "This feature is currently under development. We'll notify you as soon as it's available.",
  ctaText = "Contact Us",
  ctaHref,
  contactFormId = "contact",
  ariaLabels = {
    closeButton: "Close modal",
    contactButton: "Go to contact form",
    continueButton: "Continue browsing",
  },
}: ComingSoonModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const scrollToContactForm = () => {
    const contactForm = document.getElementById(contactFormId);
    if (contactForm) {
      onClose();
      setTimeout(() => {
        contactForm.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
              duration: 0.3,
            }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label={ariaLabels.closeButton}
              >
                <IconX className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </button>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Pattern background */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-brand-primary/10 to-brand-primary-light/10 -z-10"></div>

                {/* Icon */}
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-primary/15 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-brand-primary-light"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>

                <h3
                  id="modal-title"
                  className="text-xl sm:text-2xl font-bold text-center text-neutral-900 dark:text-white mb-2"
                >
                  {title}
                </h3>

                <p className="text-neutral-600 dark:text-neutral-400 text-center mb-6">
                  {description}
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    href={ctaHref}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-button-text w-full"
                    onClick={ctaHref ? onClose : scrollToContactForm}
                    aria-label={ariaLabels.contactButton}
                  >
                    {ctaText}
                  </Button>

                  <Button
                    className="w-full"
                    onClick={onClose}
                    aria-label={ariaLabels.continueButton}
                  >
                    Continue Browsing
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


