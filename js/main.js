
document.querySelector("#cart-button").addEventListener("click", function (event) {
    document.querySelector(".modal").classList.add("modal-open");
});

document.querySelector(".close").addEventListener("click", function (event) {
    document.querySelector(".modal").classList.remove("modal-open");
});

new WOW().init();
