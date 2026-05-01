import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * useFlashMessage
 *
 * Custom hook untuk mengelola flash message state.
 *
 * Fungsi hook ini:
 * - Mengambil flash message dari Inertia shared props
 * - Auto-hide flash message setelah duration tertentu
 * - Menyediakan fungsi untuk show/hide flash message secara manual
 *
 * Cara kerjanya:
 * 1. Ambil flash message dari usePage().props (success, error, info, warning)
 * 2. Set visible state ke true jika ada message
 * 3. Auto-hide setelah duration (default 5 detik)
 * 4. Sediakan fungsi show() dan hide() untuk kontrol manual
 *
 * @param {number} duration — durasi dalam milidetik sebelum auto-hide (default: 5000)
 *
 * Return:
 * - message: string — isi pesan flash message
 * - type: string — tipe message (success/error/info/warning)
 * - visible: boolean — apakah message sedang ditampilkan
 * - show: function — fungsi untuk menampilkan message
 * - hide: function — fungsi untuk menyembunyikan message
 */
export default function useFlashMessage(duration = 5000) {
    const { success, error, info, warning } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');

    useEffect(() => {
        // Check flash message dari props
        if (success) {
            setMessage(success);
            setType('success');
            setVisible(true);
        } else if (error) {
            setMessage(error);
            setType('error');
            setVisible(true);
        } else if (info) {
            setMessage(info);
            setType('info');
            setVisible(true);
        } else if (warning) {
            setMessage(warning);
            setType('warning');
            setVisible(true);
        }
    }, [success, error, info, warning]);

    useEffect(() => {
        // Auto-hide setelah duration
        if (visible && duration > 0) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, duration);

            // Cleanup timer saat component unmount atau visible berubah
            return () => clearTimeout(timer);
        }
    }, [visible, duration]);

    /**
     * Show flash message secara manual
     * 
     * @param {string} msg — isi pesan
     * @param {string} msgType — tipe message (success/error/info/warning)
     */
    const show = (msg, msgType = 'info') => {
        setMessage(msg);
        setType(msgType);
        setVisible(true);
    };

    /**
     * Hide flash message secara manual
     */
    const hide = () => {
        setVisible(false);
    };

    return {
        message,
        type,
        visible,
        show,
        hide,
    };
}
