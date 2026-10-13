import { Company } from "../config/companies";

interface CompanyIconProps {
  company: Company;
}

export default function CompanyIcon({ company }: CompanyIconProps) {
  return (
    <div className="flex min-w-fit items-center px-3 py-2 sm:px-5 md:px-8 md:py-3">
      <img
        src={company.logo}
        alt={`${company.name} logo`}
        width={company.width}
        height={company.height}
        loading="lazy"
        decoding="async"
        className={`w-auto opacity-50 grayscale brightness-0 invert transition-opacity duration-200 hover:opacity-70 ${company.sizeClass}`}
      />
    </div>
  );
}