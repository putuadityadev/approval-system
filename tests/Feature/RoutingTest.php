<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * RoutingTest
 *
 * Fungsi file ini:
 * - Test semua routing setup untuk memastikan role-based access berfungsi dengan benar
 * - Test rate limiting untuk login dan password reset
 * - Test redirect behavior untuk root route
 *
 * Test cases:
 * 1. Root route redirect behavior (guest vs authenticated)
 * 2. Guest routes accessibility
 * 3. Authenticated routes accessibility
 * 4. Admin routes dengan role-based access
 * 5. Requester routes dengan role-based access
 * 6. Rate limiting untuk login dan password reset
 */
class RoutingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test root route redirect ke login jika guest
     */
    public function test_root_route_redirects_to_login_for_guest(): void
    {
        $response = $this->get('/');

        $response->assertRedirect(route('login'));
    }

    /**
     * Test root route redirect ke admin dashboard jika user adalah admin
     */
    public function test_root_route_redirects_to_admin_dashboard_for_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/');

        $response->assertRedirect(route('admin.dashboard'));
    }

    /**
     * Test root route redirect ke requester dashboard jika user adalah requester
     */
    public function test_root_route_redirects_to_requester_dashboard_for_requester(): void
    {
        $requester = User::factory()->create(['role' => 'requester']);

        $response = $this->actingAs($requester)->get('/');

        $response->assertRedirect(route('requester.dashboard'));
    }

    /**
     * Test guest dapat akses halaman login
     */
    public function test_guest_can_access_login_page(): void
    {
        $response = $this->get(route('login'));

        $response->assertStatus(200);
    }

    /**
     * Test guest dapat akses halaman register
     */
    public function test_guest_can_access_register_page(): void
    {
        $response = $this->get(route('register'));

        $response->assertStatus(200);
    }

    /**
     * Test guest dapat akses halaman forgot password
     */
    public function test_guest_can_access_forgot_password_page(): void
    {
        $response = $this->get(route('password.request'));

        $response->assertStatus(200);
    }

    /**
     * Test authenticated user tidak bisa akses guest routes (redirect ke dashboard)
     */
    public function test_authenticated_user_cannot_access_guest_routes(): void
    {
        $user = User::factory()->create(['role' => 'requester']);

        $response = $this->actingAs($user)->get(route('login'));

        // Laravel guest middleware akan redirect ke home, yang kemudian redirect ke dashboard
        $response->assertRedirect();
    }

    /**
     * Test admin dapat akses admin dashboard
     */
    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
    }

    /**
     * Test requester tidak dapat akses admin dashboard (403 Forbidden)
     */
    public function test_requester_cannot_access_admin_dashboard(): void
    {
        $requester = User::factory()->create(['role' => 'requester']);

        $response = $this->actingAs($requester)->get(route('admin.dashboard'));

        $response->assertStatus(403);
    }

    /**
     * Test requester dapat akses requester dashboard
     */
    public function test_requester_can_access_requester_dashboard(): void
    {
        $requester = User::factory()->create(['role' => 'requester']);

        $response = $this->actingAs($requester)->get(route('requester.dashboard'));

        $response->assertStatus(200);
    }

    /**
     * Test admin tidak dapat akses requester dashboard (403 Forbidden)
     */
    public function test_admin_cannot_access_requester_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('requester.dashboard'));

        $response->assertStatus(403);
    }

    /**
     * Test guest tidak dapat akses protected routes (redirect ke login)
     */
    public function test_guest_cannot_access_protected_routes(): void
    {
        // Test admin dashboard
        $response = $this->get(route('admin.dashboard'));
        $response->assertRedirect(route('login'));

        // Test requester dashboard
        $response = $this->get(route('requester.dashboard'));
        $response->assertRedirect(route('login'));
    }

    /**
     * Test rate limiting untuk login (5 attempts per menit)
     */
    public function test_login_has_rate_limiting(): void
    {
        // Buat 6 login attempts (lebih dari limit 5)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->post(route('login.post'), [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);

            // 5 request pertama harus dapat response normal (422 validation error)
            // Request ke-6 harus dapat 429 Too Many Requests
            if ($i < 5) {
                $this->assertNotEquals(429, $response->status());
            } else {
                $response->assertStatus(429);
            }
        }
    }

    /**
     * Test rate limiting untuk password reset (3 requests per jam)
     */
    public function test_password_reset_has_rate_limiting(): void
    {
        // Buat user untuk testing
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Buat 4 password reset requests (lebih dari limit 3)
        for ($i = 0; $i < 4; $i++) {
            $response = $this->post(route('password.email'), [
                'email' => $user->email,
            ]);

            // 3 request pertama harus dapat response normal (redirect back)
            // Request ke-4 harus dapat 429 Too Many Requests
            if ($i < 3) {
                $this->assertNotEquals(429, $response->status());
            } else {
                $response->assertStatus(429);
            }
        }
    }

    /**
     * Test logout route hanya bisa diakses oleh authenticated user
     */
    public function test_logout_requires_authentication(): void
    {
        $response = $this->post(route('logout'));

        $response->assertRedirect(route('login'));
    }

    /**
     * Test authenticated user dapat logout
     */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    /**
     * Test email verification routes ada dan accessible
     */
    public function test_email_verification_routes_exist(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        // Test verification notice route
        $response = $this->actingAs($user)->get(route('verification.notice'));
        $response->assertStatus(200);

        // Test resend verification route
        $response = $this->actingAs($user)->post(route('verification.send'));
        $response->assertStatus(302); // Redirect back dengan status
    }
}
