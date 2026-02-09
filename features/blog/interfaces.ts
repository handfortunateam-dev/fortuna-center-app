// Public Blog interface with full nested data
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    status: "draft" | "published" | "archived";
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    likeCount: number;
    // Nested objects for public display
    author: {
        id: string;
        name: string;
        image: string | null;
    };
    categories: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
}

// Admin CMS interface with minimal fields for performance
export interface BlogPostAdmin {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published" | "archived";
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    likeCount: number;
    // Flattened fields for admin list view
    authorName: string;
    categoryNames: string[];
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BlogAuthor {
    id: string;
    fullName: string;
    email: string;
    imageUrl: string;
}

export interface BlogTag {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

export interface BlogComment {
    id: string;
    content: string;
    createdAt: string;
    isEdited: boolean;
    post: {
        id: string;
        title: string;
    };
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

export interface CreateBlogPostData {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    status: "draft" | "published" | "archived";
    categoryIds: string[];
    tagIds: string[];
    authorId?: string;
    publishedAt?: string;
}

export interface UpdateBlogPostData extends CreateBlogPostData {
    id: string;
}
