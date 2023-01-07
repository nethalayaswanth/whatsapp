import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { QueryClient } from "@tanstack/react-query";
import { get, set, del } from "idb-keyval";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

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
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister }}
  >
    <App />
  </PersistQueryClientProvider>
);

reportWebVitals();
