import { useState } from "react";
import { useOnlineUsers, useSearch } from "../../queries.js/users";
import Search from "../search";

import UserCard from "../listItem/userCard";
import ListOrderAnimation from "../orderAnimation";
import Layout from "../layout";

const Discover = ({ handleClick,selected, children }) => {
  const [query, setQuery] = useState();

  const queryEnabled = query && query.trim().length >= 2;

  const { data: onlineUsers } = useOnlineUsers({
    queryOptions: { suspense: true, enabled: !query },
  });
 
  //const existing = useExistingUsers();

  const { data: queryUsers } = useSearch(query, {
    enabled: !!queryEnabled,
  });
  
  const data = queryEnabled ? queryUsers : onlineUsers;

  return (
    <>
      <Search setQuery={setQuery} query={query} />
      <div className="flex-grow bg-white flex flex-col z-[1] relative scrollbar">
        {!queryEnabled && children}
        {data && data.length !== 0 ? (
          <>
            {data.map((userId, index) => {
              const last = data.length - 1 === index;

              return (
                
                <Layout key={userId}>
                  <UserCard
                    key={userId}
                    onClick={handleClick}
                    userId={userId}
                    last={last}
                  />
                </Layout>
              );
            })}
          </>
        ) : (
          <div className="flex flex-grow basis-0 flex-col overflow-y-auto relative">
            <div className="items-center flex-grow-0 flex-shrink-0 basis-auto px-[50px] py-[72px] text-center h-[1] text-input-inActive ">
              {queryEnabled
                ? `No results found for ${query}`
                : `No data to show`}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Discover;
