import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author_name: string;
  author_credentials: string | null;
  author_role: string | null;
  category_id: string | null;
  featured: boolean;
  published: boolean;
  read_time: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  user_id: string;
  category?: { id: string; name: string; slug: string } | null;
  tags?: { id: string; name: string; slug: string }[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export function usePublishedPosts(categorySlug?: string) {
  return useQuery({
    queryKey: ["blog-posts", "published", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (categorySlug && categorySlug !== "all") {
        const { data: cat } = await supabase
          .from("blog_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch tags for each post
      const posts = data as any[];
      for (const post of posts) {
        const { data: postTags } = await supabase
          .from("blog_post_tags")
          .select("tag_id")
          .eq("post_id", post.id);
        if (postTags?.length) {
          const tagIds = postTags.map((pt: any) => pt.tag_id);
          const { data: tags } = await supabase
            .from("blog_tags")
            .select("*")
            .in("id", tagIds);
          post.tags = tags || [];
        } else {
          post.tags = [];
        }
        post.category = post.blog_categories;
        delete post.blog_categories;
      }
      return posts as BlogPost[];
    },
  });
}

export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .eq("slug", slug)
        .single();
      if (error) throw error;

      const post = data as any;
      const { data: postTags } = await supabase
        .from("blog_post_tags")
        .select("tag_id")
        .eq("post_id", post.id);
      if (postTags?.length) {
        const tagIds = postTags.map((pt: any) => pt.tag_id);
        const { data: tags } = await supabase
          .from("blog_tags")
          .select("*")
          .in("id", tagIds);
        post.tags = tags || [];
      } else {
        post.tags = [];
      }
      post.category = post.blog_categories;
      delete post.blog_categories;
      return post as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useMyPosts() {
  return useQuery({
    queryKey: ["blog-posts", "mine"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((p) => ({
        ...p,
        category: p.blog_categories,
        blog_categories: undefined,
      })) as BlogPost[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as BlogCategory[];
    },
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as BlogTag[];
    },
  });
}

export function useUpsertPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      post,
      tagIds,
    }: {
      post: Partial<BlogPost> & { title: string; content: string; user_id: string };
      tagIds: string[];
    }) => {
      const slug =
        post.slug ||
        post.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const payload = { ...post, slug, updated_at: new Date().toISOString() };
      delete (payload as any).category;
      delete (payload as any).tags;

      let result;
      if (post.id) {
        const { data, error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", post.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Sync tags
      await supabase.from("blog_post_tags").delete().eq("post_id", result.id);
      if (tagIds.length > 0) {
        await supabase
          .from("blog_post_tags")
          .insert(tagIds.map((tag_id) => ({ post_id: result.id, tag_id })));
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useUpsertCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, id }: { name: string; id?: string }) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (id) {
        const { error } = await supabase.from("blog_categories").update({ name, slug }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_categories").insert({ name, slug });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog-categories"] }),
  });
}

export function useUpsertTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, id }: { name: string; id?: string }) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (id) {
        const { error } = await supabase.from("blog_tags").update({ name, slug }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_tags").insert({ name, slug });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog-tags"] }),
  });
}
