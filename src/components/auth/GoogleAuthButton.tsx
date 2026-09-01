// src/components/auth/GoogleAuthButton.tsx
//
// Login lewat Google adalah alur redirect penuh browser (bukan panggilan axios) — backend
// (Spring Security oauth2Login) yang mengarahkan ke halaman consent Google, lalu setelah
// berhasil, mengarahkan balik browser ke /oauth2/redirect di frontend ini membawa token.
// Endpoint ini juga otomatis berfungsi sebagai "daftar" untuk akun baru (auto-registrasi
// saat pertama kali login), jadi tombol yang sama dipakai di halaman Login maupun Register.
import React from 'react';
import { Button } from '@/components/ui/button';
import { API_ROOT_URL } from '@/utils/api';

interface GoogleAuthButtonProps {
    label?: string;
    disabled?: boolean;
}

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2.2 12 2.2 6.9 2.2 2.7 6.5 2.7 11.6S6.9 21 12 21c6.9 0 9.3-4.9 9.3-7.4 0-.5-.1-.9-.1-1.3H12z" />
    </svg>
);

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ label = 'Lanjutkan dengan Google', disabled }) => {
    const handleClick = () => {
        // Full page navigation, BUKAN fetch/axios — Google butuh browser asli untuk consent screen.
        window.location.href = `${API_ROOT_URL}/oauth2/authorization/google`;
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full border-border hover:bg-muted"
            onClick={handleClick}
            disabled={disabled}
        >
            <GoogleIcon /> {label}
        </Button>
    );
};

export default GoogleAuthButton;
