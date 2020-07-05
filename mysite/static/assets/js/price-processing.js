$(document).on("submit", "form#form-unit-price", function (e) {
    e.preventDefault();
    var params = $("form#form-unit-price").serializeObject();

    $.ajax({
        url: "",
        method: "post",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(params),
        dataType: "json",
    }).done(function (res, status, xhr) {
        $("#unit-price-modal").modal("hide");
        $("#unit-price-modal").on("hidden.bs.modal", function (e) {
            async_unit_price(null);
        });
    }).fail(function (res, status, xhr) {
        console.log(res);
    });
});