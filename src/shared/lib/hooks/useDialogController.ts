import {useCallback, useState} from 'react';

export function useDialogController(initialOpen?: boolean) {
  const [state, setState] = useState(initialOpen ?? false);

  const open = useCallback(() => {
    setState(true);
  }, []);

  const close = useCallback(() => {
    setState(false);
  }, []);

  return {open, close, isOpen: state};
}
