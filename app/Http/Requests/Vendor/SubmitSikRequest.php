<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

/**
 * SubmitSikRequest
 *
 * Form Request untuk validasi submit surat SIK (Izin Kerja).
 *
 * Validation rules:
 * - vendor_id: required, exists di vendors table
 * - document_serial_no: required, unique di requests table
 * - worker_count: required, integer, min 1
 * - start_date & end_date: required, valid date, end >= start
 * - start_time & end_time: required, valid time
 * - location: required
 * - job_type: required
 * - original_form_image: optional, image, max 5MB
 */
class SubmitSikRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Hanya vendor yang bisa submit
        return auth()->check() && auth()->user()->isVendor();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vendor_id' => ['required', 'exists:vendors,id'],
            'sop_form_code' => ['nullable', 'string', 'max:50'],
            'document_serial_no' => ['required', 'string', 'max:50', 'unique:requests,document_serial_no'],
            'original_form_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:5120'], // 5MB
            
            // SIK Details
            'worker_count' => ['required', 'integer', 'min:1', 'max:100'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'location' => ['required', 'string', 'max:255'],
            'job_type' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'vendor_id.required' => 'Vendor ID wajib diisi.',
            'vendor_id.exists' => 'Vendor tidak ditemukan.',
            'document_serial_no.required' => 'Nomor seri dokumen wajib diisi.',
            'document_serial_no.unique' => 'Nomor seri dokumen sudah digunakan.',
            'original_form_image.image' => 'File harus berupa gambar.',
            'original_form_image.mimes' => 'Format gambar harus JPG atau PNG.',
            'original_form_image.max' => 'Ukuran gambar maksimal 5MB.',
            
            'worker_count.required' => 'Jumlah pekerja wajib diisi.',
            'worker_count.min' => 'Jumlah pekerja minimal 1 orang.',
            'worker_count.max' => 'Jumlah pekerja maksimal 100 orang.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.after_or_equal' => 'Tanggal mulai tidak boleh kurang dari hari ini.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh kurang dari tanggal mulai.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'location.required' => 'Lokasi pekerjaan wajib diisi.',
            'job_type.required' => 'Jenis pekerjaan wajib diisi.',
        ];
    }
}
