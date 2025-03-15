export default function populateCards(data) {
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
