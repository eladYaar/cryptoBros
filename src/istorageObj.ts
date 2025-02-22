import { ICoinLong } from "./icoin";

export interface IStorageObj {
    thisCoin: ICoinLong;
    lastLoadedTime: number;
}