import { Firestore } from 'quick-fire-store';

export interface DocumentData {
  id?: string;
  title?: string;
  desc?: string;
  updatedAt?: string;
  qty?: number;
  tags?: string[];
  [key: string]: unknown;
}

// Post data structure with required fields
export interface PostData {
  id?: string;
  title: string;
  content: string;
  author: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  tags?: string[];
  likes?: number;
  [key: string]: unknown;
}

// Comment data structure with required fields
export interface CommentData {
  id?: string;
  content: string;
  author: string;
  postId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  likes?: number;
  [key: string]: unknown;
}

export interface DocumentWithId {
  id: string;
  data: DocumentData;
}

export interface DocumentUpdate {
  docId: string;
  property: string;
  updatedTo: string | number;
  watchedValue: string | number;
  valuesMatch?: boolean;
}

export interface BaseComponentProps {
  db: Firestore;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}
