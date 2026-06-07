import { useEffect, useRef } from 'react';

/**
 * Hook to globally listen for barcode scanner inputs.
 * Barcode scanners typically act like rapid keyboards that fire characters quickly 
 * and end with an 'Enter' key.
 * 
 * @param onScan Callback function when a complete barcode is scanned
 * @param minLength Minimum length of the barcode to trigger the callback
 * @param maxDelay Maximum delay between keystrokes in ms (humans type slow, scanners type fast)
 */
export function useBarcodeScanner(onScan: (barcode: string) => void, minLength = 4, maxDelay = 30) {
  const barcodeBuffer = useRef('');
  const lastKeyTime = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field (except if it's explicitly handled)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;

      if (timeDiff > maxDelay) {
        // Too slow, probably a human typing, reset buffer
        barcodeBuffer.current = '';
      }

      lastKeyTime.current = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length >= minLength) {
          onScan(barcodeBuffer.current);
          e.preventDefault();
        }
        barcodeBuffer.current = '';
      } else if (e.key.length === 1) {
        // Only accept single characters (ignore Shift, Ctrl, etc.)
        barcodeBuffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, minLength, maxDelay]);
}
