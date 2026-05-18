#!/bin/sh
set -e

echo "🚀 Starting Mall Approval System..."

# Wait for MySQL to be ready
echo "⏳ Waiting for database connection..."
until php artisan db:show > /dev/null 2>&1; do
    sleep 2
done
echo "✅ Database connected!"

# Laravel bootstrap
echo "⚙️  Running Laravel optimizations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "🗄️  Running migrations..."
php artisan migrate --force

echo "🌱 Running seeders (idempotent)..."
php artisan db:seed --class=DatabaseSeeder --force 2>/dev/null || true

# Set storage permissions
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "🎯 Starting services via Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
