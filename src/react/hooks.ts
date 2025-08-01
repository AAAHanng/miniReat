// hooks 全局状态
let _currentlyRenderingFiber: any = null;
let _workInProgressHook: any = null;
let _currentHook: any = null;

// dispatcher 对象
export const currentDispatcher = { current: null as any };

// 挂载阶段 dispatcher
export const HooksDispatcherOnMount = {
  // 这里可以实现 useState/useReducer/useEffect 等
};

// 更新阶段 dispatcher
export const HooksDispatcherOnUpdate = {
  // 这里可以实现 useState/useReducer/useEffect 等
};

// setter/getter
export function setCurrentlyRenderingFiber(fiber: any) {
  _currentlyRenderingFiber = fiber;
}
export function getCurrentlyRenderingFiber() {
  return _currentlyRenderingFiber;
}
export function setWorkInProgressHook(hook: any) {
  _workInProgressHook = hook;
}
export function getWorkInProgressHook() {
  return _workInProgressHook;
}
export function setCurrentHook(hook: any) {
  _currentHook = hook;
}
export function getCurrentHook() {
  return _currentHook;
}