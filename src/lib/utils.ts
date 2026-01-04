// src/lib/utils.ts (VERSI LENGKAP DENGAN UTILS)

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Asumsi Anda menggunakan date-fns atau format default JavaScript/Browser
// Fungsi untuk memformat tanggal
export function formatDate(dateString: string | Date, includeTime: boolean = false): string {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false; // Menggunakan format 24 jam
    }

    // Menggunakan locale Indonesia (id-ID)
    return date.toLocaleString('id-ID', options);
}

// Fungsi untuk memformat waktu yang berlalu (dari detik ke format H:M:S)
export function formatElapsedTime(seconds: number): string {
    if (typeof seconds !== 'number' || seconds < 0) return '0s';
    
    // Pembulatan ke detik terdekat
    const totalSeconds = Math.round(seconds); 
    
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    let parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`); // Tampilkan menit jika ada jam atau menit
    if (s > 0 || (h === 0 && m === 0)) parts.push(`${s}s`); // Selalu tampilkan detik jika kurang dari 1 menit

    return parts.join(' ');
}