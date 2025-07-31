import type { Instance, TextInstance } from './types';
import type { FiberNode } from '../react-reconciler/types';
import { creatRoot } from '../react/root';

const ReactDOM = {
  createRoot: creatRoot
};

export default ReactDOM;
export { ReactDOM };

export function createInstance(type: string, props: any): Instance {
  const dom = document.createElement(type);
  for (const key in props) {
    if (key === 'children') continue;
    dom[key] = props[key];
  }
  return dom;
}

export function createTextInstance(content: string): TextInstance {
  return document.createTextNode(content);
}

export function appendAllChildren(parent: Instance, wip: FiberNode): void {
  let node = wip.child;
  while (node !== null) {
    if (node.tag === 3 /* HostComponent */ || node.tag === 4 /* HostText */) {
      if (node.stateNode !== null) {
        parent.appendChild(node.stateNode);
      }
    } else if (node.child !== null) {
      node = node.child;
      continue;
    }
    if (node === wip) return;
    while (node.sibling === null) {
      if (node.return === null || node.return === wip) return;
      node = node.return;
    }
    node = node.sibling;
  }
}

export function insertOrAppendPlacementNode(
  node: FiberNode,
  parent: Instance | Text,
  before: Instance | Text | null
) {
  if (node.tag === 3 /* HostComponent */ || node.tag === 4 /* HostText */) {
    if (before) {
      parent.insertBefore(node.stateNode, before);
    } else {
      parent.appendChild(node.stateNode);
    }
  } else {
    let child = node.child;
    while (child !== null) {
      insertOrAppendPlacementNode(child, parent, before);
      child = child.sibling;
    }
  }
}