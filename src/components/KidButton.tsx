import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './KidButton.module.css';

export type KidButtonVariant = 'primary' | 'secondary' | 'ghost';
export type KidButtonSize = 'min' | 'kid' | 'primary';

interface KidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: KidButtonVariant;
  size?: KidButtonSize;
  children: ReactNode;
}

export function KidButton({
  variant = 'primary',
  size = 'kid',
  className,
  children,
  ...rest
}: KidButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
