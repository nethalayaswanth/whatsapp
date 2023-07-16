import { Suspense, forwardRef, memo, useCallback } from "react";

import { useUserDetails } from "../../queries.js/users";
import { Avatar } from "../Avatar";
import Card from "../card";
import CardView from "../card/cardView";
export const UserCardView = forwardRef(({ userId, onClick }, ref) => {
  const { data: user } = useUserDetails({ userId });

  const title = user?.name;
  const details = user?.username;
  const online = user?.online;
  const dp = user?.dp?.previewUrl;


  const handleClick = useCallback(() => {
    onClick?.(user);
  }, [user, onClick]);

  return (
    <CardView
      ref={ref}
      onClick={handleClick}
      avatar={<Avatar src={dp} />}
      title={title}
      top={online ? <Card.Online /> : null}
      main={<Card.Main>{details}</Card.Main>}
    />
  );
});

const UserCard = (props) => {
  return (
    <Suspense fallback="">
      <UserCardView {...props} />
    </Suspense>
  );
};
export default memo(UserCard);
