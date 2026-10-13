export interface FloatingCardData {
    src: string;
    alt: string;
    className: string;
    imgClassName: string;
    key: string;
}

export const floatingCards: FloatingCardData[] = [
    {
        src: "/images/hero/1.svg",
        alt: "Traffic source",
        className:
            "absolute left-22 sm:left-4 md:left-8 lg:left-33 bottom-[11%] sm:bottom-[25%] lg:bottom-[30%] z-20",
        imgClassName:
            "w-[60px] sm:w-[120px] md:w-[140px] lg:w-[150px] rotate-[-8deg]",
        key: "svg1",
    },
    {
        src: "/images/hero/2.svg",
        alt: "Active New",
        className:
            "absolute left-4 sm:left-8 md:left-16 lg:left-24 bottom-[2%] sm:bottom-[5%] md:bottom-[8%] lg:bottom-[5%] z-20",
        imgClassName:
            "w-[70px] sm:w-[100px] md:w-[120px] lg:w-[120px] rotate-[-6deg]",
        key: "svg2",
    },
    {
        src: "/images/hero/3.svg",
        alt: "Scale/share",
        className:
            "absolute right-18 sm:right-4 md:right-8 lg:right-26 bottom-[10%] sm:bottom-[25%] md:bottom-[28%] lg:bottom-[30%] z-20",
        imgClassName:
            "w-[70px] sm:w-[140px] md:w-[160px] lg:w-[160px] rotate-[10deg]",
        key: "svg3",
    },
    {
        src: "/images/hero/4.svg",
        alt: "Clients Report",
        className:
            "absolute right-4 sm:right-8 md:right-16 lg:right-24 bottom-[2%] sm:bottom-[5%] md:bottom-[8%] lg:bottom-[5%] z-20",
        imgClassName:
            "w-[55px] sm:w-[110px] md:w-[130px] lg:w-[120px] rotate-[7deg]",
        key: "svg4",
    },
];

export const HERO_3D_IMAGE = "/images/hero_3d.webp";
