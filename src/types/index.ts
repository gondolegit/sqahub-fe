// src/types/index.ts
import type { AxiosInstance } from 'axios';

// Role global user (Role enum di backend). Dipakai untuk @PreAuthorize("hasRole(...)").
export type UserRole = 'ADMIN' | 'TESTER' | 'DEVELOPER' | 'AUTOMATION';

// Role keanggotaan proyek (sistem izin terpisah dari UserRole di atas, per-user per-project).
export type ProjectMemberRole = 'MANAGER' | 'TESTER' | 'DEVELOPER' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  email?: string;
  roles: UserRole[];
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    /**
     * Terapkan sesi yang tokennya sudah diterbitkan di luar alur login biasa (mis. redirect
     * balik dari Google OAuth2 di /oauth2/redirect), tanpa memanggil /auth/authenticate lagi.
     */
    applySession: (session: { token: string; userId: string; username: string; role: UserRole }) => void;
    logout: () => void;
    hasRole: (roles: UserRole[]) => boolean;
    api: AxiosInstance;
}

// --- PROJECT ---
export type ProjectType = 'WEB' | 'MOBILE' | 'API' | 'OTHER';
export type ProjectStatus = 'active' | 'archived' | 'maintenance' | 'suspended' | 'completed';

export interface Project {
  id: number;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  createdByUsername: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
}

export interface UpdateProjectRequest extends CreateProjectRequest {
    id: number;
}

export interface LoginApiResponse {
    userId: string;
    username: string;
    role: UserRole;
    token: string;
    message: string;
}

// --- PAGINASI (Spring Page<T>) ---
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // halaman saat ini (0-based)
  size: number;
  first: boolean;
  last: boolean;
}

// --- ERROR RESPONSE STANDAR BACKEND ---
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// --- PROJECT MEMBERS ---
export interface ProjectMember {
  id: number;
  idProject: number;
  idUser: number;
  username: string;
  email: string;
  role: ProjectMemberRole;
  joinedAt: string;
}

export interface ProjectMemberRequest {
  idUser: number;
  role: ProjectMemberRole;
}

// --- API KEYS ---
export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | string;

export interface ApiKey {
  id: number;
  idUser: number;
  name: string;
  status: ApiKeyStatus;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdByUsername: string;
  createdAt: string;
  rawKey: string | null; // hanya terisi sesaat setelah dibuat
}

export interface ApiKeyRequest {
  name: string;
  expiresAt?: string | null;
}

// --- ACTIVITY LOG ---
export interface ActivityLog {
  id: number;
  idUser: number | null;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  ipAddress: string;
  createdAt: string;
}
