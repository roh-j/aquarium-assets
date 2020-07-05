var init_store_layout = function () {
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
                layout.rect(60, 40).attr({
                    "class": "store-layout-button",
                    "fill": "#E7E7E7",
                    "x": (j * width_interval + 1 + width_interval),
                    "y": (i * height_interval + 1 + height_interval)
                });
            }
        }
    }
    else {
        alert("SVG를 지원하지 않는 브라우저입니다.");
    }
}