<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * Tampilkan halaman My Documents
     */
    public function index()
    {
        // Placeholder untuk fitur master dokumen vendor jika nanti diperlukan
        return Inertia::render('Vendor/Documents/Index', [
            'documents' => []
        ]);
    }
}
