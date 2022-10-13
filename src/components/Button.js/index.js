


export const Button = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="m-0 p-0 outline-none border-0 cursor-pointer h-full absolute top-0 left-0 transition-all duration-300"
    >
      {children}
    </button>
  );
};