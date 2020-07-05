$(function () {
    $("#console-menu").metisMenu();
    $(".nav-second-level").removeClass("d-none");

    $("#add-order").click(function (e) {
        $("#add-order-modal").modal("show");
    });
});