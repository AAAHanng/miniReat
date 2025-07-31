import type { ReactElementType } from './types';

export function createElement(type: any, props: any, ...children: any[]): ReactElementType {
  return {
    $$typeof: Symbol.for('react.element'),
    type,
    key: props?.key ?? null,
    props: { ...props, children }
  };
}

export default { createElement };