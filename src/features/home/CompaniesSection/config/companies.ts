export interface Company {
  name: string;
  logo: string;
  width: number;
  height: number;
  sizeClass: string;
}

export const companies: Company[] = [
  {
    name: "Yahoo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Yahoo%21_%282019%29.svg",
    width: 1000,
    height: 277,
    sizeClass: "h-6 sm:h-8 md:h-10",
  },
  {
    name: "Business Insider",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Business_Insider_2023_logo.svg",
    width: 1365,
    height: 120,
    sizeClass: "h-3 sm:h-4 md:h-5",
  },
  {
    name: "Bloomberg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/New_Bloomberg_Logo.svg",
    width: 512,
    height: 95,
    sizeClass: "h-5 sm:h-7 md:h-8",
  },
];