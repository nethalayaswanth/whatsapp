import { useCallback, useSyncExternalStore } from "react";

export const createStore = (initialState) => {
  let state = initialState;
  let isInitialized = false;

  const getState = () => state;
  const listeners = new Set();
  const init=(initState) => {
      if (!isInitialized) {
        state = initState;
      }
    }
  const setState = (fn) => {
    state = fn(state);
    listeners.forEach((l) => l());
  };
   const setRef = (fn) => {
    state = fn(state);
    // listeners.forEach((l) => l());
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = (selector) => {
    return useSyncExternalStore(
      subscribe,
      useCallback(() =>{ 
        
        return(selector ? selector(state) : undefined)},[selector]) 
    );
  };

  return { init,getState, setState,setRef, subscribe, useStore };
};
