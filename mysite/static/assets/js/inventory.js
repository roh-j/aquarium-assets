var storage_room_id = null;
var aquarium_section_id = null;

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

            storage_room_id = $("div.media > span.data-binding", this).data("storage-room-id");
            storage_room_name = $("div.media > span.data-binding", this).data("storage-room-name");

            draw_store_layout("../../store/ajax/async-from-inventory/store-layout/", function () {
                $(".nav-tabs a[href='#store-layout']").tab("show");
            });
        }
    });
});

var draw_store_layout = function (url, callback) {
    var params = {
        "csrfmiddlewaretoken": CSRF_TOKEN,
        "FK": storage_room_id
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
                            "data-store-layout-selected": true,
                            "data-store-layout-section-id": data[idx]["section_id"]
                        });
                        idx++;
                    }
                    else {
                        layout.rect(60, 40).attr({
                            "class": "store-layout-button",
                            "fill": "#E7E7E7",
                            "x": (j * width_interval + 1 + width_interval),
                            "y": (i * height_interval + 1 + height_interval),
                            "data-store-layout-selected": false
                        });
                    }
                }
            }
            $("rect.store-layout-button").on("click", function () {
                aquarium_section_id = $(this).data("store-layout-section-id");
                draw_aquarium("../../store/ajax/async-from-inventory/aquarium-section/", function () {
                    $(".nav-tabs a[href='#aquarium']").tab("show");
                });
            });

            if (callback) {
                callback();
            }
        }
        else {
            alert("SVG를 지원하지 않는 브라우저입니다.");
        }
    }).fail(function (data) {
    });
}

var draw_aquarium = function (url, callback) {
    var params = {
        "csrfmiddlewaretoken": CSRF_TOKEN,
        "PK": aquarium_section_id
    };

    $.ajax({
        url: url,
        method: "POST",
        data: params,
        dataType: "json",
    }).done(function (data) {
        if (SVG.supported) {
            $("#aquarium-canvas").empty();

            var aquarium = SVG("aquarium-canvas").size(60 * data[0]["fields"]["aquarium_num_of_columns"] + 21, 60 * data[0]["fields"]["aquarium_num_of_rows"] + 21);

            for (i = data[0]["fields"]["aquarium_num_of_rows"]; i > 0; i--) {
                for (j = 0; j < data[0]["fields"]["aquarium_num_of_columns"]; j++) {
                    var group = aquarium.group();

                    group.add(aquarium.rect(60, 60).attr({
                        'class': 'aquarium-front-grid',
                        'x': 1,
                        'y': 20
                    }));
                    group.add(aquarium.rect(60, 60).attr({
                        'class': 'aquarium-front-button',
                        'x': 1,
                        'y': 20
                    }));
                    group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-grid' }));
                    group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-plane' }));
                    group.add(aquarium.polygon('80,1 61,20 61,80 80,61').attr({ 'class': 'aquarium-grid' }));
                    group.add(aquarium.polygon('80,1 61,20 61,80 80,61').attr({ 'class': 'aquarium-plane' }));

                    group.move(60 * j, 60 * (i - 1));
                    aquarium.plain((data[0]["fields"]["aquarium_num_of_rows"] - i + 1) + "-" + (j + 1)).attr({ "text-anchor": "middle", "x": 60 * j + 30, "y": 40 + (60 * (i - 1)) });
                }
            }

            if (callback) {
                callback();
            }
        }
        else {
            alert("SVG를 지원하지 않는 브라우저입니다.");
        }
    }).fail(function (data) {
    });
}