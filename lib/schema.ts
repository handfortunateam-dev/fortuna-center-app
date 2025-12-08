// import { Post } from "@/db/schema";

import { Post } from "@/components/features/posts/interfaces/posts";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function generateBlogPostSchema(post: Post, authorName: string = "Joshtri Lenggu") {
  const imageUrl = post.coverImage || `${BASE_URL}/og-image.jpg`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.content?.substring(0, 160),
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
      name: post.title,
    },
    datePublished: post.createdAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: authorName,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Joshtri Lenggu",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/joshtri-lenggu-solid.png`,
        width: 512,
        height: 512,
      },
    },
    url: `${BASE_URL}/${post.typeId}/${post.slug}`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      name: "Joshtri Lenggu Blog",
      url: BASE_URL,
    },
  };

  return schema;
}

export function generateBlogCollectionSchema(posts: Post[]) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Joshtri Lenggu Blog",
    description: "A blog about language learning and technology",
    url: BASE_URL,
    mainEntity: {
      "@type": "Blog",
      name: "Joshtri Lenggu Blog",
      description: "A blog about language learning and technology",
      url: BASE_URL,
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || post.content?.substring(0, 160),
        image: post.coverImage || `${BASE_URL}/og-image.jpg`,
        datePublished: post.createdAt?.toISOString(),
        dateModified: post.updatedAt?.toISOString(),
        url: `${BASE_URL}/${post.typeId}/${post.slug}`,
      })),
    },
  };

  return schema;
}

export function generateWebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Joshtri Lenggu Blog",
    description: "A blog about language learning and technology",
    url: BASE_URL,
    image: {
      "@type": "ImageObject",
      url: `${BASE_URL}/joshtri-lenggu-solid.png`,
      width: 512,
      height: 512,
    },
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/joshtri-lenggu-solid.png`,
      width: 512,
      height: 512,
    },
    sameAs: [
      // Add your social media profiles here
      // "https://twitter.com/yourhandle",
      // "https://instagram.com/yourhandle",
      // "https://linkedin.com/in/yourprofile",
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/?search={search_term_string}`,
      },
      query_input: "required name=search_term_string",
    },
  };

  return schema;
}

export function generateOrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Joshtri Lenggu",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/joshtri-lenggu-solid.png`,
      width: 512,
      height: 512,
    },
    image: [
      {
        "@type": "ImageObject",
        url: `${BASE_URL}/joshtri-lenggu-solid.png`,
        width: 512,
        height: 512,
      },
      {
        "@type": "ImageObject",
        url: `${BASE_URL}/joshtri-lenggu-outlined.png`,
        width: 512,
        height: 512,
      },
    ],
    description: "A blog about language learning and technology",
    sameAs: [
      // Add your social media profiles here
      // "https://twitter.com/yourhandle",
      // "https://instagram.com/yourhandle",
      // "https://linkedin.com/in/yourprofile",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      // Add your contact email here
      // "email": "contact@yourdomain.com"
    },
  };

  return schema;
}
