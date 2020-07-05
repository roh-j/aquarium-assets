var price_table = null;
var unit_price_id = null;

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

    $('#unit_price_table').on('length.dt', function (e, settings, len) {
        $('#unit_price_table').on('draw.dt', function () {
            event_unit_price_modify();
        });
    });

    $('#unit_price_table').on('search.dt', function () {
        $('#unit_price_table').on('draw.dt', function () {
            event_unit_price_modify();
        });
    });

    $('#unit_price_table').on('page.dt', function () {
        $('#unit_price_table').on('draw.dt', function () {
            event_unit_price_modify();
        });
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

                toastr.remove();
                toastr.success('단가가 등록되었습니다.');
                $(this).off('hidden.bs.modal');
            });
        }).fail(function (res, status, xhr) {
            $.each(res.responseJSON, function (key, value) {
                toastr.remove();
                toastr.warning(value);
                return false;
            });
        });
    });

    $('#form-unit-price-modify').on('submit', function (e) {
        e.preventDefault();
        var params = $('#form-unit-price-modify').serializeObject();
        params = $.extend(
            params, {
                'pk_unit_price': unit_price_id
            }
        );

        $.ajax({
            url: '',
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json'
        }).done(function (data, status, xhr) {
            $('#unit-price-modify-modal').modal('hide');
            $('#unit-price-modify-modal').on('hidden.bs.modal', function () {
                async_unit_price();
                
                toastr.remove();
                toastr.success('단가가 변경되었습니다.');
                $(this).off('hidden.bs.modal');
            });
        }).fail(function (res, status, xhr) {
            $.each(res.responseJSON, function (key, value) {
                toastr.remove();
                toastr.warning(value);
                return false;
            });
        });
    });

    $('#unit-price-delete').on('click', function () {
        var params = {
            'pk_unit_price': unit_price_id
        };

        $.ajax({
            url: '',
            method: 'delete',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json'
        }).done(function (data, status, xhr) {
            $('#unit-price-modify-modal').modal('hide');
            $('#unit-price-modify-modal').on('hidden.bs.modal', function () {
                async_unit_price();

                toastr.remove();
                toastr.success('단가가 삭제되었습니다.');
                $(this).off('hidden.bs.modal');
            });
        }).fail(function (res, status, xhr) { });
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
                        <th scope="row">\
                            <span class="data-bind"\
                                data-unit-price-id="' + data[i]['id'] + '"\
                                data-price="' + data[i]['price'] + '"\
                                data-scope-of-sales="' + data[i]['scope_of_sales'] + '"\
                                data-order-quantity="' + data[i]['order_quantity'] + '"></span>\
                            ' + (price_table.rows().count() + 1) + '\
                        </th>\
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
                            <button type="button" class="btn btn-default unit-price-modify">변경</button>\
                        </td>\
                    </tr>'
                )
            ).draw();
        }

        event_unit_price_modify();

        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) { });
};

var event_unit_price_modify = function (callback) {
    $('.unit-price-modify').off('click');
    $('.unit-price-modify').on('click', function () {
        var unit_price = $('th span.data-bind', $(this).closest('tr'));
        var scope_of_sales = $('#form-unit-price-modify input[name=scope_of_sales][value=' + unit_price.data('scope-of-sales') + ']');

        $('#form-unit-price-modify')
            .find('input[type=radio]')
            .closest('label')
            .removeClass('active');

        if (parseInt(unit_price.data('order-quantity')) == 0) {
            $('#unit-price-modify-warning').empty();
            $('#unit-price-delete').attr('disabled', false);
        }
        else {
            $('#unit-price-modify-warning').html(
                '<div class="alert alert-explain">\
                    <span class="text-danger font-weight-bold">' + unit_price.data('order-quantity') + '</span> 마리에 대한 처리되지 않은 주문이 존재하여 삭제하실 수 없습니다.\
                </div>'
            );
            $('#unit-price-delete').attr('disabled', true);
        }

        unit_price_id = unit_price.data('unit-price-id');
        scope_of_sales.attr('checked', true);
        scope_of_sales.parents('label').addClass('active');
        $('#form-unit-price-modify input[name=price]').val(unit_price.data('price'));

        $('#unit-price-modify-modal').modal('show');
    });

    typeof callback === 'function' && callback();
};