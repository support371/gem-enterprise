import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GemAssist } from "@/components/GemAssist";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { Newspaper, Clock, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublishedPosts, useCategories } from "@/hooks/useBlog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Curated cybersecurity Unsplash cover images cycled deterministically by post index
const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=450&fit=crop&auto=format",
];

function getPostCoverImage(postId: string, index: number): string {
  // Use index for deterministic cycling, fallback to hash of id
  return COVER_IMAGES[index % COVER_IMAGES.length];
}

function getAuthorAvatar(authorName: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}&backgroundColor=1e3a5f,0f172a&textColor=60a5fa&fontSize=38&fontWeight=600`;
}

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: posts = [], isLoading } = usePublishedPosts(activeCategory);
  const { data: categories = [] } = useCategories();

  const featuredPosts = posts.filter((p) => p.featured);
  const regularPosts = posts.filter((p) => !p.featured);

  const allCategories = [{ slug: "all", name: "All" }, ...categories];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 relative">
          <div className="absolute inset-0 cyber-grid opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
                <Newspaper className="w-4 h-4" />
                <span>Security Blog</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Insights & <span className="text-gradient-primary">Analysis</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Expert perspectives on cybersecurity trends, threats, and best practices
                from the GEM security team.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Categories */}
        <section className="py-6 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {allCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {isLoading ? (
          <section className="py-20">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </section>
        ) : posts.length === 0 ? (
          <section className="py-20 text-center">
            <p className="text-muted-foreground text-lg">No articles published yet. Check back soon!</p>
          </section>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className="py-12">
                <div className="container mx-auto px-4">
                  <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-bold mb-6">Featured Articles</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      {featuredPosts.map((post, index) => (
                        <AnimatedSection key={post.id} delay={index * 0.1}>
                          <Link to={`/blog/${post.slug}`} className="group block">
                            <div className="aspect-video rounded-xl mb-4 overflow-hidden bg-secondary">
                              <img
                                src={getPostCoverImage(post.id, index)}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                                {post.category?.name || "Uncategorized"}
                              </span>
                              {post.read_time && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {post.read_time}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {post.tags.map((tag) => (
                                  <span key={tag.id} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              <Avatar className="w-10 h-10 ring-1 ring-border">
                                <AvatarImage src={getAuthorAvatar(post.author_name)} alt={post.author_name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                  {post.author_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {post.author_name}
                                  {post.author_credentials && `, ${post.author_credentials}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {post.author_role}
                                  {post.published_at &&
                                    ` • ${new Date(post.published_at).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}`}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </AnimatedSection>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* All Posts */}
            {regularPosts.length > 0 && (
              <section className="py-12 border-t border-border">
                <div className="container mx-auto px-4">
                  <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-bold mb-6">All Articles</h2>
                    <StaggerContainer className="space-y-6">
                      {regularPosts.map((post) => (
                        <StaggerItem key={post.id}>
                          <Link
                            to={`/blog/${post.slug}`}
                            className="group flex flex-col md:flex-row gap-6 glass-panel rounded-xl p-6 hover:border-primary/30 transition-all"
                          >
                            <div className="md:w-48 aspect-video md:aspect-square rounded-lg shrink-0 overflow-hidden bg-secondary">
                              <img
                                src={getPostCoverImage(post.id, featuredPosts.length + regularPosts.indexOf(post))}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs text-primary font-medium">
                                  {post.category?.name || "Uncategorized"}
                                </span>
                                {post.read_time && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.read_time}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {post.tags.map((tag) => (
                                    <span key={tag.id} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground flex items-center gap-1">
                                      <Tag className="w-2.5 h-2.5" />
                                      {tag.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  By {post.author_name}
                                  {post.author_credentials && `, ${post.author_credentials}`}
                                  {post.published_at && (
                                    <>
                                      <span className="mx-2">•</span>
                                      {new Date(post.published_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </>
                                  )}
                                </div>
                                <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Read more <ArrowRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                          </Link>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
      <GemAssist />
    </div>
  );
};

export default Blog;
