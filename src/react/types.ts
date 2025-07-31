import type { Key, Props } from '../shared/types';

export interface ReactElementType {
  $$typeof: symbol;
  type: any;
  key: Key;
  props: Props;
}
