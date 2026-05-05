<?php

namespace App\Http\Requests\Approver;

use Illuminate\Foundation\Http\FormRequest;

/**
 * RejectRequestRequest
 *
 * Form Request untuk validasi reject request.
 *
 * Fungsi:
 * - Validasi input dari approver saat reject request
 * - Reason wajib diisi (minimal 10 karakter)
 *
 * Rules:
 * - reason: required, string, min 10, max 500 karakter
 *
 * Digunakan oleh: ApprovalController@reject
 */
class RejectRequestRequest extends FormRequest
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
            'reason' => ['required', 'string', 'min:10', 'max:500'],
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
            'reason.required' => 'Alasan penolakan wajib diisi.',
            'reason.string' => 'Alasan penolakan harus berupa teks.',
            'reason.min' => 'Alasan penolakan minimal 10 karakter.',
            'reason.max' => 'Alasan penolakan maksimal 500 karakter.',
        ];
    }
}
