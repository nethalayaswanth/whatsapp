import Messenger from "./pages/messenger";
import {
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
  useIsRestoring,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useUser } from "./requests.js/useRequests";
import LoginPage from "./pages/login";
import { useEffect, useRef, useMemo } from "react";
import { useCallback } from "react";

function App() {
  const { data,isLoading } = useUser();

 
  const isRestoring = useIsRestoring();

  
if (isLoading ) return null



  return (
    <>
      {!isRestoring && (
        <div id="app" className="App w-full ">
          <div className="relative w-full h-full overflow-hidden z-[100]">
            {data.user && data.verified==='success'? <Messenger /> : <LoginPage />}
            {/* <LoginPage /> */}
            <div className=" z-[-1] w-full h-[127px] fixed top-0 left-0 bg-app-stripe"></div>
          </div>
        </div>
      )}
    </>
  );
}

function Index() {
  return (
    <>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div>
                There was an error!{" "}
                <button onClick={() => resetErrorBoundary()}>Try again</button>
                <pre style={{ whiteSpace: "normal" }}>{error.message}</pre>
              </div>
            )}
            onReset={reset}
          >
            <Suspense fallback={<h1>Loading </h1>}>
              <App />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
      <ReactQueryDevtools initialIsOpen />
    </>
  );
}

export default Index;
