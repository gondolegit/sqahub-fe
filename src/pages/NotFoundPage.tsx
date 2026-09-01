// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-muted/40 text-center p-4">
            <div className="text-8xl font-extrabold text-primary mb-4">
                404
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
                {t('notFound.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
                {t('notFound.description')}
            </p>
            <Link to="/dashboard">
                <Button size="lg" className="flex items-center">
                    <Home className="mr-2 h-5 w-5" />
                    {t('notFound.backToDashboard')}
                </Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;