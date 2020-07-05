/**
 * Order List JS
 * @author roh-j
 * @version 2019-08-01, 코드 표준화.
 */

var table = null;
var data = [];

var pick_year = year;
var pick_month = month;
var pick_day = day;

var pos_year = year;
var pos_month = month;

$(function () {
    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');

    draw_datepicker(pos_year, pos_month);
    toast('info', '주문을 관리할 수 있습니다.');
    load_complete();

    $('#datepicker > thead > tr > th > a').on('click', function (e) {
        e.preventDefault();

        if ($(this).data('action') == 'year-previous') {
            pos_year = (parseInt(pos_year) - 1).toString();
        }
        else if ($(this).data('action') == 'year-next') {
            pos_year = (parseInt(pos_year) + 1).toString();
        }
        else if ($(this).data('action') == 'month-previous') {
            pos_month = (parseInt(pos_month) - 1).toString();
            if (pos_month < 1) {
                pos_year = (parseInt(pos_year) - 1).toString();
                pos_month = '12';
            }
        }
        else if ($(this).data('action') == 'month-next') {
            pos_month = (parseInt(pos_month) + 1).toString();
            if (pos_month > 12) {
                pos_year = (parseInt(pos_year) + 1).toString();
                pos_month = '1';
            }
        }

        if (pos_month.length == 1) {
            pos_month = '0' + pos_month;
        }

        draw_datepicker(pos_year, pos_month);
    });

    data = [
        ['<div class="pretty p-default p-round">\
            <input type="radio" name="test" value="NE555">\
            <div class="state p-primary">\
                <label></label>\
            </div>\
        </div>', 'NE555', '2019-07-29', '구피', '알비노풀레드', '1.2 cm', '암컷', '3', '매장', '12000 원', '처리됨', 'processed'],
        ['<div class="pretty p-default p-round">\
            <input type="radio" name="test" value="NE555">\
            <div class="state p-primary">\
                <label></label>\
            </div>\
        </div>', 'NE555', '2019-07-29', '구피', '알비노풀레드', '1.2 cm', '암컷', '3', '매장', '12000 원', '완료됨', 'processed'],
        ['<div class="pretty p-default p-round">\
            <input type="radio" name="test" value="NE666">\
            <div class="state p-primary">\
                <label></label>\
            </div>\
        </div>', 'NE666', '2019-07-29', '구피', '알비노풀레드', '1.2 cm', '암컷', '3', '매장', '12000 원', '처리됨', 'completed'],
    ];

    table = $('#order_sheet_table').DataTable({
        data: data,
        rowsGroup: [0, 1, 2, 8, 9],
        lengthMenu: [10, 25, 50],
        autoWidth: false,
        searching: false,
        ordering: false,
        pageLength: 10,
        pagingType: 'simple',
        dom: 'l' + 't' + 'p' + 'i',
        language: {
            emptyTable: '데이터가 존재하지 않습니다.',
            zeroRecords: '일치하는 레코드가 없습니다.',
            lengthMenu: '_MENU_',
            search: '',
            paginate: {
                previous: '이전',
                next: '다음'
            }
        },
        createdRow: function (row, data, index) {
            if (data[11] == 'processed') {
                $(row).addClass('warning');
            }
            if (index == 0) {
                $(row).children(':nth-child(1)').addClass('min');
            }
        },
        initComplete: function () {
            $('.dataTables_length select').removeClass('input-sm');
            $('.dataTables_info').detach().appendTo('#order-sheet-info');
            $('.dataTables_paginate').detach().appendTo('#order-sheet-pagination');
            $('.dataTables_length').detach().appendTo('#order-sheet-tool');
            $('#order-sheet-tool').append('<button type="button" class="btn btn-default">항목 담기</button>');
        }
    });
});

var draw_datepicker = function (year, month) {
    $('#datepicker tbody').empty();
    $('#pick-date').html(
        pick_year + '년 ' + pick_month + '월 ' + pick_day + '일'
    )
    $('#set-date').html(
        '<div class="btn-group pull-right">\
            <button type="button" class="btn btn-default">시작일로</button>\
            <button type="button" class="btn btn-default">종료일로</button>\
            <button type="button" class="btn btn-default"><i class="far fa-calendar-alt fa-fw"></i></button>\
        </div>'
    );

    $('#date-year').html(year);
    $('#date-month').html(month);

    var data = calendar(year, month);

    for (i = 0; i < (data[1].length / 7); i++) {
        $('#datepicker tbody').append('<tr></tr>');

        for (j = 0; j < 7; j++) {
            if (data[1][i * 7 + j]) {
                if (data[0][0] == pick_year && data[0][1] == pick_month && data[1][i * 7 + j] == pick_day) {
                    $('#datepicker tbody tr:last-child').append(
                        '<td>\
                            <span class="data-bind"\
                                data-exist="true"\
                                data-year="' + year + '"\
                                data-month="' + month + '"\
                                data-day="' + data[1][i * 7 + j] + '"></span>\
                            <span class="label label-danger">' + data[1][i * 7 + j] + '</span>\
                        </td>'
                    );
                }
                else {
                    if ((i * 7 + j) % 7 == 0) {
                        $('#datepicker tbody tr:last-child').append(
                            '<td class="text-danger">\
                                <span class="data-bind"\
                                    data-exist="true"\
                                    data-year="' + year + '"\
                                    data-month="' + month + '"\
                                    data-day="' + data[1][i * 7 + j] + '"></span>\
                                ' + data[1][i * 7 + j] + '\
                            </td>'
                        );
                    }
                    else if ((i * 7 + j) % 7 == 6) {
                        $('#datepicker tbody tr:last-child').append(
                            '<td class="text-primary">\
                                <span class="data-bind"\
                                    data-exist="true"\
                                    data-year="' + year + '"\
                                    data-month="' + month + '"\
                                    data-day="' + data[1][i * 7 + j] + '"></span>\
                                ' + data[1][i * 7 + j] + '\
                            </td>'
                        );
                    }
                    else {
                        $('#datepicker tbody tr:last-child').append(
                            '<td>\
                                <span class="data-bind"\
                                    data-exist="true"\
                                    data-year="' + year + '"\
                                    data-month="' + month + '"\
                                    data-day="' + data[1][i * 7 + j] + '"></span>\
                                ' + data[1][i * 7 + j] + '\
                            </td>'
                        );
                    }
                }
            }
            else {
                $('#datepicker tbody tr:last-child').append(
                    '<td class="bg-light">\
                        <span class="data-bind"\
                            data-exist="false"></span>\
                            &nbsp;\
                    </td>'
                );
            }
        }
    }

    $('#datepicker > tbody > tr td').on('click', function () {
        if ($('span.data-bind', this).data('exist') == true) {
            pick_year = $('span.data-bind', this).data('year');
            pick_month = $('span.data-bind', this).data('month');
            pick_day = $('span.data-bind', this).data('day');

            draw_datepicker(pick_year, pick_month);
        }
    });
}