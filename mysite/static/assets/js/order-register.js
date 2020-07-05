var params = {};
var order_items = [];

var customer_table = null;
var product_table = null;
var order_item_table = null;

$(function () {
    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');
    init_toast();
    init_spinner();
    init_select_all();

    $('.wide-screen').on('click', function () {
        wide_screen('toggle');
    });

    $('#form-recipient-register').on('submit', function (e) {
        e.preventDefault();
        params['customer_name'] = $('#id_customer_name').val();
        params['contact'] = $('#id_contact').val();
        params['address'] = $('#id_address').val();

        if ($('#id_customer_name').val() != '') {
            $('#view-customer-name').text($('#id_customer_name').val());
        }
        if ($('#id_contact').val() != '') {
            $('#view-contact').text($('#id_contact').val());
        }
        if ($('#id_address').val() != '') {
            $('#view-address').text($('#id_address').val());
        }

        $('#recipient-register-modal').modal('hide');
    });

    $('#empty-cart').on('click', function () {
        order_item_table.clear().draw();
        order_items = [];
    });

    $('#add-order').on('click', function () {
        $('#add-order-modal').modal('show');
    });

    $('input:radio[name=order_type]').on('click', function () {
        var value = $('input:radio[name=order_type]:checked').val();

        switch (value) {
            case 'pickup':
                value = '매장'; break;
            case 'delivery':
                value = '택배'; break;
        }
        $('#view-order-type').text(value);
    });

    customer_table = $('#customer_table').DataTable({
        'columnDefs': [
            {
                'targets': [0, 5],
                'searchable': false,
                'orderable': false
            }
        ],
        'autoWidth': false,
        'info': false,
        'pageLength': 10,
        'lengthMenu': [10, 25, 50],
        'order': [[1, 'asc']],
        'pagingType': 'simple',
        'dom': 'l' + 'f' + 't' + 'p',
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
            $('#customer_table_filter input').removeClass('input-sm');
            $('#customer_table_length select').removeClass('input-sm');
            $('#customer_table_length').detach().appendTo('#customer-tool').addClass('ml-auto');
            $('#customer_table_filter').detach().appendTo('#customer-tool');
            $('#customer_table_paginate').detach().appendTo('#customer-pagination');
        }
    });

    product_table = $('#product_table').DataTable({
        'columnDefs': [
            {
                'targets': [0, 9],
                'searchable': false,
                'orderable': false
            }
        ],
        'autoWidth': false,
        'info': false,
        'pageLength': 10,
        'lengthMenu': [10, 25, 50],
        'order': [[1, 'asc']],
        'pagingType': 'simple',
        'dom': 'l' + 'f' + 't' + 'p',
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
            $('#product_table_filter input').removeClass('input-sm');
            $('#product_table_length select').removeClass('input-sm');
            $('#product_table_length').detach().appendTo('#product-tool').addClass('ml-auto');
            $('#product_table_filter').detach().appendTo('#product-tool');
            $('#product_table_paginate').detach().appendTo('#product-pagination');

            async_product(load_complete());
        }
    });

    order_item_table = $('#order_item_table').DataTable({
        'buttons': [
            {
                'extend': 'excel',
                'text': '<i class="far fa-save fa-fw"></i> Excel',
                'filename': '주문 항목 ' + year + '-' + month + '-' + day,
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
        'info': false,
        'pageLength': 10,
        'lengthMenu': [10, 25, 50],
        'pagingType': 'simple',
        'dom': 'B' + 'l' + 'f' + 't' + 'p',
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
            $('.dt-buttons').detach().appendTo('#order-menu');
            $('#order_item_table_filter input').removeClass('input-sm');
            $('#order_item_table_length select').removeClass('input-sm');
            $('#order_item_table_length').detach().appendTo('#order-item-tool').addClass('ml-auto');
            $('#order_item_table_filter').detach().appendTo('#order-item-tool');
            $('#order_item_table_paginate').detach().appendTo('#order-item-pagination');
        }
    });

    $('#order-register').on('click', function () {
        params['order_type'] = $('input:radio[name=order_type]:checked').val();
        params['order_items'] = order_items;
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
            $('#alert-modal .modal-body').text('주문이 등록되었습니다.');
            $('#alert-modal').modal('show');
            $('#alert-modal').on('hidden.bs.modal', function () {
                location.reload(true);
            });
        }).fail(function (res, status, xhr) { });
    });
});

