import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Database, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button'; 

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="p-6 border rounded-xl shadow-lg hover:shadow-xl transition duration-300 bg-white space-y-3">
        {icon}
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Navigasi */}
            <header className="sticky top-0 z-10 bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center"> 
                        <Zap className="h-6 w-6 mr-2 text-primary" /> SQAHub.org
                    </h1>
                    <nav className="space-x-4">
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            {/* Tombol Daftar menggunakan primary */}
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"> 
                                Daftar Gratis
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Bagian Hero */}
            {/* Menggunakan latar belakang gelap (gray-800) */}
            <section className="bg-gray-800 text-white py-20"> 
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-5xl font-extrabold mb-4">
                        Pusat Analisis Kualitas Perangkat Lunak Terpadu
                    </h2>
                    <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                        SQA Hub adalah platform sentralisasi hasil pengujian otomatis Anda. Ubah data mentah menjadi wawasan kualitas yang dapat ditindaklanjuti.
                    </p>
                    <Link to="/register">
                        {/* Tombol CTA dibalik */}
                        <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg font-bold shadow-2xl">
                            Mulai Sekarang!
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Bagian Fitur */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Apa yang Bisa Anda Lakukan dengan SQAHub?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<BarChart3 className="h-10 w-10 text-primary" />} 
                            title="Analisis Tren Kualitas"
                            description="Visualisasikan tingkat kelulusan (pass rate) dari waktu ke waktu untuk mengidentifikasi degradasi kualitas."
                        />
                        <FeatureCard 
                            icon={<FileText className="h-10 w-10 text-gray-600" />} 
                            title="Laporan PDF Profesional"
                            description="Ekspor laporan pengujian lengkap yang siap dibagikan kepada tim manajemen."
                        />
                        <FeatureCard 
                            icon={<Database className="h-10 w-10 text-gray-600" />} 
                            title="Sentralisasi Data Uji"
                            description="Kumpulkan hasil dari berbagai *framework* ke dalam satu sumber terpadu."
                        />
                    </div>
                </div>
            </section>

            {/* Bagian CTA */}
            <section className="py-16 bg-gray-100 text-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Siap Mengambil Kendali Kualitas Anda?</h2>
                <Link to="/register">
                    {/* Tombol CTA menggunakan primary */}
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
                        Daftar Akun Tester Gratis
                    </Button>
                </Link>
            </section>
        </div>
    );
};

export default LandingPage;