<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * LoginRequest
 *
 * Form Request untuk validasi input login user.
 *
 * Fungsi file ini:
 * - Memvalidasi input email, password, dan remember dari form login
 * - Memastikan email dalam format yang benar
 * - Memastikan password diisi
 *
 * Cara kerja:
 * 1. Menerima data dari form login (email, password, remember)
 * 2. Menjalankan validasi sesuai rules yang didefinisikan
 * 3. Jika valid, data bisa digunakan oleh AuthController
 * 4. Jika tidak valid, return error ke frontend
 *
 * Digunakan oleh: AuthController->login()
 */
class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Otorisasi request:
     * Login adalah public endpoint, semua orang boleh akses.
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
     * - email: wajib diisi, harus format email yang valid
     * - password: wajib diisi, harus berupa string
     * - remember: opsional, harus berupa boolean (true/false)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * Pesan error dalam Bahasa Indonesia untuk user experience yang lebih baik.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
            'password.string' => 'Password harus berupa teks.',
            'remember.boolean' => 'Nilai remember harus berupa true atau false.',
        ];
    }
}
