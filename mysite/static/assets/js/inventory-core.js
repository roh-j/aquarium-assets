var draw_store_layout = function (url, callback) {
    var params = {
        "FK": storage_room_pk
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
                            "fill": "#e7e7e7",
                            "x": (j * width_interval + 1 + width_interval),
                            "y": (i * height_interval + 1 + height_interval),
                            "data-store-layout-selected": false
                        });
                    }
                }
            }

            $("rect.store-layout-button").on("click", function () {
                if ($(this).data("store-layout-selected")) {
                    aquarium_section_pk = $(this).data("store-layout-section-id");
                    draw_aquarium("aquarium-section/", function () {
                        $(".nav-tabs a[href='#aquarium']").tab("show");
                    });
                }
            });
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

var draw_aquarium = function (url, callback) {
    var params = {
        "PK": aquarium_section_pk
    }

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
        if (SVG.supported) {
            $("#aquarium-canvas").empty();

            var aquarium = SVG("aquarium-canvas").size(60 * data["aquarium_num_of_columns"] + 21, 60 * data["aquarium_num_of_rows"] + 21);

            for (i = data["aquarium_num_of_rows"]; i > 0; i--) {
                for (j = 0; j < data["aquarium_num_of_columns"]; j++) {
                    var group = aquarium.group();

                    if (i == (data["aquarium_num_of_rows"] - aquarium_selection_row) && j == aquarium_selection_column) {
                        group.add(water = aquarium.pattern(.25, 1.1, function (add) {
                            add.path("M0.25,1H0c0,0,0-0.659,0-0.916c0.083-0.303,0.158,0.334,0.25,0C0.25,0.327,0.25,1,0.25,1z").fill("#207ba9");
                        }).attr({
                            'patternUnits': null,
                            'patternContentUnits': 'objectBoundingBox'
                        }));
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'effect-aquarium-front-grid',
                            'x': 1,
                            'y': 20
                        }));
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'effect-aquarium-front-button',
                            'x': 1,
                            'y': 20
                        }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.polygon('80,1 61,20 61,80 80,61').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('80,1 61,20 61,80 80,61').attr({ 'class': 'aquarium-plane' }));
                        group.add(mask = aquarium.rect(59, 60).attr({
                            'x': 1,
                            'y': 20
                        }).fill("#fff"));
                        group.add(water_mask = aquarium.mask().add(mask));
                        group.add(water_effect1 = aquarium.rect(1200, 120).attr({
                            'x': -500,
                            'y': 81,
                            'pointer-events': 'none'
                        }).attr({
                            "opacity": 0.3
                        }).fill(water).maskWith(water_mask));
                        group.add(water_effect2 = aquarium.rect(1600, 120).attr({
                            'x': -500,
                            'y': 81,
                            'pointer-events': 'none'
                        }).attr({
                            "opacity": 0.3
                        }).fill(water).maskWith(water_mask));

                        water_effect1.animate(1000).move(-300, 45).animate(3000).move(0, 45).loop();
                        water_effect2.animate(1000).move(-400, 40).animate(4000).move(0, 40).loop();
                    }
                    else {
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'aquarium-front-grid',
                            'x': 1,
                            'y': 20
                        }));
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'aquarium-front-button',
                            'x': 1,
                            'y': 20,
                            "data-aquarium-row": (data["aquarium_num_of_rows"] - i),
                            "data-aquarium-column": j
                        }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.polygon('80,1 61,20 61,80 80,61').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('80,1 61,20 61,80 80,61').attr({ 'class': 'aquarium-plane' }));
                    }

                    group.move(60 * j, 60 * (i - 1));
                    aquarium.plain((data["aquarium_num_of_rows"] - i + 1) + "-" + (j + 1)).attr({ "text-anchor": "middle", "x": 60 * j + 30, "y": 40 + (60 * (i - 1)) });
                }
            }

            $("rect.aquarium-front-button").on("click", function () {
                aquarium_selection_row = $(this).data("aquarium-row");
                aquarium_selection_column = $(this).data("aquarium-column");
                draw_aquarium("aquarium-section/", null);
            });
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