'use client';

import {useDomReady} from '@/shared/lib/hooks/use-dom-ready';
import clsx from 'clsx';
import {MouseEvent, ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

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

const OVERLAY_STYLES = 'glass-overlay transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0';

const CONTENT_STYLES =
  'fixed inset-0 z-50 mx-auto flex max-h-[100dvh] sm:max-h-[90vh] w-full max-w-2xl items-end sm:items-center justify-center p-0 sm:p-4 md:p-6';

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
  const domReady = useDomReady();
  const panelRef = useRef<HTMLDivElement>(null);
  const animationState = useAnimationState(open);

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

  if (!domReady) {
    return null;
  }

  if (!open && animationState === 'closed') {
    return null;
  }

  return createPortal(
    <>
      <div data-state={animationState} className={OVERLAY_STYLES} aria-hidden="true" onClick={handleOverlayClick} />
      <div data-state={animationState} className={CONTENT_STYLES}>
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          data-state={animationState}
          className="w-full"
        >
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}

interface ModalHeaderProps extends ModalSectionProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ModalHeader({children, className, onClose, showCloseButton = false}: ModalHeaderProps) {
  return (
    <header
      className={clsx('border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4', className)}
    >
      {/* Mobile: Handle for drag-to-close gesture indication */}
      <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-muted sm:hidden" />

      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1">{children}</div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

export function ModalBody({children, className}: ModalSectionProps) {
  return <div className={clsx('flex-1 min-h-0 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4', className)}>{children}</div>;
}

export function ModalFooter({children, className}: ModalSectionProps) {
  return (
    <footer
      className={clsx(
        'border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 pb-safe sm:px-6 sm:py-4',
        className,
      )}
    >
      {children}
    </footer>
  );
}
