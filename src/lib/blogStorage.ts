import type {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogFilters,
  BlogPostFormData,
  BlogStats,
} from "@/types/blog";
import { notificationService } from "./notificationService";

// Storage keys
const STORAGE_KEYS = {
  POSTS: "hfrp_blog_posts",
  CATEGORIES: "hfrp_blog_categories",
  TAGS: "hfrp_blog_tags",
  DRAFTS: "hfrp_blog_drafts",
};

// Default categories
const DEFAULT_CATEGORIES: BlogCategory[] = [
  {
    id: "cat-1",
    name: "News & Updates",
    slug: "news-updates",
    color: "blue",
    description: "Latest news from HFRP",
  },
  {
    id: "cat-2",
    name: "Success Stories",
    slug: "success-stories",
    color: "green",
    description: "Stories of impact and transformation",
  },
  {
    id: "cat-3",
    name: "Education",
    slug: "education",
    color: "purple",
    description: "Educational programs and initiatives",
  },
  {
    id: "cat-4",
    name: "Healthcare",
    slug: "healthcare",
    color: "red",
    description: "Healthcare initiatives and updates",
  },
  {
    id: "cat-5",
    name: "Community",
    slug: "community",
    color: "yellow",
    description: "Community events and engagement",
  },
  {
    id: "cat-6",
    name: "Volunteer Stories",
    slug: "volunteer-stories",
    color: "indigo",
    description: "Experiences from our volunteers",
  },
];

// Default tags
const DEFAULT_TAGS: BlogTag[] = [
  { id: "tag-1", name: "Children", slug: "children", color: "pink" },
  { id: "tag-2", name: "Education", slug: "education", color: "blue" },
  { id: "tag-3", name: "Healthcare", slug: "healthcare", color: "green" },
  { id: "tag-4", name: "Nutrition", slug: "nutrition", color: "orange" },
  { id: "tag-5", name: "Volunteers", slug: "volunteers", color: "purple" },
  { id: "tag-6", name: "Donations", slug: "donations", color: "red" },
  { id: "tag-7", name: "Events", slug: "events", color: "yellow" },
  { id: "tag-8", name: "Haiti", slug: "haiti", color: "indigo" },
];

class BlogStorageService {
  // Initialize default data
  constructor() {
    this.initializeDefaults();
  }

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getFromStorage(key: string, defaultValue = ""): string {
    if (!this.isClient()) return defaultValue;
    return localStorage.getItem(key) || defaultValue;
  }

  private setToStorage(key: string, value: string): void {
    if (!this.isClient()) return;
    localStorage.setItem(key, value);
  }

  private initializeDefaults() {
    // Only initialize if we're in the browser
    if (!this.isClient()) return;

    // Initialize categories if not exists
    if (!this.getFromStorage(STORAGE_KEYS.CATEGORIES)) {
      this.setToStorage(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(DEFAULT_CATEGORIES)
      );
    }

    // Initialize tags if not exists
    if (!this.getFromStorage(STORAGE_KEYS.TAGS)) {
      this.setToStorage(STORAGE_KEYS.TAGS, JSON.stringify(DEFAULT_TAGS));
    }

    // Initialize empty posts array if not exists
    if (!this.getFromStorage(STORAGE_KEYS.POSTS)) {
      this.setToStorage(STORAGE_KEYS.POSTS, JSON.stringify([]));
    }
  }

