export type FormActionStatus = 'idle' | 'success' | 'error';

export type FormActionResult =
  | {status: 'idle'}
  | {status: 'success'; message: string}
  | {
      status: 'error';
      issues: {path: string; message: string}[];
    };
