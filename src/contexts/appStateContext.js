
import * as React from "react";



const reducer = (state, action) => {
  switch (action.type) {
    case "set state":
      return { ...state, ...action.payload };
    case "set current room":
      return { ...state, currentRoom: action.payload,preview:true };
    
    case "new room": {
      return {
        ...state,
        currentRoom: action.payload,
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

const initialState = {
  currentRoom: null,
  draftRooms: {},
  users: {},
  preview:false,
  socket:null
};




const AppStateContext = React.createContext();

function AppStateProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const value = [state, dispatch];
  value.state=state;
  value.dispatch=dispatch;
  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

function useAppState() {
  const context = React.useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within a AppStateProvider");
  }
  return context;
}


export { AppStateProvider, useAppState };