import { useSidebar } from "../../contexts/sidebarContext";

export const MenuItem = ({ index, name, onClick }) => {
  const handleClick = () => {
   
    onClick?.( name);
  };
  return (
    <li
      id={name}
      style={{
        animationDuration: `${index * 0.1}s`,
      }}
      className="animate-fadeIn active:bg-primary-backdrop hover:bg-primary-backdrop"
      onClick={handleClick}
    >
      <div className="pl-[24px]  pr-[58px] pt-[13px] cursor-pointer relative flex-grow overflow-hidden text-ellipsis whitespace-nowrap block h-[40px] text-[14.5px] leading-[14.5px] text-primary-default ">
        {name}
      </div>
    </li>
  );
};

export const MenuContainer = ({ items, onClick }) => {
  return (
    <div className="Py-[9px] bg-white rounded-[3px] shadow-md ">
      <ul className="p-0 m-0 list-none">
        {items.map((item, i) => {
          return (
            <MenuItem key={item} name={item} onClick={onClick} index={i} />
          );
        })}
      </ul>
    </div>
  );
};

export default function Menu({ handleClose }) {
  const items = ["New Group", "New Chat", "Log out"];

  const [sideBar, setSideBar] = useSidebar();

  const handleClick = ({ name }) => {
    switch (name) {
      case "New Group": {
        handleClose?.();
        setSideBar({
          type: "set state",
          payload: { open: true, active: "new group" },
        });
        break;
      }
      case "New Chat": {
        handleClose?.();
        setSideBar({
          type: "set state",
          payload: { open: true, active: "new chat" },
        });
        break;
      }

      default: {
      }
    }
  };
  return <MenuContainer items={items} onClick={handleClick} />;
}

export function MessageActions({ handleClose }) {
  const items = [
    "Message info",
    "Reply",
    "React to message",
    "Forward message",
    "Delete message",
  ];

  return <MenuContainer items={items} />;
}
