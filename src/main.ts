import { ICoinShort, ICoinLong } from "./interfaces/ICoin";
import IStorageObj from "./interfaces/IStoageObj";
import { addCommasToNumber, saveDataToLocal, loadDataFromLocal } from "./modules/dataManip.js";
import { disableBackBtn, populateCards, showForwardsBack, searchIsLoading } from "./modules/visualManip.js";
import fetchData from "./modules/fetchData.js";

$(() => {
    const coinApiUrl = "https://api.coingecko.com/api/v3/coins/";
    
    let globalCoinList: ICoinShort[];
    let currentPage: number;
    const coinsPicked: string[] = [];  

    async function onPageLoad(apiUrl: string): Promise<void> {
        currentPage = 0;
        try {
            $("#aboutContent").hide();
            setTimeout(async () => {
                if (!globalCoinList) {
                    globalCoinList = await fetchData(apiUrl) as ICoinShort[];
                }
                disableBackBtn();
                populateCards(globalCoinList.slice(100 * currentPage, 100 * (currentPage + 1)));
            }, 0);
        } catch (error) {
            alert("something went wrong...");
        }
    }
    onPageLoad(coinApiUrl + "list");

    $('input.form-check-input').on('change', function() { // this doesnt seem to work, could not figure out why
        console.log("working");
        
        if((this as HTMLInputElement).checked) {
          console.log(`Checkbox ${this.id} is checked`);
        } else {
          console.log(`Checkbox ${this.id} is unchecked`);
        }
      });
    
    $("a#homeBtn,header>h1, header>img").on("click", () => {
        $("cardContainerRow").html(`
            <div id="pageLoadSpinnerDiv" class="text-center">
                <div class="spinner-grow" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>`);
        showForwardsBack();
        onPageLoad(coinApiUrl + "list")
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
    
    $("#aboutBtn, #aboutContent>button").on("click", () => {
        const aboutContent = $("#aboutContent");
        if (!aboutContent.hasClass("visible")) {
            aboutContent.slideDown();
            aboutContent.addClass("visible");
            $("#homeBtn").prop("disabled",true);
        } else {
            aboutContent.slideUp();
            aboutContent.removeClass("visible");
        }
    });
        
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
            populateCards(answerCoins.sort((a: ICoinShort, b: ICoinShort) => a.symbol.length - b.symbol.length));
            $(this).children("input").val('');
            showForwardsBack(false);
            searchIsLoading(false);
        }, 0);
    });

    $("#cardContainerRow").on("click", "a.btn-more-info", async function (): Promise<void> {
        if ($(this).hasClass("collapsed")) {
            return;
        }
        let now: number = Date.now();
        const loadedData = loadDataFromLocal($(this).attr("aria-controls")) as IStorageObj;
        let thisCoin: ICoinLong;
        if (!loadedData || now - loadedData.lastLoadedTime > 120000) {
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
            now = loadedData.lastLoadedTime;
            console.log("Loaded From LocalStorage");
        }
        const key = thisCoin.id;
        const storageObj: IStorageObj = {
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
});

