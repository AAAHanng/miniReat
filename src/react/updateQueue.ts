import { Update, UpdateQueue } from "../react-reconciler/types";


// 处理 update 队列，支持链式环形 update
export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: Update<State> | null
): { memoizedState: State } => {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState,
  };

  if (pendingUpdate !== null) {
    let first = pendingUpdate.next === undefined ? pendingUpdate : pendingUpdate.next;
    let update = first;
    let state = baseState;
    do {
      const action = update.action;
      if (typeof action === 'function') {
        state = (action as (prev: State) => State)(state);
      } else {
        state = action;
      }
      update = update.next!;
    } while (update !== first && update != null);
    result.memoizedState = state;
  }

  return result;
};

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
