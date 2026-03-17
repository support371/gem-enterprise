import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GemAssist } from "@/components/GemAssist";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { 
  FileText, BookOpen, Newspaper, Download, 
  ArrowRight, Calendar, User, Tag, Search
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  { id: "all", label: "All Resources" },
  { id: "guides", label: "Guides" },
  { id: "reports", label: "Reports" },
  { id: "whitepapers", label: "Whitepapers" },
  { id: "case-studies", label: "Case Studies" },
];

const resources = [
  {
    id: 1,
    title: "Enterprise SOC Operations: A Complete Guide",
    excerpt: "Learn how to build and operate an effective Security Operations Center for enterprise environments.",
    category: "guides",
    author: "Dr. Sarah Chen, CISSP",
    authorRole: "Chief Security Officer",
    date: "2026-01-10",
    readTime: "15 min read",
    featured: true,
  },
  {
    id: 2,
    title: "2026 Threat Landscape Report",
    excerpt: "Analysis of emerging cyber threats, attack vectors, and security trends for the coming year.",
    category: "reports",
    author: "GEM Threat Intelligence Team",
    authorRole: "Security Research",
    date: "2026-01-05",
    readTime: "25 min read",
    featured: true,
  },
  {
    id: 3,
    title: "Zero Trust Architecture Implementation",
    excerpt: "Step-by-step guide to implementing zero trust principles in enterprise environments.",
    category: "whitepapers",
    author: "Michael Torres, CISM",
    authorRole: "Security Architect",
    date: "2025-12-20",
    readTime: "20 min read",
    featured: false,
  },
  {
    id: 4,
    title: "Case Study: Financial Services Security Transformation",
    excerpt: "How a major financial institution reduced incident response time by 85% with GEM.",
    category: "case-studies",
    author: "GEM Customer Success",
    authorRole: "Case Study",
    date: "2025-12-15",
    readTime: "10 min read",
    featured: false,
  },
  {
    id: 5,
    title: "Incident Response Playbook Template",
    excerpt: "Ready-to-use incident response playbook with customizable procedures and checklists.",
    category: "guides",
    author: "Alex Rodriguez, GCIH",
    authorRole: "Incident Response Lead",
    date: "2025-12-10",
    readTime: "30 min read",
    featured: false,
  },
  {
    id: 6,
    title: "Cloud Security Best Practices for 2026",
    excerpt: "Essential security controls and configurations for AWS, Azure, and GCP environments.",
    category: "whitepapers",
    author: "Jennifer Park, CCSP",
    authorRole: "Cloud Security Engineer",
    date: "2025-12-05",
    readTime: "18 min read",
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

const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = resources.filter((resource) => {
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
                <BookOpen className="w-4 h-4" />
                <span>Resources</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Security <span className="text-gradient-primary">Knowledge Hub</span>
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

        {/* Featured Resources */}
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

        {/* All Resources */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-bold mb-6">
                {selectedCategory === "all" ? "All Resources" : categories.find(c => c.id === selectedCategory)?.label}
                <span className="text-muted-foreground font-normal ml-2">({filteredResources.length})</span>
              </h2>
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
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

export default Resources;
