<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ForgotPasswordRequest
 *
 * Form Request untuk validasi input forgot password (lupa password).
 *
 * Fungsi file ini:
 * - Memvalidasi input email dari form forgot password
 * - Memastikan email dalam format yang benar
 * - Memastikan email terdaftar di database (exists di table users)
 *
 * Cara kerja:
 * 1. Menerima data email dari form forgot password
 * 2. Menjalankan validasi sesuai rules yang didefinisikan
 * 3. Jika valid, email bisa digunakan untuk generate token reset password
 * 4. Jika tidak valid, return error ke frontend dengan pesan Bahasa Indonesia
 *
 * Digunakan oleh: PasswordResetController->sendResetLink()
 */
class ForgotPasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Otorisasi request:
     * Forgot password adalah public endpoint, semua orang boleh akses.
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
     * - email: wajib diisi, harus format email yang valid, harus terdaftar di table users
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'exists:users,email'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * Pesan error dalam Bahasa Indonesia untuk user experience yang lebih baik.
     * Pesan dibuat jelas dan membantu user memahami masalahnya.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.exists' => 'Email tidak terdaftar di sistem. Silakan periksa kembali atau daftar akun baru.',
        ];
    }
}
