<?php

namespace App\Http\Requests\Approver;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ApproveRequestRequest
 *
 * Form Request untuk validasi approve request.
 *
 * Fungsi:
 * - Validasi input dari approver saat approve request
 * - Notes bersifat optional tapi recommended
 *
 * Rules:
 * - notes: optional, string, max 500 karakter
 *
 * Digunakan oleh: ApprovalController@approve
 */
class ApproveRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization check dilakukan di controller
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'notes.string' => 'Catatan harus berupa teks.',
            'notes.max' => 'Catatan maksimal 500 karakter.',
        ];
    }
}
