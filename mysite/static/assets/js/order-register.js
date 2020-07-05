/**
 * order - register javascript
 * @author roh-j
 * @version 2019-08-11
 */

var customer_table = null;
var product_table = null;
var cart_table = null;

var params = {};
var recipient = {};
var cart = [];

$(function () {

    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');

    init_toast();

    init_horizontal_spinner();
    init_checkbox_select_all();

    $('#order-register').on('click', function () {
        params['cart'] = cart;
        params['recipient'] = recipient;
        params['order_type'] = $('input:radio[name=order_type]:checked').val();

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
        }).fail(function (res, status, xhr) {
        });
    });

    $('#add-order').on('click', function () {
        $('#add-order-modal').modal('show');
    });

    $('#empty-cart').on('click', function () {
        cart_table.clear().draw();
        cart = [];
    });

    $('input:radio[name=order_type]').on('click', function () {
        var value = $('input:radio[name=order_type]:checked').val();
        switch (value) {
            case 'pickup':
                value = '매장';
                break;
            case 'delivery':
                value = '택배';
                break;
        }
        $('#view-order-type').text(value);
    });

    $('#form-recipient-register').on('submit', function (e) {
        e.preventDefault();

        recipient['customer_name'] = $('#id_customer_name').val();
        recipient['contact'] = $('#id_contact').val();
        recipient['address'] = $('#id_address').val();

        $('#view-customer-name').text($('#id_customer_name').val());
        $('#view-contact').text($('#id_contact').val());
        $('#view-address').text($('#id_address').val());
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

            $('#customer_table_info').detach().appendTo('#customer-info');
            $('#customer_table_paginate').detach().appendTo('#customer-pagination');

            $('#customer_table_length').detach().appendTo('#customer-tool').addClass('ml-auto');
            $('#customer_table_filter').detach().appendTo('#customer-tool');
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

            $('#product_table_info').detach().appendTo('#product-info');
            $('#product_table_paginate').detach().appendTo('#product-pagination');

            $('#product_table_length').detach().appendTo('#product-tool').addClass('ml-auto');
            $('#product_table_filter').detach().appendTo('#product-tool');

            async_product();
        }
    });

    cart_table = $('#cart_table').DataTable({
        'buttons': [
            {
                'extend': 'csv',
                'text': '<i class="far fa-save fa-fw"></i> CSV',
                'filename': '주문 항목 ' + year + '-' + month + '-' + day,
                'exportOptions': {
                    'columns': [1, 2, 3, 4, 5, 6, 7]
                }
            },
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
            $('.dt-buttons').addClass('btn-group').addClass('ml-0');
            $('.dt-buttons > .dt-button').addClass('btn btn-default');

            $('#cart_table_filter input').removeClass('input-sm');
            $('#cart_table_length select').removeClass('input-sm');

            $('#cart_table_info').detach().appendTo('#cart-info');
            $('#cart_table_paginate').detach().appendTo('#cart-pagination');

            $('.dt-buttons').detach().appendTo('#order-menu');
            $('#cart_table_length').detach().appendTo('#cart-tool').addClass('ml-auto');
            $('#cart_table_filter').detach().appendTo('#cart-tool');
        }
    });

    load_complete();
});

