export type Domain = 
  | "resume" 
  | "linkedin" 
  | "networking" 
  | "interview" 
  | "negotiation" 
  | "confidence" 
  | "general";

export type Stage = 
  | "applying" 
  | "interviewing" 
  | "negotiating" 
  | "pivoting" 
  | "stuck" 
  | "unknown";

export interface ContentChunk {
  id: string;
  content: string;
  embedding: number[];
  domain: Domain;
  stage?: Stage;
  metadata?: {
    source?: string;
    section?: string;
    tags?: string[];
  };
}

export interface RetrievalResult {
  content: string;
  similarity: number;
  domain: Domain;
  stage?: Stage;
  metadata?: Record<string, any>;
}