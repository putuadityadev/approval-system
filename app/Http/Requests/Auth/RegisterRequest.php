<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * RegisterRequest
 *
 * Form Request untuk validasi input registrasi user baru (Requester).
 *
 * Fungsi file ini:
 * - Memvalidasi input name, email, password, dan password_confirmation dari form registrasi
 * - Memastikan email belum terdaftar di database (unique)
 * - Memastikan password memenuhi kriteria keamanan (minimal 8 karakter)
 * - Memastikan password dan konfirmasi password cocok
 *
 * Cara kerja:
 * 1. Menerima data dari form registrasi (name, email, password, password_confirmation)
 * 2. Menjalankan validasi sesuai rules yang didefinisikan
 * 3. Jika valid, data bisa digunakan oleh AuthController untuk membuat user baru
 * 4. Jika tidak valid, return error ke frontend dengan pesan Bahasa Indonesia
 *
 * Digunakan oleh: AuthController->register()
 */
class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Otorisasi request:
     * Registrasi adalah public endpoint, semua orang boleh akses untuk mendaftar sebagai Requester.
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
     * - name: wajib diisi, harus berupa string, maksimal 255 karakter
     * - email: wajib diisi, harus format email yang valid, harus unique di table users
     * - password: wajib diisi, harus berupa string, minimal 8 karakter, harus ada konfirmasi (confirmed)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * Pesan error dalam Bahasa Indonesia untuk user experience yang lebih baik.
     * Setiap field memiliki pesan yang jelas dan mudah dipahami oleh user.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'name.string' => 'Nama harus berupa teks.',
            'name.max' => 'Nama tidak boleh lebih dari 255 karakter.',
            
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
            
            'password.required' => 'Password wajib diisi.',
            'password.string' => 'Password harus berupa teks.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ];
    }
}
