import type { Key, Props, Container as _Container } from '../shared/types';

export type Container = _Container;
export type WorkTag = number;
export type Flags = number;

export class FiberNode {
  tag: WorkTag;
  key: Key;
  type: any;
  stateNode: any;

  return: FiberNode | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  index: number;

  pendingProps: Props;
  memoizedProps: Props;
  memoizedState: any;
  updateQueue: UpdateQueue<any> | null;

  alternate: FiberNode | null;
  flags: Flags;
  subtreeFlags: Flags;

  deletions?: FiberNode[];
  expirationTime?: number;

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key;
    this.type = null;
    this.stateNode = null;

    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.memoizedState = null;
    this.updateQueue = null;

    this.alternate = null;
    this.flags = 0;
    this.subtreeFlags = 0;
  }
}

export class FiberRootNode {
  container: Container;
  current: FiberNode;
  finishedWork: FiberNode | null;
  workInProgress?: FiberNode | null;
  pendingPassiveEffects?: any;
  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;
    this.finishedWork = null;
  }
}

export type Action<State> = State | ((prevState: State) => State);

export interface Update<State> {
  action: Action<State>;
  next?: Update<State>;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}

export const HostRoot = 0;
export const FunctionComponent = 1;
export const ClassComponent = 2;
export const HostComponent = 3;
export const HostText = 4;
export const Fragment = 5;

export const NoFlags = 0b0000001;
export const Placement = 0b0000010;
export const Update = 0b0000100;
export const ChildDeletion = 0b0001000;
export const MutationMask = Placement | Update | ChildDeletion;
export const Ref = 0b0010000;
