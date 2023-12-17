export type Side = 'left'|'right';
import { USER } from '../../App';
import defaultImg from '../../assets/images/default_profileImg.png'

export interface Chat_t{
    id: number
    who: string
    chatroomid: number
    time: Date
    text?: string|undefined
    img?: string|undefined
}

const Chat = ({me, data, getUserInfo}:{me:string, data:Chat_t, getUserInfo:(id:string)=>USER|undefined}) => {
    
    const left = me !== data.who;
    const content = data.text ? data.text.replace(/(\n|\r\n)/g, "<br />") : '';
    const opp:USER|undefined = getUserInfo(data.who);
    
    let profileImg:string = defaultImg;
    if(left && opp &&  opp.img != undefined) profileImg = opp.img;
    const stringify_time = (t: Date): string => {
        // Create a new Date object adjusted for the timezone offset
        const time = new Date(new Date(t).getTime() - (new Date().getTimezoneOffset() * 60000));
        
        // Extract hours and minutes
        let hours = time.getHours();
        const minutes = time.getMinutes();
    
        // Determine AM/PM and convert to 12-hour format
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    
        // Format hours and minutes with leading zeros if necessary
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
    
        // Create and return the formatted time string
        return `${ampm} ${formattedHours}:${formattedMinutes}`;
    };
    

    return <div className={`h-min flex  ${left ? 'place-self-start' : 'place-self-end'}`}>    
                {left && <img className="w-14 h-14 aspect-square rounded-[1.2rem] ml-4" src={profileImg} alt='profileImg'/>}
            <div className="flex flex-col gap-2">
                    {left && <p className="mx-2 text-2xl">{data.who}</p>}
                <div className={`flex ${!left ? '' : 'flex-row-reverse'}`}>
                    <div className="(time) w-max self-end">{stringify_time(data.time)}</div>
                    {data.img ? 
                    <img className={`(image) w-[20rem] mx-2 ${left ? 'order-last' : ''}`} draggable='false' src={data.img}/>
                    :<div className={`(content) max-w-[20rem] mx-2 text-2xl rounded-xl p-3 break-normal break-words ${left ? 'bg-white' : 'bg-yellow-300'}`} dangerouslySetInnerHTML={{__html: content}}></div>}
                </div>
            </div>
        </div>

}

export default Chat;