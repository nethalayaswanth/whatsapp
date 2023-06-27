import { useState, createContext, useContext, useCallback } from "react";

import createStore from "./exStore";

const SidebarContext = createContext();

const initialState = {
  open: false,
  active: null,
  from:null,
  detailsOpened:false,
  selected:[]
};
function reducer(state, action) {
  switch (action.type) {
    case "set state": {
      return { ...state, ...action.payload };
    }
    case "toggle": {
      return { ...state, open: !state.open };
    }
    case "reset": {
      return { ...initialState };
    }
     case "select": {

      return { ...state,selected:[...state.selected,action.user]};
     }

    case "deselect": {

      
      const id=action.id
      const rest=state.selected.filter((user)=>user.id!==id)

      return { ...state, selected: rest };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function SidebarProvider({ children }) {

  const [store] = useState(() => createStore(initialState));


  return (
    <SidebarContext.Provider value={store}>{children}</SidebarContext.Provider>
  );
}

function useSidebarState() {
  const context =useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarState must be used within a SidebarProvider");
  }
  return context;
}


function useSidebarDispatch() {
  const chatStore = useContext(SidebarContext);

  if (chatStore === undefined) {
    throw new Error("useChatDispatch must be used within a ChatProvider");
  }

  const dispatch = useCallback(
    (action) => {
      chatStore((state) => reducer(state, action));
    },
    [chatStore]
  );
  return dispatch;
}


export { SidebarProvider, useSidebarState, useSidebarDispatch };
