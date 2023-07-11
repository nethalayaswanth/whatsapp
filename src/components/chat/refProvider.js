



import * as React from "react";

const Context = React.createContext();

function RefProvider({ children }) {
 
      const scroller = React.useRef();
      const footer = React.useRef();

  return (
    <Context.Provider value={{scroller,footer}}>
    {children}
    </Context.Provider>
  );
}

function useRefs() {
  const context = React.useContext(Context);
  if (context === undefined) {
    throw new Error("useRefs must be used within a RefProvider");
  }
  return context;
}


export {RefProvider,useRefs}