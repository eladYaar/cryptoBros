import { ICoinLong } from "./ICoin";

export default interface IStorageObj {
    thisCoin: ICoinLong;
    lastLoadedTime: number;
}