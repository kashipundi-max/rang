import { floatingCards } from "../config";
import { getBrandFilter } from "../utils";

export function FloatingCards() {
  const brandFilter = getBrandFilter();

  return (
    <>
      {floatingCards.map((card, index) => (
        <div key={card.key} className={card.className}>
          <img
            src={card.src}
            alt={card.alt}
            decoding="async"
            fetchPriority={index < 2 ? "high" : "auto"}
            className={card.imgClassName}
            style={{
              boxShadow: "0 4px 32px 0 rgba(0,0,0,0.18)",
              filter: brandFilter,
            }}
          />
        </div>
      ))}
    </>
  );
}
