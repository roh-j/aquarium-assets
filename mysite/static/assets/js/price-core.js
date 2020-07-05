var async_unit_price = function (callback) {
    $.ajax({
        url: "unit-price/",
        method: "get",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        dataType: "json",
    }).done(function (data, status, xhr) {
        table.clear().draw();
        
        for (i = 0; i < data.length; i++) {
            var unit = null;

            if (data[i]["unit"] == "couple") {
                unit = "<i class='fas fa-heart fa-fw text-success'></i> 한쌍";
            }
            else if (data[i]["unit"] == "female") {
                unit = "<i class='fas fa-venus fa-fw text-danger'></i> 암컷"
            }
            else if (data[i]["unit"] == "male") {
                unit = "<i class='fas fa-mars fa-fw text-primary'></i> 수컷"
            }
            else if (data[i]["unit"] == "none") {
                unit = "<i class='fas fa-circle fa-fw text-secondary'></i> 없음"
            }

            table.row.add(
                $("\
                    <tr>\
                        <th scope='row'>" + (table.rows().count() + 1) + "</th>\
                        <td>" + data[i]["species"] + "</td>\
                        <td>" + data[i]["breed"] + "</td>\
                        <td>" + data[i]["size"] + " cm</td>\
                        <td>" + unit + "</td>\
                        <td>" + data[i]["price"] + " 원</td>\
                        <td class='min cell-button'>\
                            <div class='btn-group d-flex pull-right'>\
                                <button type='button' class='btn btn-default'><i class='fas fa-pen'></i></button>\
                                <button type='button' class='btn btn-default'><i class='fas fa-trash-alt'></i></button>\
                            </div>\
                        </td>\
                    </tr>\
                ")
            ).draw();
        }
        if (callback) {
            callback();
        }
    }).fail(function (res, status, xhr) {
        console.log(res);
    });
}