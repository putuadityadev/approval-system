/**
 * Welcome
 * 
 * Halaman welcome sederhana untuk testing Inertia + React setup
 * 
 * Props:
 * - message: pesan welcome dari backend
 */

export default function Welcome({ message }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🎉 Laravel + Inertia + React
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {message || 'Setup berhasil!'}
                    </p>
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 font-medium">✅ Laravel 11 - Running</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 font-medium">✅ Inertia.js - Connected</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-purple-800 font-medium">✅ React 18 - Rendering</p>
                        </div>
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                            <p className="text-pink-800 font-medium">✅ Tailwind CSS - Styled</p>
                        </div>
                    </div>
                    <p className="mt-8 text-sm text-gray-500">
                        Authentication System - Mall Approval
                    </p>
                </div>
            </div>
        </div>
    );
}
