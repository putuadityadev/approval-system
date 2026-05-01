<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * EmailVerificationControllerTest
 *
 * Test suite untuk EmailVerificationController.
 * Memastikan semua fitur email verification berfungsi dengan benar.
 *
 * Test cases:
 * 1. User dapat melihat halaman verification notice
 * 2. User yang sudah verified redirect ke dashboard
 * 3. User dapat verify email dengan signed URL yang valid
 * 4. User tidak dapat verify dengan signed URL yang invalid
 * 5. User dapat resend email verification
 * 6. Email verification dicatat ke audit trail
 */
class EmailVerificationControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user dapat melihat halaman verification notice
     */
    public function test_user_can_view_verification_notice(): void
    {
        // Buat user yang belum verified
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Akses halaman verification notice
        $response = $this->get(route('verification.notice'));

        // Assert response OK dan render komponen yang benar
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Auth/VerifyEmail'));
    }

    /**
     * Test user yang sudah verified redirect ke dashboard
     */
    public function test_verified_user_redirects_to_dashboard(): void
    {
        // Buat user requester yang sudah verified
        $user = User::factory()->create([
            'role' => 'requester',
            'email_verified_at' => now(),
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Akses halaman verification notice
        $response = $this->get(route('verification.notice'));

        // Assert redirect ke requester dashboard
        $response->assertRedirect(route('requester.dashboard'));
    }

    /**
     * Test admin yang sudah verified redirect ke admin dashboard
     */
    public function test_verified_admin_redirects_to_admin_dashboard(): void
    {
        // Buat user admin yang sudah verified
        $user = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Akses halaman verification notice
        $response = $this->get(route('verification.notice'));

        // Assert redirect ke admin dashboard
        $response->assertRedirect(route('admin.dashboard'));
    }

    /**
     * Test user dapat verify email dengan signed URL yang valid
     */
    public function test_user_can_verify_email_with_valid_signed_url(): void
    {
        // Buat user yang belum verified
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Generate signed URL untuk verifikasi
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        // Akses URL verifikasi
        $response = $this->get($verificationUrl);

        // Assert user berhasil verified
        $this->assertNotNull($user->fresh()->email_verified_at);

        // Assert redirect ke dashboard
        $response->assertRedirect(route('requester.dashboard'));
        $response->assertSessionHas('success', 'Email berhasil diverifikasi. Selamat datang!');

        // Assert audit log tercatat
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'action' => 'email_verification',
        ]);
    }

    /**
     * Test user tidak dapat verify dengan signed URL yang invalid
     */
    public function test_user_cannot_verify_with_invalid_signed_url(): void
    {
        // Buat user yang belum verified
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Buat URL verifikasi tanpa signature (invalid)
        $invalidUrl = route('verification.verify', ['id' => $user->id, 'hash' => sha1($user->email)]);

        // Akses URL verifikasi invalid
        $response = $this->get($invalidUrl);

        // Assert user tidak verified
        $this->assertNull($user->fresh()->email_verified_at);

        // Assert response forbidden atau redirect
        $response->assertStatus(403);
    }

    /**
     * Test user yang sudah verified tidak perlu verify lagi
     */
    public function test_already_verified_user_redirects_to_dashboard(): void
    {
        // Buat user yang sudah verified
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Generate signed URL untuk verifikasi
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        // Akses URL verifikasi
        $response = $this->get($verificationUrl);

        // Assert redirect ke dashboard tanpa proses verifikasi lagi
        $response->assertRedirect(route('requester.dashboard'));

        // Assert tidak ada audit log baru (karena sudah verified)
        $this->assertDatabaseMissing('audit_logs', [
            'user_id' => $user->id,
            'action' => 'email_verification',
        ]);
    }

    /**
     * Test user dapat resend email verification
     */
    public function test_user_can_resend_verification_email(): void
    {
        // Buat user yang belum verified
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Resend email verification
        $response = $this->post(route('verification.send'));

        // Assert redirect kembali dengan status sukses
        $response->assertRedirect();
        $response->assertSessionHas('status', 'Link verifikasi telah dikirim ulang ke email Anda. Silakan cek inbox atau folder spam.');
    }

    /**
     * Test user yang sudah verified tidak bisa resend
     */
    public function test_verified_user_cannot_resend_verification_email(): void
    {
        // Buat user yang sudah verified
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        // Login sebagai user
        $this->actingAs($user);

        // Coba resend email verification
        $response = $this->post(route('verification.send'));

        // Assert redirect ke dashboard
        $response->assertRedirect(route('requester.dashboard'));
    }

    /**
     * Test guest tidak dapat akses email verification routes
     */
    public function test_guest_cannot_access_verification_routes(): void
    {
        // Coba akses verification notice tanpa login
        $response = $this->get(route('verification.notice'));

        // Assert redirect ke login
        $response->assertRedirect(route('login'));
    }
}
