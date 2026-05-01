# Layouts

Folder ini berisi layout components yang digunakan untuk membungkus halaman-halaman aplikasi dengan struktur yang konsisten.

## GuestLayout.jsx

Layout untuk halaman authentication (login, register, forgot password, reset password).

**Fitur:**
- Centered card design dengan logo aplikasi
- Background gradient yang menarik
- Footer dengan copyright dan links
- Fully responsive (mobile & desktop)

**Cara Penggunaan:**
```jsx
import GuestLayout from '@/Layouts/GuestLayout';

function Login() {
    return (
        <GuestLayout>
            {/* Form login di sini */}
        </GuestLayout>
    );
}
```

**Props:**
- `children` (ReactNode, required) — konten form yang akan ditampilkan

---

## AuthenticatedLayout.jsx

Layout untuk halaman setelah login (dashboard dan halaman protected lainnya).

**Fitur:**
- Navbar dengan logo dan UserMenu dropdown
- Sidebar navigation (berbeda untuk Admin dan Requester)
- Collapsible sidebar di mobile (hamburger menu)
- Main content area yang responsive
- Fixed navbar dan sidebar untuk UX yang lebih baik

**Cara Penggunaan:**
```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout auth={auth}>
            {/* Konten dashboard di sini */}
        </AuthenticatedLayout>
    );
}
```

**Props:**
- `auth` (object, required) — object berisi user data `{ user: { id, name, email, role } }`
- `children` (ReactNode, required) — konten halaman yang akan ditampilkan

**Navigation Items:**
- **Admin**: Dashboard, Surat Masuk
- **Requester**: Dashboard, Ajukan Surat, Riwayat Surat

---

## Struktur Responsive

### Mobile (< 1024px)
- Sidebar tersembunyi secara default
- Hamburger menu di navbar untuk toggle sidebar
- Sidebar muncul sebagai overlay saat dibuka
- Click outside sidebar untuk menutup

### Desktop (≥ 1024px)
- Sidebar selalu terlihat di sebelah kiri
- Main content area otomatis adjust dengan padding-left
- Hamburger menu tersembunyi

---

## Styling

Kedua layout menggunakan **Tailwind CSS** dengan prinsip:
- Clean dan minimal design
- Consistent spacing dan colors
- Smooth transitions dan animations
- Accessibility-friendly (focus states, ARIA labels)

---

## Dependencies

- `@inertiajs/react` — untuk Link component dan navigation
- `@/Components/shared/UserMenu` — dropdown menu user (hanya di AuthenticatedLayout)

---

## Notes

- Layout ini sudah fully responsive dan siap digunakan
- Navigation items di AuthenticatedLayout akan di-extend di fase berikutnya saat fitur approval workflow ditambahkan
- Footer links di GuestLayout masih placeholder (href="#"), bisa diupdate sesuai kebutuhan
