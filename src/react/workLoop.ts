import {
  FiberNode,
  FiberRootNode,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText, MutationMask, NoFlags
} from "../react-reconciler/types";
import {beginWork} from "./beginWork";
import {createWorkInProgress} from "./fiber";
import {Instance} from "../react-dom/types";

let workInProgress: FiberNode | null = null;
let isCommitting = false;

function prepareFreshStack(root: FiberRootNode) {
  // current 是当前渲染的 FiberRoot 的 current Fiber（即当前 Fiber 树根节点）
  workInProgress = createWorkInProgress(root.current, {});

  // 关联 root 中当前的 workInProgress 指向刚创建的 Fiber
  // root.workInProgress = workInProgress;

  // 这里还会初始化一些更新优先级状态（比如 expirationTime）
  // workInProgress.expirationTime = expirationTime;
}


export function markUpdateFromFiberToRoot(sourceFiber: FiberNode): FiberRootNode | null {
  let node = sourceFiber;
  let parent = node.return;

  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  // 找到最顶端的 hostRootFiber
  if (node.tag === HostRoot) {
    return node.stateNode;
  }

  return null;
}

export function renderRoot(root: FiberRootNode) {
  // 1. 准备新的工作栈 (fiber 树快照等)
  prepareFreshStack(root);

  // 2. 循环调用 workLoop 处理 fiber 节点，
  do {
    try {
      workLoop();  // 核心遍历处理过程
      break;       // 正常执行完毕跳出循环
    } catch (error) {
      // 出错处理（React 中会做错误边界处理等）
      handleError(error);
      workInProgress = null; // 重置工作指针，准备重试
    }
  } while (true);

  const finishedWork = root.current.alternate;
  // （就是wip）
  // render 阶段构造新 fiber 树
  root.finishedWork = finishedWork;
  commitRoot(root); // commit 阶段，应用 DOM 变更和副作用
}

const workLoop = () => {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
};

function performUnitOfWork(workInProgress: FiberNode): void {

  // const current = unitOfWork.alternate
  let next = beginWork(workInProgress);
  // memoizedProps 是处理后
  // pendingProps 是处理前
  workInProgress.memoizedProps = workInProgress.pendingProps;

  if (next === null) {
    completeUnitOfWork(workInProgress);
  } else {
    workInProgress = next;
  }
}

function completeUnitOfWork(fiber: FiberNode): void {
  let node: FiberNode | null = fiber;
  debugger
  do {
    completeWork(node); // 对当前 fiber 执行 complete 阶段（生成 DOM 或收集副作用）

    const sibling = node.sibling;
    if (sibling !== null) {
      // 如果当前节点有兄弟节点，继续遍历兄弟
      workInProgress = sibling;
      return;
    }

    // 否则向上回溯父节点
    node = node.return;
    workInProgress = node;
  } while (node !== null);
}

export const completeWork = (wip: FiberNode): void => {
  const newProps = wip.pendingProps;
  const current = wip.alternate;
  debugger
  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode != null) {
        // update DOM props
        for (const key in newProps) {
          if (key === 'children') continue;
          wip.stateNode[key] = newProps[key];
        }
      } else {
        // 1. 创建 DOM 节点
        const instance = createInstance(wip.type, newProps);

        // 2. 插入子节点
        appendAllChildren(instance, wip);

        // 3. 保存 DOM 到 fiber
        wip.stateNode = instance;
      }
      break;

    case HostText:
      if (current !== null && wip.stateNode != null) {
        // 更新文本节点内容
        wip.stateNode.nodeValue = newProps.content;
      } else {
        const textInstance = createTextInstance(newProps.content);
        wip.stateNode = textInstance;
      }
      break;

    case HostRoot:
      break;

    case FunctionComponent:
      break;

    default:
      break;
  }

  // 向上冒泡属性（flags等）
  bubbleProperties(wip);
};

export const createTextInstance = (content: string): Text => {
  return document.createTextNode(content);
};

function createInstance(type, props) {
  const dom = document.createElement(type);
  for (const key in props) {
    if (key === 'children') continue;
    dom[key] = props[key];
  }
  return dom;
}

function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = wip.child;

  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child.return = wip;
    child = child.sibling;
  }

  wip.subtreeFlags |= subtreeFlags;
}

