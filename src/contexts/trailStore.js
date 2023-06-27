import * as React from "react";
import { useCallback } from "react";
import store from "./exStore";

const reducer = (state, action) => {
  switch (action.type) {
    case "set state":
      return { ...state, ...action.payload };
    case "set current room":
      return { ...state, currentRoom: action.payload, preview: true };

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

export const appStore = store({
  currentRoom: null,
});


