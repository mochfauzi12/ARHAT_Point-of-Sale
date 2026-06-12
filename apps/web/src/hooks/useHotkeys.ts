import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface HotkeyMap {
  [key: string]: KeyHandler;
}

export function useHotkeys(keyMap: HotkeyMap) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field (unless it's a function key or escape)
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);
      const isSpecialKey = e.key.startsWith('F') || e.key === 'Escape';
      
      if (isInput && !isSpecialKey) return;

      const handler = keyMap[e.key];
      if (handler) {
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap]);
}
