import { ReactNode } from "react";
import defaultImg from "../../assets/images/default_profileImg.png";
import { USER } from "../../App";

export interface ChatRoomBlock_t{
    roomId:number;
    opp:USER;
    preview: string|undefined;
}

const ChatRoomBlock = ({data, openChat}:{data:ChatRoomBlock_t, openChat:(room:ChatRoomBlock_t)=>void}):ReactNode =>{

    let profileImg:string = defaultImg;
    if(data.opp.img != null) profileImg = data.opp.img;
    return <div className="w-full h-24 flex flex-row items-center px-4 gap-8 cursor-pointer" onClick={()=>{openChat(data)}}>
    <img className="h-3/5 aspect-square rounded-[1.2rem]" src={profileImg} alt='profileImg'/>
    <div className="flex flex-col justify-center">
        <div className="(name) text-2xl">{data.opp.id}</div>
        <div className="(preview) h-4  ">{data.preview}</div>
    </div>
    
</div>
}

export default ChatRoomBlock;