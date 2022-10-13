import * as React from "react";

const SidebarContext = React.createContext();

const initialState = {
  open: false,
  active: null,
  from:null,
  detailsOpened:false
};
function sideReducer(state, action) {
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
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function SidebarProvider({ children }) {
  const [state, dispatch] = React.useReducer(sideReducer, initialState);

  const value = [state, dispatch];
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export { SidebarProvider, useSidebar };
