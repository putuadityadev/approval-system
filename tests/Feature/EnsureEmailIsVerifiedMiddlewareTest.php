<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * EnsureEmailIsVerifiedMiddlewareTest
 *
 * Test suite untuk middleware EnsureEmailIsVerified.
 *
 * Apa yang ditest:
 * - User dengan email verified dapat mengakses route yang dilindungi
 * - User dengan email belum verified akan di-redirect ke verification notice
 * - Guest user tidak terpengaruh oleh middleware ini (handled by auth middleware)
 *
 * Cara kerja test:
 * 1. Setup user dengan berbagai kondisi email verification
 * 2. Simulasi request ke route yang dilindungi middleware
 * 3. Assert response sesuai dengan kondisi user
 */
class EnsureEmailIsVerifiedMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: User dengan email verified dapat mengakses route
     *
     * Scenario:
     * 1. Buat user dengan email_verified_at terisi
     * 2. Login sebagai user tersebut
     * 3. Akses route yang dilindungi middleware 'verified'
     * 4. Expect: dapat mengakses route (status 200)
     */
    public function test_user_dengan_email_verified_dapat_mengakses_route(): void
    {
        // Buat user dengan email verified
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Akses route yang dilindungi middleware verified
        // Note: Kita perlu buat route test untuk ini
        $response = $this->get('/test-verified-route');

        // Assert: dapat mengakses route
        $response->assertStatus(200);
    }

    /**
     * Test: User dengan email belum verified di-redirect ke verification notice
     *
     * Scenario:
     * 1. Buat user dengan email_verified_at = null
     * 2. Login sebagai user tersebut
     * 3. Akses route yang dilindungi middleware 'verified'
     * 4. Expect: di-redirect ke /email/verify
     */
    public function test_user_dengan_email_belum_verified_di_redirect(): void
    {
        // Buat user dengan email belum verified
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Akses route yang dilindungi middleware verified
        $response = $this->get('/test-verified-route');

        // Assert: di-redirect ke /email/verify
        $response->assertRedirect('/email/verify');
        $response->assertSessionHas('message', 'Silakan verifikasi email Anda terlebih dahulu.');
    }

    /**
     * Test: Middleware tidak crash ketika user adalah null
     *
     * Scenario:
     * 1. Test bahwa middleware handle null user dengan baik
     * 2. Middleware harus return $next($request) tanpa error
     *
     * Note: Dalam praktik, middleware 'auth' akan dijalankan sebelum 'verified',
     * jadi user tidak akan pernah null. Test ini hanya memastikan defensive programming.
     */
    public function test_middleware_tidak_crash_dengan_null_user(): void
    {
        // Buat route test tanpa middleware 'auth', hanya 'verified'
        $this->app['router']->get('/test-verified-only', function () {
            return response('OK', 200);
        })->middleware(['verified']);

        // Akses route sebagai guest (user = null)
        $response = $this->get('/test-verified-only');

        // Assert: middleware tidak crash, request dilanjutkan
        // Karena user null, middleware akan return $next($request)
        $response->assertStatus(200);
    }

    /**
     * Setup test routes untuk testing middleware
     *
     * Cara kerja:
     * 1. Daftarkan route test yang dilindungi middleware 'auth' dan 'verified'
     * 2. Route ini hanya untuk testing, tidak ada di production
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Daftarkan route test
        $this->app['router']->get('/test-verified-route', function () {
            return response('OK', 200);
        })->middleware(['auth', 'verified']);
    }
}
