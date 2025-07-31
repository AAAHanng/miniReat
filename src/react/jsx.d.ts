import type { ReactElementType } from './types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends ReactElementType {}
  }
}