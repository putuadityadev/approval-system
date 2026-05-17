import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function LoadingScan({ isVisible }) {
    const [progress, setProgress] = useState(0);
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        // Fetch the animation data since it's in public folder
        fetch('/assets/Searching.json')
            .then(response => response.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error('Error loading animation:', err));
    }, []);

    useEffect(() => {
        if (!isVisible) {
            setProgress(0);
            return;
        }

        // Simulate progress bar going from 0 to 95%
        // The remaining 5% will just jump to 100 when the page unmounts/redirects
        const interval = setInterval(() => {
            setProgress(prev => {
                // Slower progress as it gets closer to 95
                if (prev < 50) return prev + 2;
                if (prev < 80) return prev + 1;
                if (prev < 95) return prev + 0.5;
                return 95;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="!m-0 fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Lottie Animation */}
            <div className="w-48 h-48 md:w-56 md:h-56 mb-6 relative">
                {animationData && (
                    <Lottie
                        animationData={animationData}
                        loop={true}
                        autoplay={true}
                        style={{ width: '100%', height: '100%' }}
                    />
                )}
            </div>

            {/* Content */}
            <div className="w-full max-w-sm px-6 flex flex-col items-center text-center">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2 tracking-wide">
                    Menganalisa Dokumen
                </h2>
                <p className="text-sm text-slate-500 mb-8 font-light tracking-wide">
                    AI sedang memproses dan mengekstrak data.
                </p>

                {/* Progress Bar Container - Very Minimal */}
                <div className="w-full h-1 bg-slate-100 overflow-hidden mb-3">
                    {/* The Fill */}
                    <div 
                        className="h-full bg-primary transition-all duration-300 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                    </div>
                </div>

                <div className="flex justify-between w-full text-[11px] uppercase tracking-widest font-semibold text-slate-400">
                    <span>Memproses</span>
                    <span className="text-primary">{Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    );
}
