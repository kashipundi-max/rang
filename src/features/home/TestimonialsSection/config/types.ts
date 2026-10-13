// Define the structure for testimonial items (data layer)
export interface TestimonialItem {
    id: string; // Translation key (t1, t2, etc.)
    avatar: string;
    rating: number;
}

// Translated testimonial with all text content
export interface TranslatedTestimonial extends TestimonialItem {
    uniqueKey: string;
    name: string;
    role: string;
    company: string;
    content: string;
    roleAtCompany: string;
}

// Props for the TestimonialCard component (agnostic)
export interface TestimonialCardProps {
    name: string;
    role: string;
    company: string;
    content: string;
    avatar: string;
    rating: number;
    roleAtCompany: string;
}
