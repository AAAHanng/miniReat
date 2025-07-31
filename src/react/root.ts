import type { Container } from '../shared/types';
import type { ReactElementType } from './types';
import type { FiberNode, FiberRootNode } from '../react-reconciler/types';
import { createContainer, updateContainer } from '../react-reconciler/index';

export const creatRoot = (container: Container) => {
  const root = createContainer(container);
  return {
    render(element: ReactElementType) {
      updateContainer(element, root);
    }
  };
};