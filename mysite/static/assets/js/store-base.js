var storage_room_pk = null;
var section_pk = null;
var section_color = null;

var storage_room_name = null;
var section_name = null;
var aquarium_num_of_rows = null;
var aquarium_num_of_columns = null;

$(function () {
    $("#console-menu").metisMenu();
    $(".nav-second-level").removeClass("d-none");

    $("#storage-room-modal").on("hide.bs.modal", function (e) {
        $("#storage-room-modal-title").empty();
        $("#storage-room-modal-footer").empty();
        $("form#form-storage-room input#id_storage_room_name").val("");
    });

    $("#aquarium-section-modal").on("hide.bs.modal", function (e) {
        $("#aquarium-section-modal-title").empty();
        $("#aquarium-section-modal-footer").empty();
        $("form#form-aquarium-section input#id_section_name").val("");
        $("form#form-aquarium-section input#id_aquarium_num_of_rows").val(0);
        $("form#form-aquarium-section input#id_aquarium_num_of_columns").val(0);
        $("form#form-aquarium-section input#id_section_color").val("#cd5c5c");
        $("#aquarium-section-edit-color-selected").css({ "background": "#cd5c5c" });
    });

    $("#aquarium-section-edit-color-picker > ul li").click(function (e) {
        $("#aquarium-section-edit-color-selected").css({ "background": $(this).data("section-color") });
        $("form#form-aquarium-section input#id_section_color").val($(this).data("section-color"));
    });

    $("#move-aquarium-section").click(function (e) {
        if (storage_room_pk) {
            async_aquarium_section(function () {
                $(".nav-tabs a[href='#aquarium-section']").tab("show");
            });
        }
    });

    $("#move-store-layout").click(function (e) {
        if (section_pk && section_color) {
            draw_store_layout("store-layout/", function () {
                $(".nav-tabs a[href='#store-layout']").tab("show");
            });
        }
    });

    $("#redo-aquarium-section").click(function (e) {
        if (section_pk && section_color) {
            $(".nav-tabs a[href='#aquarium-section']").tab("show");
        }
    });

    $("#storage-room-register").click(function (e) {
        $("#storage-room-modal-title").html(
            "<i class='fas fa-exclamation-circle text-primary'></i> 생물실 등록"
        );
        $("#storage-room-modal-footer").html(
            "<button type='submit' class='btn btn-primary' data-http-method='post'>등록</button>"
        );
        $("#storage-room-modal").modal("show");
    });

    $("#storage-room-modify").click(function (e) {
        if (storage_room_pk) {
            $("form#form-storage-room input#id_storage_room_name").val(storage_room_name);

            $("#storage-room-modal-title").html(
                "<i class='fas fa-exclamation-circle text-primary'></i> 생물실 변경"
            );
            $("#storage-room-modal-footer").html(
                "<div class='btn-group'>\
                    <button type='button' class='btn btn-default' data-http-method='delete'>삭제</button>\
                    <button type='submit' class='btn btn-primary' data-http-method='put'>변경</button>\
                </div>"
            );
            $("#storage-room-modal").modal("show");
        }
    });

    $("#aquarium-section-register").click(function (e) {
        $("#aquarium-section-modal-title").html(
            "<i class='fas fa-exclamation-circle text-primary'></i> 섹션 / 수조 등록"
        );
        $("#aquarium-section-modal-footer").html(
            "<button type='submit' class='btn btn-primary' data-http-method='post'>등록</button>"
        );
        $("#aquarium-section-modal").modal("show");
    });

    $("#aquarium-section-modify").click(function (e) {
        if (section_pk && section_color) {
            $("form#form-aquarium-section input#id_section_name").val(section_name);
            $("form#form-aquarium-section input#id_aquarium_num_of_rows").val(aquarium_num_of_rows);
            $("form#form-aquarium-section input#id_aquarium_num_of_columns").val(aquarium_num_of_columns);
            $("form#form-aquarium-section input#id_section_color").val(section_color);
            $("#aquarium-section-edit-color-selected").css({ "background": section_color });

            $("#aquarium-section-modal-title").html(
                "<i class='fas fa-exclamation-circle text-primary'></i> 섹션 / 수조 변경"
            );
            $("#aquarium-section-modal-footer").html(
                "<div class='btn-group'>\
                    <button type='button' class='btn btn-default' data-http-method='delete'>삭제</button>\
                    <button type='submit' class='btn btn-primary' data-http-method='put'>변경</button>\
                </div>"
            );
            $("#aquarium-section-modal").modal("show");
        }
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
            section_pk = null;
            section_color = null;

            storage_room_name = $("div.media > span.data-binding", this).data("storage-room-name");

            $("#storage-room-modify").removeAttr("disabled");
            $("#move-aquarium-section").removeAttr("disabled");
        }
    });
});