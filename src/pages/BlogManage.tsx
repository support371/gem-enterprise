import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  useMyPosts,
  useCategories,
  useTags,
  useUpsertPost,
  useDeletePost,
  useUpsertCategory,
  useUpsertTag,
  type BlogPost,
} from "@/hooks/useBlog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Tag,
  FolderOpen,
} from "lucide-react";

export default function BlogManage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useMyPosts();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const upsertPost = useUpsertPost();
  const deletePost = useDeletePost();
  const upsertCategory = useUpsertCategory();
  const upsertTag = useUpsertTag();

  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return null;

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditing(post);
      setSelectedTags(post.tags?.map((t) => t.id) || []);
    } else {
      setEditing({
        title: "",
        content: "",
        excerpt: "",
        author_name: "",
        author_credentials: "",
        author_role: "",
        category_id: null,
        featured: false,
        published: false,
        read_time: "",
      });
      setSelectedTags([]);
    }
  };

  const handleSave = async () => {
    if (!editing?.title || !editing?.content || !editing?.author_name) {
      toast({ title: "Error", description: "Title, content, and author name are required.", variant: "destructive" });
      return;
    }

    try {
      await upsertPost.mutateAsync({
        post: {
          ...editing,
          user_id: user.id,
          published_at: editing.published ? editing.published_at || new Date().toISOString() : null,
        } as any,
        tagIds: selectedTags,
      });
      toast({ title: "Saved", description: "Blog post saved successfully." });
      setEditing(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost.mutateAsync(id);
      toast({ title: "Deleted", description: "Post deleted." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await upsertCategory.mutateAsync({ name: newCategoryName.trim() });
      setNewCategoryName("");
      setCategoryDialogOpen(false);
      toast({ title: "Category added" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await upsertTag.mutateAsync({ name: newTagName.trim() });
      setNewTagName("");
      setTagDialogOpen(false);
      toast({ title: "Tag added" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Editor view
  if (editing) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                {editing.id ? "Edit Post" : "New Post"}
              </h1>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={upsertPost.isPending}>
                  {upsertPost.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Post title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={editing.excerpt || ""}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Brief summary..."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content">Content (Markdown) *</Label>
                <Textarea
                  id="content"
                  value={editing.content || ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder="Write your article in markdown..."
                  rows={16}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="author_name">Author Name *</Label>
                  <Input
                    id="author_name"
                    value={editing.author_name || ""}
                    onChange={(e) => setEditing({ ...editing, author_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="author_credentials">Credentials</Label>
                  <Input
                    id="author_credentials"
                    value={editing.author_credentials || ""}
                    onChange={(e) => setEditing({ ...editing, author_credentials: e.target.value })}
                    placeholder="CISSP, CISM"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="author_role">Role</Label>
                  <Input
                    id="author_role"
                    value={editing.author_role || ""}
                    onChange={(e) => setEditing({ ...editing, author_role: e.target.value })}
                    placeholder="Security Analyst"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <div className="flex gap-2 mt-1">
                    <Select
                      value={editing.category_id || "none"}
                      onValueChange={(v) => setEditing({ ...editing, category_id: v === "none" ? null : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Category</DialogTitle>
                        </DialogHeader>
                        <div className="flex gap-2">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name"
                            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                          />
                          <Button onClick={handleAddCategory}>Add</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div>
                  <Label htmlFor="read_time">Read Time</Label>
                  <Input
                    id="read_time"
                    value={editing.read_time || ""}
                    onChange={(e) => setEditing({ ...editing, read_time: e.target.value })}
                    placeholder="8 min"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Tags</Label>
                  <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-3 h-3 mr-1" /> Add Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Tag</DialogTitle>
                      </DialogHeader>
                      <div className="flex gap-2">
                        <Input
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="Tag name"
                          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        />
                        <Button onClick={handleAddTag}>Add</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags yet. Create one above.</p>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-8 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editing.published || false}
                    onCheckedChange={(checked) => setEditing({ ...editing, published: checked })}
                  />
                  <Label className="flex items-center gap-1.5">
                    {editing.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {editing.published ? "Published" : "Draft"}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editing.featured || false}
                    onCheckedChange={(checked) => setEditing({ ...editing, featured: checked })}
                  />
                  <Label className="flex items-center gap-1.5">
                    <Star className="w-4 h-4" />
                    Featured
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">Manage Blog</h1>
            <Button onClick={() => openEditor()}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No posts yet</h2>
              <p className="text-muted-foreground mb-6">Create your first blog post to get started.</p>
              <Button onClick={() => openEditor()}>
                <Plus className="w-4 h-4 mr-2" /> Create Post
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="glass-panel rounded-xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                      {post.featured && (
                        <Star className="w-4 h-4 text-yellow-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                      {post.category && (
                        <span className="flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" />
                          {(post.category as any)?.name}
                        </span>
                      )}
                      <span>
                        {new Date(post.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEditor(post)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