  // Generate a slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Calculate reading time based on content
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Get all posts
  async getAllPosts(filters?: BlogFilters): Promise<BlogPost[]> {
    if (!this.isClient()) return [];

    const posts = JSON.parse(
      this.getFromStorage(STORAGE_KEYS.POSTS, "[]")
    ) as BlogPost[];

    let filteredPosts = [...posts];

    // Apply filters
    if (filters) {
      if (filters.status) {
        filteredPosts = filteredPosts.filter(
          (post) => post.status === filters.status
        );
      }

      if (filters.categories?.length) {
        filteredPosts = filteredPosts.filter((post) =>
          post.categories.some((cat) => filters.categories?.includes(cat.id))
        );
      }

      if (filters.tags?.length) {
        filteredPosts = filteredPosts.filter((post) =>
          post.tags.some((tag) => filters.tags?.includes(tag.id))
        );
      }

      if (filters.authors?.length) {
        filteredPosts = filteredPosts.filter((post) =>
          filters.authors?.includes(post.author.id)
        );
      }

      if (filters.dateFrom) {
        filteredPosts = filteredPosts.filter(
          (post) =>
            new Date(post.publishedAt || post.createdAt) >=
            new Date(filters.dateFrom!)
        );
      }

      if (filters.dateTo) {
        filteredPosts = filteredPosts.filter(
          (post) =>
            new Date(post.publishedAt || post.createdAt) <=
            new Date(filters.dateTo!)
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(
          (post) =>
            post.title.toLowerCase().includes(searchLower) ||
            post.excerpt.toLowerCase().includes(searchLower) ||
            post.content.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      const sortBy = filters.sortBy || "date";
      const sortOrder = filters.sortOrder || "desc";

      filteredPosts.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "date":
            comparison =
              new Date(b.publishedAt || b.createdAt).getTime() -
              new Date(a.publishedAt || a.createdAt).getTime();
            break;
          case "author":
            comparison = a.author.name.localeCompare(b.author.name);
            break;
          case "views":
            comparison = b.viewCount - a.viewCount;
            break;
          case "updated":
            comparison =
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            break;
        }

        return sortOrder === "asc" ? -comparison : comparison;
      });
    }

    return filteredPosts;
  }

