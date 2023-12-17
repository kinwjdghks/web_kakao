import { ReactNode, useState, useRef} from "react";
import logo from '../assets/images/kakao_logo.png';
import BackGround from "../public/components/Background";
import { useNavigate } from "react-router-dom";
import { loginState } from "../states/loggedIn";
import { useSetRecoilState } from "recoil";
import { USER } from "../App";

const LoginPage = ():ReactNode =>{
    const setLoginState = useSetRecoilState(loginState);
    const navigater = useNavigate();
    const [isRegistering,setIsRegistering] = useState<boolean>(false);
    const [error,setError] = useState<number>(0);

    //1: id empty
    //2: pw empty
    //3: id invalid
    //4: pwc incorrect
    //5: user no exist
    //6: pw incorrect

    const idRef = useRef<HTMLInputElement>(null);
    const pwRef = useRef<HTMLInputElement>(null);
    const pwcRef = useRef<HTMLInputElement>(null); //pw confirm

    const onLogin = (e: React.MouseEvent) => {
    
        e.preventDefault();
        if (idRef.current == null || pwRef.current == null) return;
    
        const id = idRef.current.value;
        const pw = pwRef.current.value;
        
        if (id.trim() === '') {
            setError(1); //id empty error
            return;
        }
        if (pw.trim() === '') {
            setError(2); //pw empty error
            return;
        }
    
        if (isRegistering) {
            console.log("register");
            onRegister();
            return;
        }
        // console.log("login");
        const account = { username: id, password: pw };
    
        fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(account),
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Login error: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            // console.log(data)
            if(data.access_token){
                // console.log(data.user)
                const loginstate:USER = {id:data.user.id, intro:data.user.intro, img:data.user.img};
                setLoginState(loginstate);
                sessionStorage.setItem('loginState',JSON.stringify(loginstate));
                navigater('/');
            }
            // Handle successful response
        })
        .catch((error) => {
            console.error("Login error:", error.message);
            // Handle error and provide feedback to the user
        });
    }
    

    const isIdValid = (id: string): boolean => {
    
        fetch(`http://localhost:8000/idvalid?id=${encodeURIComponent(id)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.isValid) {
                return true;
                // You can perform actions here if the ID is valid
            } else {
                return false;
            }
        })
        .catch(error => {
            console.error("Validation error:", error.message);
            // Handle the error here
        });
    
        return true;
    }
    

    const onRegister = ()=>{
        if(!(idRef.current && pwRef.current && pwcRef.current)) return;
        const id = idRef.current.value;
        const pw = pwRef.current.value;
        const pwc = pwcRef.current.value;
        
        if(!isIdValid(id)){ //id validity check
            setError(3); //id invalid error
            return;
        }   
        if(pw !== pwc){
            setError(4); //pwc incorrect
            return;
        } 
        const data = { username: id, password: pw };
        console.log(data);

        fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Register error: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            console.log(data);
            setIsRegistering(false);
            emptyInputs();
            // Handle successful response
        })
        .catch((error) => {
            console.error("Register error:", error.message);
            // Handle error and provide feedback to the user
        });
        }

    const unError = () => setError(0);
    const emptyInputs = () =>{
        if(!(idRef.current && pwRef.current && pwcRef.current)) return;
        idRef.current.value = '';
        pwRef.current.value = '';
        pwcRef.current.value = '';
    }

    const inputCN = 'w-full h-14 px-4 border-solid border-[1px] border-yellow-400 rounded-md outline-none';

    return <BackGround>
        <div className="h-full flex-grow bg-[#F7E600] flex flex-col items-center py-20 px-20">
        <img src={logo} alt="logo" className="w-[10rem] h-[9rem]"/>
        <div className="w-full h-max mt-10 flex flex-col">
            <input className={`${inputCN} border-b-0 rounded-b-sm`} type='text' placeholder="아이디" ref={idRef} onFocus={unError}/>
            <input className={`${inputCN} border-t-gray-200 rounded-t-sm`} type='password' placeholder="비밀번호" ref={pwRef} onFocus={unError}/>
            {isRegistering && <input className={`${inputCN} border-t-gray-200 rounded-t-sm`} type='password' placeholder="비밀번호 확인" ref={pwcRef} onFocus={unError}/>}
            <button onClick={onLogin} className="w-full h-14 bg-slate-100 mt-2 rounded-md text-gray-600">{isRegistering ? "회원가입" : "로그인"}</button>
            {error != 0 && <p className="text-red-600 text-center text-xl m-5">
                {error == 1 ? '아이디를 입력하세요'
                : error == 2 ? '비밀번호를 입력하세요' 
                : error == 3 ? '중복된 아이디입니다'
                : error == 4 ? '비밀번호를 확인하세요'
                : error == 5 ? '존재하지 않는 아이디입니다'
                : error == 6 ? '비밀번호가 틀렸습니다': ''}</p>}
        </div>
        <button onClick={()=>{
            unError();
            emptyInputs();
            setIsRegistering((prev)=>!prev);}} className="text-gray-700 mt-auto text-xl">
                {isRegistering ? "취소" : "회원가입하기"}</button>

    </div>
    </BackGround>
}

export default LoginPage;