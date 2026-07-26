/**
 * Meta Graph API Client
 * Handles all interactions with Meta's Graph API
 */

const META_API_VERSION = 'v18.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaAPIError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

export class MetaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Make a GET request to Meta API
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${META_API_BASE}${endpoint}`);
    url.searchParams.append('access_token', this.accessToken);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());
    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request to Meta API
   */
  async post<T>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const url = new URL(`${META_API_BASE}${endpoint}`);
    url.searchParams.append('access_token', this.accessToken);

    const body = data ? new URLSearchParams(data) : undefined;

    const response = await fetch(url.toString(), {
      method: 'POST',
      body
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok || (data as MetaAPIError).error) {
      const error = (data as MetaAPIError).error;
      throw new Error(`Meta API Error: ${error.message} (${error.code})`);
    }

    return data as T;
  }

  /**
   * Get page information
   */
  async getPage(pageId: string) {
    return this.get(`/${pageId}`, {
      fields: 'id,name,picture,category,about,website,followers_count'
    });
  }

  /**
   * Get page feed
   */
  async getPageFeed(pageId: string, limit = 25) {
    return this.get(`/${pageId}/feed`, {
      fields: 'id,message,created_time,type,link,picture,story',
      limit
    });
  }

  /**
   * Get page insights
   */
  async getPageInsights(pageId: string, metric: string) {
    return this.get(`/${pageId}/insights`, {
      metric,
      period: 'day'
    });
  }

  /**
   * Get post insights
   */
  async getPostInsights(postId: string) {
    return this.get(`/${postId}/insights`, {
      fields: 'name,period,values,title,description'
    });
  }

  /**
   * Publish a post
   */
  async publishPost(pageId: string, message: string, link?: string) {
    return this.post(`/${pageId}/feed`, {
      message,
      link
    });
  }

  /**
   * Publish a photo
   */
  async publishPhoto(pageId: string, imageUrl: string, caption?: string) {
    return this.post(`/${pageId}/photos`, {
      url: imageUrl,
      caption
    });
  }

  /**
   * Get user pages
   */
  async getUserPages() {
    return this.get('/me/accounts', {
      fields: 'id,name,picture,category,access_token'
    });
  }

  /**
   * Get business portfolios
   */
  async getBusinessPortfolios() {
    return this.get('/me/businesses', {
      fields: 'id,name,picture'
    });
  }

  /**
   * Get business portfolio pages
   */
  async getBusinessPages(businessId: string) {
    return this.get(`/${businessId}/pages`, {
      fields: 'id,name,picture,category,access_token'
    });
  }
}

/**
 * Create a Meta API client from an access token
 */
export function createMetaClient(accessToken: string): MetaClient {
  return new MetaClient(accessToken);
}
