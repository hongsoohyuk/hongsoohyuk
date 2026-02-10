import {useState} from 'react';

export function useDialogController(initialOpen?: boolean) {
  const [state, setState] = useState(initialOpen ?? false);

  const open = () => {
    setState(true);
  };

  const close = () => {
    setState(false);
  };

  return {open, close, isOpen: state};
}
