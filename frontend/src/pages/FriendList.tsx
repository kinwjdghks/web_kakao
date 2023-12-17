import { ReactNode } from "react";
import ProfileBlock from "../public/components/ProfileBlock";
import { USER } from "../App";
import { loginState } from "../states/loggedIn";
import { useRecoilValue } from "recoil";

const FriendList = ({openProfile,friendList}:{openProfile:(profile:USER)=>void, friendList:USER[]}): ReactNode => {
  const me:USER = useRecoilValue(loginState)!;
  return (
    <div className="flex-col flex-grow">
      <p className=" text-3xl font-bold p-6 mb-4">친구</p>
      <div className="w-full h-min max-h-[calc(100%-6rem)] overflow-y-scroll">
        <ProfileBlock user={me} open={()=>openProfile(me)}/>
        <hr />
        {friendList.map((friend)=><ProfileBlock user={friend} open={()=>openProfile(friend)} key={friend.id}/>)}
      </div>
    </div>
  );
};

export default FriendList;
