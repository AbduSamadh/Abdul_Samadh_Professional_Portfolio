// LinkedIn recommendations (real ones only). `quote` is the short pull line shown large on the
// monolith; `detail` is the rest of the recommendation, shown in the reading panel.
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

export const testimonials: Testimonial[] = [
  {
    quote: 'His ability to break down complex ideas into clear and practical solutions is impressive.',
    detail:
      'I had the opportunity to work with Abdul Samad and always appreciated his professionalism and collaborative approach. He has a strong understanding of computer science and robotics, and his ability to break down complex ideas into clear and practical solutions is impressive. He is approachable, supportive, and always willing to help colleagues when needed.',
    name: 'Shirin Shahana',
    role: 'ICT & STEM Teacher, Robotics & Coding Instructor',
    org: 'STEM.org Certified Master Trainer',
  },
  {
    quote: 'He consistently brings clarity, structure, and enthusiasm to every engagement.',
    detail:
      'Abdul Samad has a deep understanding of computer science concepts as well as robotics and broader STEM applications. His technical knowledge is strong, but what truly sets him apart is his attention to detail and his ability to break down complex concepts into clear, engaging learning experiences. He is highly professional, reliable, and passionate about empowering learners. Whether it’s delivering hands-on training sessions or supporting educators with practical classroom implementation, he consistently brings clarity, structure, and enthusiasm to every engagement.',
    name: 'Ayesha Zia',
    role: 'Marketing Consultant',
    org: 'Atlab ME',
  },
  {
    quote: 'His curriculum development is thoughtfully structured, highly efficient, and aligned with current industry standards.',
    detail:
      'Abdul Samadh is a visionary and highly skilled professional in the field of Computer Science, with strong expertise in robotics and modern technologies. He consistently stays updated with the latest advancements and integrates them effectively into the training programs and curricula he designs. His curriculum development is thoughtfully structured, highly efficient, and aligned with current industry standards, ensuring learners gain relevant and future-ready skills. His approach to teaching and development reflects innovation, clarity, and real-world relevance. Abdul demonstrates excellent leadership qualities and works exceptionally well within a team, contributing positively to collaborative efforts. His innovative mindset, technical competence, and commitment to quality make him a valuable asset to any organization. I confidently recommend Abdul for any opportunity, his technical excellence, dedication, and ability to make a meaningful impact in any organization.',
    name: 'Harisanker S L',
    role: 'Robotics Engineer',
    org: '',
  },
  {
    quote: 'An exceptional content lead in computer science and a dedicated curriculum specialist for schools.',
    detail:
      "Abdul Samadh is an exceptional content lead in computer science and a dedicated curriculum specialist for schools. His deep understanding of both subject matter and educational pedagogy shines through in every project he undertakes. Abdul's ability to create engaging and impactful content tailored to diverse learning styles is truly impressive. His leadership skills, coupled with his passion for education, make him an invaluable asset to any team or organization. I highly recommend Abdul for his expertise, professionalism, and commitment to advancing curriculum development, training and teaching.",
    name: 'Sahana Parveen',
    role: 'Author, Content Writer & Curator',
    org: 'K-8 Education, Instructional Design',
  },
  {
    quote: 'He has his own approach in delivering and writing the content.',
    detail:
      'Abdul Samadh is someone who is very dedicated to his work. He has his own approach in delivering and writing the content. Always exhibits positive attitude towards producing quality work. I highly recommend Abdul as a professional Content writer and an amazing Aptitude trainer whose work in the team helps in better results.',
    name: 'Nisha O R',
    role: 'RTL Frontend Engineer',
    org: 'Xilinx',
  },
  {
    quote: 'Always open to new learning and challenges, he is an asset to any team!',
    detail:
      'Abdul has a learner mindset. Responds positively to new processes and works hard to see projects through. He takes initiatives and has a pleasant personality. He makes sure to do his research before working on anything and goes over and beyond with anything given to him. He also has a good working relationship with peers. Always open to new learning and challenges, he is an asset to any team! With very little input he can get things done, a quick learner and a hardworking person.',
    name: 'Kaavya Ramachandran',
    role: 'Curriculum & Pedagogy, Teacher, Trainer',
    org: 'TFI alumni',
  },
];
