import { useCallback, useRef, useState } from "react";

import { useForm } from "react-hook-form";
import { ReactComponent as InValid } from "../../assets/close.svg";
import { ReactComponent as Valid } from "../../assets/ok.svg";
import whatsapp from "../../assets/whatsapp.png";
import { useSidebar } from "../../contexts/sidebarContext";
import { checkUsername } from "../../requests.js/api";
import { useLoginUser, useSignUpUser } from "../../requests.js/useRequests";
import SpriteRenderer from "../spriteRender";
import Input from "./input";



const Form = ({ onSubmit, loginRoute,toggle }) => {
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

        //  if (name === "email") {
        //    const data = await checkUserEmail({email:value });

        //    clearErrors("usernameCheck");

        //    if (data.taken) {
        //      setError("usernameCheck", {
        //        type: "server side",

        //        message: data.message,
        //      });
        //    }

        //    return;
        //  }
      } catch (e) {}
    },
    [clearErrors, setError]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <Input
        label={!loginRoute ? "Username" : "Username / Email address"}
        type="text"
        placeholder="monynethala"
        control={control}
        error={errors.username}
        {...(!loginRoute && { onWatchChange: onWatchChange })}
        {...register("username", {
          required: "You must enter username",
          minLength: {
            value: 2,
            message: "username must have at least 2 characters",
          },
        })}
      >
        {!loginRoute ? (
          errors.username ? (
            <InValid style={{ width: "18px", height: "18px" }} />
          ) : (
            <Valid style={{ width: "18px", height: "18px" }} />
          )
        ) : null}
      </Input>
      {!loginRoute && (
        <Input
          label="Email"
          type={"email"}
          control={control}
          placeholder="example@gmail.com"
          error={errors.email}
          {...register("email", {
            required: "You must enter valid email",
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "You must enter valid email",
          })}
        />
      )}
      {/* <Input
              label="New Password"
              placeholder="new password"
              control={control}
              onWatchChange={onWatchChange}
              error={errors.newPassword}
              className="mb-[0] border-b-[1px] border-solid border-border-list "
              type="password"
              {...register("newPassword", {
                required: "You must specify a password",
                minLength: {
                  value: 8,
                  message: "Password must have at least 8 characters",
                },
              })}
            />
            <Input
              placeholder="confirm new password"
              control={control}
              label="Confirm password"
              type="password"
              error={errors.confirmPassword}
              onWatchChange={onWatchChange}
              {...register("confirmPassword", {
                required: true,
                validate: (value) => {
                  return (
                    value === passwordRef.current ||
                    "The passwords do not match"
                  );
                },
              })}
            /> */}

      <div
        className={`px-[30px] mb-0 pb-[10px] outline-none    flex-shrink-0 flex-grow bg-white basis-auto relative py-[10px] animate-land   `}
      >
        <div className="p-0 mb-[22px]"></div>
        <button
          type="submit"
          className="h-[32px] w-full py-[8px] mb-[10px] flex items-center justify-center text-white   bg-app-stripe active:bg-primary-teal rounded-[3px] text-[12px] leading-[12px]"
        >
          {loginRoute ? "Login" : "SignUp"}
        </button>
        <div className="flex items-center justify-center ">
          <span className="align-middle  hover:cursor-pointer  font-normal text-[12px] leading-[12px]">
            {!loginRoute ? "Already have an account?" : "Not registered yet?"}{" "}
            <span
              className="text-primary-teal hover:text-panel-header-coloured"
              onClick={() => {
                toggle();
              }}
            >
              {!loginRoute ? "login" : "signUp"}
            </span>
          </span>
        </div>
      </div>
    </form>
  );
};

export default Form;
