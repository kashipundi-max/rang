import { TestimonialItem } from "./types";

// Re-export the type for convenience
export type { TestimonialItem };

// Define the testimonials data with translation keys
export const testimonials: TestimonialItem[] = [
    { id: "t1", avatar: "/images/avatars/person/person-2.webp", rating: 5 },
    { id: "t2", avatar: "/images/avatars/person/person-female-2.webp", rating: 5 },
    { id: "t3", avatar: "/images/avatars/person/person-female.webp", rating: 5 },
    { id: "t4", avatar: "/images/avatars/person/person.webp", rating: 5 },
    { id: "t5", avatar: "/images/avatars/person/person-female-2.webp", rating: 5 },
    { id: "t6", avatar: "/images/avatars/person/person-female.webp", rating: 5 },
];
