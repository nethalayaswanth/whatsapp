import { useSyncExternalStore } from "react";

const __DEV__ = process.env.NODE_ENV !== "production";
const __DEV_ERR__ = (msg) => {
  if (__DEV__) {
    throw new Error(msg);
  }
};

function isArrayLike(value) {
  return value != null && typeof value !== "function" && Array.isArray(value);
}

function isObject(value) {
  const type = typeof value;
  return value != null && type === "object" && !isArrayLike(value);
}

const createState = (key, listeners, data) => {
  const state = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => data[key],
    setSnapshot: (val) => {
      if (val !== data[key]) {
        data[key] = val;

        listeners.forEach((listener) => listener());
      }
    },
    useSnapshot: (selector) => {
      return useSyncExternalStore(
        state.subscribe,
        () => {
          return selector ? selector(state.getSnapshot()) : state.getSnapshot();
        },
        () => {
          return selector ? selector(state.getSnapshot()) : state.getSnapshot();
        }
      );
    },
  };
  return state;
};

const createStore = (data) => {
  const state = {};
  const methods = {};
  const listeners = new Set();
  if (Object.keys(data).length !== 0) {
    Object.keys(data).forEach((key) => {
      const initVal = data[key];

      if (initVal instanceof Function) {
        methods[key] = (...args) => {
          const res = initVal(...args);
          return res;
        };
        return;
      }
      if (isObject(data[key])) {
        if (Object.keys(data[key]).length === 0) return;
        data[key] = createStore(data[key]);
        return;
      }
      state[key] = createState(key, listeners, data);
    });
  }

  const setState = (key, val) => {
    if (key in data) {
      if (key in state) {
        const newVal = val instanceof Function ? val(data[key]) : val;
        state[key].setSnapshot(newVal);
      }
    } else {
      data[key] = val;
      if (val instanceof Function) {
        methods[key] = (...args) => {
          const res = val(data[key]);
          return res;
        };
        return;
      }
      state[key] = createState(key, listeners, data);
    }
  };

  const clearState = (newState,oldState ) => {

      if (Object.keys(oldState).length !== 0) {
           Object.keys(oldState).forEach((key) => {
             if(key in newState)return
             oldState.delete(key)
             if(key in state){
                 state.delete(key)
             }
             if(key in methods){
                 methods.delete(key)
             }
           });
         }
  };


  return new Proxy(() => undefined, {
    get: (target, key) => {
      if (key in methods) {
        return methods[key];
      }

      try {
        return state[key].useSnapshot();
      } catch (err) {
        return data[key];
      }
    },
    set: (_, key, val) => {
      setState(key, val);
      return true;
    },
    apply: (_, __,[ update]) => {
      
     
        
      if (isObject(update)) {
        if (Object.keys(update).length !== 0) {
          Object.keys(update).forEach((key) => {
            setState(key, update[key]);
          });
        }
      }else if(typeof update === 'function'){
        const newVal=update(data)
        clearState(newVal,data)
         if (Object.keys(newVal).length !== 0) {
           Object.keys(newVal).forEach((key) => {
             setState(key, newVal[key]);  
           });
         }
      }
      else {
        __DEV_ERR__(`updates  should be a object or function`);
      }
    },
  });
};

const store = (initialData) => {
  if (
    __DEV__ &&
    Object.prototype.toString.call(initialData) !== "[object Object]"
  ) {
    throw new Error("object required");
  }

  const data = { ...initialData };

  return createStore(data);
};

export default store;
