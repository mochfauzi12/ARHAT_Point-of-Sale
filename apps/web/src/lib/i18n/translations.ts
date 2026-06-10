export type Language = 'id' | 'en';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    loading: string;
    noData: string;
    actions: string;
    status: string;
    total: string;
    back: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    success: string;
    error: string;
    warning: string;
    all: string;
    active: string;
    inactive: string;
    name: string;
    price: string;
    quantity: string;
    date: string;
    category: string;
    description: string;
    image: string;
    stock: string;
    unit: string;
    notes: string;
    submit: string;
    reset: string;
    refresh: string;
    download: string;
    upload: string;
    print: string;
  };

  // Navigation / Sidebar
  nav: {
    dashboard: string;
    pos: string;
    products: string;
    inventory: string;
    customers: string;
    employees: string;
    transactions: string;
    reports: string;
    settings: string;
    logout: string;
  };

  // Auth
  auth: {
    welcome: string;
    loginSubtitle: string;
    email: string;
    password: string;
    loginButton: string;
    registerLink: string;
    noAccount: string;
    registerTitle: string;
    registerSubtitle: string;
    businessName: string;
    fullName: string;
    confirmPassword: string;
    registerButton: string;
    hasAccount: string;
    loginLink: string;
    loggingIn: string;
    registering: string;
  };

  // Dashboard
  dashboard: {
    overview: string;
    subtitle: string;
    todayRevenue: string;
    todayTransactions: string;
    activeProducts: string;
    revenueLast7Days: string;
    topProducts: string;
    itemsSold: string;
    recentTransactions: string;
    viewAll: string;
    customer: string;
    amount: string;
    time: string;
  };

  // POS
  pos: {
    searchProduct: string;
    allCategories: string;
    cart: string;
    emptyCart: string;
    emptyCartHint: string;
    subtotal: string;
    tax: string;
    discount: string;
    grandTotal: string;
    pay: string;
    cash: string;
    transfer: string;
    qris: string;
    paymentMethod: string;
    amountPaid: string;
    change: string;
    processPayment: string;
    paymentSuccess: string;
    printReceipt: string;
    newTransaction: string;
    holdOrder: string;
    clearCart: string;
    addNote: string;
    selectCustomer: string;
    walkInCustomer: string;
    itemsInCart: string;
  };

  // Products
  products: {
    title: string;
    addProduct: string;
    editProduct: string;
    productName: string;
    sku: string;
    costPrice: string;
    sellingPrice: string;
    minStock: string;
    manageCategories: string;
    noProducts: string;
    deleteConfirm: string;
  };

  // Inventory
  inventory: {
    title: string;
    stockIn: string;
    stockOut: string;
    adjustment: string;
    currentStock: string;
    stockHistory: string;
    lowStock: string;
    outOfStock: string;
    supplier: string;
    reference: string;
  };

  // Customers
  customers: {
    title: string;
    addCustomer: string;
    customerName: string;
    phone: string;
    address: string;
    totalPurchases: string;
    lastVisit: string;
    loyaltyPoints: string;
  };

  // Employees / Users
  employees: {
    title: string;
    addEmployee: string;
    role: string;
    admin: string;
    supervisor: string;
    cashier: string;
    lastLogin: string;
    resetPassword: string;
  };

  // Transactions
  transactions: {
    title: string;
    transactionId: string;
    paymentMethod: string;
    cashier: string;
    items: string;
    detail: string;
    completed: string;
    pending: string;
    cancelled: string;
    refunded: string;
    dateRange: string;
    todayOnly: string;
    last7Days: string;
    last30Days: string;
    thisMonth: string;
  };

  // Reports
  reports: {
    title: string;
    salesReport: string;
    productReport: string;
    dailySummary: string;
    monthlySummary: string;
    revenue: string;
    profit: string;
    totalSales: string;
    averageTransaction: string;
    generateReport: string;
    period: string;
  };

  // Settings
  settings: {
    title: string;
    general: string;
    storeName: string;
    storeAddress: string;
    storePhone: string;
    currency: string;
    taxRate: string;
    receiptHeader: string;
    receiptFooter: string;
    language: string;
    theme: string;
    darkMode: string;
    lightMode: string;
    saveSettings: string;
  };
}

