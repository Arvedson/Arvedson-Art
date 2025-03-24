"use client"
import React from 'react';
import AboutMe from "../components/AboutMe"
import useTheme from '@/hooks/useTheme';

const SobreMiPage = () => {
    const theme = useTheme();


    return (
        <div
            className={`min-h-screen ${
                theme === 'light' ? 'bg-[var(--background)] text-[var(--foreground)]' : 'bg-gray-900 text-gray-100'
            }`}
        >
            <AboutMe />
        </div>
    );
};

export default SobreMiPage;
