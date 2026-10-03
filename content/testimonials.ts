// Real testimonials only. Each needs the person's permission to publish.
// While this list is empty the testimonial monoliths in SCALE are not rendered at all.
//
// Example shape:
// {
//   quote: 'The strongest single line, short enough to read from a distance.',
//   detail: 'Optional longer supporting sentence shown up close.',
//   name: 'Full name',
//   role: 'Role',
//   org: 'Organisation',
// },

export type Testimonial = {
  quote: string;
  detail?: string;
  name: string;
  role: string;
  org: string;
};

export const testimonials: Testimonial[] = [];
