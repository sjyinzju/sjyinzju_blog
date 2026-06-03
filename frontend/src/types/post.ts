export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  categories: string[];
  tags: string[];
  is_published: boolean;
  created_at: string;
}
