import React from 'react';
import { Scale, Gavel, BookMarked } from 'lucide-react';

const FloatingLegalIcons = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
            <Scale className="absolute top-20 left-10 text-blue-200 opacity-20 float" size={80} style={{ animationDelay: '0s' }} />
            <Gavel className="absolute top-40 right-20 text-blue-300 opacity-15 float" size={60} style={{ animationDelay: '2s' }} />
            <BookMarked className="absolute bottom-40 left-1/4 text-blue-200 opacity-20 float" size={70} style={{ animationDelay: '4s' }} />
            <Scale className="absolute bottom-20 right-1/3 text-blue-300 opacity-15 float" size={50} style={{ animationDelay: '1s' }} />
        </div>
    );
};

export default FloatingLegalIcons;
