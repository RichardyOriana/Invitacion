export interface WeddingConfig {
  names: string;
  date: string; // ISO string format (e.g., "2026-10-17T18:00:00")
  parents: string; // Deprecated but kept for compatibility
  groomParents: string; // e.g., "Obdulio Camargo y Lucía de Camargo"
  brideParents: string; // e.g., "Padres de la Novia"
  googleMapsUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
  musicUrl: string;
  coverImage: string;
  image2?: string;
  image3?: string;
  image4?: string;
  eventDetails: string;
  placeName: string;
  musicChunksCount?: number;
  parentsIntro?: string;
  middleText?: string;
}

export interface AdminUser {
  email: string;
  uid: string;
}
