import { ReactNode, useRef, useState } from "react";
import defaultImg from "../../assets/images/default_profileImg.png";
import { USER } from "../../App";
import { IoMdClose } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { IoIosChatbubbles } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { useSetRecoilState } from "recoil";
import { loginState } from "../../states/loggedIn";
import { blobToBase64 } from "../../functions/encoding";

const ProfilePage = ({me,user,close,createChat}:{me:USER, user:USER, close:()=>void,createChat:(user1:string,user2:string)=>void}):ReactNode =>{
    const [modalopen,setModalOpen] = useState<boolean>(false);
    const [introEdit,setIntroEdit] = useState<boolean>(false);
    const inputIntroRef = useRef<HTMLInputElement>(null);
    const inputImgRef = useRef<HTMLInputElement>(null);
    const setLoginState = useSetRecoilState(loginState);
    const [localIntro,setLocalIntro] = useState<string>(user?.intro);
    const [localImg,setLocalImg] = useState<string|undefined>(user.img);

    const onUploadImg = async () =>{
        if (inputImgRef.current && inputImgRef.current.files && inputImgRef.current.files[0]) {
            const imageStr = await blobToBase64(inputImgRef.current.files[0]);
            
            fetch(`http://localhost:8000/setImg`,
            {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id:me.id, img:imageStr})
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Update error: ${res.status}`);
                }
                return res.json();
            })
            .then(() => {
                setLocalImg(imageStr);
                const user: USER = { id: me.id, img: imageStr, intro: me.intro };
                const newState: USER = user;
                setLoginState(newState);
                setModalOpen(false);
            })
            .catch((error) => {
                console.error("Send error:", error.message);
                // Handle error and provide feedback to the user
            });


        } 
    }
    
    const EditProfileImgModal = ():ReactNode =>{
        const buttonCN = 'text-[1.5rem] text-white ';

        return <div className="w-1/2 h-20 absolute top-16 right-2 flex flex-col gap-2">
            <button className={buttonCN}>
                <input type="file" accept="image/*" className='opacity-0 absolute w-max h-max top-0 left-0 cursor-pointer'
                onChange={onUploadImg} ref={inputImgRef}/>
                프로필사진 변경
            </button>
            
            <button className={buttonCN} onClick={()=>{setIntroEdit((prev)=>!prev)}}>상태메시지 변경</button>
        </div>
    }

    const isMe = user.id == me.id;
    const onIntroSubmit = () =>{
        if(inputIntroRef.current){
            const intro = inputIntroRef.current.value.trim();
            if(intro == '') return;
            fetch(`http://localhost:8000/setIntro`,
            {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id:me.id, intro:intro})
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Send error: ${res.status}`);
                }
                return res.json();
            })
            .then(() => {
                setLocalIntro(intro); // Update the local state
                const user: USER = { id: me.id, img: me.img, intro: intro };
                const newState:USER = user;
                setLoginState(newState);
                setIntroEdit(false);
                setModalOpen(false);
            })
            .catch((error) => {
                console.error("Send error:", error.message);
                // Handle error and provide feedback to the user
            });

        }
    }


    const checkTypeLimit = () =>{
        if(inputIntroRef.current){
            const length = inputIntroRef.current.value.length;
            if(length>20) inputIntroRef.current.value = inputIntroRef.current.value.substring(0,20);
        }
    }
    
    return <div className="absolute w-full h-full top-0 left-0 flex flex-col justify-end items-center bg-gray-700 text-center">
        <div className="(actionbar) w-full flex flex-row justify-between p-6 mb-auto">
            <IoMdClose className="fill-white w-8 h-8 cursor-pointer" onClick={close}/>
            {isMe && <IoMdSettings className="fill-white w-8 h-8 cursor-pointer" onClick={()=>setModalOpen((prev)=>!prev)}/>}
        </div>
        {modalopen && <EditProfileImgModal />}
        <img className="w-28 h-28 rounded-[2rem]" src={localImg ? localImg : defaultImg} alt='profileImg'/>
        <div className="w-full text-white text-3xl m-4">{user?.id}</div>

        {introEdit ?
         <div className="flex w-full items-center justify-center translate-x-10">
            <input type="text" className="w-1/2 h-10 p-2 txext-xl" onChange={checkTypeLimit} ref={inputIntroRef}/>
         <FaCheck className="w-8 h-8 fill-white m-6 cursor-pointer" onClick={onIntroSubmit}/>
         </div>
        :<div className="w-full h-8 text-white text-xl m-6">{localIntro}</div>}
        {!isMe && <div onClick={()=>createChat(me!.id,user!.id)}>
            <IoIosChatbubbles className = "w-12 h-12 fill-white mt-8 cursor-pointer"/>
            <p className="text-[1rem] text-white mb-5 ">1:1 채팅</p>
        </div>}
    </div>
}

export default ProfilePage;