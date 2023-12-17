import { ReactNode } from "react";
import defaultImg from "../../assets/images/default_profileImg.png";
import { USER } from "../../App";

const ProfileBlock = ({user, open}:{user:USER, open:()=>void}):ReactNode =>{
    if(!user) return <div>loading..</div>
    let profileImg:string = defaultImg;
    if(user.img != null) profileImg = user.img;
    return <div className="w-full h-24 flex flex-row items-center px-4 gap-8 cursor-pointer" onClick={open}>
        <img className="h-3/5 aspect-square rounded-[1.2rem]" src={profileImg} alt='profileImg'/>
        <div className="(name) text-2xl ">{user.id}</div>
        <div className="(description) w-52 mr-4 ml-auto text-right">{user.intro}</div>
    </div>
}

export default ProfileBlock;