import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function ReceiptTemplate({ transaction }: { transaction: any }) {
  if (!transaction) return null;

  return (
    <div className="p-4 bg-white mx-auto" style={{ width: '58mm', color: '#000', fontFamily: 'monospace', fontSize: '12px' }}>
      <style type="text/css" media="print">
        {`
          @page { size: 58mm auto; margin: 0; }
          body { margin: 0; padding: 0; }
        `}
      </style>
      
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>TRANSAKSI KITA</h2>
        <p style={{ margin: '2px 0 0 0', fontSize: '10px' }}>Jl. Contoh Toko No. 123</p>
        <p style={{ margin: 0, fontSize: '10px' }}>Telp: 08123456789</p>
      </div>

      <div style={{ borderBottom: '1px dashed #000', marginBottom: '5px', paddingBottom: '5px' }}>
        <p style={{ margin: 0 }}>No  : {transaction.transactionNumber}</p>
        <p style={{ margin: 0 }}>Tgl : {new Date(transaction.createdAt || new Date()).toLocaleString('id-ID')}</p>
        <p style={{ margin: 0 }}>Kasir: Cashier</p>
      </div>

      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px' }}>
        {transaction.items && transaction.items.map((item: any, i: number) => (
          <div key={i} style={{ marginBottom: '4px' }}>
            <p style={{ margin: 0 }}>{item.productName || item.name || 'Produk'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.quantity} x {Number(item.unitPrice || item.sellingPrice || 0).toLocaleString('id-ID')}</span>
              <span>{(Number(item.quantity) * Number(item.unitPrice || item.sellingPrice || 0)).toLocaleString('id-ID')}</span>
            </div>
            {Number(item.discount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span>Disc:</span>
                <span>-{Number(item.discount).toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>{Number(transaction.subtotal).toLocaleString('id-ID')}</span>
        </div>
        {Number(transaction.discountAmount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount</span>
            <span>-{Number(transaction.discountAmount).toLocaleString('id-ID')}</span>
          </div>
        )}
        {Number(transaction.taxAmount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>PPN (11%)</span>
            <span>{Number(transaction.taxAmount).toLocaleString('id-ID')}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '5px' }}>
          <span>TOTAL</span>
          <span>{Number(transaction.totalAmount).toLocaleString('id-ID')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span>Payment ({transaction.paymentMethod || 'Cash'})</span>
          <span>{Number(transaction.totalAmount).toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Terima Kasih</p>
        <p style={{ margin: 0, fontSize: '10px' }}>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
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
    <div className="print-only bg-white absolute top-0 left-0 w-full h-full z-50">
      <ReceiptTemplate transaction={transaction} />
    </div>,
    document.body
  );
}
