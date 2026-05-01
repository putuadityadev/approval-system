# UI Components Documentation

Dokumentasi untuk komponen UI primitif yang digunakan di seluruh aplikasi.

## Komponen yang Tersedia

### 1. Button.jsx
Tombol dengan berbagai variant dan loading state.

**Props:**
- `type`: string (default: 'button') — tipe tombol HTML
- `variant`: string (default: 'primary') — variant styling (primary/secondary/danger)
- `disabled`: boolean (default: false) — apakah tombol disabled
- `loading`: boolean (default: false) — apakah tombol dalam state loading
- `children`: node — konten di dalam tombol
- `onClick`: function — fungsi yang dipanggil saat tombol diklik
- `className`: string — class tambahan

**Contoh Penggunaan:**
```jsx
import Button from '@/Components/ui/Button';

// Primary button
<Button onClick={handleSubmit}>
    Simpan
</Button>

// Loading state
<Button loading={processing} type="submit">
    Proses...
</Button>

// Danger variant
<Button variant="danger" onClick={handleDelete}>
    Hapus
</Button>
```

---

### 2. Input.jsx
Input field dengan label dan error handling.

**Props:**
- `type`: string (default: 'text') — tipe input HTML
- `name`: string (required) — nama input
- `value`: string/number — nilai input
- `onChange`: function (required) — fungsi yang dipanggil saat input berubah
- `error`: string — pesan error validasi
- `label`: string — label yang ditampilkan di atas input
- `placeholder`: string — placeholder text
- `required`: boolean (default: false) — apakah input wajib diisi
- `disabled`: boolean (default: false) — apakah input disabled
- `className`: string — class tambahan

**Contoh Penggunaan:**
```jsx
import Input from '@/Components/ui/Input';

// Basic input dengan label
<Input
    type="email"
    name="email"
    label="Email"
    value={data.email}
    onChange={(e) => setData('email', e.target.value)}
    placeholder="nama@example.com"
    required
/>

// Input dengan error
<Input
    type="password"
    name="password"
    label="Password"
    value={data.password}
    onChange={(e) => setData('password', e.target.value)}
    error={errors.password}
    required
/>

// Input disabled
<Input
    name="username"
    label="Username"
    value={user.username}
    disabled
/>
```

---

### 3. Label.jsx
Label untuk input field dengan required indicator.

**Props:**
- `htmlFor`: string (required) — id dari input yang di-label
- `children`: node (required) — text label
- `required`: boolean (default: false) — apakah field wajib diisi
- `className`: string — class tambahan

**Contoh Penggunaan:**
```jsx
import Label from '@/Components/ui/Label';

// Label biasa
<Label htmlFor="name">
    Nama Lengkap
</Label>

// Label dengan required indicator (*)
<Label htmlFor="email" required>
    Email
</Label>
```

**Note:** Komponen Input sudah menggunakan Label secara internal, jadi biasanya tidak perlu import Label secara terpisah kecuali untuk custom form layout.

---

### 4. Alert.jsx
Alert box untuk menampilkan pesan notifikasi.

**Props:**
- `type`: string (default: 'info') — tipe alert (success/error/warning/info)
- `message`: string (required) — pesan yang ditampilkan
- `className`: string — class tambahan

**Contoh Penggunaan:**
```jsx
import Alert from '@/Components/ui/Alert';

// Success alert
<Alert type="success" message="Data berhasil disimpan!" />

// Error alert
<Alert type="error" message="Terjadi kesalahan saat menyimpan data." />

// Warning alert
<Alert type="warning" message="Perhatian: Data akan dihapus permanen." />

// Info alert
<Alert type="info" message="Silakan lengkapi profil Anda." />

// Conditional rendering
{status && <Alert type="success" message={status} />}
```

---

## Contoh Form Lengkap

Berikut contoh penggunaan semua komponen bersama-sama dalam sebuah form:

```jsx
import { useForm } from '@inertiajs/react';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Alert from '@/Components/ui/Alert';

function LoginForm() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success message */}
            {status && <Alert type="success" message={status} />}

            {/* Email input */}
            <Input
                type="email"
                name="email"
                label="Email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                error={errors.email}
                placeholder="nama@example.com"
                required
            />

            {/* Password input */}
            <Input
                type="password"
                name="password"
                label="Password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                error={errors.password}
                placeholder="Masukkan password"
                required
            />

            {/* Submit button */}
            <Button
                type="submit"
                loading={processing}
                className="w-full"
            >
                {processing ? 'Memproses...' : 'Masuk'}
            </Button>
        </form>
    );
}

export default LoginForm;
```

---

## Styling Guidelines

Semua komponen menggunakan Tailwind CSS dengan pola yang konsisten:

- **Colors**: Blue untuk primary, Gray untuk secondary, Red untuk danger/error
- **Spacing**: Padding dan margin yang konsisten (px-3 py-2 untuk input, px-4 py-2 untuk button)
- **Border Radius**: rounded-md untuk semua komponen
- **Focus State**: Ring dengan warna yang sesuai dengan variant
- **Transitions**: Smooth transitions untuk hover dan focus states

## Accessibility

Semua komponen sudah mengikuti best practices accessibility:

- Label terhubung dengan input via `htmlFor` dan `id`
- Error messages memiliki `role="alert"` dan `aria-describedby`
- Input dengan error memiliki `aria-invalid="true"`
- Alert memiliki `role="alert"`
- Button disabled tidak bisa diklik dan memiliki visual feedback

## Responsive Design

Semua komponen responsive by default:
- Input dan Button menggunakan `w-full` atau bisa dikustomisasi via className
- Alert menggunakan flexbox yang responsive
- Text size menggunakan `text-sm` yang readable di semua device

---

**Catatan:** Komponen-komponen ini adalah building blocks dasar. Untuk komponen yang lebih kompleks (seperti Modal, Dropdown, dll), buat komponen baru di folder `Components/shared/` yang menggunakan komponen-komponen primitif ini.
