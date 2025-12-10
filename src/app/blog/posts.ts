export type BlogCategory = "story" | "update" | "news" | "impact";

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO date string
  author?: string;
  summary?: string;
  image?: string; // Featured/main image (backward compatibility)
  images?: string[]; // Additional images for the post
  category: BlogCategory;
  featured?: boolean;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "welcomed-30-new-children",
    title: "Welcomed 30 New Children to Our Safe Housing",
    date: "2024-12-15",
    summary:
      "This month we opened our doors to 30 more children who needed safe shelter and care. Each child now has a bed, regular meals, and access to education.",
    author: "HFRP Team",
    image: "/images/gallery/children_gathering.jpg",
    category: "story",
    featured: true,
    content:
      "We welcomed 30 new children into our safe housing program. With the support of our community, each child now has stable shelter, nutritious meals, and access to education. Your generosity makes this possible.",
  },
  {
    slug: "school-lunch-expansion",
    title: "Launched School Lunch Expansion in Port-au-Prince",
    date: "2024-12-10",
    summary:
      "Our feeding program has expanded to serve 500 additional children daily in three new schools across Port-au-Prince.",
    author: "Marie Jean-Baptiste",
    image: "/images/gallery/meals_served.jpg",
    category: "update",
    featured: true,
    content:
      "This month, the school lunch program expanded to three new schools, serving 500 additional children daily. Consistent access to meals is improving attendance and performance.",
  },
  {
    slug: "silver-gold-members-commitment",
    title: "Thank You to Our New Silver and Gold Members",
    date: "2024-12-05",
    summary:
      "We're grateful for the commitment of our new recurring donors who have joined our Silver and Gold membership tiers this month.",
    author: "HFRP Team",
    image: "/images/gallery/community_meeting.jpg",
    category: "news",
    content:
      "A heartfelt thank you to our new Silver and Gold members. Your ongoing support ensures sustained care and services for children and families who depend on us.",
  },
  {
    slug: "medical-clinic-opens",
    title: "New Medical Clinic Serves Rural Communities",
    date: "2024-11-28",
    summary:
      "Our mobile medical clinic has established a permanent location in Jacmel, providing healthcare access to over 1,000 families.",
    author: "Dr. Claude Moïse",
    image: "/images/gallery/medical_clinic.jpg",
    category: "impact",
    featured: true,
    content:
      "The mobile clinic now has a permanent base in Jacmel, offering reliable access to care for more than 1,000 families. Preventative services and treatment are already making a measurable difference.",
  },
  {
    slug: "education-program-results",
    title: "Education Program Shows Remarkable Results",
    date: "2024-11-20",
    summary:
      "95% of children in our education program have improved their reading skills, with 80% advancing to the next grade level.",
    author: "Teacher Roseline",
    image: "/images/gallery/school_supplies.jpg",
    category: "impact",
    content:
      "Students in our education program are showing remarkable progress. With tutoring, materials, and consistent instruction, reading proficiency is up and grade advancement is increasing.",
  },
  {
    slug: "community-kitchen-expansion",
    title: "Community Kitchen Doubles Meal Production",
    date: "2024-11-15",
    summary:
      "Thanks to new equipment and additional staff, our community kitchen now serves 850 meals daily, up from 400 just six months ago.",
    author: "Chef Antoine",
    image: "/images/gallery/cooking_rice.jpg",
    category: "update",
    content:
      "Upgrades to equipment and staffing have doubled daily meal production. This growth means more families receive reliable nourishment and support.",
  },
  {
    slug: "volunteer-training-program",
    title: "Local Volunteers Complete Leadership Training",
    date: "2024-11-08",
    summary:
      "25 community volunteers graduated from our leadership training program, becoming certified to lead programs in their villages.",
    author: "HFRP Team",
    image: "/images/gallery/volunteer_leaders.jpg",
    category: "story",
    content:
      "Twenty-five volunteers completed leadership training and are now certified to lead programs in their communities. Their dedication amplifies our reach and impact.",
  },
  {
    slug: "water-well-project",
    title: "Clean Water Wells Benefit 500 Families",
    date: "2024-10-30",
    summary:
      "Two new water wells were completed this month, providing clean drinking water access to families in remote areas.",
    author: "Engineer Joseph",
    image: "/images/gallery/community_building.jpg",
    category: "impact",
    content:
      "Two newly completed wells bring clean water to remote communities, benefiting 500 families. Access to safe water reduces illness and supports everyday life.",
  },
];

export function getPosts(): BlogPost[] {
  return posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
