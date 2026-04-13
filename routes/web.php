<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Route untuk testing Inertia + React setup
 */
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'message' => 'Selamat datang di Mall Approval System! Setup Laravel + Inertia + React berhasil.',
    ]);
});
