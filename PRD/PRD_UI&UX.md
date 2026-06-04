# PRD — SaaS Landing Page untuk Aplikasi Point of Sale (POS)

**Dokumen**: Product Requirements Document  
**Versi**: 1.0  
**Tanggal**: 4 Juni 2026  
**Status**: Draft

---

## 1. Overview & Tujuan

### 1.1 Latar Belakang

Landing page ini adalah wajah pertama dari produk SaaS POS yang ditujukan untuk pelaku bisnis ritel, F&B, dan merchant modern. Inspirasi UI/UX diambil dari pendekatan "foundation of a new digital epoch" — minimalis namun berkesan, dengan elemen interaktif yang membangun kepercayaan dan mendorong konversi.

### 1.2 Tujuan Produk

- Memperkenalkan produk POS berbasis cloud kepada calon pelanggan
- Mendorong sign-up trial gratis atau demo request
- Membangun kredibilitas melalui social proof dan logo client
- Menjelaskan fitur utama secara ringkas dan visual

### 1.3 Target Pengguna

| Segmen | Deskripsi |
|---|---|
| **Primary** | Pemilik bisnis F&B (kafe, restoran, cloud kitchen) |
| **Secondary** | Pemilik ritel (fashion, minimarket, toko elektronik) |
| **Tertiary** | Developer / IT Manager yang mencari solusi POS untuk klien |

---

## 2. Spesifikasi Desain & Estetika

### 2.1 Design Direction

**Tema**: *Refined Dark Luxury meets Operational Clarity*

Mengacu pada inspirasi UI yang diberikan, landing page mengadopsi:
- **Hero**: Full-width video background tanpa overlay — menampilkan suasana bisnis yang aktif (kasir, dapur, ritel)
- **Container**: Rounded card besar (`rounded-[48px]`) dengan shadow halus dan border tipis, menciptakan kesan "floating"
- **Warna utama**: Deep navy `#0a1b33` sebagai warna brand, putih bersih untuk surface, slate untuk teks sekunder
- **Nuansa**: Premium, terpercaya, dan modern — bukan startup generik

### 2.2 Tipografi

| Peran | Font | Weight |
|---|---|---|
| Display / Headline | **Outfit** | 500–600 |
| Body / UI | **Inter** | 400–600 |

### 2.3 Palet Warna

| Token | Nilai | Penggunaan |
|---|---|---|
| `--brand-deep` | `#0a1b33` | CTA button, teks headline |
| `--brand-mid` | `#1e3a5f` | Hover state, accent |
| `--surface` | `#ffffff` | Card, navbar, kontainer |
| `--bg-base` | `#f9fafb` | Background halaman |
| `--text-muted` | `#64748b` | Subheadline, deskripsi |
| `--border` | `rgba(148,163,184,0.4)` | Border card dan navbar |

---

## 3. Struktur Halaman (Page Sections)

### Section 1 — Hero

**Komponen utama** mengikuti spesifikasi teknis referensi UI:

```
[Hero Container: max-w-[1400px], rounded-[48px], h-[600px]]
  ├── [Video Background] — footage kasir/transaksi berjalan
  ├── [Text Content]
  │     ├── Headline: "Satu Platform untuk\nSemua Transaksi Bisnis"
  │     ├── Subheadline: "POS berbasis cloud yang membantu ritel, F&B, dan merchant modern tumbuh lebih cepat — dari kasir hingga laporan real-time."
  │     └── CTA Button: "Coba Gratis 14 Hari"
  └── [Floating Bottom Navbar]
        ├── Logo mark (✦)
        ├── Links: "Fitur" | "Harga" | "Dokumentasi"
        └── Button: "Mulai Sekarang →"
```

**Video background**: footage B-roll suasana kasir modern, transaksi QRIS/kartu, atau dapur cloud kitchen yang dinamis. Autoplay, loop, muted, playsInline.

---

### Section 2 — Social Proof / Logo Marquee

