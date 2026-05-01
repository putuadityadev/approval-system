<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * CreateUserRequest
 *
 * Form Request untuk validasi input pembuatan user baru oleh Super Admin.
 *
 * Fungsi file ini:
 * - Memvalidasi input untuk membuat user dengan role tertentu (approver_dept, approver_ops, approver_finance, approver_gm, security)
 * - Memastikan email belum terdaftar di database (unique)
 * - Memastikan password memenuhi kriteria keamanan (minimal 8 karakter)
 * - Memvalidasi role yang dipilih sesuai dengan role yang diizinkan
 *
 * Cara kerja:
 * 1. Menerima data dari form create user (email, password, role)
 * 2. Menjalankan validasi sesuai rules yang didefinisikan
 * 3. Jika valid, data bisa digunakan oleh UserController untuk membuat user baru
 * 4. Jika tidak valid, return error ke frontend dengan pesan Bahasa Indonesia
 *
 * Digunakan oleh: UserController->store()
 */
class CreateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Otorisasi request:
     * Hanya Super Admin yang boleh membuat user baru.
     * Middleware sudah handle ini, jadi return true.
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
     * - email: wajib diisi, harus format email yang valid, harus unique di table users
     * - password: wajib diisi, harus berupa string, minimal 8 karakter, harus ada konfirmasi (confirmed)
     * - role: wajib diisi, harus salah satu dari role yang diizinkan (approver_dept, approver_ops, approver_finance, approver_gm, security)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['approver_dept', 'approver_ops', 'approver_finance', 'approver_gm', 'security'])],
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
            'email.unique' => 'Email sudah terdaftar. Silakan gunakan email lain.',
            
            'password.required' => 'Password wajib diisi.',
            'password.string' => 'Password harus berupa teks.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            
            'role.required' => 'Role wajib dipilih.',
            'role.in' => 'Role yang dipilih tidak valid. Pilih salah satu: Approver Dept, Approver Ops, Approver Finance, Approver GM, atau Security.',
        ];
    }
}
