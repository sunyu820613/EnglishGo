import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './ColorWheelPicker.module.css';

const RADIUS = 100;
const DOT_SIZE = 44;
const WHEEL_SIZE = (RADIUS + DOT_SIZE) * 2;
const CENTER = WHEEL_SIZE / 2;

const PRESET_COLORS: { hex: string; name: string }[] = [
  { hex: '#ff4444', name: 'red' },
  { hex: '#ff8c00', name: 'orange' },
  { hex: '#ffd700', name: 'gold' },
  { hex: '#90ee90', name: 'light green' },
  { hex: '#22c55e', name: 'green' },
  { hex: '#06b6d4', name: 'cyan' },
  { hex: '#3483eb', name: 'blue' },
  { hex: '#6366f1', name: 'indigo' },
  { hex: '#8b5cf6', name: 'violet' },
  { hex: '#ec4899', name: 'pink' },
  { hex: '#a78bfa', name: 'lavender' },
  { hex: '#6b7280', name: 'gray' },
];

export interface ColorWheelPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

export function ColorWheelPicker({ value, onChange, label }: ColorWheelPickerProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const margin = 12;
    const rect = containerRef.current.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - WHEEL_SIZE / 2, margin),
      window.innerWidth - WHEEL_SIZE - margin,
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow >= WHEEL_SIZE + margin ? rect.bottom + margin : Math.max(rect.top - WHEEL_SIZE - margin, margin);
    setPos({ left, top });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        style={{ backgroundColor: value }}
        onClick={() => setOpen((o) => !o)}
        aria-label={`${label}: tap to change`}
        aria-expanded={open}
      >
        <span className={styles.triggerLabel}>{label}</span>
      </button>
      {open ? (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className={`${styles.wheel} ${reducedMotion ? styles.noMotion : ''}`}
            style={{ width: WHEEL_SIZE, height: WHEEL_SIZE, left: pos.left, top: pos.top }}
            role="dialog"
            aria-label={label}
          >
            <div className={styles.centerSwatch} style={{ backgroundColor: value }} aria-hidden="true" />
            {PRESET_COLORS.map(({ hex, name }, i) => {
              const angle = (i / PRESET_COLORS.length) * Math.PI * 2 - Math.PI / 2;
              const x = CENTER + RADIUS * Math.cos(angle) - DOT_SIZE / 2;
              const y = CENTER + RADIUS * Math.sin(angle) - DOT_SIZE / 2;
              const isSelected = hex.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  className={`${styles.dot} ${isSelected ? styles.dotSelected : ''}`}
                  style={{
                    left: x,
                    top: y,
                    backgroundColor: hex,
                    animationDelay: reducedMotion ? '0s' : `${i * 0.035}s`,
                  }}
                  aria-label={name}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(hex);
                    setOpen(false);
                  }}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
