import { ReactNode, useRef, useState } from "react";
import { IoPerson } from "react-icons/io5";
import { BsChatFill } from "react-icons/bs";
import { IoExitOutline } from "react-icons/io5";
import { pageType } from "../../App";
import { useNavigate } from "react-router-dom";
import { IoMdPersonAdd } from "react-icons/io";
import { useRecoilState } from "recoil";
import { loginState } from "../../states/loggedIn";

const Sidebar = ({page,switchPage,reload}:{page:pageType,switchPage:(page:pageType)=>void, reload:()=>void}):ReactNode => {

    
    const [addFriend,setAddFriend] = useState<boolean>(false);
    const [loginstate,setloginState] = useRecoilState(loginState);
    const me = loginstate;

    const add_friend = (user1:string, user2: string) =>{

        fetch('http://localhost:8000/add_friend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user1: user1, user2: user2 }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            reload();
            switchPage('friendlist');
            return data;
            // Handle successful addition of friend here
        })
        .catch(error => {
            console.error("Error adding friend:", error.message);
        });
        
    }

    const AddFriendModal = ():ReactNode =>{
        const inputRef = useRef<HTMLInputElement>(null);
        

        const onAddFriend = (e:React.MouseEvent) =>{
            e.preventDefault();
            if(inputRef.current){
                add_friend(me!.id,inputRef.current.value);
            }
        }

        

        return <div className="p-4 absolute top-0 right-0 flex flex-col">
            <input type="text" className="h-10 p-2 text-xl border-solid border-black border-2" ref={inputRef}/>
            <button className= "w-max bg-yellow-300 mt-4 px-4 py-1 rounded-md self-center " onClick={(e)=>onAddFriend(e)}>친구 추가</button>
        </div>
    }

    const navigater = useNavigate();
    const toFriendList = () => switchPage('friendlist');
    const toChatList = () => switchPage('chatlist');
    const friend = page === 'friendlist';
    const chatList = page === 'chatlist';

    const logout = () =>{
        sessionStorage.removeItem('loginState');
        navigater('/login');
        setloginState(undefined);
    }

    return <div className="w-20 h-full bg-gray-200 flex flex-col items-center pt-28 gap-16">
        {addFriend && <AddFriendModal />}
        <IoPerson className={`w-10 h-10 ${!friend && "opacity-60"} cursor-pointer hover:scale-110`} onClick={toFriendList}/>
        <BsChatFill className={`w-8 h-8 ${!chatList && "opacity-60"} cursor-pointer hover:scale-110`} onClick={toChatList}/>
        <IoMdPersonAdd className={`w-10 h-10 opacity-60 cursor-pointer hover:scale-110`} onClick={()=>setAddFriend((prev)=>!prev)}/>
        <IoExitOutline className={`w-10 h-10 opacity-60 cursor-pointer hover:scale-110 mt-auto mb-8`} onClick={logout}/>
    </div>
}

export default Sidebar;