var async_product = function (callback) {

    $.ajax({
        url: '../../product/stock/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'json',
    }).done(function (data, status, xhr) {
        product_table.clear().draw();

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

            switch (data[i]['unit_price__stages_of_development']) {
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
            product_table.row.add(
                $('\
                    <tr>\
                        <th scope="row" class="min">\
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
                        <td>' + stages_of_development + '</td>\
                        <td>' + unit + '</td>\
                        <td>' + data[i]['unit_price__price'].toLocaleString() + ' 원</td>\
                        <td>' + data[i]['remaining_quantity'] + '</td>\
                        <td class="min col-btn">\
                            <button type="button" class="add-to-cart btn btn-default">담기</button>\
                        </td>\
                    </tr>\
                ')
            ).draw();
        }

        $('.add-to-cart').on('click', function () {
            var overlap = false;
            var product = $('th span.data-bind', $(this).closest('tr'));

            for (i = 0; i < cart.length; i++) {
                if (cart[i]['id'] == product.data('id')) {
                    if (cart[i]['remaining_quantity'] <= cart[i]['quantity']) {
                        toastr.remove();
                        toastr.warning('재고가 부족합니다.');
                        return;
                    }
                    cart[i]['quantity'] = parseInt(cart[i]['quantity']) + 1;
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
                    'remaining_quantity': product.data('remaining-quantity'),
                };
                cart.push(data);
            }
            add_to_cart();
        });

        $('#selected-items-to-cart').on('click', function () {
            $('input:checkbox[name=product]').each(function () {
                if ($(this).is(':checked')) {
                    var overlap = false;
                    var product = $('th span.data-bind', $(this).closest('tr'));

                    for (i = 0; i < cart.length; i++) {
                        if (cart[i]['id'] == product.data('id')) {
                            if (cart[i]['remaining_quantity'] <= cart[i]['quantity']) {
                                return;
                            }
                            cart[i]['quantity'] = parseInt(cart[i]['quantity']) + 1;
                            overlap = true;
                        }
                    }

                    if (!overlap) {
                        var data = {
                            'id': product.data('id'),
                            'unit_price': product.data('unit_price'),
                            'species': product.data('species'),
                            'breed': product.data('breed'),
                            'remark': product.data('remark'),
                            'min_size': product.data('min-size'),
                            'max_size': product.data('max-size'),
                            'stages_of_development': product.data('stages-of-development'),
                            'unit': product.data('unit'),
                            'price': product.data('price'),
                            'quantity': 1,
                            'remaining_quantity': product.data('remaining-quantity'),
                        };
                        cart.push(data);
                    }
                    add_to_cart();
                }
            });
        });
        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) {
    });
}

var add_to_cart = function (callback) {
    cart_table.clear().draw();
    var payment = 0;

    for (i = 0; i < cart.length; i++) {
        var unit = null;
        var stages_of_development = null;

        switch (cart[i]['unit']) {
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

        switch (cart[i]['stages_of_development']) {
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
        cart_table.row.add(
            $('\
                <tr>\
                    <th>\
                        <span class="data-bind"\
                            data-unit-price="' + cart[i]['unit_price'] + '"\
                            data-species="' + cart[i]['species'] + '"\
                            data-breed="' + cart[i]['breed'] + '"\
                            data-remark="' + escape_html(cart[i]['remark']) + '"\
                            data-min-size="' + cart[i]['min_size'] + '"\
                            data-max-size="' + cart[i]['max_size'] + '"\
                            data-stages-of-development="' + cart[i]['stages_of_development'] + '"\
                            data-unit="' + cart[i]['unit'] + '"\
                            data-price="' + cart[i]['price'] + '"\
                            data-quantity="' + cart[i]['quantity'] + '"\
                            data-remaining-quantity="' + cart[i]['remaining_quantity'] + '"></span>\
                        ' + (cart_table.rows().count() + 1) + '\
                    </th>\
                    <td>' + cart[i]['species'] + '</td>\
                    <td>' + cart[i]['breed'] + '</td>\
                    <td>' + cart[i]['remark'] + '</td>\
                    <td>' + stages_of_development + '</td>\
                    <td>' + unit + '</td>\
                    <td>' + cart[i]['quantity'] + '</td>\
                    <td>' + (parseInt(cart[i]['price']) * parseInt(cart[i]['quantity'])).toLocaleString() + ' 원</td>\
                    <td class="min col-btn">\
                        <div class="btn-group d-flex">\
                            <button type="button" class="btn btn-default"><i class="fas fa-pen fa-fw"></i></button>\
                            <button type="button" class="btn btn-default"><i class="fas fa-trash-alt fa-fw"></i></button>\
                        </div>\
                    </td>\
                </tr>\
            ')
        ).draw();
        payment += (parseInt(cart[i]['price']) * parseInt(cart[i]['quantity']));
    }
    $('#view-payment').text(payment.toLocaleString() + ' 원');
    toastr.remove();
    toastr.success('상품을 담았습니다.');
    typeof callback === 'function' && callback();
}