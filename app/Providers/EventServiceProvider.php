<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

/**
 * EventServiceProvider
 *
 * Mendaftarkan semua event-listener mapping untuk mailing system.
 *
 * Event Flow:
 * - RequestSubmitted → Vendor konfirmasi + Notify Dept Approver
 * - RequestApproved → Vendor progress + Notify Next Approver + Notify Security (final)
 * - RequestRejected → Vendor rejection notice
 * - RequestCancelled → Notify current Approver
 * - RequestExecuted → Vendor execution confirmation
 */
class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Vendor submit surat baru
        \App\Events\RequestSubmitted::class => [
            \App\Listeners\SendVendorSubmissionConfirmation::class,
            \App\Listeners\NotifyApproverNewPending::class,
        ],

        // Approver approve surat (setiap level)
        \App\Events\RequestApproved::class => [
            \App\Listeners\SendVendorApprovalProgress::class,
            \App\Listeners\NotifyNextApprover::class,
            \App\Listeners\NotifySecurityOnApproval::class,
        ],

        // Approver reject surat
        \App\Events\RequestRejected::class => [
            \App\Listeners\SendVendorRejectionNotice::class,
        ],

        // Vendor cancel surat
        \App\Events\RequestCancelled::class => [
            \App\Listeners\NotifyApproverOnCancel::class,
        ],

        // Security verifikasi selesai
        \App\Events\RequestExecuted::class => [
            \App\Listeners\SendVendorExecutionConfirmation::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
