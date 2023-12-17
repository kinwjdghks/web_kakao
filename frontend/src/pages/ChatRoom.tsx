import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import Chat, { Chat_t } from "../public/components/Chat";
import { ChatRoomBlock_t } from "../public/components/ChatRoomBlock";
import { IoArrowBackOutline } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";
import defaultImg from "../assets/images/default_profileImg.png";
import { FaFileImage } from "react-icons/fa";
import { blobToBase64 } from "../functions/encoding";
import { USER } from "../App";

const ChatRoom = ({me,chatroomData,close,getUserInfo,reload}:{me:string, chatroomData:ChatRoomBlock_t,close:()=>void,getUserInfo:(id:string)=>USER|undefined, reload:()=>void}):ReactNode =>{
    const [chatdata, setChatdata] = useState<Chat_t[]>([]);
    const [inputImg,setInputImg] = useState<string | undefined>(undefined);
    const inputTextRef = useRef<HTMLTextAreaElement>(null);
    const inputImgRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    console.log(chatroomData);
    
    let profileImg:string = defaultImg;
    if(chatroomData.opp.img != null && chatroomData.opp.img != undefined) profileImg = chatroomData.opp.img;
    
    const handleKeyPress = useCallback((e:React.KeyboardEvent) => {

        if(inputTextRef.current){
            if(!e.shiftKey && e.key === 'Enter' && !e.nativeEvent.isComposing){
                e.preventDefault();
                sendChat();
                return;
            }
        }
    }, []);
    
    // if(!opp) return <div>loading...</div>
    const scroll_to_bottom = () =>{
        scrollEndRef.current?.scrollIntoView({block:'end', behavior: 'smooth' });
    }
    
    const getChatData = (roomId:number) => {

        fetch(`http://localhost:8000/get_chatList?roomId=${encodeURIComponent(roomId)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json();
            })
            .then(chatData => {
                console.log('chatdata:');
                console.log(chatData); // Log the chat data
                setChatdata(chatData);
            })
            .catch(error => {
                console.error("Get chat data error:", error.message);
                // Handle any errors here
            });
    };
    
    const sendChat = async () =>{
        if(!inputTextRef.current) return;
        const content = inputTextRef.current.value.trim();
        if(content == '' && !inputImg){
            console.log('nothing to uploads');
            return;
        }

        const newChat = {
            who: me,
            time: new Date(),
            text: inputImg ? undefined : content,
            img: inputImg,
            chatroomid: chatroomData.roomId,
        }
        console.log(newChat);
        // send to database
        await fetch('http://localhost:8000/addChat',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newChat)
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Send error: ${res.status}`);
                }
                return res.json();
            })
            .then(()=>{
                // console.log(data);
                inputTextRef!.current!.value = '';
                setInputImg(undefined);
                getChatData(chatroomData.roomId);
                setTimeout(()=>scroll_to_bottom(),10);
                reload();
            })
            .catch((error) => {
                console.error("Send error:", error.message);
                // Handle error and provide feedback to the user
            });
    }

    const onUploadImg = async () => {
        if (inputImgRef.current && inputImgRef.current.files && inputImgRef.current.files[0]) {
            const imageStr = await blobToBase64(inputImgRef.current.files[0]);
            setInputImg(imageStr);
        } else {
            setInputImg(undefined); // Clear the input if no file is selected
        }
    }


    useEffect(() => {
        const fetchChatData = () => {
          getChatData(chatroomData.roomId);
        };
        const intervalId = setInterval(fetchChatData, 500);

        return () => clearInterval(intervalId);
      }, [getChatData, chatroomData.roomId]);

      useEffect(()=>{
        setTimeout(()=>scroll_to_bottom(),10);
      },[])

    
    return <div className="(background) w-full h-full bg-blue-200 flex flex-col">
        <div className="(header) w-full h-32 flex flex-col">
            <IoArrowBackOutline className = "w-8 h-8 flex-grow ml-4 " onClick={close}/>
            <div className="flex flex-row h-min items-center m-4 mt-0">
                <img className="h-16 w-16 rounded-[1.5rem]" draggable='false' src={profileImg} alt='profileImg'/>
                <div className="text-3xl font-bold ml-8">{chatroomData.opp.id}</div>
            </div>
        </div>
        <div className="(main) w-full h-[calc(100%-19rem)] relative flex flex-col gap-2 overflow-y-scroll" ref={scrollRef}>
            {chatdata.map((chat:Chat_t)=><Chat me={me} data={chat} getUserInfo={getUserInfo} key={chat.id} />)}
            <div ref={scrollEndRef}></div>
        </div>
        <div className="(footer) w-full h-44 mt-auto relative bg-white pt-3 flex flex-col ">
            {inputImg && <div className="w-full h-60 absolute bottom-[3rem] bg-white flex items-center justify-center">
                <IoCloseSharp className="w-6 h-6 absolute top-4 right-4 cursor-pointer" onClick={()=>setInputImg(undefined)}/>
                <img className="h-4/5" draggable='false' src={inputImg} alt="chatimg"/></div>}
            <textarea className="w-full h-full px-3 resize-none outline-none text-2xl border-none" ref={inputTextRef} onKeyDown={handleKeyPress}/>
            <div className="(action) w-full h-[4.5rem] p-2 flex items-center">
                <div className="w-6 h-6 ml-2 relative cursor-pointer">
                    <input type="file" accept="image/*" className="opacity-0 absolute w-full h-full top-0 left-0"  ref={inputImgRef} onChange={onUploadImg}/>
                    <FaFileImage className="w-full h-full"/>
                </div>
                <button className="h-full w-20 bg-yellow-400 rounded-md float-right ml-auto" onClick={sendChat}>전송</button>
            </div>
        </div>
    </div>
}

export default ChatRoom;