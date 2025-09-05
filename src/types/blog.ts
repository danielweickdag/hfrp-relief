// Blog post status types
export type BlogPostStatus = "draft" | "published" | "scheduled" | "archived";

// Blog post category type
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string; // For UI display
  postCount?: number;
}

// Blog post tag type
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

// SEO metadata type
export interface BlogSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
}

// Blog post author type
export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role?: string;
}

// Blog post type
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML content from rich text editor
  markdownContent?: string; // Optional markdown version
  status: BlogPostStatus;
  author: BlogAuthor;
  categories: BlogCategory[];
  tags: BlogTag[];
  featuredImage?: string;
  images?: string[]; // Additional images used in the post
  seo: BlogSEO;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  readingTime?: number; // in minutes
  isDraft: boolean;
  isFeatured: boolean;
}

// Blog post form data (for creating/editing)
export interface BlogPostFormData {
  title: string;
  excerpt: string;
  content: string;
  status: BlogPostStatus;
  categories: string[]; // category IDs
  tags: string[]; // tag IDs
  featuredImage?: string;
  seo: BlogSEO;
  scheduledAt?: string;
  isFeatured: boolean;
}

// Blog filters type
export interface BlogFilters {
  status?: BlogPostStatus;
  categories?: string[];
  tags?: string[];
  authors?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: "title" | "date" | "author" | "views" | "updated";
  sortOrder?: "asc" | "desc";
}

// Blog statistics type
export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalViews: number;
  averageReadingTime: number;
  topCategories: Array<{ name: string; count: number }>;
  topAuthors: Array<{ name: string; posts: number }>;
  recentPosts: BlogPost[];
}
