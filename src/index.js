import { QueryClient } from "@tanstack/react-query";
import { del, get, set } from "idb-keyval";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ErrorBoundary } from "react-error-boundary";
import StartUp from "./components/startUp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 10,
      retry: 3,
      // notifyOnChangeProps: "tracked",
    },
  },
});

export function createIDBPersister(idbValidKey = "reactQuery") {
  return {
    persistClient: async (client) => {
      set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  };
}

const persister = createIDBPersister();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => {
      //console.log('APP')
      return (
        <StartUp>
          <div className=" flex flex-col text-text-primary">
            {error}
            <button
              className="text-danger"
              onClick={() => {
                resetErrorBoundary();
              }}
            >
              Try again
            </button>
          </div>
        </StartUp>
      );
    }}
  >
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <App />
    </PersistQueryClientProvider>
  </ErrorBoundary>
);

reportWebVitals();
