<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * UpdateUserRequest
 *
 * Form Request untuk validasi input update user oleh Super Admin.
 *
 * Fungsi file ini:
 * - Memvalidasi input untuk update user (email, password opsional, role, is_active)
 * - Memastikan email unique kecuali untuk user yang sedang diedit
 * - Memvalidasi role yang dipilih sesuai dengan role yang diizinkan
 *
 * Cara kerja:
 * 1. Menerima data dari form edit user (email, password, role, is_active)
 * 2. Menjalankan validasi sesuai rules yang didefinisikan
 * 3. Jika valid, data bisa digunakan oleh UserController untuk update user
 * 4. Jika tidak valid, return error ke frontend dengan pesan Bahasa Indonesia
 *
 * Digunakan oleh: UserController->update()
 */
class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Otorisasi request:
     * Hanya Super Admin yang boleh update user.
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
     * - email: wajib diisi, harus format email yang valid, harus unique kecuali untuk user yang sedang diedit
     * - password: opsional, jika diisi harus minimal 8 karakter dan ada konfirmasi
     * - role: wajib diisi, harus salah satu dari role yang diizinkan
     * - is_active: wajib diisi, harus berupa boolean (true/false)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Ambil user ID dari route parameter
        $userId = $this->route('user');

        return [
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['super_admin', 'vendor', 'approver_dept', 'approver_ops', 'approver_finance', 'approver_gm', 'security'])],
            'is_active' => ['required', 'boolean'],
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
            'email.unique' => 'Email sudah digunakan oleh user lain.',
            
            'password.string' => 'Password harus berupa teks.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            
            'role.required' => 'Role wajib dipilih.',
            'role.in' => 'Role yang dipilih tidak valid.',
            
            'is_active.required' => 'Status aktif wajib dipilih.',
            'is_active.boolean' => 'Status aktif harus berupa true atau false.',
        ];
    }
}
