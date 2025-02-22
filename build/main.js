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
    let globalCoinList;
    onPageLoad(coinApiUrl + "list");
    async function onPageLoad(apiUrl) {
        try {
            globalCoinList = await fetchData(apiUrl);
            globalCoinList.splice(100);
            populateCards(globalCoinList);
        }
        catch (error) {
            alert("something went wrong...");
        }
    }
    async function fetchData(url) {
        try {
            const response = await fetch(url, optionsForFetch);
            if (!response.ok) {
                throw new Error('Failed to retrieve data from the API');
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error("Error", error.message);
            alert("Oops! something went wrong...");
        }
    }
    function saveDataToLocal(storageObj, key) {
        const json = JSON.stringify(storageObj);
        localStorage.setItem(key, json);
    }
    function loadDataFromLocal(localStorageKey) {
        const json = localStorage.getItem(localStorageKey);
        if (json) {
            return JSON.parse(json);
        }
        else {
            return false;
        }
    }
    function searchIsLoading(isLoading) {
        if (isLoading) {
            $("#searchForm button").html(`Search`);
            $("#searchForm button").prop("disabled", false);
        }
        else {
            $("#searchForm button").html(`
                <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                <span role="status">Loading...</span>
                `);
            $("#searchForm button").prop("disabled", true);
        }
    }
    $("form#searchForm").on("submit", function (event) {
        searchIsLoading(true);
        event.preventDefault();
        const searchTerm = $("input#searchBox").val().toString().toLowerCase();
        console.log(searchTerm);
        const answerCoins = globalCoinList.filter((coin) => (coin.symbol).toLowerCase().indexOf(searchTerm) >= 0);
        if (!answerCoins) {
            alert(`couldn't find Coin '${searchTerm}'`);
            return;
        }
        populateCards(answerCoins.sort((a, b) => a.symbol.length - b.symbol.length));
        $(this).children("input").val('');
        searchIsLoading(false);
    });
    $("#cardContainerRow").on("click", "a.btn-more-info", async function () {
        if ($(this).hasClass("collapsed")) {
            return;
        }
        let now = Date.now();
        const loadedData = loadDataFromLocal($(this).attr("aria-controls"));
        let thisCoin;
        if (!loadedData || now - loadedData.lastLoadedTime > 120000) {
            thisCoin = await fetchData(coinApiUrl + $(this).attr("aria-controls"));
            $(`${$(this).attr("href")}`).children().children().html(`
                 <div
                    class="spinner-grow text-primary"
                    role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>`);
            console.log("Loaded From API");
        }
        else {
            thisCoin = loadedData.thisCoin;
            now = loadedData.lastLoadedTime;
            console.log("Loaded From LocalStorage");
        }
        const key = thisCoin.id;
        const storageObj = {
            thisCoin,
            lastLoadedTime: now,
        };
        saveDataToLocal(storageObj, key);
        $(`#${thisCoin.id}`).children().children().html(`
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
    function addCommasToNumber(num) {
        if (!num && num !== 0) {
            return " Data Not Found";
        }
        const stringsNum = num.toString().split(".");
        const returnStringArr = [];
        for (let i = stringsNum[0].length; i > 0; i -= 3) {
            returnStringArr.unshift(stringsNum[0].substring(i - 3, i));
        }
        stringsNum[0] = returnStringArr.join(",");
        return stringsNum.join(".");
    }
    function populateCards(data) {
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
export {};
