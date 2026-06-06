import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function ReceiptTemplate({ transaction }: { transaction: any }) {
  if (!transaction) return null;

  return (
    <div id="thermal-receipt" className="bg-white text-black font-sans leading-tight mx-auto" style={{ width: '58mm', padding: '0', fontSize: '12px' }}>
      <style type="text/css" media="print">
        {`
          @page { 
            margin: 0; 
            size: 58mm auto; 
          }
          body { 
            margin: 0; 
            padding: 0; 
            background-color: white; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          .print-only { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 58mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Sembunyikan semua elemen UI utama saat print */
          body > *:not(.print-only) { display: none !important; }
        `}
      </style>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '8px', paddingTop: '4px' }}>
        <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>TRANSAKSI KITA</h2>
        <p style={{ margin: '2px 0 0', fontSize: '10px' }}>Jl. Contoh Toko No. 123</p>
        <p style={{ margin: '0', fontSize: '10px' }}>Telp: 08123456789</p>
      </div>

      <div style={{ borderBottom: '1px dashed black', marginBottom: '8px' }}></div>

      {/* INFO */}
      <div style={{ fontSize: '10px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>No:</span>
          <span>{transaction.transactionNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Tgl:</span>
          <span>{new Date(transaction.createdAt || new Date()).toLocaleString('id-ID')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Kasir:</span>
          <span>Cashier</span>
        </div>
        {transaction.customerId && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Plg:</span>
            <span>{transaction.customerName || 'Member'}</span>
          </div>
        )}
      </div>

      <div style={{ borderBottom: '1px dashed black', marginBottom: '8px' }}></div>

      {/* ITEMS */}
      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        {transaction.items && transaction.items.map((item: any, i: number) => {
          const qty = Number(item.quantity);
          const price = Number(item.unitPrice || item.sellingPrice || 0);
          const subtotal = qty * price;
          const disc = Number(item.discount || 0);
          return (
            <div key={i} style={{ marginBottom: '6px', breakInside: 'avoid' }}>
              <div style={{ fontWeight: 'bold' }}>{item.productName || item.name || 'Produk'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{qty} x {price.toLocaleString('id-ID')}</span>
                <span>{subtotal.toLocaleString('id-ID')}</span>
              </div>
              {disc > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>Disc:</span>
                  <span>-{disc.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ borderBottom: '1px dashed black', marginBottom: '8px' }}></div>

      {/* SUMMARY */}
      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>Rp {Number(transaction.subtotal).toLocaleString('id-ID')}</span>
        </div>
        {Number(transaction.discountAmount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Diskon</span>
            <span>-Rp {Number(transaction.discountAmount).toLocaleString('id-ID')}</span>
          </div>
        )}
        {Number(transaction.taxAmount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>PPN (11%)</span>
            <span>Rp {Number(transaction.taxAmount).toLocaleString('id-ID')}</span>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid black' }}>
          <span>TOTAL</span>
          <span>Rp {Number(transaction.totalAmount).toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed black', marginBottom: '8px' }}></div>

      {/* PAYMENT */}
      <div style={{ fontSize: '11px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Bayar ({transaction.paymentMethod || 'Cash'})</span>
          <span>Rp {Number(transaction.totalAmount).toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', fontSize: '12px', margin: '0' }}>Terima Kasih</p>
        <p style={{ fontSize: '9px', margin: '2px 0 0' }}>Barang yang dibeli tidak dapat ditukar</p>
      </div>
    </div>
  );
}

export function PrintReceiptPortal({ transaction }: { transaction: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !transaction) return null;

  return createPortal(
    <div className="print-only bg-white fixed inset-0 z-50 flex justify-center items-start pt-8 print:p-0 print:block overflow-y-auto w-full h-full">
      {/* Container ini hanya untuk pratinjau di web. Saat diprint, isinya akan otomatis menggunakan ukuran 58mm */}
      <div className="shadow-2xl border border-gray-200 print:shadow-none print:border-none print:m-0" style={{ backgroundColor: 'white' }}>
        <ReceiptTemplate transaction={transaction} />
      </div>
    </div>,
    document.body
  );
}
