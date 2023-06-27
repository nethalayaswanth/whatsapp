import {
  Children,
  cloneElement,
  useEffect,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import usePrevious from "../hooks/usePrevious";
import useAnimationFrame from "../hooks/useAnimationFrame";

const NavItem = ({ name, onClick, activetext, index }) => {
  const handleClick = () => {
    onClick?.({ index });
  };

  return (
    <div
      style={{ color: activetext }}
      onClick={handleClick}
      className="cursor-pointer text-[13px] leading-[19px] overflow-hidden flex-1 uppercase flex flex-col h-full items-center justify-center px-[4px] text-inherit "
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full inline-block">
        {name}
      </span>
    </div>
  );
};

const tabsMenu = ["media", "docs"];

const Navbar = ({
  onClick,
  menu = tabsMenu,
  style = {},
  activeBar,
  activetext,
  className,
}) => {
  const [activeStyles, setActiveStyles] = useState({});

  const navMenu = tabsMenu;
  const handleClick = useCallback(
    ({ index }) => {
      onClick?.(navMenu[index], index);
      setActiveStyles({
        transform: `translateX(${index * 100}%)`,
        transition: "transform .3s cubic-bezier(.1,.82,.25,1)",
      });
    },
    [navMenu, onClick]
  );

  const width = 100 / navMenu.length;

  return (
    <div
      style={{ ...style }}
      className={` border-panel-header relative z-[300] items-center flex flex-none h-[44px] text-panel-default ${className}`}
    >
      {navMenu.map((item, i) => {
        return (
          <NavItem
            activetext={activetext}
            key={i}
            index={i}
            name={item}
            onClick={handleClick}
          />
        );
      })}
      <div
        style={{ width: `${width}%`, ...activeStyles, background: activeBar }}
        className={` h-[4px] absolute bottom-[0]  left-0 bg-tab-active z-[500]`}
      ></div>
    </div>
  );
};

const TabNavigation = ({
  children,
  style,
  activeBar,
  activetext,
  className,
  duration=100
}) => {
  const arrayChildren = Children.toArray(children);

  const tabsRef = useRef(new Set());

  const [active, setActive] = useState(0);

  const prevActive = usePrevious(active);

  const [mount, setMount] = useState(false);

  const handleClick = (active, index) => {
    setActive(index);
  };

  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIn = (x) => x * x;

  const initialStyles = {
    enter: { x: 0, opacity: 0 },
    leave: { x: 0, opacity: 1 },
  };

  const [styles, setStyles] = useState(initialStyles);

  useLayoutEffect(() => {
    if (active.toString() && prevActive !== null) {
      setMount(true);
    }
  }, [active, prevActive]);

  useAnimationFrame(
    (progress) => {
      const enterFromLeft = parseInt(active) > parseInt(prevActive);

      const [from, to] = enterFromLeft ? [-80, 0] : [80, 0];

      const [leaveFrom, leaveTo] = enterFromLeft ? [0, 50] : [0, -50];
      const enterTranslate = lerp(from, to, progress);
      const fadeIn = lerp(0, 1, progress);
      const fadeOut = lerp(0, 1, 1 - progress);
      const leaveTranslate = lerp(leaveFrom, leaveTo, progress);

      setStyles({
        enter: { x: enterTranslate, opacity: 1 },
        leave: { x: leaveTranslate, opacity: fadeOut },
      });
      if (progress >= 1) {
        setMount(false);
        setStyles({
          enter: { x: 0, opacity: 0 },
          leave: { x: 0, opacity: 1 },
        });
      }
    },
    { shouldAnimate: mount, duration: duration }
  );

  return (
    <div className="relative flex flex-1 flex-col">
      {
        <Navbar
          className={className}
          onClick={handleClick}
          style={style}
          activetext={activetext}
          activeBar={activeBar}
        />
      }
      <div className="relative flex-1 ">
        {mount && (
          <div
            style={{
              transform: `translateX(${styles.leave.x}%)`,
              opacity: styles.leave.opacity,
            }}
            className="absolute top-0 left-0 w-full h-full"
            key={"prevActive"}
            ref={(node) => {
              if (node) {
                tabsRef.current.add(node);
              }
            }}
          >
            {arrayChildren[parseInt(prevActive)]}
          </div>
        )}
        <div
          style={{
            transform: `translateX(${styles.enter.x}%)`,
            opacity: !mount ? 1 : styles.enter.opacity,
          }}
          className="absolute z-[1] top-0 left-0 w-full h-full"
          key={"active"}
          ref={(node) => {
            if (node) {
              tabsRef.current.add(node);
            }
          }}
        >
          {arrayChildren[active]}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