  // Get a single post by ID
  async getPostById(id: string): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    return posts.find((post) => post.id === id) || null;
  }

  // Get a single post by slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    return posts.find((post) => post.slug === slug) || null;
  }

  // Create a new post
  async createPost(
    data: BlogPostFormData,
    author: { id: string; name: string; email: string }
  ): Promise<BlogPost> {
    const posts = await this.getAllPosts();
    const categories = await this.getCategories();
    const tags = await this.getTags();

    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: data.title,
      slug: this.generateSlug(data.title),
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
      },
      categories: categories.filter((cat) => data.categories.includes(cat.id)),
      tags: tags.filter((tag) => data.tags.includes(tag.id)),
      featuredImage: data.featuredImage,
      seo: data.seo,
      publishedAt:
        data.status === "published" ? new Date().toISOString() : undefined,
      scheduledAt: data.scheduledAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      readingTime: this.calculateReadingTime(data.content),
      isDraft: data.status === "draft",
      isFeatured: data.isFeatured,
    };

    posts.push(newPost);
    this.setToStorage(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    return newPost;
  }

  // Update a post
  async updatePost(
    id: string,
    data: Partial<BlogPostFormData>
  ): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    const index = posts.findIndex((post) => post.id === id);

    if (index === -1) return null;

    const categories = await this.getCategories();
    const tags = await this.getTags();
    const existingPost = posts[index];

    const updatedPost: BlogPost = {
      ...existingPost,
      ...data,
      categories: data.categories
        ? categories.filter((cat) => data.categories?.includes(cat.id))
        : existingPost.categories,
      tags: data.tags
        ? tags.filter((tag) => data.tags?.includes(tag.id))
        : existingPost.tags,
      slug: data.title ? this.generateSlug(data.title) : existingPost.slug,
      readingTime: data.content
        ? this.calculateReadingTime(data.content)
        : existingPost.readingTime,
      updatedAt: new Date().toISOString(),
      publishedAt:
        data.status === "published" && !existingPost.publishedAt
          ? new Date().toISOString()
          : existingPost.publishedAt,
      isDraft: data.status ? data.status === "draft" : existingPost.isDraft,
    };

    posts[index] = updatedPost;
    this.setToStorage(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    return updatedPost;
  }

  // Delete a post
  async deletePost(id: string): Promise<boolean> {
    const posts = await this.getAllPosts();
    const filtered = posts.filter((post) => post.id !== id);

    if (filtered.length === posts.length) return false;

    this.setToStorage(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
    return true;
  }

  // Save draft (auto-save functionality)
  async saveDraft(postId: string, content: string): Promise<void> {
    const drafts = JSON.parse(this.getFromStorage(STORAGE_KEYS.DRAFTS) || "{}");
    drafts[postId] = {
      content,
      savedAt: new Date().toISOString(),
    };
    this.setToStorage(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  }

  // Get draft
  async getDraft(
    postId: string
  ): Promise<{ content: string; savedAt: string } | null> {
    const drafts = JSON.parse(this.getFromStorage(STORAGE_KEYS.DRAFTS) || "{}");
    return drafts[postId] || null;
  }

  // Clear draft
  async clearDraft(postId: string): Promise<void> {
    const drafts = JSON.parse(this.getFromStorage(STORAGE_KEYS.DRAFTS) || "{}");
    delete drafts[postId];
    this.setToStorage(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  }

  // Get all categories
  async getCategories(): Promise<BlogCategory[]> {
    return JSON.parse(this.getFromStorage(STORAGE_KEYS.CATEGORIES, "[]"));
  }

  // Create category
  async createCategory(
    category: Omit<BlogCategory, "id">
  ): Promise<BlogCategory> {
    const categories = await this.getCategories();
    const newCategory: BlogCategory = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    categories.push(newCategory);
    this.setToStorage(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return newCategory;
  }

  // Get all tags
  async getTags(): Promise<BlogTag[]> {
    return JSON.parse(this.getFromStorage(STORAGE_KEYS.TAGS, "[]"));
  }

  // Create tag
  async createTag(tag: Omit<BlogTag, "id">): Promise<BlogTag> {
    const tags = await this.getTags();
    const newTag: BlogTag = {
      ...tag,
      id: `tag-${Date.now()}`,
    };
    tags.push(newTag);
    this.setToStorage(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return newTag;
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    const posts = await this.getAllPosts();
    const post = posts.find((p) => p.id === id);
    if (post) {
      post.viewCount += 1;
      this.setToStorage(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
  }

  // Get blog statistics
  async getStats(): Promise<BlogStats> {
    const posts = await this.getAllPosts();
    const publishedPosts = posts.filter((p) => p.status === "published");
    const draftPosts = posts.filter((p) => p.status === "draft");
    const scheduledPosts = posts.filter((p) => p.status === "scheduled");

    // Calculate top categories
    const categoryCount: Record<string, number> = {};
    for (const post of posts) {
      for (const cat of post.categories) {
        categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1;
      }
    }

    const topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate top authors
    const authorCount: Record<string, number> = {};
    for (const post of posts) {
      authorCount[post.author.name] = (authorCount[post.author.name] || 0) + 1;
    }

    const topAuthors = Object.entries(authorCount)
      .map(([name, posts]) => ({ name, posts }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5);

    // Calculate average reading time
    const totalReadingTime = posts.reduce(
      (sum, post) => sum + (post.readingTime || 0),
      0
    );
    const averageReadingTime =
      posts.length > 0 ? Math.round(totalReadingTime / posts.length) : 0;

    // Get recent posts
    const recentPosts = [...publishedPosts]
      .sort(
        (a, b) =>
          new Date(b.publishedAt!).getTime() -
          new Date(a.publishedAt!).getTime()
      )
      .slice(0, 5);

    return {
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      scheduledPosts: scheduledPosts.length,
      totalViews: posts.reduce((sum, post) => sum + post.viewCount, 0),
      averageReadingTime,
      topCategories,
      topAuthors,
      recentPosts,
    };
  }

  // Bulk operations
  async bulkUpdateStatus(
    postIds: string[],
    status: BlogPost["status"]
  ): Promise<void> {
    const posts = await this.getAllPosts();
    const now = new Date().toISOString();

    for (const post of posts) {
      if (postIds.includes(post.id)) {
        post.status = status;
        post.updatedAt = now;
        if (status === "published" && !post.publishedAt) {
          post.publishedAt = now;
        }
        post.isDraft = status === "draft";
      }
    }

    this.setToStorage(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }

  async bulkDelete(postIds: string[]): Promise<void> {
    const posts = await this.getAllPosts();
    const filtered = posts.filter((post) => !postIds.includes(post.id));
    this.setToStorage(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
  }
}

// Export singleton instance
export const blogStorage = new BlogStorageService();
