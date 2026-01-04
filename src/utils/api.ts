// src/lib/axios.ts (atau src/services/api.ts)
import axios from 'axios';

// 1. Definisikan Base URL
const API = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // Sesuaikan dengan base URL API Anda
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Tambahkan Request Interceptor untuk menyisipkan Token
API.interceptors.request.use(
    (config) => {
        // Ambil token dari Local Storage (atau dari state/store Autentikasi Anda)
        const token = localStorage.getItem('authToken'); // Asumsi key Anda 'authToken'

        if (token) {
            // Tambahkan Header Authorization jika token ada
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API; // Pastikan semua hook (useProjects) menggunakan instance API ini