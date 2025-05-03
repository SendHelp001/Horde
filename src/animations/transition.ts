// src/animations/transition.ts
import { createAnimation } from "@ionic/react";

export const transitionFade = (element: HTMLElement | null, direction: 'in' | 'out', duration: number = 300) => {
  if (!element) return;

  const fromOpacity = direction === 'in' ? '0' : '1';
  const toOpacity = direction === 'in' ? '1' : '0';

  return createAnimation()
    .addElement(element)
    .duration(duration)
    .fromTo('opacity', fromOpacity, toOpacity)
    .play();
};