'use client';

import {createPortal} from 'react-dom';
import {MouseEvent, ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
  describedBy?: string;
}

interface ModalSectionProps {
  children: ReactNode;
  className?: string;
}

const OVERLAY_STYLES =
  'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0';

const CONTENT_STYLES =
  'fixed inset-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-5xl items-center justify-center p-4 sm:p-6';

const PANEL_STYLES =
  'relative w-full transform rounded-2xl bg-background shadow-2xl outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function useAnimationState(dep: boolean) {
  const [state, setState] = useState<'open' | 'closed'>(dep ? 'open' : 'closed');

  useEffect(() => {
    if (dep) {
      setState('open');
      return;
    }

    const timeout = setTimeout(() => setState('closed'), 200);
    return () => clearTimeout(timeout);
  }, [dep]);

  return state;
}

export function Modal({open, onClose, children, labelledBy, describedBy}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const animationState = useAnimationState(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) {
      return;
    }
    panelRef.current.focus();
  }, [open]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, open]);

  const handleOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!mounted) {
    return null;
  }

  if (!open && animationState === 'closed') {
    return null;
  }

  return createPortal(
    <>
      <div
        data-state={animationState}
        className={OVERLAY_STYLES}
        aria-hidden="true"
        onClick={handleOverlayClick}
      />
      <div data-state={animationState} className={CONTENT_STYLES}>
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          data-state={animationState}
          className={clsx(
            PANEL_STYLES,
            animationState === 'open' ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        >
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}

export function ModalHeader({children, className}: ModalSectionProps) {
  return <header className={clsx('border-b border-border px-6 py-4', className)}>{children}</header>;
}

export function ModalBody({children, className}: ModalSectionProps) {
  return <div className={clsx('px-6 py-4', className)}>{children}</div>;
}

export function ModalFooter({children, className}: ModalSectionProps) {
  return <footer className={clsx('border-t border-border px-6 py-4', className)}>{children}</footer>;
}
