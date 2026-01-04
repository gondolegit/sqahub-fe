// src/types/index.ts
// --- PERBAIKAN: Gunakan import type untuk AxiosInstance ---
import type { AxiosInstance } from 'axios'; 

// Menggunakan role Anda:
// export type UserRole = 'TESTER' | 'ADMIN' | 'DEVELOPER' | 'GUEST'; 

// Menggunakan role Anda:
export type UserRole = 'TESTER' | 'ADMIN' | 'DEVELOPER' | 'GUEST'; 

// Tipe Struktur User
export interface User {
  id: string;
  username: string;
  email?: string;
  roles: UserRole[]; 
}

// Tipe untuk Auth Context
export interface AuthContextType {
    // --- PROPERTY BARU DAN WAJIB UNTUK PROTECTED ROUTE ---
    isAuthenticated: boolean; 
    // ---------------------------------------------------
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasRole: (roles: UserRole[]) => boolean;
    // Gunakan AxiosInstance untuk tipe API
    api: AxiosInstance; 
}

// src/types/index.ts
// ... (Tipe User, AuthContextType, UserRole yang sudah ada) ...

// --- TIPE BARU: PROJECT ---
export type ProjectType = 'WEB' | 'MOBILE' | 'API' | 'OTHER';
export type ProjectStatus = 'active' | 'archived' | 'maintenance' | 'suspended' | 'completed';

export interface Project {
  id: number;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: string; // Tanggal pembuatan
  updatedAt: string; // Tanggal update
  createdByUsername: string; // Username pembuat
}

// Tipe untuk respon list Project
export interface ProjectListResponse {
  content: Project[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// src/types/index.ts
// ... (Tipe Project, ProjectType, ProjectStatus) ...

// --- TIPE BARU: FORM REQUEST BODY ---
export interface CreateProjectRequest {
  name: string;
  description: string;
  type: ProjectType; // 'WEB' | 'MOBILE' | 'API' | 'OTHER'
  status: ProjectStatus; // 'active' | 'archived' | 'maintenance' (Asumsi default 'active')
}

export interface UpdateProjectRequest extends CreateProjectRequest {
    id: number; // ID Project yang akan diupdate
}

export interface LoginApiResponse {
    userId: string;
    username: string;
    role: UserRole; // String tunggal
    token: string;
    message: string;
}