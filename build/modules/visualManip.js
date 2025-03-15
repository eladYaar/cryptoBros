export function populateCards(data) {
    let cardHtml = "";
    for (const coin of data) {
        cardHtml +=
            `<div class="col-auto 1">
                <div class="card position-relative" style="width: 18rem;">
                    <div class="card-body">
                        <div
                            class="form-check form-switch position-absolute top-0 end-0 m-2">
                            <input class="form-check-input" type="checkbox"
                                id="${coin.id}-checkBox">
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
export function disableBackBtn(disable = true) {
    $("#btnPrevTop").prop("disabled", disable);
    $("#btnPrevBottom").prop("disabled", disable);
}
export function showForwardsBack(isShown = true) {
    if (isShown) {
        $("#nextPrevDivTop").show();
        $("#nextPrevDivBottom").show();
    }
    else {
        $("#nextPrevDivTop").hide();
        $("#nextPrevDivBottom").hide();
    }
}
export function searchIsLoading(isLoading) {
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