Komponen marquee infinite scroller (persis seperti referensi) menampilkan logo bisnis / integrasi yang kompatibel dengan platform POS:

| Logo | Keterangan |
|---|---|
| **Shopify** | Integrasi e-commerce |
| **Stripe** | Payment gateway |
| **Google Cloud** | Infrastruktur |
| **WhatsApp Business** | Notifikasi order |
| **Tokopedia / GoTo** | Marketplace sync |
| **GoPay / OVO / DANA** | Dompet digital |
| **Accurate Online** | Akuntansi |
| **Grab / GoFood** | Delivery integration |

**Styling card**: identik dengan referensi — `rounded-full`, `h-24 w-40`, `bg-white`, gradient hover effect, logo inverting on hover.

---

### Section 3 — Feature Highlights

**Layout**: 3 kolom card grid, dengan satu featured card lebih besar (bento grid style)

| Feature | Ikon | Deskripsi Singkat |
|---|---|---|
| **Multi-Outlet** | Store | Kelola semua cabang dari satu dashboard |
| **Laporan Real-Time** | BarChart2 | Pantau penjualan, stok, dan keuntungan live |
| **QRIS & Payment Hub** | CreditCard | Terima semua metode bayar, satu QR |
| **Manajemen Stok** | Package | Auto-deduct stok per transaksi |
| **Struk Digital** | Receipt | Kirim struk via WhatsApp atau email |
| **Mode Offline** | WifiOff | Tetap berjalan tanpa koneksi internet |

**Animasi**: Staggered fade-in saat scroll masuk viewport menggunakan `motion.div` dari Motion.

---

### Section 4 — How It Works

**Layout**: Horizontal step flow (3 langkah), dengan connector line di antara step.

```
[1. Daftar & Setup]  →  [2. Atur Produk & Tim]  →  [3. Mulai Transaksi]
```

Setiap step memiliki:
- Nomor step (large, semi-transparent)
- Ikon lucide-react
- Judul singkat
- Deskripsi 1–2 kalimat

---

### Section 5 — Pricing

**Layout**: 3 tier card, card tengah (Pro) di-highlight dengan border brand dan shadow lebih dalam.

| Plan | Harga | Untuk |
|---|---|---|
| **Starter** | Rp 199.000/bln | 1 outlet, 1 kasir |
| **Pro** ⭐ | Rp 499.000/bln | 3 outlet, 5 kasir, laporan advanced |
| **Enterprise** | Custom | Unlimited outlet, dedicated support |

Semua plan memiliki toggle **Bulanan / Tahunan** (diskon 20% tahunan).

---

### Section 6 — Testimonials

**Layout**: Marquee horizontal (sama dengan logo scroller) atau grid 2 kolom.

Setiap testimonial card berisi:
- Avatar + nama + jabatan + nama bisnis
- Rating bintang (5/5)
- Quote singkat (max 2 kalimat)

Minimal **6 testimonial** dari segmen berbeda (F&B, ritel, jasa).

---

### Section 7 — CTA Section (Final)

**Layout**: Full-width card dengan background gradient gelap (`#0a1b33` → `#1e3a5f`), teks putih.

```
Headline: "Siap Transformasi Bisnis Anda?"
Subheadline: "Bergabung dengan 10.000+ merchant yang sudah menggunakan platform kami."
[CTA: Coba Gratis 14 Hari]  [CTA Ghost: Jadwalkan Demo]
```

---

### Section 8 — Footer

**Layout**: 4 kolom + bottom bar.

| Kolom | Isi |
|---|---|
| **Brand** | Logo, tagline, sosial media |
| **Produk** | Fitur, Harga, Changelog, Roadmap |
| **Perusahaan** | Tentang, Blog, Karier, Press |
| **Support** | Dokumentasi, API, Status, Kontak |

Bottom bar: Copyright + link Privacy Policy + Terms of Service + Kebijakan Refund.

---