export const id: Translations = {
  common: {
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    add: 'Tambah',
    search: 'Cari',
    filter: 'Filter',
    export: 'Ekspor',
    loading: 'Memuat...',
    noData: 'Tidak ada data',
    actions: 'Aksi',
    status: 'Status',
    total: 'Total',
    back: 'Kembali',
    close: 'Tutup',
    confirm: 'Konfirmasi',
    yes: 'Ya',
    no: 'Tidak',
    success: 'Berhasil',
    error: 'Gagal',
    warning: 'Peringatan',
    all: 'Semua',
    active: 'Aktif',
    inactive: 'Nonaktif',
    name: 'Nama',
    price: 'Harga',
    quantity: 'Jumlah',
    date: 'Tanggal',
    category: 'Kategori',
    description: 'Deskripsi',
    image: 'Gambar',
    stock: 'Stok',
    unit: 'Satuan',
    notes: 'Catatan',
    submit: 'Kirim',
    reset: 'Reset',
    refresh: 'Segarkan',
    download: 'Unduh',
    upload: 'Unggah',
    print: 'Cetak',
  },
  nav: {
    dashboard: 'Dashboard',
    pos: 'POS',
    products: 'Produk',
    inventory: 'Inventori',
    customers: 'Pelanggan',
    employees: 'Karyawan',
    transactions: 'Transaksi',
    reports: 'Laporan',
    settings: 'Pengaturan',
    logout: 'Keluar',
  },
  auth: {
    welcome: 'Selamat Datang',
    loginSubtitle: 'Masuk untuk mengelola bisnis Anda',
    email: 'Alamat Email',
    password: 'Password',
    loginButton: 'Masuk ke Dashboard',
    registerLink: 'Daftar Sekarang',
    noAccount: 'Belum punya akun?',
    registerTitle: 'Daftar Akun Baru',
    registerSubtitle: 'Buat akun untuk mulai menggunakan sistem',
    businessName: 'Nama Bisnis',
    fullName: 'Nama Lengkap',
    confirmPassword: 'Konfirmasi Password',
    registerButton: 'Daftar Sekarang',
    hasAccount: 'Sudah punya akun?',
    loginLink: 'Masuk',
    loggingIn: 'Memproses...',
    registering: 'Mendaftarkan...',
  },
  dashboard: {
    overview: 'Ringkasan',
    subtitle: 'Berikut aktivitas toko Anda hari ini.',
    todayRevenue: 'PENDAPATAN HARI INI',
    todayTransactions: 'TRANSAKSI HARI INI',
    activeProducts: 'PRODUK AKTIF',
    revenueLast7Days: 'Pendapatan 7 Hari Terakhir',
    topProducts: 'Produk Terlaris',
    itemsSold: 'item terjual',
    recentTransactions: 'Transaksi Terbaru',
    viewAll: 'Lihat Semua',
    customer: 'Pelanggan',
    amount: 'Jumlah',
    time: 'Waktu',
  },
  pos: {
    searchProduct: 'Cari produk...',
    allCategories: 'Semua Kategori',
    cart: 'Keranjang',
    emptyCart: 'Keranjang kosong',
    emptyCartHint: 'Tambahkan produk untuk memulai transaksi',
    subtotal: 'Subtotal',
    tax: 'Pajak',
    discount: 'Diskon',
    grandTotal: 'Total',
    pay: 'Bayar',
    cash: 'Tunai',
    transfer: 'Transfer',
    qris: 'QRIS',
    paymentMethod: 'Metode Pembayaran',
    amountPaid: 'Jumlah Bayar',
    change: 'Kembalian',
    processPayment: 'Proses Pembayaran',
    paymentSuccess: 'Pembayaran Berhasil!',
    printReceipt: 'Cetak Struk',
    newTransaction: 'Transaksi Baru',
    holdOrder: 'Tahan Pesanan',
    clearCart: 'Kosongkan Keranjang',
    addNote: 'Tambah Catatan',
    selectCustomer: 'Pilih Pelanggan',
    walkInCustomer: 'Pelanggan Umum',
    itemsInCart: 'item di keranjang',
  },
  products: {
    title: 'Produk',
    addProduct: 'Tambah Produk',
    editProduct: 'Edit Produk',
    productName: 'Nama Produk',
    sku: 'SKU',
    costPrice: 'Harga Beli',
    sellingPrice: 'Harga Jual',
    minStock: 'Stok Minimum',
    manageCategories: 'Kelola Kategori',
    noProducts: 'Belum ada produk',
    deleteConfirm: 'Yakin ingin menghapus produk ini?',
  },
  inventory: {
    title: 'Inventori',
    stockIn: 'Stok Masuk',
    stockOut: 'Stok Keluar',
    adjustment: 'Penyesuaian',
    currentStock: 'Stok Saat Ini',
    stockHistory: 'Riwayat Stok',
    lowStock: 'Stok Rendah',
    outOfStock: 'Habis',
    supplier: 'Pemasok',
    reference: 'Referensi',
  },
  customers: {
    title: 'Pelanggan',
    addCustomer: 'Tambah Pelanggan',
    customerName: 'Nama Pelanggan',
    phone: 'No. Telepon',
    address: 'Alamat',
    totalPurchases: 'Total Pembelian',
    lastVisit: 'Kunjungan Terakhir',
    loyaltyPoints: 'Poin Loyalitas',
  },
  employees: {
    title: 'Karyawan',
    addEmployee: 'Tambah Karyawan',
    role: 'Peran',
    admin: 'Admin',
    supervisor: 'Supervisor',
    cashier: 'Kasir',
    lastLogin: 'Login Terakhir',
    resetPassword: 'Reset Password',
  },
  transactions: {
    title: 'Transaksi',
    transactionId: 'ID Transaksi',
    paymentMethod: 'Metode Bayar',
    cashier: 'Kasir',
    items: 'Item',
    detail: 'Detail',
    completed: 'Selesai',
    pending: 'Tertunda',
    cancelled: 'Dibatalkan',
    refunded: 'Dikembalikan',
    dateRange: 'Rentang Tanggal',
    todayOnly: 'Hari Ini',
    last7Days: '7 Hari Terakhir',
    last30Days: '30 Hari Terakhir',
    thisMonth: 'Bulan Ini',
  },
  reports: {
    title: 'Laporan',
    salesReport: 'Laporan Penjualan',
    productReport: 'Laporan Produk',
    dailySummary: 'Ringkasan Harian',
    monthlySummary: 'Ringkasan Bulanan',
    revenue: 'Pendapatan',
    profit: 'Keuntungan',
    totalSales: 'Total Penjualan',
    averageTransaction: 'Rata-rata Transaksi',
    generateReport: 'Buat Laporan',
    period: 'Periode',
  },
  settings: {
    title: 'Pengaturan',
    general: 'Umum',
    storeName: 'Nama Toko',
    storeAddress: 'Alamat Toko',
    storePhone: 'No. Telepon Toko',
    currency: 'Mata Uang',
    taxRate: 'Tarif Pajak',
    receiptHeader: 'Header Struk',
    receiptFooter: 'Footer Struk',
    language: 'Bahasa',
    theme: 'Tema',
    darkMode: 'Mode Gelap',
    lightMode: 'Mode Terang',
    saveSettings: 'Simpan Pengaturan',
  },
};

