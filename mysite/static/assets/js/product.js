/**
 * product javascript
 * @author roh-j
 * @version 2019-08-10
 */

var price_table = null;

$(function () {

    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');

    init_toast();

    init_horizontal_spinner();
    init_custom_radio_reset();

    price_table = $('#unit_price_table').DataTable({
        'buttons': [
            {
                'extend': 'csv',
                'text': '<i class="far fa-save fa-fw"></i> CSV',
                'filename': '생물 단가표 ' + year + '-' + month + '-' + day,
                'exportOptions': {
                    'columns': [1, 2, 3, 4, 5, 6, 7]
                }
            },
            {
                'extend': 'excel',
                'text': '<i class="far fa-save fa-fw"></i> Excel',
                'filename': '생물 단가표 ' + year + '-' + month + '-' + day,
                'title': '',
                'exportOptions': {
                    'columns': [1, 2, 3, 4, 5, 6, 7]
                },
                'customize': function (xlsx) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];
                    var col = $('col', sheet);

                    col.each(function () {
                        $(this).attr('width', 35);
                    });
                }
            }
        ],
        'columnDefs': [
            {
                'targets': [8],
                'searchable': false,
                'orderable': false
            }
        ],
        'autoWidth': false,
        'pageLength': 10,
        'lengthMenu': [10, 25, 50],
        'pagingType': 'simple',
        'dom': 'l' + 'B' + 'f' + 't' + 'p' + 'i',
        'language': {
            'emptyTable': '데이터가 존재하지 않습니다.',
            'zeroRecords': '일치하는 데이터가 없습니다.',
            'lengthMenu': '_MENU_',
            'search': '',
            'paginate': {
                'previous': '이전',
                'next': '다음'
            }
        },
        'initComplete': function () {
            $('.dt-buttons').addClass('btn-group');
            $('.dt-buttons > .dt-button').addClass('btn btn-default');

            $('.dataTables_filter input').removeClass('input-sm');
            $('.dataTables_length select').removeClass('input-sm');

            $('.dataTables_info').detach().appendTo('#unit-price-info');
            $('.dataTables_paginate').detach().appendTo('#unit-price-pagination');

            $('.dt-buttons').detach().appendTo('#unit-price-menu');
            $('.dataTables_length').detach().appendTo('#unit-price-tool').addClass('ml-auto');
            $('.dataTables_filter').detach().appendTo('#unit-price-tool');

            async_unit_price(load_complete);
        }
    });

    $('#unit-price-register').on('click', function (e) {
        $.ajax({
            url: 'creature/',
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            dataType: 'json',
        }).done(function (data, status, xhr) {
            var species = [];
            var breed = [];

            $('#species-dropdown-menu').empty();
            $('#breed-dropdown-menu').empty();

            for (i = 0; i < data.length; i++) {
                species.push(data[i]['species']);
                breed.push(data[i]['breed']);

                $('#species-dropdown-menu').append(
                    '<li><a href="#" data-target="#id_species">' + data[i]['species'] + '</a></li>'
                );
                $('#breed-dropdown-menu').append(
                    '<li><a href="#" data-target="#id_breed">' + data[i]['breed'] + '</a></li>'
                );
            }

            $('#id_species').typeahead({
                source: species,
                items: 5
            });
            $('#id_breed').typeahead({
                source: breed,
                items: 5
            });

            $('.dropdown-menu li a').on('click', function (e) {
                e.preventDefault();

                target = $(this).data('target');
                $(target).val($(this).text());
            });

            $('#unit-price-register-modal').modal('show');
        }).fail(function (res, status, xhr) {
        });
    });

    /**
     * 단가 입력 데이터 전송.
     * Rest API 구조를 따름.
     */

    $('#form-unit-price-register').on('submit', function (e) {
        e.preventDefault();
        var params = $('#form-unit-price-register').serializeObject();

        $.ajax({
            url: '',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (data, status, xhr) {
            $('#unit-price-register-modal').modal('hide');
            $('#unit-price-register-modal').on('hidden.bs.modal', function (e) {
                async_unit_price();
            });
        }).fail(function (res, status, xhr) {
            $.each(res.responseJSON, function (key, value) {
                toastr.remove();
                toastr.warning(error_messages['product'][key][value]);
                return false;
            });
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
        price_table.clear().draw();

        for (i = 0; i < data.length; i++) {
            var unit = null;
            var stages_of_development = null;

            switch (data[i]['unit']) {
                case 'none':
                    unit = '<i class="fas fa-genderless fa-fw text-secondary"></i> 없음';
                    break;
                case 'female':
                    unit = '<i class="fas fa-venus fa-fw text-danger"></i> 암컷';
                    break;
                case 'male':
                    unit = '<i class="fas fa-mars fa-fw text-primary"></i> 수컷';
                    break;
            }

            switch (data[i]['stages_of_development']) {
                case 'adult':
                    stages_of_development = '성어';
                    break;
                case 'immature':
                    stages_of_development = '준성어';
                    break;
                case 'juvenile':
                    stages_of_development = '유어';
                    break;
                case 'larva':
                    stages_of_development = '치어';
                    break
            }

            price_table.row.add(
                $('\
                    <tr>\
                        <th scope="row">' + (price_table.rows().count() + 1) + '</th>\
                        <td>' + data[i]['creature__species'] + '</td>\
                        <td>' + data[i]['creature__breed'] + '</td>\
                        <td>' + data[i]['min_size'] + ' cm</td>\
                        <td>' + data[i]['max_size'] + ' cm</td>\
                        <td>' + stages_of_development + '</td>\
                        <td>' + unit + '</td>\
                        <td>' + data[i]['price'].toLocaleString() + ' 원</td>\
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
        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) {
    });
}