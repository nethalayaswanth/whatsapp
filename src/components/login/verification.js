import { LoginView } from ".";
import { useAnotherAccount } from "../../queries.js/useRequests";
const Verification = ({ user }) => {

  const verification=user.verification
  const {dp,username}=user
  const src=dp?.url
  
  const anotherAccount = useAnotherAccount()
  const handleAnotherAccount = async () => {
    try {
       anotherAccount.mutate();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <LoginView src={src} title={username} caption='welcome'>
      <div
        className={`px-[30px] mb-[3px] pb-[10px] outline-none    flex-shrink-0  bg-white basis-auto relative py-[10px] animate-land   `}
      >
        <div className="p-0 mb-[22px] text-[16px] leading-[16px]">
          <div className="flex items-center">
            <div>
              {`Verification email has been sent to ${verification?.email} ,please verify to visit the site.`}{" "}
              <span className="text-primary-green">Not your email?</span>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`px-[30px] mb-[3px] pb-[10px] outline-none    flex-shrink-0  bg-white basis-auto relative py-[10px] animate-land   `}
      >
        <div className="p-0  text-[16px] leading-[16px]">
          <div className="flex items-center ">
            <div
              onClick={handleAnotherAccount}
              className="text-primary-teal hover:cursor-pointer"
            >
              Use different account
            </div>
          </div>
        </div>
      </div>
    </LoginView>
  );
};

export default Verification;
