import type { SimpleIcon } from "simple-icons";
import {
  siAmericanexpress,
  siBitcoin,
  siDiscover,
  siEthereum,
  siGooglepay,
  siLitecoin,
  siMastercard,
  siTether,
  siVisa,
} from "simple-icons";
import { IconBrandAmazon, IconCreditCard } from "@tabler/icons-react";

export type PaymentMethod = {
  name: string;
  icon?: SimpleIcon;
  color: string;
  fallback?: "amazon" | "card";
};

export const paymentMethods: PaymentMethod[] = [
  { name: "Visa", icon: siVisa, color: "#" + siVisa.hex },
  { name: "Debit Card", color: "#A855F7", fallback: "card" },
  {
    name: "American Express",
    icon: siAmericanexpress,
    color: "#" + siAmericanexpress.hex,
  },
  { name: "Discover", icon: siDiscover, color: "#" + siDiscover.hex },
  { name: "Mastercard", icon: siMastercard, color: "#" + siMastercard.hex },
  { name: "Google Pay", icon: siGooglepay, color: "#" + siGooglepay.hex },
  { name: "Amazon Pay", color: "#FF9900", fallback: "amazon" },
  { name: "Bitcoin", icon: siBitcoin, color: "#" + siBitcoin.hex },
  { name: "USDT", icon: siTether, color: "#" + siTether.hex },
  { name: "Litecoin", icon: siLitecoin, color: "#" + siLitecoin.hex },
  { name: "Ethereum", icon: siEthereum, color: "#" + siEthereum.hex },
];

export function PaymentMethodIcon({ method }: { method: PaymentMethod }) {
  if (method.fallback === "amazon") {
    return <IconBrandAmazon aria-hidden="true" className="h-6 w-6" />;
  }

  if (method.fallback === "card") {
    return <IconCreditCard aria-hidden="true" className="h-6 w-6" />;
  }

  if (!method.icon) return null;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
    >
      <path d={method.icon.path} />
    </svg>
  );
}

function PaymentMethodChip({
  method,
  compact = false,
}: {
  method: PaymentMethod;
  compact?: boolean;
}) {
  // Logo only: no name label, and no card around it. The chip used to carry a
  // bordered, tinted panel plus the brand name; both are gone so the logos read
  // as a clean row against the section background.
  return (
    <span
      className={
        "flex shrink-0 items-center justify-center rounded-xl bg-white " +
        (compact ? "h-9 w-9" : "h-11 w-11")
      }
      style={{ color: method.color }}
    >
      <PaymentMethodIcon method={method} />
      {/* The icons are aria-hidden, so without this the logo has no accessible
          name at all once the visible label is removed. */}
      <span className="sr-only">{method.name}</span>
    </span>
  );
}

export function PaymentMethodsMarquee() {
  return (
    <section
      aria-labelledby="payment-methods-title"
      className="relative overflow-hidden bg-bg-dark py-8 sm:py-10"
    >
      <div className="mx-auto mb-5 max-w-[1250px] px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary-light">
          Secure checkout
        </p>
        <h2
          id="payment-methods-title"
          className="mt-2 font-clash-display text-xl font-semibold text-text-primary sm:text-2xl"
        >
          Payment Methods
        </h2>
      </div>

      <div className="payment-methods-mask relative">
        <div className="payment-methods-track">
          {[0, 1].map((setIndex) => (
            <div
              key={setIndex}
              className="flex gap-3 pr-3"
              aria-hidden={setIndex === 1 ? "true" : undefined}
            >
              {paymentMethods.map((method) => (
                <PaymentMethodChip key={method.name} method={method} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FooterPaymentMethods() {
  return (
    <section
      aria-labelledby="footer-payment-methods-title"
      className="my-8 border-y border-border-secondary/60 py-7 sm:my-10"
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary-light">
            Secure checkout
          </p>
          <h2
            id="footer-payment-methods-title"
            className="mt-1 font-clash-display text-lg font-semibold text-text-primary"
          >
            Payment Methods
          </h2>
        </div>
        <p className="text-xs text-text-muted">
          Card and digital asset payment options
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {paymentMethods.map((method) => (
          <PaymentMethodChip key={method.name} method={method} compact />
        ))}
      </div>
    </section>
  );
}
