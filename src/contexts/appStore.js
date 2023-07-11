import { createContext, useCallback, useContext, useState } from "react";

import createStore from "./exStore";
const AppContext = createContext();

const initialState = {
  roomId: null,
  roomType: "private",
  privateMember: null,
  preview: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "set state":
      return { ...state, ...action.payload };
    case "set current room":
      return { ...state, ...action.payload, preview: true };

    case "new room": {
      return {
        ...state,
        ...action.payload,
        preview: true,
      };
    }
    case "add room":
      return {
        ...state,
        rooms: { ...state.rooms, [action.payload.id]: action.payload },
      };
    default:
      return state;
  }
};

function AppProvider({ children }) {
  const [store] = useState(() => createStore(initialState));

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within a AppProvider");
  }
  return context;
}

function useAppDispatch() {
  const appStore = useContext(AppContext);

  if (appStore === undefined) {
    throw new Error("useAppDispatch must be used within a AppProvider");
  }

  const dispatch = useCallback(
    (action) => {
      //console.log(action.type)
      appStore((state) => reducer(state, action));
    },
    [appStore]
  );
  return dispatch;
}

export { AppProvider, useAppDispatch, useAppState };
