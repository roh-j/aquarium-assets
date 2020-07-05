var price_table = null;

$(function () {
    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');
    init_toast();
    init_spinner();
    init_radio_reset();

    $('.wide-screen').on('click', function () {
        wide_screen('toggle');
    });

    price_table = $('#unit_price_table').DataTable({
        'buttons': [
            {
                'extend': 'excel',
                'text': '<i class="far fa-save fa-fw"></i> Excel',
                'filename': '생물 단가표 ' + year + '-' + month + '-' + day,
                'title': '',
                'exportOptions': {
                    'columns': [1, 2, 3, 4, 5, 6, 7, 8, 9]
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
                'targets': [10],
                'searchable': false,
                'orderable': false
            }
        ],
        'autoWidth': false,
        'pageLength': 10,
        'lengthMenu': [10, 25, 50],
        'pagingType': 'simple',
        'dom': 'B' + 'l' + 'f' + 't' + 'i' + 'p',
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
            $('.dt-buttons').detach().appendTo('#unit-price-menu');
            $('.dataTables_filter input').removeClass('input-sm');
            $('.dataTables_length select').removeClass('input-sm');
            $('.dataTables_length').detach().appendTo('#unit-price-tool').addClass('ml-auto');
            $('.dataTables_filter').detach().appendTo('#unit-price-tool');
            $('.dataTables_info').detach().appendTo('#unit-price-info');
            $('.dataTables_paginate').detach().appendTo('#unit-price-pagination');

            async_unit_price(load_complete());
        }
    });

    $('#unit-price-register').on('click', function () {
        $.ajax({
            url: 'creature/',
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            dataType: 'json'
        }).done(function (data, status, xhr) {
            var species = [];
            var breed = [];
            var remark = [];

            $('#species-dropdown-menu').empty();
            $('#breed-dropdown-menu').empty();
            $('#remark-dropdown-menu').empty();

            for (i = 0; i < data.length; i++) {
                if ($.inArray(data[i]['species'], species) < 0) {
                    species.push(data[i]['species']);
                    $('#species-dropdown-menu').append('<li><a href="#" data-target="#id_species">' + data[i]['species'] + '</a></li>');
                }

                if ($.inArray(data[i]['breed'], breed) < 0) {
                    breed.push(data[i]['breed']);
                    $('#breed-dropdown-menu').append('<li><a href="#" data-target="#id_breed">' + data[i]['breed'] + '</a></li>');
                }

                if (data[i]['remark'] != '' && $.inArray(data[i]['remark'], remark) < 0) {
                    remark.push(data[i]['remark']);
                    $('#remark-dropdown-menu').append('<li><a href="#" data-target="#id_remark">' + data[i]['remark'] + '</a></li>');
                }
            }

            $('#id_species').typeahead({ source: species, items: 5 });
            $('#id_breed').typeahead({ source: breed, items: 5 });
            $('#id_remark').typeahead({ source: remark, items: 5 });

            $('.dropdown-menu li a').on('click', function (e) {
                e.preventDefault();
                target = $(this).data('target');
                $(target).val($(this).text());
            });

            $('#unit-price-register-modal').modal('show');
        }).fail(function (res, status, xhr) { });
    });

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
            dataType: 'json'
        }).done(function (data, status, xhr) {
            $('#unit-price-register-modal').modal('hide');
            $('#unit-price-register-modal').on('hidden.bs.modal', function () {
                form_reset('#form-unit-price-register');
                async_unit_price();
            });
        }).fail(function (res, status, xhr) {
            $.each(res.responseJSON, function (key, value) {
                toastr.remove();
                toastr.warning(value);
                return false;
            });
        });
    });
});

var async_unit_price = function (callback) {
    $.ajax({
        url: 'unit-price/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'json'
    }).done(function (data, status, xhr) {
        price_table.clear().draw();

        for (i = 0; i < data.length; i++) {
            price_table.row.add(
                $(
                    '<tr>\
                        <th scope="row">' + (price_table.rows().count() + 1) + '</th>\
                        <td>' + data[i]['creature__species'] + '</td>\
                        <td>' + data[i]['creature__breed'] + '</td>\
                        <td>' + data[i]['creature__remark'] + '</td>\
                        <td>' + data[i]['min_size'] + ' cm</td>\
                        <td>' + data[i]['max_size'] + ' cm</td>\
                        <td>' + conv_stages_of_development(data[i]['stages_of_development']) + '</td>\
                        <td>' + conv_unit(data[i]['unit']) + '</td>\
                        <td>' + data[i]['price'].toLocaleString() + ' 원</td>\
                        <td>' + conv_scope_of_sales(data[i]['scope_of_sales']) + '</td>\
                        <td class="min col-btn">\
                            <button type="button" class="btn btn-default"><i class="fas fa-pen fa-fw"></i></button>\
                        </td>\
                    </tr>'
                )
            ).draw();
        }
        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) { });
};