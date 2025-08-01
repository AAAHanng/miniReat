import {FiberNode, NoFlags} from "../react-reconciler/types";
import { Props } from "../shared/types";

export function createWorkInProgress(
    current: FiberNode,
    pendingProps: Props
): FiberNode {
  let wip = current.alternate;

  // 🧱 mount 阶段（第一次渲染）
  if (wip === null) {
    wip = new FiberNode(
        current.tag,
        pendingProps,
        current.key
    );

    // 复制必要的属性
    wip.type = current.type;
    wip.stateNode = current.stateNode;

    // 建立双向 alternate 连接（current <-> workInProgress）
    wip.alternate = current;
    current.alternate = wip;
  } else {
    // 🛠 update 阶段：复用 wip 节点，只更新部分字段
    wip.pendingProps = pendingProps;

    wip.flags = NoFlags;
    wip.subtreeFlags = NoFlags;
  }

  // 复制状态和结构相关内容
  wip.type = current.type;
  wip.updateQueue = current.updateQueue;
  wip.child = current.child;
  wip.memoizedProps = current.memoizedProps;
  wip.memoizedState = current.memoizedState;
  return wip;
}
