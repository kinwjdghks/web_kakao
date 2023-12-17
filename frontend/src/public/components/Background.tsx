import { ReactNode } from "react";

const BackGround = ({children}:{children?:ReactNode}):ReactNode =>{

    return <div className="w-[35rem] h-[55rem] relative rounded-md m-2 bg-white border-solid border-2 border-gray-400 flex">{children}</div>
}

export default BackGround;