<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

/**
 * SubmitSikmRequest
 *
 * Form Request untuk validasi submit surat SIKMB (Barang Masuk/Keluar).
 *
 * Validation rules:
 * - vendor_id: required, exists di vendors table
 * - request_type: required, LOADING_IN atau LOADING_OUT
 * - document_serial_no: required, unique di requests table
 * - start_date & end_date: required, valid date, end >= start
 * - start_time & end_time: required, valid time
 * - dest_address & dest_phone: required
 * - items: required, array, minimal 1 item
 * - items.*.item_name: required
 * - items.*.quantity: required, integer, min 1
 * - items.*.unit: required
 * - original_form_image: optional, image, max 5MB
 */
class SubmitSikmRequest extends FormRequest
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
            'request_type' => ['required', 'in:LOADING_IN,LOADING_OUT'],
            'sop_form_code' => ['nullable', 'string', 'max:50'],
            'document_serial_no' => ['required', 'string', 'max:50', 'unique:requests,document_serial_no'],
            'original_form_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:5120'], // 5MB
            
            // SIKMB Details
            'origin_floor' => ['nullable', 'string', 'max:50'],
            'origin_unit' => ['nullable', 'string', 'max:100'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'dest_address' => ['required', 'string', 'max:500'],
            'dest_floor' => ['nullable', 'string', 'max:50'],
            'dest_phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
            
            // SIKMB Items
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.item_name' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit' => ['required', 'string', 'max:50'],
            'items.*.remarks' => ['nullable', 'string', 'max:500'],
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
            'request_type.required' => 'Tipe surat wajib dipilih.',
            'request_type.in' => 'Tipe surat harus LOADING_IN atau LOADING_OUT.',
            'document_serial_no.required' => 'Nomor seri dokumen wajib diisi.',
            'document_serial_no.unique' => 'Nomor seri dokumen sudah digunakan.',
            'original_form_image.image' => 'File harus berupa gambar.',
            'original_form_image.mimes' => 'Format gambar harus JPG atau PNG.',
            'original_form_image.max' => 'Ukuran gambar maksimal 5MB.',
            
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.after_or_equal' => 'Tanggal mulai tidak boleh kurang dari hari ini.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh kurang dari tanggal mulai.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'dest_address.required' => 'Alamat tujuan wajib diisi.',
            'dest_phone.required' => 'Nomor telepon tujuan wajib diisi.',
            'dest_phone.regex' => 'Format nomor telepon tidak valid.',
            
            'items.required' => 'Daftar barang wajib diisi.',
            'items.min' => 'Minimal harus ada 1 barang.',
            'items.max' => 'Maksimal 50 barang per surat.',
            'items.*.item_name.required' => 'Nama barang wajib diisi.',
            'items.*.quantity.required' => 'Jumlah barang wajib diisi.',
            'items.*.quantity.min' => 'Jumlah barang minimal 1.',
            'items.*.unit.required' => 'Satuan barang wajib diisi.',
        ];
    }
}
