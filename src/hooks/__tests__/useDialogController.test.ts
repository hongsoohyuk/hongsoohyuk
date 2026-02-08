import {renderHook, act} from '@testing-library/react';

import {useDialogController} from '../useDialogController';

describe('useDialogController', () => {
  it('starts closed by default', () => {
    const {result} = renderHook(() => useDialogController());
    expect(result.current.isOpen).toBe(false);
  });

  it('starts open when initialOpen is true', () => {
    const {result} = renderHook(() => useDialogController(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('starts closed when initialOpen is false', () => {
    const {result} = renderHook(() => useDialogController(false));
    expect(result.current.isOpen).toBe(false);
  });

  it('opens the dialog', () => {
    const {result} = renderHook(() => useDialogController());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('closes the dialog', () => {
    const {result} = renderHook(() => useDialogController(true));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('handles multiple open/close cycles', () => {
    const {result} = renderHook(() => useDialogController());

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('open is stable across renders (useCallback)', () => {
    const {result, rerender} = renderHook(() => useDialogController());
    const firstOpen = result.current.open;
    rerender();
    expect(result.current.open).toBe(firstOpen);
  });

  it('close is stable across renders (useCallback)', () => {
    const {result, rerender} = renderHook(() => useDialogController());
    const firstClose = result.current.close;
    rerender();
    expect(result.current.close).toBe(firstClose);
  });
});
