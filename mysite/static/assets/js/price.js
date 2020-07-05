/**
 * Price JS
 * @author roh-j
 * @version 2019-07-26, 코드 표준화.
 */

var table = null;
var species = [];
var breed = [];

$(function () {

    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');

    init_horizontal_spinner();
    init_radio_reset();

    table = $('#unit_price_table').DataTable({
        buttons: [
            {
                extend: 'csv',
                text: '<i class="far fa-save fa-fw"></i> CSV',
                filename: '생물 단가 ' + year + '-' + month + '-' + day,
                exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                }
            },
            {
                extend: 'excel',
                text: '<i class="far fa-save fa-fw"></i> Excel',
                filename: '생물 단가 ' + year + '-' + month + '-' + day,
                title: '',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                },
                customize: function (xlsx) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];
                    var col = $('col', sheet);

                    col.each(function () {
                        $(this).attr('width', 35);
                    });
                }
            }
        ],
        columnDefs: [
            {
                'targets': [6],
                'searchable': false,
                'orderable': false
            }
        ],
        autoWidth: false,
        pageLength: 10,
        lengthMenu: [10, 25, 50],
        pagingType: 'simple',
        dom: 'l' + 'B' + 'f' + 't' + 'p' + 'i',
        language: {
            emptyTable: '데이터가 존재하지 않습니다.',
            zeroRecords: '일치하는 레코드가 없습니다.',
            lengthMenu: '_MENU_',
            search: '',
            searchPlaceholder: '\uf002',
            paginate: {
                previous: '이전',
                next: '다음'
            }
        },
        initComplete: function () {
            $('.dt-buttons').addClass('btn-group');
            $('.dt-buttons > .dt-button').addClass('btn btn-default');

            $('.dataTables_filter input').removeClass('input-sm').unwrap('label').addClass('fas fa-search');
            $('.dataTables_length select').removeClass('input-sm');

            $('.dataTables_info').detach().appendTo('#unit-price-info');
            $('.dataTables_paginate').detach().appendTo('#unit-price-pagination');

            $('.dt-buttons').detach().appendTo('#unit-price-menu');
            $('.dataTables_length').detach().appendTo('#unit-price-tool');
            $('.dataTables_filter').detach().appendTo('#unit-price-tool');

            async_unit_price(load_complete);
        }
    });

    /**
     * [단가 추가] 버튼 클릭.
     * 단가와 재고에 입력된 데이터의 union 한 결과를 표시.
     */

    $('#unit-price-register').click(function (e) {
        $.ajax({
            url: 'unit-price/species/',
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            dataType: 'json',
        }).done(function (data, status, xhr) {
            species = [];

            $('#species-dropdown-menu').empty();

            for (i = 0; i < data.length; i++) {
                species.push(data[i]['species']);
                $('#species-dropdown-menu').append(
                    '<li><a href="#">' + data[i]['species'] + '</a></li>'
                );
            }

            $('#id_species').typeahead({
                source: species,
                items: 3
            });

            $.ajax({
                url: 'unit-price/breed/',
                method: 'get',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                dataType: 'json',
            }).done(function (data, status, xhr) {
                breed = [];

                $('#breed-dropdown-menu').empty();

                for (i = 0; i < data.length; i++) {
                    breed.push(data[i]['breed']);
                    $('#breed-dropdown-menu').append(
                        '<li><a href="#">' + data[i]['breed'] + '</a></li>'
                    );
                }

                $('#id_breed').typeahead({
                    source: breed,
                    items: 3
                });

                $('#unit-price-modal').modal('show');
            }).fail(function (res) {
            });
        }).fail(function (res) {
        });
    });

    /**
     * 단가 입력 데이터 전송.
     * Rest API 구조를 따름.
     */

    $(document).on('submit', 'form#form-unit-price', function (e) {
        e.preventDefault();
        var params = $('form#form-unit-price').serializeObject();

        $.ajax({
            url: '',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (res, status, xhr) {
            $('#unit-price-modal').modal('hide');
            $('#unit-price-modal').on('hidden.bs.modal', function (e) {
                async_unit_price(null);
            });
        }).fail(function (res, status, xhr) {
            console.log(res);
        });
    });
});

/**
 * 사용자가 입력한 단가 데이터를 Ajax로 가져옴.
 * @param {string} callback 콜백 처리 변수.
 * @returns 없음.
 */

var async_unit_price = function (callback) {
    $.ajax({
        url: 'unit-price/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'json',
    }).done(function (data, status, xhr) {
        table.clear().draw();

        for (i = 0; i < data.length; i++) {
            var unit = null;

            if (data[i]['unit'] == 'couple') {
                unit = '<i class="fas fa-seedling fa-fw text-success"></i> 한쌍';
            }
            else if (data[i]['unit'] == 'female') {
                unit = '<i class="fas fa-venus fa-fw text-danger"></i> 암컷'
            }
            else if (data[i]['unit'] == 'male') {
                unit = '<i class="fas fa-mars fa-fw text-primary"></i> 수컷'
            }
            else if (data[i]['unit'] == 'none') {
                unit = '<i class="fas fa-genderless fa-fw text-secondary"></i> 없음'
            }

            table.row.add(
                $('\
                    <tr>\
                        <th scope="row">' + (table.rows().count() + 1) + '</th>\
                        <td>' + data[i]['species'] + '</td>\
                        <td>' + data[i]['breed'] + '</td>\
                        <td>' + data[i]['size'] + ' cm</td>\
                        <td>' + unit + '</td>\
                        <td>' + data[i]['price'] + ' 원</td>\
                        <td class="min col-btn">\
                            <div class="btn-group d-flex">\
                                <button type="button" class="btn btn-default"><i class="fas fa-pen fa-fw"></i></button>\
                                <button type="button" class="btn btn-default"><i class="fas fa-trash-alt fa-fw"></i></button>\
                            </div>\
                        </td>\
                    </tr>\
                ')
            ).draw();
        }
        if (callback) {
            callback();
        }
    }).fail(function (res, status, xhr) {
        console.log(res);
    });
}