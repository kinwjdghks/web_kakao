import ChatRoomBlock, { ChatRoomBlock_t } from "../public/components/ChatRoomBlock";

const Chatlist = ({chatroomList, openChat}:{chatroomList:ChatRoomBlock_t[], openChat:(room:ChatRoomBlock_t)=>void}) =>{
  //  console.log(chatroomList);
    return <div className="flex-col flex-grow">
    <p className=" text-3xl font-bold p-6 mb-4">채팅</p>
    <div className="w-full h-min max-h-[calc(100%-6rem)] overflow-y-scroll">
      {chatroomList.map((chatroom)=><ChatRoomBlock data={chatroom} openChat={openChat} key={chatroom.roomId}/>)}
  
    </div>
  </div>
  
}

export default Chatlist;