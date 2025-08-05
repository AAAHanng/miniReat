import { Update, UpdateQueue } from "../react-reconciler/types";

export function processUpdateQueue<State>(
  baseState: State,
  pendingUpdate: Update<State> | null
): { memoizedState: State } {
  let resultState = baseState;

  if (pendingUpdate !== null) {
    let update: Update<State> | null = pendingUpdate;

    // 假设这里只有一个 update，不是链表结构
    const action = update.action;

    if (typeof action === 'function') {
      // 如果是函数 action（类似 setState(prev => ...)）
      resultState = (action as (prev: State) => State)(baseState);
    } else {
      // 如果是值 action（类似 setState(123)）
      resultState = action;
    }
  }

  return { memoizedState: resultState };
}


// 可选：补全 updateQueue 相关方法，便于后续维护
export function createUpdateQueue<State>(): UpdateQueue<State> {
  return {
    shared: {
      pending: null
    }
  };
}

export function createUpdate<State>(action: State | ((prev: State) => State)): Update<State> {
  return {
    action
  };
}

export function enqueueUpdate<State>(updateQueue: UpdateQueue<State>, update: Update<State>): void {
  const pending = updateQueue.shared.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  updateQueue.shared.pending = update;
}
