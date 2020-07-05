var async_aquarium_section = function (callback) {
    var params = {
        "FK": storage_room_pk
    };

    $.ajax({
        url: "aquarium-section/",
        method: "get",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: params,
        dataType: "json",
    }).done(function (data, status, xhr) {
        $("#async-aquarium-section").empty();

        if (data.length) {
            $("#async-aquarium-section").append(
                "<div id='aquarium-section-list' class='list-group'></div>"
            );

            for (i = 0; i < data.length; i++) {
                var aquarium_total = parseInt(data[i]['aquarium_num_of_rows']) * parseInt(data[i]['aquarium_num_of_columns'])
                $("#async-aquarium-section > #aquarium-section-list").append("\
                    <a href='#' class='list-group-item'>\
                        <div class='media'>\
                            <span class='data-binding d-none'\
                                data-section-id='" + data[i]['pk'] + "'\
                                data-section-name='" + data[i]['section_name'] + "'\
                                data-section-color='" + data[i]['section_color'] + "'\
                                data-aquarium-num-of-rows='" + data[i]['aquarium_num_of_rows'] + "'\
                                data-aquarium-num-of-columns='" + data[i]['aquarium_num_of_columns'] + "'></span>\
                            <div class='media-left'>\
                                <img class='media-object' src='" + DJANGO_STATIC_URL + "/assets/img/icon/Mimetypes-application-x-tar-icon-64x64.png'>\
                            </div>\
                            <div class='media-body w-100'>\
                                <p class='font-weight-bold'>\
                                    <i class='fas fa-circle' style='color: " + data[i]['section_color'] + "'></i> " + data[i]['section_name'] + "\
                                </p>\
                                가로: " + data[i]['aquarium_num_of_columns'] + "개 / 높이: " + data[i]['aquarium_num_of_rows'] + "층 / 총: " + aquarium_total + "개\
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
                    section_pk = $("div.media > span.data-binding", this).data("section-id");
                    section_color = $("div.media > span.data-binding", this).data("section-color");

                    section_name = $("div.media > span.data-binding", this).data("section-name");
                    aquarium_num_of_rows = $("div.media > span.data-binding", this).data("aquarium-num-of-rows");
                    aquarium_num_of_columns = $("div.media > span.data-binding", this).data("aquarium-num-of-columns");

                    $("#aquarium-section-modify").removeAttr("disabled");
                    $("#move-store-layout").removeAttr("disabled");
                }
            });
        }
        else {
            $("#async-aquarium-section").append(
                "<div class='standby'>\
                <img src='" + DJANGO_STATIC_URL + "/assets/img/icon/Apps-utilities-file-archiver-icon.png' class='img-responsive mx-auto'>\
                <hr>\
                <p class='text-center'>생물실의 섹션을 등록할 수 있습니다.</p>\
                </div>"
            );
        }
        if (callback) {
            callback();
        }
    }).fail(function (res, status, xhr) {
        console.log(res);
    });
}

var draw_store_layout = function (url, callback) {
    var params = {
        "FK1": storage_room_pk,
        "FK2": section_pk
    };

    $.ajax({
        url: url,
        method: "get",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: params,
        dataType: "json",
    }).done(function (data, status, xhr) {
        var idx = 0;

        if (SVG.supported) {
            $("#svg-store-layout").empty();

            var row_count = 13;
            var col_label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
            var width_interval = 60;
            var height_interval = 40;

            var layout = SVG("svg-store-layout").size((col_label.length + 1) * width_interval + col_label.length + 2, (row_count + 1) * height_interval + row_count + 2).attr(
                { "class": "align-middle" }
            );

            for (i = 0; i < row_count; i++) {
                var y = (height_interval * (i + 1) + i + 2 + 20);
                layout.plain(i + 1).attr({ "text-anchor": "middle", "x": 30, "y": y });
            }

            for (i = 0; i < col_label.length; i++) {
                var x = (width_interval * (i + 1) + i + 2 + 30);
                layout.plain(col_label[i]).attr({ "text-anchor": "middle", "x": x, "y": 20 });
            }

            for (i = 0; i < row_count; i++) {
                for (j = 0; j < col_label.length; j++) {
                    layout.rect(60, 40).attr({
                        "class": "store-layout-grid",
                        "x": (width_interval * (j + 1) + j + 2),
                        "y": (height_interval * (i + 1) + i + 2)
                    });
                    if (idx < data.length && i == data[idx]["row"] && j == data[idx]["column"]) {
                        layout.rect(60, 40).attr({
                            "class": "store-layout-button",
                            "fill": data[idx]["color"],
                            "x": (width_interval * (j + 1) + j + 2),
                            "y": (height_interval * (i + 1) + i + 2),
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
                            "fill": "#e7e7e7",
                            "x": (width_interval * (j + 1) + j + 2),
                            "y": (height_interval * (i + 1) + i + 2),
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
                        "PK": $(this).data("store-layout-id")
                    };

                    $.ajax({
                        url: "store-layout/",
                        method: "delete",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify(params),
                        dataType: "json",
                    }).done(function (res, status, xhr) {
                        draw_store_layout("store-layout/", null);
                    }).fail(function (res, status, xhr) {
                    });
                }
                else if ($(this).data("store-layout-selected")) {
                    $("#alert-modal-body").html("이미 다른 섹션이 선택되어있습니다.");
                    $("#alert-modal").modal("show");
                }
                else {
                    save_store_layout($(this).data("store-layout-row"), $(this).data("store-layout-column"));
                }
            });

            $("#store-layout-console").html(
                "<i class='fas fa-circle' style='color: " + section_color + "'></i> " + section_name
            );
        }
        else {
            alert("SVG를 지원하지 않는 브라우저입니다.");
        }
        if (callback) {
            callback();
        }
    }).fail(function (data) {
    });
}

var save_store_layout = function (row, column) {
    var params = {
        "FK1": storage_room_pk,
        "FK2": section_pk,
        "row": row,
        "column": column
    };

    $.ajax({
        url: "store-layout/",
        method: "post",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(params),
        dataType: "json",
    }).done(function (res, status, xhr) {
        draw_store_layout("store-layout/", null);
    }).fail(function (res, status, xhr) {
    });
}