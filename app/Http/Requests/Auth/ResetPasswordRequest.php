<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ResetPasswordRequest
 *
 * Form Request untuk validasi input reset password (ubah password baru).
 *
 * Fungsi file ini:
 * - Memvalidasi input token, email, password, dan password_confirmation dari form reset password
 * - Memastikan token reset password valid (dikirim dari email)
 * - Memastikan email terdaftar di database
 * - Memastikan password baru memenuhi kriteria keamanan (minimal 8 karakter)
 * - Memastikan password dan konfirmasi password cocok
 *
 * Cara kerja:
 * 1. Menerima data dari form reset password (token, email, password, password_confirmation)
 * 2. Menjalankan validasi sesuai rules yang didefinisikan
 * 3. Jika valid, data bisa digunakan untuk update password user di database
 * 4. Jika tidak valid, return error ke frontend dengan pesan Bahasa Indonesia
 *
 * Digunakan oleh: PasswordResetController->resetPassword()
 */
class ResetPasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Otorisasi request:
     * Reset password adalah public endpoint, semua orang yang punya token valid boleh akses.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules validasi:
     * - token: wajib diisi, harus berupa string (token dari email reset password)
     * - email: wajib diisi, harus format email yang valid, harus terdaftar di table users
     * - password: wajib diisi, harus berupa string, minimal 8 karakter, harus ada konfirmasi (confirmed)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * Pesan error dalam Bahasa Indonesia untuk user experience yang lebih baik.
     * Setiap field memiliki pesan yang jelas dan membantu user memahami masalahnya.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'token.required' => 'Token reset password wajib ada.',
            'token.string' => 'Token reset password harus berupa teks.',
            
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.exists' => 'Email tidak terdaftar di sistem.',
            
            'password.required' => 'Password baru wajib diisi.',
            'password.string' => 'Password harus berupa teks.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ];
    }
}
