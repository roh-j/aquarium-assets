var storage_room_id = null;
var section_id = null;
var section_color = null;

var storage_room_name = null;
var section_name = null;
var aquarium_num_of_rows = null;
var aquarium_num_of_columns = null;

var draw_store_layout = function (url) {
    var params = {
        "csrfmiddlewaretoken": CSRF_TOKEN,
        "FK": storage_room_id,
        "section_id": section_id
    };

    $.ajax({
        url: url,
        method: "POST",
        data: params,
        dataType: "json",
    }).done(function (data) {
        var idx = 1;

        if (SVG.supported) {
            $("#store-layout-canvas").empty();

            var row_count = 13;
            var col_label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
            var width_interval = 60;
            var height_interval = 40;

            var layout = SVG("store-layout-canvas").size((col_label.length + 1) * width_interval + 2, (row_count + 1) * height_interval + 2);

            for (i = 0; i < row_count; i++) {
                var y = i * height_interval + 67;
                layout.plain(i + 1).attr({ "text-anchor": "middle", "x": 31, "y": y });
            }

            for (i = 0; i < col_label.length; i++) {
                var x = i * width_interval + 91;
                layout.plain(col_label[i]).attr({ "text-anchor": "middle", "x": x, "y": 27 });
            }

            for (i = 0; i < row_count; i++) {
                for (j = 0; j < col_label.length; j++) {
                    layout.rect(60, 40).attr({
                        "class": "store-layout-grid",
                        "x": (j * width_interval + 1 + width_interval),
                        "y": (i * height_interval + 1 + height_interval)
                    });
                    if (idx < data.length && i == data[idx]["row"] && j == data[idx]["column"]) {
                        layout.rect(60, 40).attr({
                            "class": "store-layout-button",
                            "fill": data[idx]["color"],
                            "x": (j * width_interval + 1 + width_interval),
                            "y": (i * height_interval + 1 + height_interval),
                            "data-store-layout-row": i,
                            "data-store-layout-column": j,
                            "data-store-layout-selected": true,
                            "data-store-layout-id": data[idx]["id"],
                            "data-store-layout-modify-permission": data[idx]["permission"]
                        });
                        idx++;
                    }
                    else {
                        layout.rect(60, 40).attr({
                            "class": "store-layout-button",
                            "fill": "#E7E7E7",
                            "x": (j * width_interval + 1 + width_interval),
                            "y": (i * height_interval + 1 + height_interval),
                            "data-store-layout-row": i,
                            "data-store-layout-column": j,
                            "data-store-layout-selected": false
                        });
                    }
                }
            }
            $("rect.store-layout-button").on("click", function () {
                if ($(this).data("store-layout-selected") && $(this).data("store-layout-modify-permission")) {
                    var params = {
                        "csrfmiddlewaretoken": CSRF_TOKEN,
                        "PK": $(this).data("store-layout-id")
                    };

                    $.ajax({
                        url: "ajax/delete/store-layout/",
                        method: "POST",
                        data: params,
                        dataType: "json",
                    }).done(function (data) {
                        if (data["state"] == "success") {
                            draw_store_layout("ajax/async/store-layout/");
                        }
                        else if (data["state"] == "error") {
                        }
                    }).fail(function (data) {
                    });
                }
                else if ($(this).data("store-layout-selected")) {
                    $("#alert-modal-content").html("이미 다른 섹션이 선택되어있습니다.");
                    $("#alert-modal").modal("show");
                }
                else {
                    save_store_layout($(this).data("store-layout-row"), $(this).data("store-layout-column"));
                }
            });
            $("#store-layout-console").html(
                "<i class='fas fa-circle' style='color: " + section_color + ";'></i> 섹션을 추가/삭제합니다."
            );
        }
        else {
            alert("SVG를 지원하지 않는 브라우저입니다.");
        }
    }).fail(function (data) {
    });
}

