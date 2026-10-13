import type { DepthCarouselItem } from "@/components/DepthCarousel";

/**
 * The source files are 1536x1024 JPEGs. `f_auto,q_auto,w_900` is Cloudinary's
 * own transformation segment: it serves AVIF/WebP where the browser supports
 * it and caps the delivered width at 900px, which still covers the ~420px card
 * on a 2x display without shipping the full-size original to a landing page.
 */
const CLOUDINARY_BASE =
  "https://res.cloudinary.com/dqd6xx60g/image/upload/f_auto,q_auto,w_900";

const files = [
  "v1788606108/13_u7m1rf.jpg",
  "v1788606109/8_rpgcwr.jpg",
  "v1788606108/11_yjti5d.jpg",
  "v1788606108/12_fh3pgj.jpg",
  "v1788606108/10_zywflg.jpg",
  "v1788606108/9_mjovff.jpg",
];

export const CERTIFICATE_ASPECT = { width: 1536, height: 1024 } as const;

export const certificates: DepthCarouselItem[] = files.map((file, index) => ({
  image: `${CLOUDINARY_BASE}/${file}`,
  alt: `Range4ex payout certificate ${index + 1}`,
}));
