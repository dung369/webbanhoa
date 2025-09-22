"use client";

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AOSProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  return <>{children}</>;
}