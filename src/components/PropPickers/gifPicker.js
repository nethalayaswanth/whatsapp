import { useLayoutEffect, useState, useRef, useCallback } from "react";
import {
  Grid,
  SearchBar,
  SearchContext,
  SearchContextManager,
  SuggestionBar,
} from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import Disclosure from "../Disclosure";
import useDisclosure from "../../hooks/useDisclosure";
import useTransition from "../../hooks/useTransition";
import useWindowSize from "../../hooks/useWindowResize";
import { useMemo } from "react";

const NavItem = ({ name, onClick, index }) => {
  const handleClick = () => {
    onClick?.({ index });
  };

  return (
    <div
      onClick={handleClick}
      className="text-[13px] leading-[19px] overflow-hidden flex-1 uppercase flex flex-col items-center justify-center px-[4px] text-panel-secondary "
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full inline-block">
        {name}
      </span>
    </div>
  );
};

const gifNavMenu = [
  "trending",
  "sad",
  "love",
  "reactions",
  "sports",
  "haha",
];

const stickerNavMenu = [
  "trending",
  "love",
  "greetings",
  "happy",
  "sad",
  "celebrate",
  "party",
];

const Navbar = ({ onClick, sticker }) => {
  const [activeStyles, setActiveStyles] = useState({});

  const navMenu = sticker ? stickerNavMenu : gifNavMenu;
  const handleClick = useCallback(
    ({ index }) => {
      onClick?.(navMenu[index]);
      setActiveStyles({
        transform: `translateX(${index * 100}%)`,
        transition: "transform .3s cubic-bezier(.1,.82,.25,1)",
      });
    },
    [navMenu, onClick]
  );

  return (
    <div className="border-l border-panel-header relative z-[300] items-center flex flex-none h-[44px] text-panel-default">
      {navMenu.map((item, i) => {
        return <NavItem key={i} index={i} name={item} onClick={handleClick} />;
      })}
      <div
        style={{ width: `${100/navMenu.length}%`, ...activeStyles }}
        className={` h-[4px] absolute bottom-[0]  left-0 bg-tab-active z-[500]`}
      ></div>
    </div>
  );
};

const GifPicker = ({ onSelect, sticker = false }) => {
  const { width } = useWindowSize();

  const [hideOnScroll, setHideOnScroll] = useState(false);
  const SearchBarRef = useRef();
  const [gifWidth, setGifWidth] = useState(600);

  const [position, isScrolling, elRef, targerRef] = useScrollPosition({
    onScrollChange: ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      setHideOnScroll((x) => (x !== isShow ? isShow : x));
    },
    wait: 200,
  });

  const { mount, getDisclosureProps, getParentProps } = useTransition({
    isExpanded: !hideOnScroll,
    direction: "top",
    easing: "ease-in-out",
    duration: 50,
  });

  useLayoutEffect(() => {
    if (SearchBarRef.current) {
      const { width: w } = SearchBarRef.current.getBoundingClientRect();

      setGifWidth(w);
    }
  }, [width]);

  const [searchKey, setSearchKey] = useState('');
   const [render, setRender] = useState("");

  const handleInputChange = (e) => {
 
    setSearchKey(e.target.value.trim());
    setRender(e.target.value.trim());
  };

  
  const [gf] = useState(
    () => new GiphyFetch("Z4wbRtMknUVNlfwyYDgFICqClEbf5H0E")
  );
  const [category, setCategory] = useState();

  const handleNavgation = useMemo(
    () => (active) => {
      if (active === "trending") {
        setSearchKey("");
        setCategory("");
        setRender("");
        return;
      }
      setCategory(active);
      setSearchKey(active);
      setRender(active)
    },
    []
  );

  const fetchGifs = useCallback(
    (offset) =>
      searchKey
        ? gf.search(searchKey, {
            offset,
            limit: 10,
            ...(sticker && { lang: "es", type: "stickers" }),
          })
        : category
        ? gf.search(category, {
            offset,
            limit: 10,
            ...(sticker && { lang: "hi", type: "stickers" }),
          })
        : gf.trending({
            offset,
            limit: 10,
            ...(sticker && { lang: "es", type: "stickers" }),
          }),
    [category, gf, searchKey, sticker]
  );


  useLayoutEffect(()=>{
    setRender(`${Math.random()}`);
  },[sticker])


  return (
    <div className="rounded-t-[6px] h-[320px] relative overflow-hidden">
      {<Navbar onClick={handleNavgation} sticker={sticker} />}

      {mount && (
        <span>
          <div className="left-0 bg-panel-header mt-[-2px] right-[6px]  py-[6px] px-[12px] absolute z-50 ">
            <div className="h-full flex flex-1 w-full relative ">
              <div
                {...getParentProps({
                  style: { position: "absolute", width: "100%" },
                })}
              >
                <div
                  {...getDisclosureProps()}
                  className="block flex-grow py-[6px] overflow-x-hidden overflow-y-auto bg-panel "
                >
                  <div
                    ref={SearchBarRef}
                    className="py-[10px] px-[12px] rounded-[5px] bg-input-panel flex items-center  "
                  >
                    <input
                      onChange={handleInputChange}
                      value={searchKey}
                      placeholder="Search Giphy"
                      className="text-left border-none w-full min-h-[20px] bg-inherit text-[15px] leading-[20px] font-normal outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </span>
      )}
      <div
        ref={elRef}
        className="px-[12px] pt-[52px] overflow-y-scroll .scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-100 relative h-[274px]"
      >
        <div className="h-full w-full flex " ref={targerRef}>
          <Grid
            key={render}
            columns={gifWidth < 400 ? 2 : 4}
            width={gifWidth}
            fetchGifs={fetchGifs}
            hideAttribution={true}
            noLink={true}
            onGifClick={(gif) => {
              const images = gif?.images;
              onSelect({
                original: images.original,
                preview: images.preview_gif,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GifPicker;