var save_store_layout = function (row, column) {
    var params = {
        "csrfmiddlewaretoken": CSRF_TOKEN,
        "FK1": storage_room_id,
        "FK2": section_id,
        "row": row,
        "column": column
    };

    $.ajax({
        url: "ajax/insert/store-layout/",
        method: "POST",
        data: params,
        dataType: "json",
    }).done(function (data) {
        if (data["state"] == "success") {
            draw_store_layout("ajax/async/store-layout/");
        }
        else if (data["state"] == "error") {
        }
    }).fail(function (data) {
    });
}

var async_aquarium_section = function () {
    var params = { "csrfmiddlewaretoken": CSRF_TOKEN, "FK": storage_room_id };

    $.ajax({
        url: "ajax/async/aquarium-section/",
        method: "POST",
        data: params,
        dataType: "json",
    }).done(function (data) {
        $("#async-aquarium-section").empty();

        if (data.length == 0) {
            $("#async-aquarium-section").append(
                "<div class='standby'>\
                <img src='" + DJANGO_STATIC_URL + "/assets/img/Actions-svn-commit-icon.png' class='img-responsive mx-auto'>\
                <hr>\
                <p class='text-center'>창고의 섹션을 등록할 수 있습니다.</p>\
                </div>"
            );
        }
        else {
            $("#async-aquarium-section").append(
                "<div id='aquarium-section-list' class='list-group'></div>"
            );

            for (i = 0; i < data.length; i++) {
                $("#async-aquarium-section > #aquarium-section-list").append("\
                    <a href='#' class='list-group-item'>\
                        <div class='media'>\
                            <span class='data-binding d-none'\
                                data-section-id='" + data[i]['pk'] + "'\
                                data-section-name='" + data[i]['fields']['section_name'] + "'\
                                data-section-color='" + data[i]['fields']['section_color'] + "'\
                                data-aquarium-num-of-rows='" + data[i]['fields']['aquarium_num_of_rows'] + "'\
                                data-aquarium-num-of-columns='" + data[i]['fields']['aquarium_num_of_columns'] + "'></span>\
                            <div class='media-left'>\
                                <img class='media-object' src='" + DJANGO_STATIC_URL + "/assets/img/Mimetypes-application-x-tar-icon-64x64.png'>\
                            </div>\
                            <div class='media-body w-100'>\
                                <p class='font-weight-bold'>\
                                    <i class='fas fa-circle' style='color: " + data[i]['fields']['section_color'] + ";'></i> " + data[i]['fields']['section_name'] + "\
                                </p>\
                                " + data[i]['fields']['aquarium_num_of_rows'] + " x " + data[i]['fields']['aquarium_num_of_columns'] + "\
                            </div>\
                        </div>\
                    </a>\
                ");
            }

            $("#aquarium-section-list > a").click(function (e) {
                e.preventDefault();

                if (!$(this).hasClass("selected")) {
                    $("#aquarium-section-list > a").removeClass("selected");
                    $("#aquarium-section-list > a > div.media > div.media-body > p > span").remove();

                    $(this).addClass("selected");
                    $("div.media > div.media-body > p", this).append(
                        "<span class='text-primary pull-right'><i class='fas fa-check'></i></span>"
                    );
                    section_id = $("div.media > span.data-binding", this).data("section-id");
                    section_color = $("div.media > span.data-binding", this).data("section-color");

                    $("#aquarium-section-edit").removeAttr("disabled");
                    $("#move-store-layout").removeAttr("disabled");

                    section_name = $("div.media > span.data-binding", this).data("section-name");
                    aquarium_num_of_rows = $("div.media > span.data-binding", this).data("aquarium-num-of-rows");
                    aquarium_num_of_columns = $("div.media > span.data-binding", this).data("aquarium-num-of-columns");

                    $("form#aquarium-section-edit-form input#id_section_name").val(section_name);
                    $("form#aquarium-section-edit-form input#id_aquarium_num_of_rows").val(aquarium_num_of_rows);
                    $("form#aquarium-section-edit-form input#id_aquarium_num_of_columns").val(aquarium_num_of_columns);
                    $("form#aquarium-section-edit-form input#id_section_color").val(section_color);
                    $("#aquarium-section-edit-color-selected").css({ "background": section_color });

                    draw_store_layout("ajax/async/store-layout/");
                }
            });
        }
    }).fail(function (data) {
    });
}