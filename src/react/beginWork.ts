import {
  FiberNode,
  FunctionComponent,
  HostComponent,
  HostRoot,
  Placement,
  UpdateQueue,
  WorkTag
} from "../react-reconciler/types";
import {REACT_ELEMENT_TYPE} from "../shared/constants";
import {ReactElementType} from "./types";
import {processUpdateQueue} from "./updateQueue";
// hooks 相关全局变量和 dispatcher 建议放在 hooks.ts 并在此引入
import {
  currentDispatcher,
  HooksDispatcherOnMount,
  HooksDispatcherOnUpdate,
  setCurrentlyRenderingFiber,
  setWorkInProgressHook,
  setCurrentHook
} from './hooks';
import {mountChildFibers, reconcileChildFibers} from "../react-reconciler/childFibers";

export function beginWork(workInProgress: FiberNode) {
    debugger
    switch (workInProgress.tag) {
        case FunctionComponent:
            return updateFunctionComponent(workInProgress);

        case HostComponent:
            return updateHostComponent(workInProgress);

        case HostRoot:
            return updateHostRoot(workInProgress);

        // case HostText:
        //   return updateFragment(workInProgress);

        default:
            return null;
    }
}

function updateFunctionComponent(workInProgress: FiberNode) {
    // 执行函数组件并处理 hooks，返回 ReactElement（children）
    const nextChildren = renderWithHooks(workInProgress);

    // 构建子 fiber 树
    reconcileChildren(workInProgress, nextChildren);

    // 返回 child，继续处理子组件
    return workInProgress.child;
}

function updateHostComponent(workInProgress: FiberNode) {
    // 处理 HostComponent 的逻辑
    const nextChildren = workInProgress.pendingProps.children;
    reconcileChildren(workInProgress, nextChildren);
    return workInProgress.child;
}

function updateHostRoot(wip: FiberNode): FiberNode | null {
    // 1. 获取当前的 base state（旧状态）
    const baseState = wip.memoizedState;

    // 2. 拿到更新队列
    const updateQueue = wip.updateQueue as UpdateQueue<Element>;

    // 3. 取出 pending 更新链表（环形链表）
    const pending = updateQueue.shared.pending;

    // 4. 清空 pending，准备处理
    updateQueue.shared.pending = null;

    // 5. 调用 processUpdateQueue 计算新的 state
    const {memoizedState} = processUpdateQueue(baseState, pending);

    // 6. 更新 fiber 的 memoizedState
    wip.memoizedState = memoizedState;

    // 7. 拿到新的 children（通常是 React 元素树）
    const nextChildren = wip.memoizedState;

    // 8. 协调子节点，生成新的子 Fiber
    reconcileChildren(wip, nextChildren);

    // 9. 返回第一个子 Fiber，继续协调
    return wip.child;
}

const shouldTrackEffects = true;

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
    const current = wip.alternate;
    if (current !== null) {
        // update 流程：对比新旧子节点
        wip.child = reconcileChildFibers(wip, current?.child, children);
    } else {
        // mount 流程：首次渲染
        wip.child = mountChildFibers(wip, null, children);
    }
}

function placeSingleChild(fiber: FiberNode): FiberNode {
    // 如果需要跟踪副作用，并且这个 fiber 没有 alternate（即不是更新，而是初次挂载）
    if (shouldTrackEffects && fiber.alternate === null) {
        // 设置插入标记，用于 commit 阶段插入 DOM
        fiber.flags |= Placement;
    }
    return fiber;
}



export function createFiberFromElement(element: ReactElementType): FiberNode {
    const {type, key, props} = element;

    let fiberTag: WorkTag = FunctionComponent; // 默认假设是函数组件

    if (typeof type === 'string') {
        // HTML 原生标签，比如 <div>
        fiberTag = HostComponent;
    } else if (typeof type !== 'function') {
        // 既不是函数组件，也不是原生组件，警告一下
        console.warn("未定义的 type 类型", element);
    }

    // 创建 FiberNode
    const fiber = new FiberNode(fiberTag, props, key);
    fiber.type = type;

    return fiber;
}

export function renderWithHooks(wip: FiberNode) {
    // 当前正在渲染的 fiber 赋值为 wip
    setCurrentlyRenderingFiber(wip);

    // 清空 hook 链表
    wip.memoizedState = null;

    // 重置工作 hook 指针
    setWorkInProgressHook(null);
    setCurrentHook(null);

    const current = wip.alternate;

    // 区分首次挂载和更新
    if (current !== null) {
        // update 阶段：设置 hook 调度器
        currentDispatcher.current = HooksDispatcherOnUpdate;
    } else {
        // mount 阶段：设置 hook 调度器
        currentDispatcher.current = HooksDispatcherOnMount;
    }

    // 函数组件执行 —— 触发 hook 调用（如 useState）
    const Component = wip.type;
    const props = wip.pendingProps;
    const children = Component(props);

    // 清空全局变量，避免副作用
    setCurrentlyRenderingFiber(null);
    setWorkInProgressHook(null);
    setCurrentHook(null);

    return children;
}