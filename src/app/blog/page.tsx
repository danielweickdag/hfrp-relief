"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getPosts } from "./posts";
import ShareBox from "../_components/ShareBox";

function getCategoryColor(category: string): string {
  switch (category) {
    case "story":
      return "bg-blue-100 text-blue-800";
    case "update":
      return "bg-green-100 text-green-800";
    case "news":
      return "bg-purple-100 text-purple-800";
    case "impact":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<ReturnType<typeof getPosts>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    setPosts(getPosts());
  }, []);

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  const featuredPosts = posts.filter((post) => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stories & Updates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow our journey as we transform lives in Haiti. Read about our
            impact, meet the children we serve, and stay updated on our latest
            programs and achievements.
          </p>
        </div>

        {/* Share Box */}
        <ShareBox />

        {/* Featured Stories */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Stories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.slice(0, 3).map((post) => (
                <Link
                  href={`/blog/${post.slug}`}
                  key={post.slug}
                  className="block rounded-xl bg-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden group"
                >
                  {post.image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}
                        >
                          {post.category.charAt(0).toUpperCase() +
                            post.category.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-3 flex items-center text-sm text-gray-500 gap-3">
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      {post.author && <span>· By {post.author}</span>}
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-blue-600 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {["all", "story", "update", "news", "impact"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-blue-50 shadow"
                }`}
              >
                {category === "all"
                  ? "All Posts"
                  : category.charAt(0).toUpperCase() + category.slice(1)}
                <span className="ml-2 text-xs opacity-75">
                  (
                  {category === "all"
                    ? posts.length
                    : posts.filter((p) => p.category === category).length}
                  )
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* All Posts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="block rounded-xl bg-white shadow-md hover:shadow-lg transition-all p-6 group"
            >
              {post.image && (
                <div className="relative mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={300}
                    height={150}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>
              )}
              <div className="mb-2 flex items-center text-xs text-gray-500 gap-2">
                <span>{new Date(post.date).toLocaleDateString()}</span>
                {post.author && <span>· {post.author}</span>}
              </div>
              <h3 className="text-lg font-bold group-hover:text-blue-600 mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3">
                {post.summary}
              </p>
            </Link>
          ))}
        </div>

        {/* Social Media Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Follow Our Journey
          </h2>
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Stay connected with us on social media for daily updates,
              behind-the-scenes moments, and real-time stories from Haiti.
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <a
              href="https://facebook.com/familyreliefproject"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>

            <a
              href="https://instagram.com/familyreliefproject"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988c6.62 0 11.987-5.367 11.987-11.988C24.014 5.367 18.637.001 12.017.001zM8.448 16.988c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448zm7.104 0c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448z" />
              </svg>
              Instagram
            </a>

            <a
              href="https://twitter.com/familyreliefproject"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter
            </a>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Share our stories and help us reach more supporters:
              #HaitianFamilyRelief #Hope4Haiti
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
