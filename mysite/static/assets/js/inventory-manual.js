/**
 * inventory - manual javascript
 * @author roh-j
 * @version 2019-08-11
 */

var storage_room_id = null;
var aquarium_section_id = null;
var storage_room_name = null;

var aquarium_id = null;
var aquarium_row = null;
var aquarium_column = null;

var inventory_table = null;
var coordinate = null;

$(function () {
    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');

    init_toast();
    init_horizontal_spinner();

    $('span.relative-time').each(function () {
        var conv = moment($(this).text(), 'YYYY-MM-DD HH:mm:ss').fromNow();
        $(this).text(conv);
    });

    $('#aquarium-stock-register').on('click', function (e) {
        $.ajax({
            url: '../../product/creature/',
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

            $('#aquarium-stock-register-modal').modal('show');
        }).fail(function (res, status, xhr) {
        });
    });

    $('#form-aquarium-stock-register').on('submit', function (e) {
        e.preventDefault();
        var params = $('#form-aquarium-stock-register').serializeObject();
        params = $.extend(
            params,
            {
                'FK': aquarium_id
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
            dataType: 'json',
        }).done(function (data, status, xhr) {
            $('#aquarium-stock-register-modal').modal('hide');
            $('#aquarium-stock-register-modal').on('hidden.bs.modal', function (e) {
                async_aquarium_stock();

                toastr.remove();
                toastr.success('재고를 등록하였습니다.');
            });
        }).fail(function (res, status, xhr) {
        });
    });

    inventory_table = $('#inventory_table').DataTable({
        'buttons': [
            {
                'extend': 'csv',
                'text': '<i class="far fa-save fa-fw"></i> CSV',
                'filename': '수조 재고 목록표 ' + year + '-' + month + '-' + day,
                'exportOptions': {
                    'columns': [1, 2, 3, 4, 5, 6, 7]
                }
            },
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

            $('.dataTables_info').detach().appendTo('#inventory-info');
            $('.dataTables_paginate').detach().appendTo('#inventory-pagination');

            $('.dt-buttons').detach().appendTo('#inventory-menu');
            $('.dataTables_length').detach().appendTo('#inventory-tool').addClass('ml-auto');
            $('.dataTables_filter').detach().appendTo('#inventory-tool');
        }
    });

    load_complete();

    /**
     * 생물실 탭.
     * Event bind.
     */

    $('#storage-room-list > a').on('click', function (e) {
        e.preventDefault();

        if (!$(this).hasClass('selected')) {
            $('#storage-room-list > a').removeClass('selected');
            $('#storage-room-list > a > div.media > div.media-body > p > span').remove();

            $(this).addClass('selected');
            $('div.media > div.media-body > p', this).append(
                '<span class="text-primary pull-right"><i class="fas fa-check fa-fw"></i></span>'
            );

            storage_room_id = $('div.media > span.data-bind', this).data('storage-room-id');
            storage_room_name = $('div.media > span.data-bind', this).data('storage-room-name');

            draw_store_layout(function () {
                $('.nav-tabs a[href="#store-layout"]').tab('show');
            });
        }
    });

    /**
     * 수족관 탭.
     * Event bind.
     */

    $('#redo-store-layout').on('click', function (e) {
        $('.nav-tabs a[href="#store-layout"]').tab('show');
        $('#aquarium-stock-register').attr('disabled', true);
        aquarium_row = null;
        aquarium_column = null;
        inventory_table.clear().draw();
    });
});

/**
 * 매장 레이아웃을 그림.
 * @param {string} url 데이터를 가져오기 위한 경로 지정.
 * @param {string} callback 콜백 처리 변수.
 * @returns 없음.
 */

var draw_store_layout = function (callback) {
    var params = {
        'FK': storage_room_id
    };

    $.ajax({
        url: 'store-layout/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: params,
        dataType: 'json',
    }).done(function (data, status, xhr) {
        var idx = 0;
        coordinate = data;

        if (SVG.supported) {
            $('#svg-store-layout').empty();

            var row_count = 13;
            var col_label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
            var width_interval = 60;
            var height_interval = 40;

            var layout = SVG('svg-store-layout').size((col_label.length + 1) * width_interval + col_label.length + 2, (row_count + 1) * height_interval + row_count + 2).attr(
                { 'class': 'align-middle' }
            );

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

            $('#guide-store-layout').html(
                storage_room_name
            )
        }
        else {
            alert('SVG를 지원하지 않는 브라우저입니다.');
        }
        typeof callback === 'function' && callback();
    }).fail(function (data) {
    });
}

/**
 * 섹션 안에 있는 수조를 그림.
 * @param {string} url 데이터를 가져오기 위한 경로 지정.
 * @param {string} callback 콜백 처리 변수.
 * @returns 없음.
 */