var async_product = function (callback) {
    $.ajax({
        url: '../../product/stock/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'json'
    }).done(function (data, status, xhr) {
        product_table.clear().draw();

        for (i = 0; i < data.length; i++) {
            product_table.row.add(
                $(
                    '<tr>\
                        <th scope="row" class="selection">\
                            <div class="pretty p-icon">\
                                <input type="checkbox" name="product">\
                                <div class="state p-warning">\
                                    <i class="icon mdi mdi-check-bold"></i>\
                                    <label></label>\
                                </div>\
                            </div>\
                        </th>\
                        <th>\
                            <span class="data-bind"\
                                data-id="' + (product_table.rows().count() + 1) + '"\
                                data-unit-price="' + data[i]['unit_price'] + '"\
                                data-species="' + data[i]['creature__species'] + '"\
                                data-breed="' + data[i]['creature__breed'] + '"\
                                data-remark="' + escape_html(data[i]['remark']) + '"\
                                data-min-size="' + data[i]['unit_price__min_size'] + '"\
                                data-max-size="' + data[i]['unit_price__max_size'] + '"\
                                data-stages-of-development="' + data[i]['unit_price__stages_of_development'] + '"\
                                data-unit="' + data[i]['unit'] + '"\
                                data-price="' + data[i]['unit_price__price'] + '"\
                                data-remaining-quantity="' + data[i]['remaining_quantity'] + '"></span>\
                            ' + (product_table.rows().count() + 1) + '\
                        </th>\
                        <td>' + data[i]['creature__species'] + '</td>\
                        <td>' + data[i]['creature__breed'] + '</td>\
                        <td>' + data[i]['remark'] + '</td>\
                        <td>' + conv_stages_of_development(data[i]['unit_price__stages_of_development']) + '</td>\
                        <td>' + conv_unit(data[i]['unit']) + '</td>\
                        <td>' + data[i]['unit_price__price'].toLocaleString() + ' 원</td>\
                        <td>' + data[i]['remaining_quantity'] + '</td>\
                        <td class="min col-btn">\
                            <button type="button" class="add-to-cart btn btn-default">담기</button>\
                        </td>\
                    </tr>'
                )
            ).draw();
        }

        $('.add-to-cart').on('click', function () {
            var overlap = false;
            var product = $('th span.data-bind', $(this).closest('tr'));

            for (i = 0; i < order_items.length; i++) {
                if (order_items[i]['id'] == product.data('id')) {
                    if (order_items[i]['remaining_quantity'] <= order_items[i]['quantity']) {
                        toastr.remove();
                        toastr.warning('재고가 부족합니다.');
                        return;
                    }
                    order_items[i]['quantity'] = parseInt(order_items[i]['quantity']) + 1;
                    overlap = true;
                }
            }
            if (!overlap) {
                var data = {
                    'id': product.data('id'),
                    'unit_price': product.data('unit-price'),
                    'species': product.data('species'),
                    'breed': product.data('breed'),
                    'remark': product.data('remark'),
                    'min_size': product.data('min-size'),
                    'max_size': product.data('max-size'),
                    'stages_of_development': product.data('stages-of-development'),
                    'unit': product.data('unit'),
                    'price': product.data('price'),
                    'quantity': 1,
                    'remaining_quantity': product.data('remaining-quantity')
                };
                order_items.push(data);
            }
            add_to_cart();
        });

        $('#selected-items-to-cart').on('click', function () {
            $('input:checkbox[name=product]').each(function () {
                if ($(this).is(':checked')) {
                    var overlap = false;
                    var product = $('th span.data-bind', $(this).closest('tr'));
                    for (i = 0; i < order_items.length; i++) {
                        if (order_items[i]['id'] == product.data('id')) {
                            if (order_items[i]['remaining_quantity'] <= order_items[i]['quantity']) {
                                return;
                            }
                            order_items[i]['quantity'] = parseInt(order_items[i]['quantity']) + 1;
                            overlap = true;
                        }
                    }
                    if (!overlap) {
                        var data = {
                            'id': product.data('id'),
                            'unit_price': product.data('unit-price'),
                            'species': product.data('species'),
                            'breed': product.data('breed'),
                            'remark': product.data('remark'),
                            'min_size': product.data('min-size'),
                            'max_size': product.data('max-size'),
                            'stages_of_development': product.data('stages-of-development'),
                            'unit': product.data('unit'),
                            'price': product.data('price'),
                            'quantity': 1,
                            'remaining_quantity': product.data('remaining-quantity')
                        };
                        order_items.push(data);
                    }
                    add_to_cart();
                }
            });
        });
        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) { });
};

var add_to_cart = function (callback) {
    var payment = 0;
    order_item_table.clear().draw();

    for (i = 0; i < order_items.length; i++) {
        order_item_table.row.add(
            $(
                '<tr>\
                    <th>\
                        <span class="data-bind"\
                            data-unit-price="' + order_items[i]['unit_price'] + '"\
                            data-species="' + order_items[i]['species'] + '"\
                            data-breed="' + order_items[i]['breed'] + '"\
                            data-remark="' + escape_html(order_items[i]['remark']) + '"\
                            data-min-size="' + order_items[i]['min_size'] + '"\
                            data-max-size="' + order_items[i]['max_size'] + '"\
                            data-stages-of-development="' + order_items[i]['stages_of_development'] + '"\
                            data-unit="' + order_items[i]['unit'] + '"\
                            data-price="' + order_items[i]['price'] + '"\
                            data-quantity="' + order_items[i]['quantity'] + '"\
                            data-remaining-quantity="' + order_items[i]['remaining_quantity'] + '"></span>\
                        ' + (order_item_table.rows().count() + 1) + '\
                    </th>\
                    <td>' + order_items[i]['species'] + '</td>\
                    <td>' + order_items[i]['breed'] + '</td>\
                    <td>' + order_items[i]['remark'] + '</td>\
                    <td>' + conv_stages_of_development(order_items[i]['stages_of_development']) + '</td>\
                    <td>' + conv_unit(order_items[i]['unit']) + '</td>\
                    <td>' + order_items[i]['quantity'] + '</td>\
                    <td>' + (parseInt(order_items[i]['price']) * parseInt(order_items[i]['quantity'])).toLocaleString() + ' 원</td>\
                    <td class="min col-btn">\
                        <div class="btn-group d-flex">\
                            <button type="button" class="btn btn-default"><i class="fas fa-pen fa-fw"></i></button>\
                            <button type="button" class="btn btn-default"><i class="fas fa-trash-alt fa-fw"></i></button>\
                        </div>\
                    </td>\
                </tr>'
            )
        ).draw();
        payment += (parseInt(order_items[i]['price']) * parseInt(order_items[i]['quantity']));
    }
    $('#view-payment').text(payment.toLocaleString() + ' 원');
    toastr.remove();
    toastr.success('상품을 담았습니다.');
    typeof callback === 'function' && callback();
};