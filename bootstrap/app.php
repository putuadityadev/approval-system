<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        // Daftarkan middleware alias untuk role-based access control, email verification, dan active status check
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'active' => \App\Http\Middleware\EnsureActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
