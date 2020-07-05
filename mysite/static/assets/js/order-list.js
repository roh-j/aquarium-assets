/**
 * Order List JS
 * @author roh-j
 * @version 2019-07-27, 코드 표준화.
 */

var table = null;
var data = [];

var start_date_year = year;
var start_date_month = month;
var start_date_day = day;

var end_date_year = year;
var end_date_month = month;
var end_date_day = day;

$(function () {

    $("#console-menu").metisMenu();
    $(".nav-second-level").removeClass("d-none");

    draw_datepicker("#start-date", "#start-datepicker-days", "bg-info", start_date_year, start_date_month, start_date_day);
    draw_datepicker("#end-date", "#end-datepicker-days", "bg-success", end_date_year, end_date_month, end_date_day);

    load_complete();

    data = [
        ["<div class='pretty p-default p-round'>\
            <input type='radio' name='test' value='NE555'>\
            <div class='state p-primary'>\
                <label></label>\
            </div>\
        </div>", "NE555", "2019-07-29", "구피", "알비노풀레드", "1.2 cm", "암컷", "3", "매장", "12000 원", "처리됨", "processed"],
        ["<div class='pretty p-default p-round'>\
            <input type='radio' name='test' value='NE555'>\
            <div class='state p-primary'>\
                <label></label>\
            </div>\
        </div>", "NE555", "2019-07-29", "구피", "알비노풀레드", "1.2 cm", "암컷", "3", "매장", "12000 원", "완료됨", "processed"],
        ["<div class='pretty p-default p-round'>\
            <input type='radio' name='test' value='NE666'>\
            <div class='state p-primary'>\
                <label></label>\
            </div>\
        </div>", "NE666", "2019-07-29", "구피", "알비노풀레드", "1.2 cm", "암컷", "3", "매장", "12000 원", "처리됨", "completed"],
    ]

    table = $("#order_sheet_table").DataTable({
        data: data,
        rowsGroup: [0, 1, 2, 8, 9],
        lengthMenu: [10, 25, 50],
        autoWidth: false,
        ordering: false,
        searching: false,
        pageLength: 10,
        pagingType: "simple",
        dom: "l" + "t" + "p" + "i",
        language: {
            emptyTable: "데이터가 존재하지 않습니다.",
            zeroRecords: "일치하는 레코드가 없습니다.",
            lengthMenu: "_MENU_",
            search: "",
            paginate: {
                previous: "이전",
                next: "다음"
            }
        },
        createdRow: function (row, data, index) {
            if (data[11] == "processed") {
                $(row).addClass("warning");
            }
            if (index == 0) {
                $(row).children(":nth-child(1)").addClass("min");
            }
        },
        initComplete: function () {
            $(".dataTables_length select").removeClass("input-sm");
            $(".dataTables_info").detach().appendTo("#order-sheet-info");
            $(".dataTables_paginate").detach().appendTo("#order-sheet-pagination");
            $(".dataTables_length").detach().appendTo("#order-sheet-tool");
        }
    });
});

var draw_datepicker = function (target_info, target_table, color, year, month, day) {

    $(target_info).html(
        year + "년 " + month + "월 " + day + "일 <button type='button' class='btn btn-default'>오늘</button>"
    )

    $(target_info + "-year").html(year);
    $(target_info + "-month").html(month);

    var data = calendar(year, month);

    for (i = 0; i < (data[1].length / 7); i++) {

        $(target_table+" tbody").append("<tr></tr>");

        for (j = 0; j < 7; j++) {
            if (data[1][i * 7 + j]) {

                // 사용자 선택일

                if (data[0][0] == start_date_year &&
                    data[0][1] == start_date_month &&
                    (i * 7 + j) == start_date_day) {
                    $(target_table+" tbody tr:last-child").append(
                        "<td class='" + color + " text-white'>\
                            <span class='data-binding'\
                                data-year='" + year + "'\
                                data-month='" + month + "'\
                                data-day='" + (i * 7 + j) + "'></span>\
                            " + data[1][i * 7 + j] + "\
                        </td>"
                    );
                }
                else {
                    if ((i * 7 + j) % 7 == 0) {
                        $(target_table + " tbody tr:last-child").append(
                            "<td class='text-danger'>\
                                <span class='data-binding'\
                                    data-year='" + year + "'\
                                    data-month='" + month + "'\
                                    data-day='" + (i * 7 + j) + "'></span>\
                                " + data[1][i * 7 + j] + "\
                            </td>"
                        );
                    }
                    else if ((i * 7 + j) % 7 == 6) {
                        $(target_table + " tbody tr:last-child").append(
                            "<td class='text-primary'>\
                                <span class='data-binding'\
                                    data-year='" + year + "'\
                                    data-month='" + month + "'\
                                    data-day='" + (i * 7 + j) + "'></span>\
                                " + data[1][i * 7 + j] + "\
                            </td>"
                        );
                    }
                    else {
                        $(target_table + " tbody tr:last-child").append(
                            "<td>\
                                <span class='data-binding'\
                                    data-year='" + year + "'\
                                    data-month='" + month + "'\
                                    data-day='" + (i * 7 + j) + "'></span>\
                                " + data[1][i * 7 + j] + "\
                            </td>"
                        );
                    }
                }
            }
            else {
                $(target_table+" tbody tr:last-child").append(
                    "<td class='bg-light'>&nbsp;</td>"
                );
            }
        }
    }
}