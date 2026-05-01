<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * RegisterRequest
 *
 * Form Request untuk validasi input registrasi user baru (Vendor).
 *
 * Fungsi file ini:
 * - Memvalidasi input registrasi vendor termasuk data perusahaan
 * - Memastikan email belum terdaftar di database (unique)
 * - Memastikan password memenuhi kriteria keamanan (minimal 8 karakter)
 * - Memvalidasi data perusahaan (company_name, pic_name, pic_phone, address)
 *
 * Cara kerja:
 * 1. Menerima data dari form registrasi vendor (email, password, company_name, pic_name, pic_phone, address)
 * 2. Menjalankan validasi sesuai rules yang didefinisikan
 * 3. Jika valid, data bisa digunakan oleh AuthController untuk membuat user vendor + data perusahaan
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
     * - email: wajib diisi, harus format email yang valid, harus unique di table users
     * - password: wajib diisi, harus berupa string, minimal 8 karakter, harus ada konfirmasi (confirmed)
     * - company_name: wajib diisi, nama perusahaan vendor, maksimal 255 karakter
     * - pic_name: wajib diisi, nama PIC (Person In Charge) vendor, maksimal 255 karakter
     * - pic_phone: wajib diisi, nomor telepon PIC, maksimal 20 karakter
     * - address: wajib diisi, alamat perusahaan vendor, berupa text
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'company_name' => ['required', 'string', 'max:255'],
            'pic_name' => ['required', 'string', 'max:255'],
            'pic_phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string'],
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
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
            
            'password.required' => 'Password wajib diisi.',
            'password.string' => 'Password harus berupa teks.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            
            'company_name.required' => 'Nama perusahaan wajib diisi.',
            'company_name.string' => 'Nama perusahaan harus berupa teks.',
            'company_name.max' => 'Nama perusahaan tidak boleh lebih dari 255 karakter.',
            
            'pic_name.required' => 'Nama PIC wajib diisi.',
            'pic_name.string' => 'Nama PIC harus berupa teks.',
            'pic_name.max' => 'Nama PIC tidak boleh lebih dari 255 karakter.',
            
            'pic_phone.required' => 'Nomor telepon PIC wajib diisi.',
            'pic_phone.string' => 'Nomor telepon PIC harus berupa teks.',
            'pic_phone.max' => 'Nomor telepon PIC tidak boleh lebih dari 20 karakter.',
            
            'address.required' => 'Alamat perusahaan wajib diisi.',
            'address.string' => 'Alamat perusahaan harus berupa teks.',
        ];
    }
}
