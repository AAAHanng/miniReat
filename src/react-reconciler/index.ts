import { FiberNode, FiberRootNode, HostRoot } from './types';
import type { Container, UpdateQueue, Update, Action } from './types';
import type { ReactElementType } from '../react/types';
import { REACT_ELEMENT_TYPE } from '../shared/constants';
import {
  createInstance,
  createTextInstance,
  appendAllChildren,
  insertOrAppendPlacementNode
} from '../react-dom/index';

// 这里粘贴 root.ts 中 Fiber、调度、reconcile、commit、update 相关实现
// ...（此处省略，实际迁移时会完整迁移所有相关实现）

export const createUpdateQueue = <State>(): UpdateQueue<State> => {
  return {
    shared: {
      pending: null
    }
  };
};

export const createUpdate = <State>(action: Action<State>): Update<State> => {
  return {
    action
  };
};

export const enqueueUpdate = <State>(
  updateQueue: UpdateQueue<State>,
  update: Update<State>
): void => {
  const pending = updateQueue.shared.pending;
  if (pending === null) {
    // 如果当前没有 pending 更新，自己成环
    update.next = update;
  } else {
    // 加入已有 pending 更新的后面
    update.next = pending.next;
    pending.next = update;
  }
  // 更新队列的尾指针
  updateQueue.shared.pending = update;
};

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  // ...此处粘贴 scheduleUpdateOnFiber 的实现...
}

export function createContainer(container: Container) {
  // 创建 HostRootFiber，type 为 HostRoot，代表 Fiber 树的起点
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  // container 是真实 DOM 容器，比如 <div id="app" />
  // 创建 FiberRootNode，建立 Fiber 树根（逻辑结构） 和 container（真实 DOM） 的联系
  const root = new FiberRootNode(container, hostRootFiber);
  // 初始化 HostRootFiber 的 updateQueue，用于后续更新时存储 setState 动作
  hostRootFiber.updateQueue = createUpdateQueue();
  // 返回整个应用的根（FiberRootNode）
  return root;
}

export function updateContainer(
  element: ReactElementType | null,
  root: FiberRootNode
) {
  // 获取根 Fiber（hostRootFiber）
  const hostRootFiber = root.current;
  // 创建 update 对象，包裹 element
  const update = createUpdate<ReactElementType | null>(element);
  // 将 update 放入 hostRootFiber 的 updateQueue 中
  enqueueUpdate(
    hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
    update
  );
  // 开始调度更新（即进入 renderRoot -> workLoop 等调度流程）
  scheduleUpdateOnFiber(hostRootFiber);
  return element;
}

// 需要补充 createUpdateQueue、createUpdate、enqueueUpdate、scheduleUpdateOnFiber 的实现或导出