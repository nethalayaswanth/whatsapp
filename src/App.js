import { QueryErrorResetBoundary, useIsRestoring } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import StartUp from "./components/startUp";
import LoginPage from "./pages/login";
import Messenger from "./pages/messenger";
import { useUser } from "./queries.js/useRequests";

function App({ isRestoring }) {

   
  
 
  const { data } = useUser();

  return (
    <>
      {
        <div id="app" className="App w-full ">
          <div className="relative w-full h-full overflow-hidden z-[100]">
            {  data.verification ? (
              <Messenger />
            ) : (
              <LoginPage />
            )}
           
            <div className=" z-[-1] w-full h-[127px] fixed top-0 left-0 bg-app-stripe"></div>
          </div>
        </div>
      }
    </>
  );
}

function Index() {
  const isRestoring = useIsRestoring();
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
            {isRestoring ? (
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  position: "absolute",
                  background: "white",
                }}
              >
                {" "}
              </div>
            ) : (
              <Suspense fallback={<StartUp />}>
                <App />
              </Suspense>
            )}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
      <ReactQueryDevtools initialIsOpen />
    </>
  );
}

export default Index;
