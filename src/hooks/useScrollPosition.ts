import { useState, useEffect } from 'react';

/**
 * Хук для отслеживания позиции скролла
 * @returns текущая позиция скролла в пикселях
 */
const useScrollPosition = (): number => {
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset);
    };
    
    window.addEventListener('scroll', updatePosition);
    
    // Инициализация позиции при монтировании
    updatePosition();
    
    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
};

export default useScrollPosition; 