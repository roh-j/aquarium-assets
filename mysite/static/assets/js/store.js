/**
 * store javascript
 * @author roh-j
 * @version 2019-08-11
 */

var storage_room_id = null;
var section_id = null;
var section_color = null;

var storage_room_name = null;
var section_name = null;
var aquarium_num_of_rows = null;
var aquarium_num_of_columns = null;

$(function () {

    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');

    $('span.relative-time').each(function () {
        var conv = moment($(this).text(), 'YYYY-MM-DD HH:mm:ss').fromNow();
        $(this).text(conv);
    });

    init_horizontal_spinner();
    load_complete();

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
            section_id = null;
            section_color = null;

            storage_room_name = $('div.media > span.data-bind', this).data('storage-room-name');

            $('#storage-room-modify').attr('disabled', false);
            $('#move-aquarium-section').attr('disabled', false);
        }
    });

    $('#register-color-picker > ul li').on('click', function (e) {
        var form = '#form-aquarium-section-register';

        $('#register-color-selected').css({ 'background': $(this).data('section-color') });
        $(form + ' #id_section_color').val($(this).data('section-color'));
    });

    $('#modify-color-picker > ul li').on('click', function (e) {
        var form = '#form-aquarium-section-modify';

        $('#modify-color-selected').css({ 'background': $(this).data('section-color') });
        $(form + ' #id_section_color').val($(this).data('section-color'));
    });

    $('#move-aquarium-section').on('click', function (e) {
        async_aquarium_section(function () {
            $('.nav-tabs a[href="#aquarium-section"]').tab('show');
        });
    });

    $('#move-store-layout').on('click', function (e) {
        draw_store_layout(function () {
            $('.nav-tabs a[href="#store-layout"]').tab('show');
        });
    });

    $('#redo-aquarium-section').on('click', function (e) {
        $('.nav-tabs a[href="#aquarium-section"]').tab('show');
    });

    $('#storage-room-modify').on('click', function (e) {
        var form = '#form-storage-room-modify';

        $(form + ' #id_storage_room_name').val(storage_room_name);
        $('#storage-room-modify-modal').modal('show');
    });

    $('#aquarium-section-modify').on('click', function (e) {
        var form = '#form-aquarium-section-modify';

        $(form + ' #id_section_name').val(section_name);
        $('#modify-color-selected').css({ 'background': section_color });
        $(form + ' #id_section_color').val(section_color);
        $('#aquarium-section-modify-modal').modal('show');
    });

    $('#form-storage-room-register').on('submit', function (e) {
        e.preventDefault();
        var params = $('#form-storage-room-register').serializeObject();

        $.ajax({
            url: 'storage-room/',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (data, status, xhr) {
            $('#storage-room-register-modal').modal('hide');
            $('#storage-room-register-modal').on('hidden.bs.modal', function (e) {
                location.reload(true);
            });
        }).fail(function (res, status, xhr) {
        });
    });

    $('#form-storage-room-modify').on('submit', function (e) {
        e.preventDefault();
        var params = $('#form-storage-room-modify').serializeObject();
        params = $.extend(
            params,
            {
                'PK': storage_room_id
            }
        );

        $.ajax({
            url: 'storage-room/',
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (data, status, xhr) {
            $('#storage-room-modify-modal').modal('hide');
            $('#storage-room-modify-modal').on('hidden.bs.modal', function (e) {
                location.reload(true);
            });
        }).fail(function (res, status, xhr) {
        });
    });

    $('#storage-room-delete').on('click', function (e) {
        var params = {
            'PK': storage_room_id
        };

        $.ajax({
            url: 'storage-room/',
            method: 'delete',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (data, status, xhr) {
            $('#storage-room-modify-modal').modal('hide');
            $('#storage-room-modify-modal').on('hidden.bs.modal', function (e) {
                location.reload(true);
            });
        }).fail(function (res, status, xhr) {
        });
    });

    $('#form-aquarium-section-register').on('submit', function (e) {
        e.preventDefault();
        var params = $('#form-aquarium-section-register').serializeObject();
        params = $.extend(
            params,
            {
                'FK': storage_room_id
            }
        );

        $.ajax({
            url: 'aquarium-section/',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (data, status, xhr) {
            $('#aquarium-section-register-modal').modal('hide');
            $('#aquarium-section-register-modal').on('hidden.bs.modal', function (e) {
                async_aquarium_section();
            });
        }).fail(function (res, status, xhr) {
        });
    });

    $('#form-aquarium-section-modify').on('submit', function (e) {
        e.preventDefault();
        var params = $('#form-aquarium-section-modify').serializeObject();
        params = $.extend(
            params,
            {
                'PK': section_id,
                'FK': storage_room_id,
                'aquarium_num_of_columns': aquarium_num_of_columns,
                'aquarium_num_of_rows': aquarium_num_of_rows
            }
        );

        $.ajax({
            url: 'aquarium-section/',
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (data, status, xhr) {
            $('#aquarium-section-modify-modal').modal('hide');
            $('#aquarium-section-modify-modal').on('hidden.bs.modal', function (e) {
                async_aquarium_section();
            });
        }).fail(function (res, status, xhr) {
        });
    });

    $('#aquarium-section-delete').on('click', function (e) {
        var params = {
            'PK': section_id
        };

        $.ajax({
            url: 'aquarium-section/',
            method: 'delete',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (data, status, xhr) {
            $('#aquarium-section-modify-modal').modal('hide');
            $('#aquarium-section-modify-modal').on('hidden.bs.modal', function (e) {
                async_aquarium_section();
            });
        }).fail(function (res, status, xhr) {
        });
    });
});

var async_aquarium_section = function (callback) {
    var params = {
        'FK': storage_room_id
    };

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
        $('#async-aquarium-section').empty();

        if (data.length) {
            $('#async-aquarium-section').append(
                '<div id="aquarium-section-list" class="list-group"></div>'
            );

            for (i = 0; i < data.length; i++) {
                var aquarium_total = parseInt(data[i]['aquarium_num_of_rows']) * parseInt(data[i]['aquarium_num_of_columns'])
                $('#async-aquarium-section > #aquarium-section-list').append('\
                    <a href="#" class="list-group-item">\
                        <div class="media">\
                            <span class="data-bind"\
                                data-section-id="' + data[i]['id'] + '"\
                                data-section-name="' + data[i]['section_name'] + '"\
                                data-section-color="' + data[i]['section_color'] + '"\
                                data-aquarium-num-of-rows="' + data[i]['aquarium_num_of_rows'] + '"\
                                data-aquarium-num-of-columns="' + data[i]['aquarium_num_of_columns'] + '"></span>\
                            <div class="media-left">\
                                <img class="media-object" src="' + DJANGO_STATIC_URL + '/assets/img/icon/Mimetypes-application-x-archive-icon-64x64.png">\
                            </div>\
                            <div class="media-body w-100">\
                                <p class="font-weight-bold">\
                                    <i class="fas fa-square fa-fw" style="color: ' + data[i]['section_color'] + '"></i> ' + data[i]['section_name'] + '\
                                </p>\
                                <ul class="list-inline">\
                                    <li>가로 ' + data[i]['aquarium_num_of_columns'] + '</li>\
                                    <li>세로 ' + data[i]['aquarium_num_of_rows'] + '</li>\
                                    <li>전체 ' + aquarium_total + '</li>\
                                </ul>\
                            </div>\
                        </div>\
                    </a>\
                ');
            }

            $('#aquarium-section-list > a').on('click', function (e) {
                e.preventDefault();

                if (!$(this).hasClass('selected')) {
                    $('#aquarium-section-list > a').removeClass('selected');
                    $('#aquarium-section-list > a > div.media > div.media-body > p > span').remove();

                    $(this).addClass('selected');
                    $('div.media > div.media-body > p', this).append(
                        '<span class="text-primary pull-right"><i class="fas fa-check fa-fw"></i></span>'
                    );
                    section_id = $('div.media > span.data-bind', this).data('section-id');
                    section_color = $('div.media > span.data-bind', this).data('section-color');

                    section_name = $('div.media > span.data-bind', this).data('section-name');
                    aquarium_num_of_rows = $('div.media > span.data-bind', this).data('aquarium-num-of-rows');
                    aquarium_num_of_columns = $('div.media > span.data-bind', this).data('aquarium-num-of-columns');

                    $('#aquarium-section-modify').attr('disabled', false);
                    $('#move-store-layout').attr('disabled', false);
                }
            });
        }
        else {
            $('#async-aquarium-section').append(
                '<div class="standby">\
                <img src="' + DJANGO_STATIC_URL + '/assets/img/icon/Apps-utilities-file-archiver-icon.png" class="img-responsive mx-auto">\
                <hr>\
                <p class="text-center">생물실의 섹션을 등록할 수 있습니다.</p>\
                </div>'
            );
        }
        typeof callback === 'function' && callback();
    }).fail(function (res, status, xhr) {
    });
}

var draw_store_layout = function (callback) {
    var params = {
        'FK1': storage_room_id,
        'FK2': section_id
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
                            'data-store-layout-row': i,
                            'data-store-layout-column': j,
                            'data-store-layout-selected': true,
                            'data-store-layout-id': data[idx]['id'],
                            'data-store-layout-modify-permission': data[idx]['permission']
                        });
                        idx++;
                    }
                    else {
                        layout.rect(60, 40).attr({
                            'class': 'store-layout-button',
                            'fill': '#e7e7e7',
                            'x': (width_interval * (j + 1) + j + 2),
                            'y': (height_interval * (i + 1) + i + 2),
                            'data-store-layout-row': i,
                            'data-store-layout-column': j,
                            'data-store-layout-selected': false
                        });
                    }
                }
            }

            $('rect.store-layout-button').on('click', function () {
                if ($(this).data('store-layout-selected') && $(this).data('store-layout-modify-permission')) {
                    var params = {
                        'PK': $(this).data('store-layout-id')
                    };

                    $.ajax({
                        url: 'store-layout/',
                        method: 'delete',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify(params),
                        dataType: 'json',
                    }).done(function (data, status, xhr) {
                        draw_store_layout();
                    }).fail(function (res, status, xhr) {
                    });
                }
                else if ($(this).data('store-layout-selected')) {
                    $('#alert-modal-body').html('이미 다른 섹션이 선택되어있습니다.');
                    $('#alert-modal').modal('show');
                }
                else {
                    save_store_layout($(this).data('store-layout-row'), $(this).data('store-layout-column'));
                }
            });

            $('#guide-store-layout').html(
                '<i class="fas fa-square fa-fw" style="color: ' + section_color + '"></i> ' + section_name
            );
        }
        else {
            alert('SVG를 지원하지 않는 브라우저입니다.');
        }
        typeof callback === 'function' && callback();
    }).fail(function (data) {
    });
}

var save_store_layout = function (row, column) {
    var params = {
        'FK1': storage_room_id,
        'FK2': section_id,
        'row': row,
        'column': column
    };

    $.ajax({
        url: 'store-layout/',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(params),
        dataType: 'json',
    }).done(function (data, status, xhr) {
        draw_store_layout();
    }).fail(function (res, status, xhr) {
    });
}