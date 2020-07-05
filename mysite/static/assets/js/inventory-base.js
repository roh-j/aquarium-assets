var storage_room_pk = null;
var aquarium_section_pk = null;
var aquarium_selection_row = null;
var aquarium_selection_column = null;

$(function () {
    $("#management-menu").metisMenu();
    $(".nav-second-level").removeClass("d-none");

    $("#redo-store-layout").click(function (e) {
        $(".nav-tabs a[href='#store-layout']").tab("show");
    });

    $("#storage-room-list > a").click(function (e) {
        e.preventDefault();

        if (!$(this).hasClass("selected")) {
            $("#storage-room-list > a").removeClass("selected");
            $("#storage-room-list > a > div.media > div.media-body > p > span").remove();

            $(this).addClass("selected");
            $("div.media > div.media-body > p", this).append(
                "<span class='text-primary pull-right'><i class='fas fa-check'></i></span>"
            );

            storage_room_pk = $("div.media > span.data-binding", this).data("storage-room-id");
            storage_room_name = $("div.media > span.data-binding", this).data("storage-room-name");

            draw_store_layout("store-layout/", function () {
                $(".nav-tabs a[href='#store-layout']").tab("show");
            });
        }
    });
});