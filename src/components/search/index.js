import { ReactComponent as Close } from "../../assets/closeThin.svg";
import { ReactComponent as SearchIcon } from "../../assets/search.svg";

export const Search = ({query, setQuery }) => {

  
  return (
    <div className="h-[49px] px-[12px] bg-white  flex flex-none items-center z-[100] relative">
      <div className="flex-1 relative  ">
        <button className="h-[24px] w-[24px] absolute top-[5px] left-[12px] z-[100] ">
          <div className="absolute top-0 left-0 z-[100] h-full w-full flex  text-input-inactive">
            <span>
              <SearchIcon />
            </span>
          </div>
        </button>
        <div className="h-[35px] pl-[65px] pr-[32px] rounded-[8px] bg-panel flex  items-center  relative">
          <div className="flex-1 px-0 flex ">
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value.trim());
              }}
              placeholder="search user"
              className="h-[20px] px-[2px] flex-1 bg-inherit leading-[20px] text-ellipsis whitespace-nowrap outline-none text-input-inActive focus:text-primary-default text-[15px] align-top"
            />
          </div>
        </div>
        <button
          onClick={() => {setQuery('')}}
          style={{
            transform: `scale(${query ? 1 : 0})`,
            opacity: query ? 1 : 0,
            transition: "transform 200ms ease-in,opacity 200ms ease-in",
            pointerEvents: query ? "auto" : "none",
          }}
          className="absolute right-[7px] top-[5px] z-[100] text-input-inactive"
        >
          <span>
            <Close />
          </span>
        </button>
      </div>
    </div>
  );
};


export default Search