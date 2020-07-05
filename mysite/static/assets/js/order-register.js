var params = {};

var product_items = [];
var order_items = [];
var order_item_idx = null;

var customer_table = null;
var product_table = null;
var order_item_table = null;

$(function () {
    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');
    init_toast();
    init_spinner();

    params['order_type'] = '';
    params['order_items'] = [];
    params['customer_name'] = '';
    params['contact'] = '';
    params['address'] = '';

    $('.wide-screen').on('click', function () {
        wide_screen('toggle');
    });

    $('#form-cart-quantity-register').on('submit', function (e) {
        e.preventDefault();

        if (order_items[order_item_idx]['remaining_quantity'] < $('input[name=cart_quantity]').val()) {
            $('#cart-quantity-register-modal').modal('hide');
            $('#cart-quantity-register-modal').on('hidden.bs.modal', function () {
                toastr.remove();
                toastr.warning('재고가 부족합니다.');
                $(this).off('hidden.bs.modal');
            });
        }
        else {
            order_items[order_item_idx]['quantity'] = $('input[name=cart_quantity]').val();

            $('#cart-quantity-register-modal').modal('hide');
            $('#cart-quantity-register-modal').on('hidden.bs.modal', function () {
                update_cart(function () {
                    toastr.remove();
                    toastr.success('항목을 수정하였습니다.');
                });
                $(this).off('hidden.bs.modal');
            });
        }
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
        
        $('#view-order-type').text(conv_order_type(value));
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

            async_customer();
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

    $('#product_table').on('length.dt', function (e, settings, len) {
        $('#product_table').on('draw.dt', function () {
            event_add_to_cart();
        });
    });

    $('#product_table').on('search.dt', function () {
        $('#product_table').on('draw.dt', function () {
            event_add_to_cart();
        });
    });

    $('#product_table').on('page.dt', function () {
        $('#product_table').on('draw.dt', function () {
            event_add_to_cart();
        });
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

    $('#order_item_table').on('length.dt', function (e, settings, len) {
        $('#order_item_table').on('draw.dt', function () {
            event_order_item_modify();
            event_order_item_delete();
        });
    });

    $('#order_item_table').on('search.dt', function () {
        $('#order_item_table').on('draw.dt', function () {
            event_order_item_modify();
            event_order_item_delete();
        });
    });

    $('#order_item_table').on('page.dt', function () {
        $('#order_item_table').on('draw.dt', function () {
            event_order_item_modify();
            event_order_item_delete();
        });
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
        }).fail(function (res, status, xhr) {
            $.each(res.responseJSON, function (key, value) {
                toastr.remove();
                toastr.warning(value);
                return false;
            });
        });
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
            var meta = {};

            meta['id'] = (product_table.rows().count() + 1);
            meta['unit_price'] = data[i]['unit_price'];
            meta['species'] = data[i]['creature__species'];
            meta['breed'] = data[i]['creature__breed'];
            meta['remark'] = data[i]['creature__remark'];
            meta['min_size'] = data[i]['unit_price__min_size'];
            meta['max_size'] = data[i]['unit_price__max_size'];
            meta['stages_of_development'] = data[i]['unit_price__stages_of_development'];
            meta['unit'] = data[i]['unit'];
            meta['price'] = data[i]['unit_price__price'];
            meta['quantity'] = 1;
            meta['remaining_quantity'] = data[i]['remaining_quantity'];

            product_items.push(meta);
            product_table.row.add(
                $(
                    '<tr>\
                        <th scope="row">\
                            <div class="pretty p-icon">\
                                <input type="checkbox" name="product">\
                                <div class="state p-warning">\
                                    <i class="icon mdi mdi-check-bold"></i>\
                                    <label></label>\
                                </div>\
                            </div>\
                        </th>\
                        <th>' + (product_table.rows().count() + 1) + '</th>\
                        <td>' + data[i]['creature__species'] + '</td>\
                        <td>' + data[i]['creature__breed'] + '</td>\
                        <td>' + data[i]['creature__remark'] + '</td>\
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

        $('.select-all').on('click', function () {
            var rows = product_table.rows({ 'search': 'applied' }).nodes();
            $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });

        $('#product_table tbody').on('change', 'input[type="checkbox"]', function () {
            if (!this.checked) {
                var el = $('.select-all').get(0);

                if (el && el.checked && ('indeterminate' in el)) {
                    el.indeterminate = true;
                }
            }
        });

        $('#selected-items-to-cart').on('click', function () {
            var cells = product_table.cells().nodes();
            var selected = false;
            var excess = true;
            var i = 0;

            $(cells).find('input:checkbox[name=product]:checked').each(function () {
                var overlap = false;
                var idx = product_table.row($(this).parents('tr')).index();
                selected = true;

                for (j = i; j < order_items.length; j++) {
                    if (order_items[j]['id'] == product_items[idx]['id']) {
                        if (order_items[j]['remaining_quantity'] <= order_items[j]['quantity']) {
                            return;
                        }
                        order_items[j]['quantity'] = parseInt(order_items[j]['quantity']) + 1;
                        overlap = true;
                        i = j + 1;
                        break;
                    }
                }
                if (!overlap) {
                    order_items.push(product_items[idx]);
                }

                excess = false;
            });

            if (!selected) {
                $('#alert-modal .modal-body').text('상품을 선택해주세요.');
                $('#alert-modal').modal('show');
            }
            if (selected && !excess) {
                update_cart(function () {
                    toastr.remove();
                    toastr.success('상품을 담았습니다.');
                });
            }
        });

        event_add_to_cart();

        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) { });
};

var async_customer = function (callback) {
    $.ajax({
        url: '../../customer/summary/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'json'
    }).done(function (data, status, xhr) {
        customer_table.clear().draw();

        for (i = 0; i < data.length; i++) {
            customer_table.row.add(
                $(
                    '<tr>\
                        <th scope="row">\
                            <div class="pretty p-default p-round">\
                                <input type="radio" name="customer">\
                                <div class="state p-warning">\
                                    <label></label>\
                                </div>\
                            </div>\
                        </th>\
                        <th>\
                            <span class="data-bind"\
                                data-customer-name="' + data[i]['customer_name'] + '"\
                                data-contact="' + data[i]['contact'] + '"\
                                data-address="' + data[i]['address'] + '"></span>\
                            ' + (customer_table.rows().count() + 1) + '\
                        </th>\
                        <td>' + data[i]['customer_name'] + '</td>\
                        <td>' + data[i]['contact'] + '</td>\
                        <td>' + data[i]['address'] + '</td>\
                        <td class="min col-btn">\
                            <button type="button" class="add-to-recipient btn btn-default">입력</button>\
                        </td>\
                    </tr>'
                )
            ).draw();
        }

        $('.add-to-recipient').on('click', function () {
            var customer = $('th span.data-bind', $(this).closest('tr'));

            params['customer_name'] = customer.data('customer-name');
            params['contact'] = customer.data('contact');
            params['address'] = customer.data('address');

            $('#view-customer-name').text(customer.data('customer-name'));
            $('#view-contact').text(customer.data('contact'));
            $('#view-address').text(customer.data('address'));

            $('#customer-modal').modal('hide');
        });

        $('#selected-items-to-recipient').on('click', function () {
            var selection = $('input:radio[name=customer]:checked');

            if (selection.val() != undefined) {
                var customer = $('th span.data-bind', selection.closest('tr'));

                params['customer_name'] = customer.data('customer-name');
                params['contact'] = customer.data('contact');
                params['address'] = customer.data('address');

                $('#view-customer-name').text(customer.data('customer-name'));
                $('#view-contact').text(customer.data('contact'));
                $('#view-address').text(customer.data('address'));

                $('#customer-modal').modal('hide');
            }
        });
        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) { });
};

var update_cart = function (callback) {
    var payment = 0;
    order_item_table.clear().draw();

    for (i = 0; i < order_items.length; i++) {
        order_item_table.row.add(
            $(
                '<tr>\
                    <th>' + (order_item_table.rows().count() + 1) + '</th>\
                    <td>' + order_items[i]['species'] + '</td>\
                    <td>' + order_items[i]['breed'] + '</td>\
                    <td>' + order_items[i]['remark'] + '</td>\
                    <td>' + conv_stages_of_development(order_items[i]['stages_of_development']) + '</td>\
                    <td>' + conv_unit(order_items[i]['unit']) + '</td>\
                    <td>' + order_items[i]['quantity'] + '</td>\
                    <td>' + (parseInt(order_items[i]['price']) * parseInt(order_items[i]['quantity'])).toLocaleString() + ' 원</td>\
                    <td class="min col-btn">\
                        <div class="btn-group d-flex">\
                            <button type="button" class="btn btn-default order-item-modify"><i class="fas fa-pen fa-fw"></i></button>\
                            <button type="button" class="btn btn-default order-item-delete"><i class="fas fa-trash-alt fa-fw"></i></button>\
                        </div>\
                    </td>\
                </tr>'
            )
        ).draw();
        payment += (parseInt(order_items[i]['price']) * parseInt(order_items[i]['quantity']));
    }

    $('#view-payment').text(payment.toLocaleString() + ' 원');

    event_order_item_modify();
    event_order_item_delete();

    typeof callback === 'function' && callback();
};

var event_add_to_cart = function (callback) {
    $('.add-to-cart').off('click');
    $('.add-to-cart').on('click', function () {
        var overlap = false;
        var idx = product_table.row($(this).parents('tr')).index();

        for (i = 0; i < order_items.length; i++) {
            if (order_items[i]['id'] == product_items[idx]['id']) {
                if (order_items[i]['remaining_quantity'] <= order_items[i]['quantity']) {
                    return;
                }
                order_items[i]['quantity'] = parseInt(order_items[i]['quantity']) + 1;
                overlap = true;
                break;
            }
        }
        if (!overlap) {
            order_items.push(product_items[idx]);
        }
        update_cart(function () {
            toastr.remove();
            toastr.success('상품을 담았습니다.');
        });
    });
};

var event_order_item_modify = function (callback) {
    $('.order-item-modify').off('click');
    $('.order-item-modify').on('click', function () {
        order_item_idx = order_item_table.row($(this).parents('tr')).index();

        $('input[name=cart_quantity]').val(order_items[order_item_idx]['quantity']);
        $('#cart-quantity-register-modal').modal('show');
    });

    typeof callback === 'function' && callback();
};

var event_order_item_delete = function (callback) {
    $('.order-item-delete').off('click');
    $('.order-item-delete').on('click', function () {
        var idx = order_item_table.row($(this).parents('tr')).index();
        order_items.splice(idx, 1);
        
        update_cart(function () {
            toastr.remove();
            toastr.success('항목을 삭제하였습니다.');
        });
    });

    typeof callback === 'function' && callback();
};