## 4. Komponen Reusable

| Komponen | Deskripsi |
|---|---|
| `<HeroSection>` | Container video + text + floating navbar |
| `<MarqueeScroller>` | Pure CSS infinite scroll dengan masking gradient |
| `<FeatureCard>` | Card dengan ikon, judul, deskripsi, hover gradient |
| `<PricingCard>` | Card tier dengan toggle bulanan/tahunan |
| `<TestimonialCard>` | Card dengan avatar, rating, quote |
| `<FloatingNavbar>` | Bottom-center nav dengan blur glass effect |
| `<CTAButton>` | Motion button dengan hover scale |

---

## 5. Animasi & Interaksi

| Elemen | Animasi |
|---|---|
| Hero text | Fade in + slide up (delay 0ms) |
| Floating navbar | Fade in + slide up (delay 300ms) |
| Feature cards | Staggered fade in saat scroll (delay per card) |
| Logo marquee | CSS `translateX` infinite, pause on hover |
| CTA buttons | `whileHover: scale(1.03)`, `whileTap: scale(0.97)` |
| Pricing toggle | Smooth cross-fade angka harga |
| Testimonial | Marquee atau auto-scroll carousel |

---

## 6. Responsivitas

| Breakpoint | Perilaku |
|---|---|
| `sm` (< 640px) | Single column, hero h-auto, navbar collapse ke icon |
| `md` (640–1024px) | 2-column grid untuk feature, pricing stack |
| `lg` (> 1024px) | Full layout sesuai desain utama |

Hero container pada mobile: `rounded-[24px]`, height `auto`, padding dikurangi.

---

## 7. Performa & Teknis

### 7.1 Stack

```
- Framework  : React + TypeScript
- Styling    : Tailwind CSS v4
- Animasi    : Motion (motion/react)
- Ikon       : lucide-react
- Utility    : clsx, tailwind-merge
- Font       : Google Fonts (Inter + Outfit)
```

### 7.2 Target Performa

| Metrik | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5 detik |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FID / INP | < 200ms |
| Lighthouse Score | ≥ 90 (Performance, Accessibility) |

### 7.3 Optimasi

- Video hero: `preload="none"`, lazy load setelah LCP
- Logo marquee: CSS-only animation (no JS runtime cost)
- Font: `display=swap`, subset hanya karakter Latin
- Image: format WebP/AVIF, lazy loading

---

## 8. SEO & Meta

```html
<title>NamaPOS — Satu Platform untuk Semua Transaksi Bisnis</title>
<meta name="description" content="POS cloud terbaik untuk ritel, F&B, dan merchant modern Indonesia. Kelola kasir, stok, dan laporan dari mana saja." />
<meta property="og:image" content="/og-image.png" />
```

- Structured data: `SoftwareApplication` schema
- Canonical URL
- Sitemap.xml + robots.txt

---

## 9. Aksesibilitas

- Semua CTA button memiliki `aria-label` deskriptif
- Video hero memiliki `aria-hidden="true"` (dekoratif)
- Kontras warna teks ≥ 4.5:1 (WCAG AA)
- Keyboard navigasi penuh untuk floating navbar
- Focus ring visible pada semua interactive element

---

## 10. Success Metrics

| KPI | Target (90 hari post-launch) |
|---|---|
| Sign-up trial | ≥ 500/bulan |
| Demo request | ≥ 100/bulan |
| Bounce rate | < 55% |
| Time on page | > 2 menit |
| CTA click-through rate | ≥ 8% |

---

## 11. Out of Scope (v1)

- Halaman dashboard dalam aplikasi
- Halaman login / onboarding
- Blog dan dokumentasi (halaman terpisah)
- Fitur live chat / chatbot
- Versi mobile app (iOS/Android)

---

*PRD ini menjadi acuan desainer dan engineer dalam membangun landing page SaaS POS. Setiap perubahan scope harus didiskusikan dan disetujui sebelum implementasi.*
