import "./App.css";
import { useState, useEffect } from "react";
import Chatlist from "./pages/ChatList";
import FriendList from "./pages/FriendList";
import BackGround from "./public/components/Background";
import Sidebar from "./public/components/Sidebar";
import ProfilePage from "./public/components/ProfilePage";
import ChatRoom from "./pages/ChatRoom";
import { useRecoilState } from "recoil";
import { loginState } from "./states/loggedIn";
import { ChatRoomBlock_t } from "./public/components/ChatRoomBlock";
import { useNavigate } from "react-router-dom";


export type pageType = 'login'|'friendlist'|'chatlist'|'chatroom';
export interface USER{
  id:string;
  intro:string;
  img?:string;
}

function App() {
  const [loginstate,setLoginState] = useRecoilState(loginState);
  const [friendList,setFriendList] = useState<USER[]>([]);
  const [chatroomList,setChatroomList] = useState<ChatRoomBlock_t[]>([]);
  const [openedRoomData,setOpenedRoomData] = useState<ChatRoomBlock_t|null>(null);
  const [page,setPage] = useState<pageType>('friendlist');
  const [openProfile, setOpenProfile] = useState<[boolean,USER|null]>([false,null]);
  const onCloseProfile = ()=> setOpenProfile([false,null]);
  const onOpenProfile = (profile:USER) => setOpenProfile([true,profile]);
  const navigator = useNavigate();
  const me = loginstate;
  

  
  const get_friendList = async () => {
    // Ensure that `me.userName` is defined and holds the current user's ID
    
    const id = me!.id!;
    await fetch(`http://localhost:8000/get_friendList/?id=${encodeURIComponent(id)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            return res.json(); // Parse the JSON response
        })
        .then(friendsList => {
            // console.log("friendList:"); // 'friendsList' is your USER[] list
            // console.log(friendsList);
            setFriendList(friendsList);
            // Further processing of 'friendsList' can be done here
            // For example, you can store it in the state or display it in the UI
        })
        .catch(error => {
            console.error("Get friend list error:", error.message);
            // Handle any errors here
        });
};
  const onFriendListReload = get_friendList;

  const get_chatroomList = async () =>{
    // console.log('friendList 확인');
    // console.log(friendList);
    const id = me!.id!;

    await fetch(`http://localhost:8000/get_chatroomList?id=${encodeURIComponent(id)}`)
    .then(res => {
        if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
        }
        return res.json(); // Parse the JSON response
    })
    .then(chatroomList => {
        // console.log(chatroomList); // 'chatroomList' is your USER[] list
       
        const chatroomData:ChatRoomBlock_t[] = [];
        chatroomList.forEach((chatroom:{id:number, user1:string, user2:string,preview:string})=>{
          const opp_ = chatroom.user1 !== me!.id ? chatroom.user1 : chatroom.user2;
          const opp = getUserInfo(opp_);
          // console.log(opp);
          const roomBlock_t:ChatRoomBlock_t = {roomId: chatroom.id, opp:opp!, preview: chatroom.preview}
          chatroomData.push(roomBlock_t);
        })
        setChatroomList(chatroomData);
        // Further processing of 'chatroomList' can be done here
        // For example, you can store it in the state or display it in the UI
    })
    .catch(error => {
        console.error("Get chatroomList list error:", error.message);
        // Handle any errors here
    });

  }

  const openChat = (room:ChatRoomBlock_t) =>{
    setOpenedRoomData(room);
    setPage('chatroom');
  }

  const createChat = (user1: string, user2:string) =>{
    const data = {user1: user1, user2: user2};
    fetch('http://localhost:8000/createChatRoom',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(result=>{
      console.log(result);
      get_chatroomList();
      setOpenProfile([false,null]);
      const opp = me?.id == user1 ? user2 : user1;
      const chatroom = chatroomList.filter((room)=>room.opp.id == opp)[0];
      
      setOpenedRoomData(chatroom);
    })

}
  const closeChatroom = () =>{
    setPage('friendlist');
    setOpenedRoomData(null);
  }
  
  const getUserInfo = (id:string):USER|undefined =>{
    return friendList.find((user) => user.id === id);
  }

  useEffect(()=>{
    const cred = sessionStorage.getItem('loginState');
    if(cred){
      // console.log(JSON.parse(cred));
      setLoginState(JSON.parse(cred));
    }
    else navigator('/login');
  },[page]);

  useEffect(() => {
    if (!me) return;
      get_friendList();
  }, [loginstate, me]);


  useEffect(()=>{
    get_chatroomList();
  },[friendList]);


  useEffect(()=>{
    if(openedRoomData){
      setPage('chatroom');
    }
  },[openedRoomData]);

  return (
    <BackGround>
      {page === 'chatroom' && openedRoomData ? <ChatRoom me={me!.id!} chatroomData={openedRoomData} close={closeChatroom} getUserInfo={getUserInfo} reload={get_chatroomList}/> 
      : <Sidebar page={page} switchPage={(page:pageType)=>setPage(page)} reload={onFriendListReload}/>}
      {page === 'friendlist' && <FriendList openProfile={onOpenProfile} me={me!} friendList={friendList}/>}
      {page === 'chatlist' && <Chatlist chatroomList={chatroomList} openChat={openChat}/>}
      {openProfile[0] && <ProfilePage me={me!} user={openProfile[1]!} close={onCloseProfile} createChat={createChat} />}
    </BackGround>
  );
}

export default App;
