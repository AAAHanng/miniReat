import {FiberNode, HostText, Placement} from "./types";
import {ReactElementType} from "../react/types";
import {createFiberFromElement} from "../react/beginWork";
import {REACT_ELEMENT_TYPE} from "../shared/constants";

export function ChildReconciler(shouldTrackEffects: boolean) {
    function reconcileSingleElement(
        returnFiber: FiberNode,                // 父 Fiber
        currentFiber: FiberNode | null,        // 当前 Fiber（老 Fiber）
        element: ReactElementType              // 新的 React 元素（JSX）
    ): FiberNode {
        // Step 1：用 JSX element 创建新的 Fiber 节点
        const fiber = createFiberFromElement(element);

        // Step 2：将 fiber 的 return 属性指向父节点
        fiber.return = returnFiber;

        // Step 3：返回这个新的子 Fiber，作为 wip.child
        return fiber;
    }

    function reconcileSingleTextNode(
        returnFiber: FiberNode,                // 父 Fiber
        currentFiber: FiberNode | null,        // 当前 Fiber（老 Fiber）
        content: string | number               // 新的文本节点内容
    ): FiberNode {
        // Step 1：用文本节点内容创建新的 Fiber 节点
        const fiber = new FiberNode(HostText, {content},null);

        // Step 2：将 fiber 的 return 属性指向父节点
        fiber.return = returnFiber;

        // Step 3：返回这个新的子 Fiber，作为 wip
        return fiber;
    }

    function placeSingleChild(
        fiber: FiberNode // 单个子 Fiber
    ): FiberNode {
        // 如果需要跟踪副作用，并且这个 fiber 没有 alternate（即不是更新，而是初次挂载）
        if (shouldTrackEffects && fiber.alternate === null) {
            // 设置插入标记，用于 commit 阶段插入 DOM
            fiber.flags |= Placement;
        }
        return fiber;
    }

    return function reconcileChildFibers(
        returnFiber: FiberNode,        // 父 fiber
        currentFiber: FiberNode | null, // 当前旧 fiber（可为空）
        newChild: ReactElementType     // 新的 virtual DOM
    ): FiberNode | null {

        // 1. 判断 newChild 类型是否为合法对象
        if (typeof newChild === 'object' && newChild !== null) {
            debugger;
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    // 如果是 React 元素类型（<div>、<Component> 等）
                    return placeSingleChild(
                        reconcileSingleElement(returnFiber, currentFiber, newChild)
                    );

                default:
                    console.warn("⚠️ 未实现的 reconcile 类型:", newChild);
                    break;
            }
        }

        // 2. HostText 类型（文本节点）
        if (typeof newChild === 'string' || typeof newChild === 'number') {
            return placeSingleChild(
                reconcileSingleTextNode(returnFiber, currentFiber, String(newChild))
            );
        }

        // 3. TODO: 未来支持数组、Fragment、多个子元素
        // if (Array.isArray(newChild)) { ... }

        // 4. 否则返回 null，表示删除旧 fiber 或无效新 fiber
        return null;
    }
}


export const mountChildFibers = ChildReconciler(true)

export const reconcileChildFibers = ChildReconciler(false)