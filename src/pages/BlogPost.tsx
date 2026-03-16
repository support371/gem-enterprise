import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GemAssist } from "@/components/GemAssist";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import { usePostBySlug } from "@/hooks/useBlog";
import ReactMarkdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=600&fit=crop&auto=format",
];

function getPostCoverImage(postId: string): string {
  const charCode = postId.charCodeAt(postId.length - 1) || 0;
  return COVER_IMAGES[charCode % COVER_IMAGES.length];
}

function getAuthorAvatar(authorName: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}&backgroundColor=1e3a5f,0f172a&textColor=60a5fa&fontSize=38&fontWeight=600`;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePostBySlug(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article not found</h1>
          <Link to="/blog" className="text-primary hover:underline">
            ← Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              <div className="flex items-center gap-3 mb-4">
                {post.category && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {post.category.name}
                  </span>
                )}
                {post.read_time && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.read_time}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                <Avatar className="w-12 h-12 ring-2 ring-border">
                  <AvatarImage src={getAuthorAvatar(post.author_name)} alt={post.author_name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {post.author_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-foreground">
                    {post.author_name}
                    {post.author_credentials && `, ${post.author_credentials}`}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {post.author_role && <span>{post.author_role}</span>}
                    {post.published_at && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.published_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover image */}
              <div className="aspect-video rounded-xl overflow-hidden bg-secondary mb-10">
                <img
                  src={getPostCoverImage(post.id)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <article className="prose prose-invert prose-lg max-w-none [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_a]:text-primary [&_strong]:text-foreground [&_code]:text-primary [&_blockquote]:border-primary/30">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </article>
            </AnimatedSection>
          </div>
        </div>
      </main>
      <Footer />
      <GemAssist />
    </div>
  );
}