var draw_aquarium = function (callback) {
    var params = {
        'PK': aquarium_section_id
    }

    $.ajax({
        url: 'aquarium-section/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: params,
        dataType: 'json',
    }).done(function (data, status, xhr) {
        if (SVG.supported) {
            $('#svg-mini-map').empty();
            $('#svg-aquarium').empty();

            var idx = 0;
            var row_count = 13;
            var col_count = 15;
            var width_interval = 15;
            var height_interval = 10;

            var map = SVG('svg-mini-map').size(col_count * width_interval + col_count + 1, row_count * height_interval + row_count + 1).attr(
                { 'class': 'align-middle' }
            );

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

            var aquarium = SVG('svg-aquarium').size(data['aquarium_num_of_columns'] * 60 + data['aquarium_num_of_columns'] + 21, data['aquarium_num_of_rows'] * 60 + data['aquarium_num_of_rows'] + 21).attr(
                { 'class': 'align-middle' }
            );

            for (i = data['aquarium_num_of_rows']; i > 0; i--) {
                for (j = 0; j < data['aquarium_num_of_columns']; j++) {
                    var group = aquarium.group();

                    if (i == (data['aquarium_num_of_rows'] - aquarium_row) && j == aquarium_column) {
                        group.add(water = aquarium.pattern(.25, 1.1, function (add) {
                            add.path('M0.25,1H0c0,0,0-0.659,0-0.916c0.083-0.303,0.158,0.334,0.25,0C0.25,0.327,0.25,1,0.25,1z').fill('#6198b3');
                        }).attr({
                            'patternUnits': null,
                            'patternContentUnits': 'objectBoundingBox'
                        }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.polygon('81,2 62,21 62,81 81,62').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('81,2 62,21 62,81 81,62').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'effect-aquarium-front-grid',
                            'x': 1,
                            'y': 21
                        }));
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'effect-aquarium-front-button',
                            'x': 1,
                            'y': 21
                        }));
                        group.add(mask = aquarium.rect(60, 60).attr({
                            'x': 1,
                            'y': 21
                        }).fill('#fff'));
                        group.add(water_mask = aquarium.mask().add(mask));
                        group.add(water_effect1 = aquarium.rect(1200, 120).attr({
                            'x': -500,
                            'y': 81,
                            'pointer-events': 'none'
                        }).attr({
                            'opacity': 0.3
                        }).fill(water).maskWith(water_mask));
                        group.add(water_effect2 = aquarium.rect(1600, 120).attr({
                            'x': -500,
                            'y': 81,
                            'pointer-events': 'none'
                        }).attr({
                            'opacity': 0.3
                        }).fill(water).maskWith(water_mask));

                        water_effect1.animate(1000).move(-300, 45).animate(3000).move(0, 45).loop();
                        water_effect2.animate(1000).move(-400, 40).animate(4000).move(0, 40).loop();
                    }
                    else {
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('20,1 1,20 61,20 80,1').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.polygon('81,2 62,21 62,81 81,62').attr({ 'class': 'aquarium-grid' }));
                        group.add(aquarium.polygon('81,2 62,21 62,81 81,62').attr({ 'class': 'aquarium-plane' }));
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'aquarium-front-grid',
                            'x': 1,
                            'y': 21
                        }));
                        group.add(aquarium.rect(60, 60).attr({
                            'class': 'aquarium-front-button',
                            'x': 1,
                            'y': 21,
                            'data-aquarium-row': (data['aquarium_num_of_rows'] - i),
                            'data-aquarium-column': j
                        }));
                    }

                    group.move(60 * j + j, 60 * (i - 1) + (i - 1));
                    aquarium.plain((data['aquarium_num_of_rows'] - i + 1) + '-' + (j + 1)).attr({ 'text-anchor': 'middle', 'x': 60 * j + j + 30, 'y': 40 + 60 * (i - 1) + (i - 1) });
                }
            }

            $('rect.aquarium-front-button').on('click', function () {
                aquarium_row = $(this).data('aquarium-row');
                aquarium_column = $(this).data('aquarium-column');

                var params = {
                    'FK': aquarium_section_id,
                    'row': aquarium_row,
                    'column': aquarium_column
                }

                $.ajax({
                    url: 'aquarium/',
                    method: 'get',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    data: params,
                    dataType: 'json',
                }).done(function (data, status, xhr) {
                    aquarium_id = data['id'];
                    $('#aquarium-stock-register').attr('disabled', false);

                    async_aquarium_stock();
                    draw_aquarium();

                    toastr.remove();
                    toastr.success('수조를 관리할 수 있습니다.');
                }).fail(function (res, status, xhr) {
                });
            });
        }
        else {
            alert('SVG를 지원하지 않는 브라우저입니다.');
        }
        typeof callback === 'function' && callback();
    }).fail(function (data) {
    });
}

var async_aquarium_stock = function (callback) {
    var params = {
        'FK': aquarium_id
    };

    $.ajax({
        url: 'aquarium-stock/',
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: params,
        dataType: 'json',
    }).done(function (data, status, xhr) {
        inventory_table.clear().draw();

        for (i = 0; i < data.length; i++) {
            var gender = null;
            var status = null;

            switch (data[i]['gender']) {
                case 'none':
                    gender = '<i class="fas fa-genderless fa-fw text-secondary"></i> 없음';
                    break;
                case 'female':
                    gender = '<i class="fas fa-venus fa-fw text-danger"></i> 암컷';
                    break;
                case 'male':
                    gender = '<i class="fas fa-mars fa-fw text-primary"></i> 수컷';
                    break;
            }

            switch (data[i]['status']) {
                case 'available':
                    status = '<i class="fas fa-lightbulb fa-fw text-success"></i>';
                    break;
                case 'unavailable':
                    status = '<i class="fas fa-lightbulb fa-fw text-warning"></i>';
                    break;
            }

            inventory_table.row.add(
                $('\
                    <tr>\
                        <th scope="row">' + (inventory_table.rows().count() + 1) + '</th>\
                        <td>' + data[i]['creature__species'] + '</td>\
                        <td>' + data[i]['creature__breed'] + '</td>\
                        <td>' + data[i]['remark'] + '</td>\
                        <td>' + data[i]['size'] + ' cm</td>\
                        <td>' + gender + '</td>\
                        <td>' + data[i]['quantity'] + '</td>\
                        <td>' + status + '</td>\
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