function handleError(error: unknown) {
  throw new Error("Function not implemented.");
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork;
  if (finishedWork === null) return;

  root.finishedWork = null;

  // 标记提交开始
  isCommitting = true;

  // 更新当前 Fiber 树
  root.current = finishedWork;

  // 判断是否存在副作用
  const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  // === 1. 处理 beforeMutation 阶段（如 getSnapshotBeforeUpdate）===
  if (subtreeHasEffects || rootHasEffect) {
    commitBeforeMutationEffects(finishedWork);
  }

  // === 2. 处理 Mutation 阶段：执行 DOM 操作 ===
  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffects(finishedWork, root);
  }

  // === 3. now the tree is visually updated ===

  // === 4. 处理 Layout 阶段：ref / componentDidMount / useLayoutEffect 等 ===
  commitLayoutEffects(finishedWork, root);

  // === 5. 提交结束 ===
  isCommitting = false;

  // === 6. 处理 useEffect 等 Passive Effect（异步）===
  requestPassiveEffectCleanup(finishedWork);

  // === 7. 清空剩余 effect 链 ===
  root.pendingPassiveEffects = null;

  // 调度下一帧可能更新
  scheduleNextUpdateIfNeeded(root);
}

function appendAllChildren(parent: Instance, wip: FiberNode): void {
  let node = wip.child;

  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
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

function commitBeforeMutationEffects(finishedWork: FiberNode) {
  // 递归处理所有子节点的 before mutation 副作用（如 getSnapshotBeforeUpdate）
  let node: FiberNode | null = finishedWork;
  while (node !== null) {
    // 这里可以处理 getSnapshotBeforeUpdate 等生命周期
    // 目前简化为递归遍历
    if (node.child !== null) {
      node = node.child;
      continue;
    }
    while (node !== null) {
      if (node.sibling !== null) {
        node = node.sibling;
        break;
      }
      node = node.return;
    }
  }
}

function commitMutationEffects(finishedWork: FiberNode, root: FiberRootNode) {
  // 递归处理所有子节点的 mutation 副作用（如插入/删除/更新 DOM）
  let node: FiberNode | null = finishedWork;
  while (node !== null) {
    // 这里只处理 Placement 标记的节点，插入到 DOM
    if ((node.flags & MutationMask) !== 0) {
      commitMutationEffectOnFiber(node, root);
    }
    if (node.child !== null) {
      node = node.child;
      continue;
    }
    while (node !== null) {
      if (node.sibling !== null) {
        node = node.sibling;
        break;
      }
      node = node.return;
    }
  }
}

function commitMutationEffectOnFiber(fiber: FiberNode, root: FiberRootNode) {
  // 这里只处理 Placement，后续可扩展 Update/Deletion
  const { Placement } = require("../react-reconciler/types");
  if ((fiber.flags & Placement) !== 0) {
    // 找到父 DOM 节点
    let parentFiber = fiber.return;
    while (parentFiber !== null && parentFiber.stateNode == null) {
      parentFiber = parentFiber.return;
    }
    const parent = parentFiber?.stateNode;
    if (parent != null && fiber.stateNode != null) {
      // 插入 DOM
      parent.appendChild(fiber.stateNode);
    }
    // 清除 Placement 标记
    fiber.flags &= ~Placement;
  }
}

function commitLayoutEffects(finishedWork: FiberNode, root: FiberRootNode) {
  // 递归处理所有子节点的 layout 副作用（如 ref、useLayoutEffect、componentDidMount）
  let node: FiberNode | null = finishedWork;
  while (node !== null) {
    // 这里可以处理 ref、useLayoutEffect 等
    // 目前简化为递归遍历
    if (node.child !== null) {
      node = node.child;
      continue;
    }
    while (node !== null) {
      if (node.sibling !== null) {
        node = node.sibling;
        break;
      }
      node = node.return;
    }
  }
}

function requestPassiveEffectCleanup(finishedWork: FiberNode) {
  // 递归处理所有子节点的 passive 副作用（如 useEffect）
  let node: FiberNode | null = finishedWork;
  while (node !== null) {
    // 这里可以处理 useEffect 的清理和执行
    // 目前简化为递归遍历
    if (node.child !== null) {
      node = node.child;
      continue;
    }
    while (node !== null) {
      if (node.sibling !== null) {
        node = node.sibling;
        break;
      }
      node = node.return;
    }
  }
}

function scheduleNextUpdateIfNeeded(root: FiberRootNode) {
  // 这里可以实现调度下一帧更新的逻辑
  // 目前简化为无操作
}
