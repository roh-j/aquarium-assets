var DJANGO_STATIC_URL = "/static";
var CSRF_TOKEN = Cookies.get("csrftoken");

var standby_store_layout = function () {
    if (SVG.supported) {
        $("#store-layout-canvas").empty();
        $("#store-layout-console").text("창고 / 섹션을 먼저 선택해주세요.");

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

var standby_aquarium = function () {
    if (SVG.supported) {
        var row = 3;
        var column = 4;

        var aquarium = SVG("aquarium-canvas").size(60 * column + 21, 60 * row + 21);

        for (i = row; i > 0; i--) {
            for (j = 0; j < column; j++) {
                if ((i == 2 && j == 2) || (i == 1 && j == 3) || (i == 1 && j == 2)) {
                    continue;
                }
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
                aquarium.plain((row - i + 1) + "-" + (j + 1)).attr({ "text-anchor": "middle", "x": 60 * j + 30, "y": 40 + (60 * (i - 1)) });
            }
        }
    }
    else {
        alert("SVG를 지원하지 않는 브라우저입니다.");
    }
}