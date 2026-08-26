"use client";



// GEM Intel — curated feed client.

// Fetches /api/intel/news with category filter and cursor-based pagination.

// Renders a hero + grid layout of NewsArticleCard components.



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  
  NewsArticleCard,
  
  NewsArticleCardSkeleton,
  
  type NewsArticleCardData,
  
} from "./NewsArticleCard";



export type CuratedCategory = {
  
  label: string;
  
  slug: string; // matches API accepted slug
  
};



type FetchState = {
  
  items: NewsArticleCardData[];
  
  nextCursor: string | null;
  
  loading: boolean;
  
  loadingMore: boolean;
  
  error: string | null;
  
};



const INITIAL_STATE: FetchState = {
  
  items: [],
  
  nextCursor: null,
  
  loading: true,
  
  loadingMore: false,
  
  error: null,
  
};



export function CuratedNewsFeed({
  
  categories,
  
  initialCategory,
  
  videoOnly = false,
  
}: {
  
  categories: CuratedCategory[];
  
  initialCategory?: string;
  
  videoOnly?: boolean;
  
}) {
  
  const [activeSlug, setActiveSlug] = useState<string>(
    
    initialCategory ?? "all",
    
  );
  
  const [search, setSearch] = useState("");
  
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [state, setState] = useState<FetchState>(INITIAL_STATE);
  

  
  // Debounce search to avoid hammering the API.
  
  useEffect(() => {
    
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    
    return () => clearTimeout(t);
    
  }, [search]);
  

  
  const loadInitial = useCallback(async () => {
    
    setState({ ...INITIAL_STATE, loading: true });
    
    try {
      
      const params = new URLSearchParams();
      
      if (activeSlug !== "all") params.set("category", activeSlug);
      
      if (debouncedSearch) params.set("q", debouncedSearch);
      
      params.set("limit", "18");
      
      if (videoOnly) params.set("videoOnly", "1");
      

      
      const res = await fetch(`/api/intel/news?${params.toString()}`, {
        
        cache: "no-store",
        
      });
      
      if (!res.ok) throw 




















































