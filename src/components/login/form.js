import { ReactComponent as InValid } from "../../assets/close.svg";
import { ReactComponent as Valid } from "../../assets/ok.svg";
import Spinner from "../spinner";
import Input from "./input";

const Form = ({
  onSubmit,
  form,
  loading,
  onWatchChange,
  onError,
  loginRoute,
  usernameChecking,
  toggle,
}) => {
  const { register, handleSubmit, control, errors, isValid } = form;


  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <Input
        label={!loginRoute ? "Username" : "Username / Email address"}
        type="text"
       
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
        {errors.username ? (
          <InValid style={{ width: "18px", height: "18px" }} />
        ) : usernameChecking ? (
          <Spinner style={{ width: "18px", height: "18px" }} />
        ) : (
          <Valid style={{ width: "18px", height: "18px" }} />
        )}
      </Input>
      {!loginRoute && (
        <Input
          label="Email"
          type={"email"}
          control={control}
         
          error={errors.email}
          {...register("email", {
            required: "You must enter valid email",
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "You must enter valid email",
          })}
        >
          {errors.email ? (
            <InValid style={{ width: "18px", height: "18px" }} />
          ) : null}
        </Input>
      )}
  

      <div
        className={`px-[30px] mb-0 pb-[10px] outline-none    flex-shrink-0 flex-grow bg-white basis-auto relative py-[10px] animate-land   `}
      >
        <div className="p-0 mb-[22px]"></div>
        <button
          type="submit"
          disabled={loading || usernameChecking}
          className="h-[32px] w-full py-[8px] mb-[10px] flex items-center justify-center text-white   bg-app-stripe active:bg-primary-teal rounded-[3px] text-[12px] leading-[12px]"
        >
          {loading ? (
            <Spinner style={{ width: 18, height: 28 }} />
          ) : loginRoute ? (
            "Login"
          ) : (
            "SignUp"
            
          )}
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
