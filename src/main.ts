import { ICoinShort } from "./icoin";
import { ICoinLong } from "./icoin";
import { IStorageObj } from "./istorageObj";

$(() => {
    const coinApiUrl = "https://api.coingecko.com/api/v3/coins/";
    const coinGeckoAPIKey = "CG-v2oSfCSuHJMbKSjaZ6dJr6hn";
    const optionsForFetch = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': coinGeckoAPIKey,
        }
    };
    let globalCoinList: ICoinShort[];

    onPageLoad(coinApiUrl + "list");
    async function onPageLoad(apiUrl): Promise<void> {
        try {
            globalCoinList = await fetchData(apiUrl) as ICoinShort[];

            // TODO TESTING ONLY, REMOVE BEFORE FINAL PUBLISH 
            globalCoinList.splice(100);
            // console.log(data[1]);
            populateCards(globalCoinList);
            // TODO TESTING ONLY, REMOVE BEFORE FINAL PUBLISH 

        } catch (error) {
            alert("something went wrong...")
        }
    }


    async function fetchData(url: string): Promise<ICoinShort[] | ICoinLong> {
        try {
            const response = await fetch(url, optionsForFetch);
            if (!response.ok) {
                throw new Error('Failed to retrieve data from the API');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error", error.message);
            alert("Oops! something went wrong...");
        }
    }

    function saveDataToLocal(storageObj: object, key: string): void {
        const json = JSON.stringify(storageObj);
        localStorage.setItem(key, json);
    }

    function loadDataFromLocal(localStorageKey): IStorageObj | boolean {
        const json: string | undefined = localStorage.getItem(localStorageKey);
        if (json) {
            return JSON.parse(json);
        } else {
            return false;
        }
    }



    $("form#searchForm").on("submit", function (event) {
        event.preventDefault();
        const searchTerm = $("input#searchBox").val();
        console.log(searchTerm);

        const answerCoin = globalCoinList.find((coin) => coin.symbol === searchTerm);
        if (!answerCoin) {
            alert(`couldn't find Coin '${searchTerm}'`);
            return;
        }
        populateCards([answerCoin]);
        $(this).children("input").val('');
    });


    $("#cardContainerRow").on("click", "a.btn-more-info", async function (): Promise<void> {
        // console.log(this);
        if ($(this).hasClass("collapsed")) {
            return;
        }
        const now: number = Date.now();
        const loadedData = loadDataFromLocal($(this).attr("aria-controls"));
        let thisCoin: ICoinLong;

        if (!loadedData || now - (loadedData as IStorageObj).lastLoadedTime > 120000) {
            thisCoin = await fetchData(coinApiUrl + $(this).attr("aria-controls")) as ICoinLong;
            $(`${$(this).attr("href")}`).children().children().html(`
                 <div
                    class="spinner-grow text-primary"
                    role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>`);
            console.log("Loaded From API");
        } else {
            thisCoin = (loadedData as IStorageObj).thisCoin;
            console.log("Loaded From LocalStorage");
        }
        const key = thisCoin.id;
        const storageObj = {
            thisCoin,
            lastLoadedTime: now,
        };
        saveDataToLocal(storageObj, key);
        $(`#${thisCoin.id}`).children().children().html(
            `
                <img class="coin-thumbnail" src="${thisCoin.image.small}">
                <br>
                USD Value: $${addCommasToNumber(thisCoin.market_data.current_price.usd)}
                <br>
                USD Market Cap: $${addCommasToNumber(thisCoin.market_data.market_cap.usd)}
                <hr>
                EUR Value: €${addCommasToNumber(thisCoin.market_data.current_price.eur)}
                <br>
                EUR Market Cap: €${addCommasToNumber(thisCoin.market_data.market_cap.eur)}
                <hr>
                ILS Value: ₪${addCommasToNumber(thisCoin.market_data.current_price.ils)}
                <br>
                ILS Market Cap: ₪${addCommasToNumber(thisCoin.market_data.market_cap.ils)}
            `);
    });

    function addCommasToNumber(num: number): string {
        const stringNum = num.toString();
        if (num < 100) {
            return stringNum;
        } 
        const returnStringArr: string[] = [];
        for (let i = stringNum.length; i > 0; i -= 3) {
            returnStringArr.unshift(stringNum.substring(i - 3, i));
        }
        return returnStringArr.join(",");
    }


    function populateCards(data: ICoinShort[]): void {
        let cardHtml = "";
        for (const coin of data) {
            cardHtml +=
                `<div class="col-auto">
                    <div class="card position-relative" style="width: 18rem;">
                        <div class="card-body">
                            <div
                                class="form-check form-switch position-absolute top-0 end-0 m-2">
                                <input class="form-check-input" type="checkbox"
                                    id="flexSwitchCheck">
                            </div>
                            <h5 class="card-title">${coin.symbol}</h5>
                            <p class="card-text">${coin.name}</p>
                            <span class="collapse-container">
                                <p class="d-inline-flex gap-1">
                                    <a class="btn btn-primary btn-more-info"
                                        data-bs-toggle="collapse"
                                        href="#${coin.id}" role="button"
                                        aria-expanded="false"
                                        aria-controls="${coin.id}">More Info</a>
                                </p>
                                <div class="row">
                                    <div class="col">
                                        <div class="collapse multi-collapse"
                                            id="${coin.id}">
                                            <div class="card card-body">
                                                <div class="text-center">
                                                    <div
                                                        class="spinner-grow text-primary"
                                                        role="status">
                                                        <span class="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </span>
                        </div>
                    </div>
                </div>`;
        }
        $("#cardContainerRow").html(cardHtml);
    }
});

