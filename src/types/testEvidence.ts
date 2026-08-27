// src/types/testEvidence.ts

export interface TestEvidence {
  id: number;
  runDetailId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePathUrl: string;
  description: string;
  downloadUrl: string | null; // hanya terisi untuk file yang di-upload lewat /evidence/upload
}

// Metadata-only (file sudah ada di storage eksternal seperti S3/GCS)
export interface TestEvidenceRequest {
  runDetailId: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  storagePathUrl?: string;
  description?: string;
}
