<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CreateUserRequest;
use App\Http\Requests\Auth\UpdateUserRequest;
use App\Models\User;
use App\Services\Auth\AuthService;
use App\Services\Auth\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * UserController
 *
 * Fungsi file ini:
 * - Mengelola CRUD user oleh Super Admin
 * - Bertanggung jawab untuk create, read, update, deactivate/activate user
 * - Delegasi logika bisnis ke AuthService (controller tetap tipis)
 * - Mencatat semua aktivitas user management ke audit trail
 *
 * Cara kerja:
 * 1. Menerima request dari Super Admin untuk manage users
 * 2. Validasi input menggunakan Form Request
 * 3. Delegasikan logika bisnis ke AuthService
 * 4. Log aktivitas ke AuditLogService
 * 5. Return response ke frontend (Inertia) atau redirect dengan flash message
 *
 * Digunakan oleh: Routes di web.php (admin routes)
 */
class UserController extends Controller
{
    /**
     * Constructor
     *
     * Inject dependencies yang dibutuhkan controller ini.
     * AuthService untuk logika user management, AuditLogService untuk logging.
     */
    public function __construct(
        protected AuthService $authService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * index
     *
     * Apa yang dilakukan fungsi ini:
     * Menampilkan daftar semua user dengan pagination.
     *
     * Cara kerjanya:
     * 1. Ambil semua user dari database dengan pagination (15 per halaman)
     * 2. Eager load relasi vendor untuk menampilkan data perusahaan
     * 3. Render halaman Admin/Users/Index dengan Inertia
     *
     * @return Response — Inertia response untuk render halaman list users
     */
    public function index(): Response
    {
        // Ambil semua user dengan pagination dan eager load vendor
        $users = User::with('vendor')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * create
     *
     * Apa yang dilakukan fungsi ini:
     * Menampilkan form untuk membuat user baru.
     *
     * Cara kerjanya:
     * 1. Render halaman Admin/Users/Create dengan Inertia
     * 2. Passing daftar role yang bisa dipilih ke frontend
     *
     * @return Response — Inertia response untuk render halaman create user
     */
    public function create(): Response
    {
        // Daftar role yang bisa dibuat oleh Super Admin
        $roles = [
            ['value' => 'approver_dept', 'label' => 'Approver Department'],
            ['value' => 'approver_ops', 'label' => 'Approver Operations'],
            ['value' => 'approver_finance', 'label' => 'Approver Finance'],
            ['value' => 'approver_gm', 'label' => 'Approver GM'],
            ['value' => 'security', 'label' => 'Security'],
        ];

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * store
     *
     * Apa yang dilakukan fungsi ini:
     * Memproses pembuatan user baru oleh Super Admin.
     *
     * Cara kerjanya:
     * 1. Terima dan validasi input dari CreateUserRequest (email, password, role)
     * 2. Panggil AuthService->createUser() untuk buat user baru
     * 3. Log aktivitas create user ke audit trail
     * 4. Redirect ke halaman list users dengan flash message sukses
     *
     * @param CreateUserRequest $request — request yang sudah divalidasi
     * @return RedirectResponse — redirect ke halaman list users
     */
    public function store(CreateUserRequest $request): RedirectResponse
    {
        // Buat user baru menggunakan AuthService
        $user = $this->authService->createUser($request->validated());

        // Log aktivitas create user ke audit trail
        $this->auditLogService->logCreateUser(auth()->user(), $user);

        // Redirect ke list users dengan pesan sukses
        return redirect()->route('admin.users.index')->with('success', 'User berhasil dibuat.');
    }

    /**
     * edit
     *
     * Apa yang dilakukan fungsi ini:
     * Menampilkan form untuk edit user.
     *
     * Cara kerjanya:
     * 1. Ambil data user berdasarkan ID
     * 2. Render halaman Admin/Users/Edit dengan Inertia
     * 3. Passing data user dan daftar role ke frontend
     *
     * @param User $user — user yang akan diedit (route model binding)
     * @return Response — Inertia response untuk render halaman edit user
     */
    public function edit(User $user): Response
    {
        // Daftar role yang bisa dipilih
        $roles = [
            ['value' => 'super_admin', 'label' => 'Super Admin'],
            ['value' => 'vendor', 'label' => 'Vendor'],
            ['value' => 'approver_dept', 'label' => 'Approver Department'],
            ['value' => 'approver_ops', 'label' => 'Approver Operations'],
            ['value' => 'approver_finance', 'label' => 'Approver Finance'],
            ['value' => 'approver_gm', 'label' => 'Approver GM'],
            ['value' => 'security', 'label' => 'Security'],
        ];

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * update
     *
     * Apa yang dilakukan fungsi ini:
     * Memproses update data user oleh Super Admin.
     *
     * Cara kerjanya:
     * 1. Terima dan validasi input dari UpdateUserRequest (email, password, role, is_active)
     * 2. Panggil AuthService->updateUser() untuk update user
     * 3. Log aktivitas update user ke audit trail
     * 4. Redirect ke halaman list users dengan flash message sukses
     *
     * @param UpdateUserRequest $request — request yang sudah divalidasi
     * @param User $user — user yang akan diupdate (route model binding)
     * @return RedirectResponse — redirect ke halaman list users
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        // Update user menggunakan AuthService
        $this->authService->updateUser($user, $request->validated());

        // Log aktivitas update user ke audit trail
        $this->auditLogService->logUpdateUser(auth()->user(), $user);

        // Redirect ke list users dengan pesan sukses
        return redirect()->route('admin.users.index')->with('success', 'User berhasil diupdate.');
    }

    /**
     * destroy
     *
     * Apa yang dilakukan fungsi ini:
     * Menonaktifkan user (soft deactivate, tidak delete dari database).
     *
     * Cara kerjanya:
     * 1. Panggil AuthService->deactivateUser() untuk set is_active = false
     * 2. Log aktivitas deactivate user ke audit trail
     * 3. Redirect ke halaman list users dengan flash message sukses
     *
     * @param User $user — user yang akan dinonaktifkan (route model binding)
     * @return RedirectResponse — redirect ke halaman list users
     */
    public function destroy(User $user): RedirectResponse
    {
        // Deactivate user menggunakan AuthService
        $this->authService->deactivateUser($user);

        // Log aktivitas deactivate user ke audit trail
        $this->auditLogService->logDeactivateUser(auth()->user(), $user);

        // Redirect ke list users dengan pesan sukses
        return redirect()->route('admin.users.index')->with('success', 'User berhasil dinonaktifkan.');
    }

    /**
     * activate
     *
     * Apa yang dilakukan fungsi ini:
     * Mengaktifkan kembali user yang sudah dinonaktifkan.
     *
     * Cara kerjanya:
     * 1. Panggil AuthService->activateUser() untuk set is_active = true
     * 2. Log aktivitas activate user ke audit trail
     * 3. Redirect ke halaman list users dengan flash message sukses
     *
     * @param User $user — user yang akan diaktifkan (route model binding)
     * @return RedirectResponse — redirect ke halaman list users
     */
    public function activate(User $user): RedirectResponse
    {
        // Activate user menggunakan AuthService
        $this->authService->activateUser($user);

        // Log aktivitas activate user ke audit trail
        $this->auditLogService->logActivateUser(auth()->user(), $user);

        // Redirect ke list users dengan pesan sukses
        return redirect()->route('admin.users.index')->with('success', 'User berhasil diaktifkan.');
    }
}
