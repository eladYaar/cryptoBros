$(() => {
    const coinApiUrl = "https://api.coingecko.com/api/v3/coins/";
    const coinGeckoAPIKey = "CG-v2oSfCSuHJMbKSjaZ6dJr6hn";
    const optionsForFetch = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': coinGeckoAPIKey,
        },
    };
    let globalCoinList;
    let currentPage = 0;
    const coinsPicked = [];
    async function onPageLoad(apiUrl) {
        try {
            setTimeout(async () => {
                $("#aboutContent").hide();
                if (!globalCoinList) {
                    globalCoinList = await fetchData(apiUrl);
                }
                populateCards(globalCoinList.slice(100 * currentPage, 100 * (currentPage + 1)));
            }, 0);
        }
        catch (error) {
            alert("something went wrong...");
        }
    }
    onPageLoad(coinApiUrl + "list");
    function showForwardsBack(isShown = true) {
        if (isShown) {
            $("#nextPrevDivTop").show();
            $("#nextPrevDivBottom").show();
        }
        else {
            $("#nextPrevDivTop").hide();
            $("#nextPrevDivBottom").hide();
        }
    }
    $("a#homeBtn,header>h1, header>img").on("click", () => {
        $("cardContainerRow").html(`
            <div id="pageLoadSpinnerDiv" class="text-center">
                    <div class="spinner-grow" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>`);
        showForwardsBack();
        onPageLoad(coinApiUrl + "list");
    });
    $("#btnPrevBottom, #btnPrevTop").on("click", () => {
        currentPage -= 1;
        populateCards(globalCoinList.slice(100 * currentPage, 100 * (currentPage + 1)));
        if (currentPage === 0) {
            $("#btnPrevBottom, #btnPrevTop").prop("disabled", true);
        }
    });
    $("#btnNextTop, #btnNextBottom").on("click", () => {
        currentPage += 1;
        populateCards(globalCoinList.slice(100 * currentPage, 100 * (currentPage + 1)));
        $("#btnPrevTop").prop("disabled", false);
        $("#btnPrevBottom").prop("disabled", false);
    });
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
    $("#aboutBtn, #aboutContent>button").on("click", () => {
        const aboutContent = $("#aboutContent");
        if (!aboutContent.hasClass("visible")) {
            aboutContent.slideDown();
            aboutContent.addClass("visible");
            $("#homeBtn").prop("disabled", true);
        }
        else {
            aboutContent.slideUp();
            aboutContent.removeClass("visible");
        }
    });
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
            $("#searchForm button").html(`
                <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                <span role="status">Loading...</span>`);
            $("#searchForm button").prop("disabled", true);
            $("#searchForm input").prop("disabled", true);
            $("#cardContainerRow").html(`
                <div id="pageLoadSpinnerDiv" class="text-center">
                    <div class="spinner-grow" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>`);
            showForwardsBack(false);
        }
        else {
            $("#searchForm button").html(`Search`);
            $("#searchForm button").prop("disabled", false);
            $("#searchForm input").prop("disabled", false);
        }
    }
    $("form#searchForm").on("submit", function (event) {
        searchIsLoading(true);
        event.preventDefault();
        setTimeout(() => {
            const searchTerm = $("input#searchBox").val().toString().toLowerCase();
            const answerCoins = globalCoinList.filter((coin) => (coin.symbol).toLowerCase().indexOf(searchTerm) >= 0);
            if (!answerCoins) {
                alert(`couldn't find Coin '${searchTerm}'`);
                return;
            }
            populateCards(answerCoins.sort((a, b) => a.symbol.length - b.symbol.length));
            $(this).children("input").val('');
            showForwardsBack(false);
            searchIsLoading(false);
        }, 0);
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
                `<div class="col-auto 1">
                    <div class="card position-relative" style="width: 18rem;">
                        <div class="card-body">
                            <div
                                class="form-check form-switch position-absolute top-0 end-0 m-2">
                                <input class="form-check-input" type="checkbox"
                                    id="">
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
