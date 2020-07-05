var storage_room_id = null;
var storage_room_name = null;

var aquarium_section_id = null;
var aquarium_id = null;
var aquarium_row = null;
var aquarium_column = null;

var aquarium_stock_id = null;

var order_sheet_table = null;
var inventory_table = null;
var coordinate = null;
var order = null;

$(function () {
    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');
    init_toast();
    init_spinner();

    $('span.relative-time').each(function () {
        var conv = moment($(this).text(), 'YYYY-MM-DD HH:mm:ss').fromNow();
        $(this).text(conv);
    });

    $('.wide-screen').on('click', function () {
        wide_screen('toggle');
    });

    $('#skip-order-sheet').on('click', function () {
        wide_screen('off');
        $('.nav-tabs a[href="#storage-room"]').tab('show');
    });

    $('#storage-room-list > a').on('click', function (e) {
        e.preventDefault();
        storage_room_id = $('div.media > span.data-bind', this).data('storage-room-id');
        storage_room_name = $('div.media > span.data-bind', this).data('storage-room-name');

        draw_store_layout(function () {
            $('.nav-tabs a[href="#store-layout"]').tab('show');
        });
    });

    $('#redo-storage-room').on('click', function () {
        $('#svg-store-layout').empty();
        $('#guide-store-layout').empty();
        $('.nav-tabs a[href="#storage-room"]').tab('show');
    });

    $('#redo-store-layout').on('click', function () {
        wide_screen('off');
        $('#svg-mini-map').empty();
        $('#svg-aquarium').empty();
        $('#aquarium-stock-register').attr('disabled', true);

        aquarium_row = null;
        aquarium_column = null;
        inventory_table.clear().draw();

        $('.nav-tabs a[href="#store-layout"]').tab('show');
    });

    $('#form-goods-issue-register').on('submit', function (e) {
        e.preventDefault();
        var transaction = $('.modal-body .nav-tabs li.active a', this).attr('href');

        switch (transaction) {
            case '#goods-issue-to-sales':
                var params = {
                    'transaction_type': 'goods_issue',
                    'fk_aquarium': aquarium_id,
                    'fk_aquarium_stock': aquarium_stock_id,
                    'order_item': $('input:radio[name=pending_order]:checked').val(),
                    'description': 'goods_sales',
                    'quantity': $('input[name=goods_issue_quantity]').val()
                }; break;
            case '#goods-issue':
                var params = {
                    'transaction_type': 'goods_issue',
                    'fk_aquarium': aquarium_id,
                    'fk_aquarium_stock': aquarium_stock_id,
                    'description': $('input:radio[name=goods_issue_description]:checked').val(),
                    'quantity': $('input[name=goods_issue_quantity]').val()
                }; break;
        }
        
        $.ajax({
            url: 'goods-issue/',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json'
        }).done(function (data, status, xhr) {
            if (transaction == '#goods-issue-to-sales') {
                var target = $('td span.remaining-order-quantity', $('input:radio[name=pending_order]:checked').closest('tr'));
                var pre = target.text();
                var res = parseInt(pre) + parseInt(params['quantity']);

                target.text(res);
            }
            
            $('#goods-issue-register-modal').modal('hide');
            $('#goods-issue-register-modal').on('hidden.bs.modal', function () {
                async_aquarium_stock();

                toastr.remove();
                toastr.success('출고가 등록되었습니다.');
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

    $('#form-goods-receipt-register').on('submit', function (e) {
        e.preventDefault();

        switch ($('.modal-body .nav-tabs li.active a', this).attr('href')) {
            case '#goods-receipt-for-purchase':
                var params = {
                    'transaction_type': 'goods_receipt',
                    'fk_aquarium': aquarium_id,
                    'fk_aquarium_stock': aquarium_stock_id,
                    'description': 'purchase_of_goods',
                    'quantity': $('input[name=goods_receipt_quantity]').val(),
                    'purchase_price': $('input[name=purchase_price]').val()
                }; break;
            case '#goods-receipt':
                var params = {
                    'transaction_type': 'goods_receipt',
                    'fk_aquarium': aquarium_id,
                    'fk_aquarium_stock': aquarium_stock_id,
                    'description': 'adoption',
                    'quantity': $('input[name=goods_receipt_quantity]').val()
                }; break;
        }

        $.ajax({
            url: 'goods-receipt/',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json'
        }).done(function (data, status, xhr) {
            $('#goods-receipt-register-modal').modal('hide');
            $('#goods-receipt-register-modal').on('hidden.bs.modal', function () {
                async_aquarium_stock();

                toastr.remove();
                toastr.success('입고가 등록되었습니다.');
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

    order_sheet_table = $('#order_sheet_table').DataTable({
        'rowsGroup': [0, 1, 2, 3],
        'autoWidth': false,
        'ordering': false,
        'info': false,
        'pageLength': 10,
        'lengthMenu': [10, 25, 50],
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
            $('#order_sheet_table_filter input').removeClass('input-sm');
            $('#order_sheet_table_length select').removeClass('input-sm');
            $('#order_sheet_table_length').detach().appendTo('#order-sheet-tool').addClass('ml-auto');
            $('#order_sheet_table_filter').detach().appendTo('#order-sheet-tool');
            $('#order_sheet_table_paginate').detach().appendTo('#order-sheet-pagination');

            async_order_sheet(load_complete());
        }
    });
    
    inventory_table = $('#inventory_table').DataTable({
        'buttons': [
            {
                'extend': 'excel',
                'text': '<i class="far fa-save fa-fw"></i> Excel',
                'filename': '수조 재고 목록표 ' + year + '-' + month + '-' + day,
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
            $('.dt-buttons').detach().appendTo('#inventory-menu');
            $('#inventory_table_filter input').removeClass('input-sm');
            $('#inventory_table_length select').removeClass('input-sm');
            $('#inventory_table_length').detach().appendTo('#inventory-tool').addClass('ml-auto');
            $('#inventory_table_filter').detach().appendTo('#inventory-tool');
            $('#inventory_table_info').detach().appendTo('#inventory-info');
            $('#inventory_table_paginate').detach().appendTo('#inventory-pagination');
        }
    });

    $('#aquarium-stock-register').on('click', function () {
        $.ajax({
            url: '../../product/creature/',
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

            $('#aquarium-stock-register-modal').modal('show');
        }).fail(function (res, status, xhr) { });
    });

    $('#form-aquarium-stock-register').on('submit', function (e) {
        e.preventDefault();
        var params = $('#form-aquarium-stock-register').serializeObject();
        params = $.extend(
            params, {
                'fk_aquarium': aquarium_id
            }
        );

        $.ajax({
            url: 'aquarium-stock/',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json'
        }).done(function (data, status, xhr) {
            $('#aquarium-stock-register-modal').modal('hide');
            $('#aquarium-stock-register-modal').on('hidden.bs.modal', function () {
                async_aquarium_stock();

                toastr.remove();
                toastr.success('재고를 등록하였습니다.');
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
});

var async_order_sheet = function (callback) {
    $.ajax({
        url: '../../order/pending-order/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'json'
    }).done(function (data, status, xhr) {
        order = data;

        for (i = 0; i < data.length; i++) {
            for (j = 0; j < data[i]['order_items'].length; j++) {
                var remaining_order_quantity = parseInt(data[i]['order_items'][j]['quantity']) - parseInt(data[i]['order_items'][j]['remaining_order_quantity']);

                order_sheet_table.row.add(
                    $(
                        '<tr>\
                            <th scope="row" class="selection">\
                                <div class="pretty p-icon">\
                                    <input type="checkbox" name="order" value="' + data[i]['id'] + '">\
                                    <div class="state p-warning">\
                                        <i class="icon mdi mdi-check-bold"></i>\
                                        <label></label>\
                                    </div>\
                                </div>\
                            </th>\
                            <th>' + data[i]['id'] + '</th>\
                            <td>' + data[i]['order_date'].split(' ')[0] + '</td>\
                            <td>' + conv_order_type(data[i]['order_type']) + '</td>\
                            <td>' + data[i]['order_items'][j]['species'] + '</td>\
                            <td>' + data[i]['order_items'][j]['breed'] + '</td>\
                            <td>' + null_to_empty(data[i]['order_items'][j]['remark']) + '</td>\
                            <td>' + conv_stages_of_development(data[i]['order_items'][j]['stages_of_development']) + '</td>\
                            <td>' + conv_unit(data[i]['order_items'][j]['unit']) + '</td>\
                            <td>' + remaining_order_quantity + ' / ' + data[i]['order_items'][j]['quantity'] + '</td>\
                            <td class="min col-btn">\
                                <button type="button" class="btn btn-default">상세</button>\
                            </td>\
                        </tr>'
                    )
                ).draw();
            }
        }

        $('.select-all').on('click', function () {
            var checked = this.checked;
            var cells = order_sheet_table.cells().nodes();
            var rows = order_sheet_table.rows({ 'search': 'applied' });

            rows.every(function (rowIdx, tableLoop, rowLoop) {
                var data = this.data();

                $(cells).find('input:checkbox[name=order][value=' + data[1] + ']').each(function () {
                    $(this).prop('checked', checked);
                });
            });
        });

        $('#order_sheet_table tbody').on('change', 'input[type="checkbox"]', function () {
            var checked = this.checked;
            var cells = order_sheet_table.cells().nodes();

            $(cells).find('input:checkbox[name=order][value=' + $(this).val() + ']').each(function () {
                $(this).prop('checked', checked);
            });

            if (!this.checked) {
                var el = $('.select-all').get(0);

                if (el && el.checked && ('indeterminate' in el)) {
                    el.indeterminate = true;
                }
            }
        });

        $('.selected-order').on('click', function () {
            var cells = order_sheet_table.cells().nodes();
            var pre = null;
            var idx = 0;
            var selected = false;
            
            $(cells).find('input:checkbox[name=order]:checked').each(function () {
                if (pre == $(this).val()) {
                    return;
                }
                for (i = idx; i < order.length; i++) {
                    if (order[i]['id'] == $(this).val()) {
                        var tbody = '';

                        if (pre == null) {
                            $('#pending-order').empty();
                            $('#pending-order').append('<div class="panel-group" id="accordion"></div>');
                        }
                        for (j = 0; j < order[i]['order_items'].length; j++) {
                            var remaining_order_quantity = parseInt(order[i]['order_items'][j]['quantity']) - parseInt(order[i]['order_items'][j]['remaining_order_quantity']);
                            tbody +=
                                '<tr>\
                                    <th scope="row" class="selection">\
                                        <div class="pretty p-default p-round">\
                                            <input type="radio" name="pending_order" value="' + order[i]['order_items'][j]['id'] + '">\
                                            <div class="state p-warning">\
                                                <label></label>\
                                            </div>\
                                        </div>\
                                    </th>\
                                    <th>' + (j + 1) + '</th>\
                                    <td>' + order[i]['order_items'][j]['species'] + '</td>\
                                    <td>' + order[i]['order_items'][j]['breed'] + '</td>\
                                    <td>' + null_to_empty(order[i]['order_items'][j]['remark']) + '</td>\
                                    <td>' + conv_stages_of_development(order[i]['order_items'][j]['stages_of_development']) + '</td>\
                                    <td>' + conv_unit(order[i]['order_items'][j]['unit']) + '</td>\
                                    <td><span class="remaining-order-quantity">' + remaining_order_quantity + '</span> / ' + order[i]['order_items'][j]['quantity'] + '</td>\
                                </tr>';
                        }
                        $('#pending-order .panel-group').append(
                            '<div class="panel">\
                                <div class="panel-heading">\
                                    <span class="font-weight-bold">' + order[i]['id'] + '</span> / \
                                    <a href="#order-' + order[i]['id'] + '" data-toggle="collapse" data-parent="#accordion">\
                                        ' + order[i]['order_date'].split(' ')[0] + ' ' + conv_order_type(data[i]['order_type']) + '\
                                    </a>\
                                </div>\
                                <div id="order-' + order[i]['id'] + '" class="table-responsive panel-collapse collapse">\
                                    <table class="table table-bordered table-hover">\
                                        <thead>\
                                            <th class="selection"></th>\
                                            <th>번호</th>\
                                            <th>어종</th>\
                                            <th>품종</th>\
                                            <th>특이사항</th>\
                                            <th>단계</th>\
                                            <th>단위</th>\
                                            <th>처리</th>\
                                        </thead>\
                                        <tbody>\
                                            ' + tbody + '\
                                        </tbody>\
                                    </table>\
                                </div>\
                            </div>'
                        );
                        idx = i;
                        selected = true;
                        break;
                    }
                }
                pre = $(this).val();
            });

            if (selected) {
                wide_screen('off');
                $('#pending-order .panel-group .panel:first-child > .panel-collapse').addClass('in');
                $('.nav-tabs a[href="#storage-room"]').tab('show');
            }
            else {
                $('#alert-modal .modal-body').text('주문을 선택해주세요.');
                $('#alert-modal').modal('show');
            }
        });
        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) { });
};

var async_aquarium_stock = function (callback) {
    var params = {
        'fk_aquarium': aquarium_id
    };

    $.ajax({
        url: 'aquarium-stock/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: params,
        dataType: 'json'
    }).done(function (data, status, xhr) {
        inventory_table.clear().draw();

        for (i = 0; i < data.length; i++) {
            inventory_table.row.add(
                $(
                    '<tr>\
                        <th scope="row">\
                            <span class="data-bind"\
                            data-aquarium-stock-id="' + data[i]['id'] + '"></span>\
                            ' + (inventory_table.rows().count() + 1) + '\
                        </th>\
                        <td>' + data[i]['creature__species'] + '</td>\
                        <td>' + data[i]['creature__breed'] + '</td>\
                        <td>' + data[i]['creature__remark'] + '</td>\
                        <td>' + data[i]['size'] + ' cm</td>\
                        <td>' + conv_unit(data[i]['gender']) + '</td>\
                        <td>' + data[i]['quantity'] + '</td>\
                        <td>' + conv_status(data[i]['status']) + '</td>\
                        <td class="min col-btn">\
                            <div class="btn-group d-flex">\
                                <button type="button" class="btn btn-default goods-issue-register"><i class="fas fa-minus fa-fw"></i></button>\
                                <button type="button" class="btn btn-default goods-receipt-register"><i class="fas fa-plus fa-fw"></i></button>\
                                <button type="button" class="btn btn-default"><i class="fas fa-pen fa-fw"></i></button>\
                            </div>\
                        </td>\
                    </tr>'
                )
            ).draw();

            $('.goods-issue-register').on('click', function () {
                aquarium_stock_id = $('th span.data-bind', $(this).closest('tr')).data('aquarium-stock-id');
                $('#goods-issue-register-modal').modal('show');
            });
            $('.goods-receipt-register').on('click', function () {
                aquarium_stock_id = $('th span.data-bind', $(this).closest('tr')).data('aquarium-stock-id');
                $('#goods-receipt-register-modal').modal('show');
            });
        }
        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) { });
};

var draw_store_layout = function (callback) {
    var params = {
        'fk_storage_room': storage_room_id
    };

    $.ajax({
        url: 'store-layout/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: params,
        dataType: 'json'
    }).done(function (data, status, xhr) {
        var idx = 0;
        coordinate = data;

        if (SVG.supported) {
            $('#svg-store-layout').empty();

            var row_count = 13;
            var col_label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
            var width_interval = 60;
            var height_interval = 40;
            var layout = SVG('svg-store-layout').size((col_label.length + 1) * width_interval + col_label.length + 2, (row_count + 1) * height_interval + row_count + 2).attr({ 'class': 'align-middle' });
            
            for (i = 0; i < row_count; i++) {
                var y = (height_interval * (i + 1) + i + 2 + 20);
                layout.plain(i + 1).attr({ 'text-anchor': 'middle', 'x': 30, 'y': y });
            }
            
            for (i = 0; i < col_label.length; i++) {
                var x = (width_interval * (i + 1) + i + 2 + 30);
                layout.plain(col_label[i]).attr({ 'text-anchor': 'middle', 'x': x, 'y': 20 });
            }
            
            for (i = 0; i < row_count; i++) {
                for (j = 0; j < col_label.length; j++) {
                    layout.rect(60, 40).attr({
                        'class': 'store-layout-grid',
                        'x': (width_interval * (j + 1) + j + 2),
                        'y': (height_interval * (i + 1) + i + 2)
                    });
                    if (idx < data.length && i == data[idx]['row'] && j == data[idx]['column']) {
                        layout.rect(60, 40).attr({
                            'class': 'store-layout-button',
                            'fill': data[idx]['color'],
                            'x': (width_interval * (j + 1) + j + 2),
                            'y': (height_interval * (i + 1) + i + 2),
                            'data-store-layout-selected': true,
                            'data-store-layout-section-id': data[idx]['section_id']
                        });
                        idx++;
                    }
                    else {
                        layout.rect(60, 40).attr({
                            'class': 'store-layout-button',
                            'fill': '#e7e7e7',
                            'x': (width_interval * (j + 1) + j + 2),
                            'y': (height_interval * (i + 1) + i + 2),
                            'data-store-layout-selected': false
                        });
                    }
                }
            }
            $('rect.store-layout-button').on('click', function () {
                if ($(this).data('store-layout-selected')) {
                    aquarium_section_id = $(this).data('store-layout-section-id');
                    draw_aquarium(function () {
                        $('.nav-tabs a[href="#aquarium"]').tab('show');
                    });
                }
            });
            $('#guide-store-layout').html(storage_room_name)
        }
        else {
            alert('SVG를 지원하지 않는 브라우저입니다.');
        }
        typeof callback === 'function' && callback();
    }).fail(function (data) { });
};

var draw_aquarium = function (callback) {
    var params = {
        'pk_aquarium_section': aquarium_section_id
    };
    $.ajax({
        url: 'aquarium-section/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: params,
        dataType: 'json'
    }).done(function (data, status, xhr) {
        if (SVG.supported) {
            $('#svg-mini-map').empty();
            $('#svg-aquarium').empty();

            var idx = 0;
            var row_count = 13;
            var col_count = 15;
            var width_interval = 15;
            var height_interval = 10;
            var map = SVG('svg-mini-map').size(col_count * width_interval + col_count + 1, row_count * height_interval + row_count + 1).attr({ 'class': 'align-middle' });
            
            for (i = 0; i < row_count; i++) {
                for (j = 0; j < col_count; j++) {
                    map.rect(15, 10).attr({
                        'class': 'mini-map-store-layout-grid',
                        'x': (width_interval * j + j + 1),
                        'y': (height_interval * i + i + 1)
                    });
                    
                    if (idx < coordinate.length && i == coordinate[idx]['row'] && j == coordinate[idx]['column']) {
                        if (aquarium_section_id == coordinate[idx]['section_id']) {
                            map.rect(15, 10).attr({
                                'class': 'mini-map-store-layout-button',
                                'fill': coordinate[idx]['color'],
                                'x': (width_interval * j + j + 1),
                                'y': (height_interval * i + i + 1)
                            });
                        }
                        else {
                            map.rect(15, 10).attr({
                                'class': 'mini-map-store-layout-button',
                                'fill': '#6c757d',
                                'x': (width_interval * j + j + 1),
                                'y': (height_interval * i + i + 1)
                            });
                        }
                        idx++;
                    }
                    else {
                        map.rect(15, 10).attr({
                            'class': 'mini-map-store-layout-button',
                            'fill': '#fff',
                            'x': (width_interval * j + j + 1),
                            'y': (height_interval * i + i + 1)
                        });
                    }
                }
            }
            var aquarium = SVG('svg-aquarium').size(data['aquarium_num_of_columns'] * 60 + data['aquarium_num_of_columns'] + 21, data['aquarium_num_of_rows'] * 60 + data['aquarium_num_of_rows'] + 21).attr({ 'class': 'align-middle' });
            for (i = data['aquarium_num_of_rows']; i > 0; i--) {
                for (j = 0; j < data['aquarium_num_of_columns']; j++) {
                    var group = aquarium.group();

                    if (i == (data['aquarium_num_of_rows'] - aquarium_row) && j == aquarium_column) {
                        group.add(water = aquarium.pattern(.25, 1.1, function (add) {
                            add.path('M0.25,1H0c0,0,0-0.659,0-0.916c0.083-0.303,0.158,0.334,0.25,0C0.25,0.327,0.25,1,0.25,1z').fill('#6198b3');
                        }).attr({ 'patternUnits': null, 'patternContentUnits': 'objectBoundingBox' }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.polygon('81,2 62,21 62,81 81,62').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('81,2 62,21 62,81 81,62').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.rect(60, 60).attr({ 'class': 'effect-aquarium-front-grid', 'x': 1, 'y': 21 }));
                        group.add(aquarium.rect(60, 60).attr({ 'class': 'effect-aquarium-front-button', 'x': 1, 'y': 21 }));
                        group.add(mask = aquarium
                            .rect(60, 60)
                            .attr({ 'x': 1, 'y': 21 })
                            .fill('#fff'));
                        group.add(water_mask = aquarium.mask().add(mask));
                        group.add(water_effect1 = aquarium
                            .rect(1200, 120)
                            .attr({ 'x': -500, 'y': 81, 'pointer-events': 'none' })
                            .attr({ 'opacity': 0.3 })
                            .fill(water)
                            .maskWith(water_mask));
                        group.add(water_effect2 = aquarium
                            .rect(1600, 120)
                            .attr({ 'x': -500, 'y': 81, 'pointer-events': 'none' })
                            .attr({ 'opacity': 0.3 })
                            .fill(water)
                            .maskWith(water_mask));
                        water_effect1
                            .animate(1000)
                            .move(-300, 45)
                            .animate(3000)
                            .move(0, 45)
                            .loop();
                        water_effect2
                            .animate(1000)
                            .move(-400, 40)
                            .animate(4000)
                            .move(0, 40)
                            .loop();
                    }
                    else {
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.polygon('81,2 62,21 62,81 81,62').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('81,2 62,21 62,81 81,62').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.rect(60, 60).attr({ 'class': 'aquarium-front-grid', 'x': 1, 'y': 21 }));
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'aquarium-front-button',
                            'x': 1,
                            'y': 21,
                            'data-aquarium-row': (data['aquarium_num_of_rows'] - i),
                            'data-aquarium-column': j
                        }));
                    }
                    
                    group.move(60 * j + j, 60 * (i - 1) + (i - 1));
                    aquarium.plain((data['aquarium_num_of_rows'] - i + 1) + '-' + (
                        j + 1
                    )).attr({
                        'text-anchor': 'middle',
                        'x': 60 * j + j + 30,
                        'y': 40 + 60 * (i - 1) + (i - 1)
                    });
                }
            }
            $('rect.aquarium-front-button').on('click', function () {
                aquarium_row = $(this).data('aquarium-row');
                aquarium_column = $(this).data('aquarium-column');

                var params = {
                    'fk_aquarium_section': aquarium_section_id,
                    'row': aquarium_row,
                    'column': aquarium_column
                };

                $.ajax({
                    url: 'aquarium/',
                    method: 'get',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    data: params,
                    dataType: 'json'
                }).done(function (data, status, xhr) {
                    aquarium_id = data['id'];
                    $('#aquarium-stock-register').attr('disabled', false);

                    async_aquarium_stock();
                    draw_aquarium();

                    toastr.remove();
                    toastr.success('수조를 관리할 수 있습니다.');
                }).fail(function (res, status, xhr) { });
            });
        }
        else {
            alert('SVG를 지원하지 않는 브라우저입니다.');
        }
        typeof callback === 'function' && callback();
    }).fail(function (data) { });
};