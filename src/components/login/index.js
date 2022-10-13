import { useCallback, useRef, useState } from "react";

import { useForm } from "react-hook-form";
import whatsapp from "../../assets/whatsapp.png";
import { useSidebar } from "../../contexts/sidebarContext";
import { checkUsername } from "../../requests.js/api";
import { useLoginUser, useSignUpUser, useUser } from "../../requests.js/useRequests";
import SpriteRenderer from "../spriteRender";
import Form from "./form";
import Verification from "./verification";




const Login = () => {
  const [sideBar, dispatch] = useSidebar();
  const {
    data: { verified },
  } = useUser();



  const [loginRoute, setLoginRoute] = useState(true);
  const {
    register,

    handleSubmit,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm();

  const onError = (data) => {};
  const onSuccess = (data) => {};
  const login = useLoginUser({ onSuccess });
  const signUp = useSignUpUser({ onSuccess });
  const onSubmit = (data) => {
    if (loginRoute) {
      login.mutate({
        input: data.username,
      });
    } else {
      signUp.mutate({
        username: data.username,
        email: data.email,
      });
    }
  };
  const [state, render] = useState(false);
  const passwordRef = useRef();
  const onWatchChange = useCallback(
    async (name, value) => {
      try {
        if (name === "username") {
          const data = await checkUsername({ username: value });

          clearErrors("usernameCheck");

          if (data.taken) {
            setError("usernameCheck", {
              type: "server side",

              message: data.message,
            });
          }

          return;
        }

        if (name === "email") {
          if (!state) {
            render(true);
          }

          passwordRef.current = value;

          return;
        }   
      } catch (e) {}
    },
    [clearErrors, setError, state]
  );

 
  const verification =
    verified || signUp?.data?.verified || login?.data?.verified;
  const verificationPending =verification?.pending 
    
  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <header
          className={`flex flex-col justify-end h-[80px] pr-[20px] pl-[23px] flex-none text-panel-header-coloured `}
        >
          <div className="flex items-center w-[full] p-0 bg-inherit font-semibold text-[14px] mb-[4px] ">
            {loginRoute ? "Login" : "SignUp"}
          </div>
          <div
            className={`align-left text-primary-teal   font-normal text-[12px] leading-[12px] `}
          >
            {loginRoute ? "Hi, Welcome back 👋" : "join our community"}
          </div>
        </header>
        <div
          onClick={() => {}}
          className="w-full flex  flex-col overflow-x-hidden overflow-y-auto z-[100] relative flex-1  "
        >
          <div className="flex-none my-[32px] flex justify-center ">
            <div className="mx-[auto] animate-pop  w-[200px] h-[200px]  relative ">
              <div className="cursor-pointer mx-[auto] bg-center rounded-full relative overflow-hidden h-full w-full">
                <div className="absolute z-[500] top-0 left-0 h-full w-full">
                  <SpriteRenderer src={whatsapp} size={200} />
                </div>
              </div>
            </div>
          </div>

          {!verificationPending ? (
            <Form
              onSubmit={onSubmit}
              loginRoute={loginRoute}
              toggle={() => {
                setLoginRoute((x) => !x);
              }}
            />
          ) : (
            <Verification verification={verification} />
          )}

          {/* <Verification verification={verification} /> */}
        </div>
      </div>
    </span>
  );
};

export default Login;
