import  IStorageObj  from "../interfaces/IStoageObj";



export function saveDataToLocal(storageObj: IStorageObj, key: string): void {
    const json = JSON.stringify(storageObj);
    localStorage.setItem(key, json);
}

export function loadDataFromLocal(localStorageKey): IStorageObj | boolean {
    const json: string | undefined = localStorage.getItem(localStorageKey);
    if (json) {
        return JSON.parse(json);
    } else {
        return false;
    }
}

export function addCommasToNumber(num: number): string {
    if (!num && num !== 0) {
        return " Data Not Found";
    }
    const stringsNum = num.toString().split(".");

    const returnStringArr: string[] = [];
    for (let i = stringsNum[0].length; i > 0; i -= 3) {
        returnStringArr.unshift(stringsNum[0].substring(i - 3, i));
    }
    stringsNum[0] = returnStringArr.join(",");
    return stringsNum.join(".");
}