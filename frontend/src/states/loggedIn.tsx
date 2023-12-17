import { atom } from "recoil";
import { USER } from "../App";

export const loginState = atom<USER|undefined>({
    key:'loginstate',
    default: undefined
})
