export type Role = 'USER' | 'ARTIST' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  artistProfile?: ArtistProfile;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  bio: string;
  verified: boolean;
  earnings: number;
}

export interface Video {
  id: string; userId: string; url: string; caption: string; views: number; likes: number; createdAt: string;
  user: { id: string; username: string; avatar?: string };
  type?: 'video'; score?: number;
}

export interface Track {
  id: string; artistId: string; url: string; title: string; plays: number;
  artist: { id: string; user: { id: string; username: string } };
  type?: 'track'; score?: number;
}

export interface LiveSession {
  id: string; artistId: string; title: string; isActive: boolean; viewers: number; startedAt: string;
  artist: { id: string; user: { id: string; username: string; avatar?: string } };
}

export interface ChatMessage {
  sessionId: string; userId: string; username: string; message: string; timestamp: string;
}

export interface AuthResponse { token: string; user: User; }