export const en: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    loading: 'Loading...',
    noData: 'No data',
    actions: 'Actions',
    status: 'Status',
    total: 'Total',
    back: 'Back',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    all: 'All',
    active: 'Active',
    inactive: 'Inactive',
    name: 'Name',
    price: 'Price',
    quantity: 'Quantity',
    date: 'Date',
    category: 'Category',
    description: 'Description',
    image: 'Image',
    stock: 'Stock',
    unit: 'Unit',
    notes: 'Notes',
    submit: 'Submit',
    reset: 'Reset',
    refresh: 'Refresh',
    download: 'Download',
    upload: 'Upload',
    print: 'Print',
  },
  nav: {
    dashboard: 'Dashboard',
    pos: 'POS',
    products: 'Products',
    inventory: 'Inventory',
    customers: 'Customers',
    employees: 'Employees',
    transactions: 'Transactions',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
  },
  auth: {
    welcome: 'Welcome',
    loginSubtitle: 'Sign in to manage your business',
    email: 'Email Address',
    password: 'Password',
    loginButton: 'Sign In',
    registerLink: 'Register Now',
    noAccount: "Don't have an account?",
    registerTitle: 'Create Account',
    registerSubtitle: 'Create an account to start using the system',
    businessName: 'Business Name',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    registerButton: 'Register Now',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign In',
    loggingIn: 'Signing in...',
    registering: 'Registering...',
  },
  dashboard: {
    overview: 'Overview',
    subtitle: "Here's what's happening in your store today.",
    todayRevenue: "TODAY'S REVENUE",
    todayTransactions: "TODAY'S TRANSACTIONS",
    activeProducts: 'ACTIVE PRODUCTS',
    revenueLast7Days: 'Revenue Last 7 Days',
    topProducts: 'Top Products (Best Sellers)',
    itemsSold: 'items sold',
    recentTransactions: 'Recent Transactions',
    viewAll: 'View All',
    customer: 'Customer',
    amount: 'Amount',
    time: 'Time',
  },
  pos: {
    searchProduct: 'Search products...',
    allCategories: 'All Categories',
    cart: 'Cart',
    emptyCart: 'Cart is empty',
    emptyCartHint: 'Add products to start a transaction',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    grandTotal: 'Grand Total',
    pay: 'Pay',
    cash: 'Cash',
    transfer: 'Transfer',
    qris: 'QRIS',
    paymentMethod: 'Payment Method',
    amountPaid: 'Amount Paid',
    change: 'Change',
    processPayment: 'Process Payment',
    paymentSuccess: 'Payment Successful!',
    printReceipt: 'Print Receipt',
    newTransaction: 'New Transaction',
    holdOrder: 'Hold Order',
    clearCart: 'Clear Cart',
    addNote: 'Add Note',
    selectCustomer: 'Select Customer',
    walkInCustomer: 'Walk-in Customer',
    itemsInCart: 'items in cart',
  },
  products: {
    title: 'Products',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    productName: 'Product Name',
    sku: 'SKU',
    costPrice: 'Cost Price',
    sellingPrice: 'Selling Price',
    minStock: 'Minimum Stock',
    manageCategories: 'Manage Categories',
    noProducts: 'No products yet',
    deleteConfirm: 'Are you sure you want to delete this product?',
  },
  inventory: {
    title: 'Inventory',
    stockIn: 'Stock In',
    stockOut: 'Stock Out',
    adjustment: 'Adjustment',
    currentStock: 'Current Stock',
    stockHistory: 'Stock History',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    supplier: 'Supplier',
    reference: 'Reference',
  },
  customers: {
    title: 'Customers',
    addCustomer: 'Add Customer',
    customerName: 'Customer Name',
    phone: 'Phone',
    address: 'Address',
    totalPurchases: 'Total Purchases',
    lastVisit: 'Last Visit',
    loyaltyPoints: 'Loyalty Points',
  },
  employees: {
    title: 'Employees',
    addEmployee: 'Add Employee',
    role: 'Role',
    admin: 'Admin',
    supervisor: 'Supervisor',
    cashier: 'Cashier',
    lastLogin: 'Last Login',
    resetPassword: 'Reset Password',
  },
  transactions: {
    title: 'Transactions',
    transactionId: 'Transaction ID',
    paymentMethod: 'Payment Method',
    cashier: 'Cashier',
    items: 'Items',
    detail: 'Detail',
    completed: 'Completed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    dateRange: 'Date Range',
    todayOnly: 'Today',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    thisMonth: 'This Month',
  },
  reports: {
    title: 'Reports',
    salesReport: 'Sales Report',
    productReport: 'Product Report',
    dailySummary: 'Daily Summary',
    monthlySummary: 'Monthly Summary',
    revenue: 'Revenue',
    profit: 'Profit',
    totalSales: 'Total Sales',
    averageTransaction: 'Average Transaction',
    generateReport: 'Generate Report',
    period: 'Period',
  },
  settings: {
    title: 'Settings',
    general: 'General',
    storeName: 'Store Name',
    storeAddress: 'Store Address',
    storePhone: 'Store Phone',
    currency: 'Currency',
    taxRate: 'Tax Rate',
    receiptHeader: 'Receipt Header',
    receiptFooter: 'Receipt Footer',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    saveSettings: 'Save Settings',
  },
};

export const translations: Record<Language, Translations> = { id, en };
