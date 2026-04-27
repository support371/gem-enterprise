import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GemAssist } from "@/components/GemAssist";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  FileText, Radar, Newspaper, Download,
  ArrowRight, Calendar, User, Tag, Search
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  { id: "all", label: "All Intel" },
  { id: "guides", label: "Guides" },
  { id: "reports", label: "Reports" },
  { id: "whitepapers", label: "Whitepapers" },
  { id: "case-studies", label: "Case Studies" },
];

const resources = [
  {
    id: "intel-001",
    title: "Global Threat Landscape Q2 2026",
    excerpt: "Comprehensive analysis of emerging cyber threats and actor behavior across enterprise sectors.",
    category: "reports",
    author: "GEM Intel Team",
    date: "2026-04-15",
    readTime: "12 min read",
    featured: true,
  },
  {
    id: "intel-002",
    title: "Zero-Day Response Protocol",
    excerpt: "Best practices for rapid response to critical vulnerabilities in distributed cloud infrastructure.",
    category: "guides",
    author: "Sarah Chen",
    date: "2026-04-10",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: "intel-003",
    title: "AI-Driven Social Engineering",
    excerpt: "Understanding the next generation of phishing and deepfake-based organizational attacks.",
    category: "whitepapers",
    author: "David Chen",
    date: "2026-03-28",
    readTime: "15 min read",
    featured: false,
  },
  {
    id: "intel-004",
    title: "Supply Chain Integrity Report",
    excerpt: "Security posture assessment of the global software and hardware supply chain for enterprise.",
    category: "reports",
    author: "GEM Intel Team",
    date: "2026-03-20",
    readTime: "20 min read",
    featured: false,
  },
];

const blogPosts = [
  {
    id: 1,
    title: "Understanding the Latest Ransomware Tactics",
    excerpt: "An analysis of evolving ransomware techniques and how to protect your organization.",
    author: "Dr. Sarah Chen, CISSP",
    date: "2026-01-12",
    category: "Threat Intelligence",
  },
  {
    id: 2,
    title: "The Role of AI in Modern Threat Detection",
    excerpt: "How machine learning is transforming security operations and threat hunting.",
    author: "Michael Torres, CISM",
    date: "2026-01-08",
    category: "Technology",
  },
  {
    id: 3,
    title: "Building a Security-First Culture",
    excerpt: "Strategies for embedding security awareness throughout your organization.",
    author: "Alex Rodriguez, GCIH",
    date: "2026-01-03",
    category: "Best Practices",
  },
];

const Intel = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntel = resources.filter((resource) => {
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                <Radar className="w-4 h-4" />
                <span>Intel</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Threat Intelligence <span className="text-gradient-primary">Hub</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Guides, reports, and insights from our security experts.
                Stay informed about the latest threats and best practices.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-8 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Intel */}
        {selectedCategory === "all" && !searchQuery && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-xl font-bold mb-6">Featured</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {resources.filter(r => r.featured).map((resource, index) => (
                    <AnimatedSection key={resource.id} delay={index * 0.1}>
                      <Link
                        to={`/resources/${resource.id}`}
                        className="group block glass-panel rounded-2xl p-6 hover:border-primary/30 transition-all bento-card h-full"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium capitalize">
                            {resource.category.replace("-", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">{resource.readTime}</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {resource.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {resource.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(resource.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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

        {/* All Intel */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-bold mb-6">
                {selectedCategory === "all" ? "All Intel" : categories.find(c => c.id === selectedCategory)?.label}
                <span className="text-muted-foreground font-normal ml-2">({filteredIntel.length})</span>
              </h2>
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntel.map((resource) => (
                  <StaggerItem key={resource.id}>
                    <Link
                      to={`/resources/${resource.id}`}
                      className="group block glass-panel rounded-xl p-5 hover:border-primary/30 transition-all h-full"
                    >
                      <span className="text-xs text-primary font-medium capitalize">
                        {resource.category.replace("-", " ")}
                      </span>
                      <h3 className="font-semibold text-foreground mt-2 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {resource.excerpt}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {resource.author}
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Latest Insights</h2>
                  <p className="text-muted-foreground text-sm mt-1">From the GEM Security Blog</p>
                </div>
                <Link to="/blog" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                  View all posts <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {blogPosts.map((post, index) => (
                  <AnimatedSection key={post.id} delay={index * 0.1}>
                    <Link
                      to={`/blog/${post.id}`}
                      className="group block"
                    >
                      <div className="aspect-video bg-secondary rounded-xl mb-4 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-primary">{post.category}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-2xl mx-auto">
              <div className="glass-panel rounded-2xl p-8 text-center">
                <Newspaper className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Stay Informed</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Get the latest security insights delivered to your inbox.
                </p>
                <div className="flex gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button variant="hero">Subscribe</Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
      <GemAssist />
    </div>
  );
};

export default Intel;
