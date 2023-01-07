import { useCallback, useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import whatsapp from "../../assets/whatsapp.png";
import { useSidebar } from "../../contexts/sidebarContext";
import { checkUsername } from "../../queries.js/api";
import {
  useLogin,
  useSignUp,
  useUser
} from "../../queries.js/useRequests";
import SpriteRenderer from "../spriteRender";
import Form from "./form";

const Login = () => {
  const [sideBar, dispatch] = useSidebar();
  const {
    data: { verification },
  } = useUser();

  const [loginRoute, setLoginRoute] = useState(true);
  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    setFocus,
    clearErrors,
    formState: { errors, isValid },
  } = useForm();

  const onError = (error) => {};
  const onSuccess = (data) => {
 
  };
  const login = useLogin({
    mutationOptions: {
      onSuccess,
      onError: (e) => {
        setError("username", { message: e.message });
      },
    },
  });
  const signUp = useSignUp({
    mutationOptions: {
      onSuccess,
      onError: (e) => {
        setError("email", { message: e.message });
      },
    },
  });
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

  const [usernameChecking,setUsernameChecking]=useState(false)

  const onWatchChange = useCallback(
    async (name, value) => {
      try {
        if (name === "username") {
          setUsernameChecking(true)
          const data = await checkUsername({ username: value });
          setUsernameChecking(false)
          clearErrors("username");

          if (data.taken) {
            setError("username", {
              type: "server side",

              message: data.message,
            });
          }

          return;
        }
      } catch (e) {}
    },
    [clearErrors, setError]
  );

  useEffect(()=>{
    setFocus("username", { shouldSelect: true });
  },[setFocus])
  
 
  const loading = login.isLoading || signUp.isLoading
  
const title=loginRoute ? "Login" : "SignUp"

const caption = loginRoute ? "Hi, Welcome back 👋" : "join our community";
  return (
    <LoginView title={title} caption={caption} >
    <Form
              onSubmit={onSubmit}
              loginRoute={loginRoute}
              onWatchChange={onWatchChange}
              onError={onError}
              loading={loading}
              usernameChecking={usernameChecking}
              form={{
                register,
                handleSubmit,
                watch,
                control,
                errors,
                isValid,
              }}
              toggle={() => {
                setLoginRoute((x) => !x);
              }}
            />
    </LoginView>
          // {!verificationPending ? (
            
          // ) : (
          //   <Verification verification={verification} />
          // )}
      
  );
};


export const LoginView = ({ title, caption, children,src}) => {
  return (
    <span className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden  ">
      <div className="absolute top-0 left-0 h-full w-full overflow-x-hidden overflow-y-hidden pointer-events-auto bg-drawer-bg flex flex-col ">
        <header
          className={`flex flex-col justify-end h-[80px] pr-[20px] pl-[23px] flex-none text-panel-header-coloured `}
        >
          <div className="flex items-center w-[full] p-0 bg-inherit font-semibold text-[14px] mb-[4px] ">
            {title}
          </div>
          <div
            className={`align-left text-primary-teal   font-normal text-[12px] leading-[12px] `}
          >
            {caption}
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
                {  src?<img  src={src} alt='' /> : <SpriteRenderer src={whatsapp} size={200} />}
                </div>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </span>
  );
};

export default Login;
