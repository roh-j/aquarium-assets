/**
 * Store JS
 * @author roh-j
 * @version 2019-07-26, 코드 표준화.
 */

var storage_room_pk = null;
var section_pk = null;
var section_color = null;

var storage_room_name = null;
var section_name = null;
var aquarium_num_of_rows = null;
var aquarium_num_of_columns = null;

$(function () {

    $('#console-menu').metisMenu();
    $('.nav-second-level').removeClass('d-none');

    load_complete();
    init_horizontal_spinner();

    // Modal 창을 닫으면 모든 입력값 초기화.

    $('#storage-room-modal').on('hide.bs.modal', function (e) {
        $('#storage-room-modal-title').empty();
        $('#storage-room-modal-footer').empty();
        $('form#form-storage-room input#id_storage_room_name').val('');
    });

    $('#aquarium-section-modal').on('hide.bs.modal', function (e) {
        $('#aquarium-section-modal-title').empty();
        $('#aquarium-section-modal-footer').empty();
        $('form#form-aquarium-section input#id_section_name').val('');
        $('form#form-aquarium-section input#id_aquarium_num_of_rows').val(0);
        $('form#form-aquarium-section input#id_aquarium_num_of_columns').val(0);
        $('form#form-aquarium-section input#id_section_color').val('#cd5c5c');
        $('#aquarium-section-edit-color-selected').css({ 'background': '#cd5c5c' });
    });

    // 생물실 선택.

    $('#storage-room-list > a').click(function (e) {
        e.preventDefault();

        if (!$(this).hasClass('selected')) {
            $('#storage-room-list > a').removeClass('selected');
            $('#storage-room-list > a > div.media > div.media-body > p > span').remove();

            $(this).addClass('selected');
            $('div.media > div.media-body > p', this).append(
                '<span class="text-primary pull-right"><i class="fas fa-check fa-fw"></i></span>'
            );

            storage_room_pk = $('div.media > span.data-bind', this).data('storage-room-id');
            section_pk = null;
            section_color = null;

            storage_room_name = $('div.media > span.data-bind', this).data('storage-room-name');

            $('#storage-room-modify').removeAttr('disabled');
            $('#move-aquarium-section').removeAttr('disabled');
        }
    });

    // 섹션 컬러 값 선택.

    $('#aquarium-section-edit-color-picker > ul li').click(function (e) {
        $('#aquarium-section-edit-color-selected').css({ 'background': $(this).data('section-color') });
        $('form#form-aquarium-section input#id_section_color').val($(this).data('section-color'));
    });

    // 버튼 클릭 이벤트.

    $('#move-aquarium-section').click(function (e) {
        if (storage_room_pk) {
            async_aquarium_section(function () {
                $('.nav-tabs a[href="#aquarium-section"]').tab('show');
            });
        }
    });

    $('#move-store-layout').click(function (e) {
        if (section_pk && section_color) {
            draw_store_layout('store-layout/', function () {
                $('.nav-tabs a[href="#store-layout"]').tab('show');
            });
        }
    });

    $('#redo-aquarium-section').click(function (e) {
        if (section_pk && section_color) {
            $('.nav-tabs a[href="#aquarium-section"]').tab('show');
        }
    });

    /**
     * Modal 창 내용 동적 변경.
     * 추가 or 변경.
     */

    $('#storage-room-register').click(function (e) {
        $('#storage-room-modal-title').html(
            '<i class="fas fa-exclamation-circle fa-fw text-primary"></i> 생물실 등록'
        );
        $('#storage-room-modal-footer').html(
            '<button type="submit" class="btn btn-primary" data-http-method="post">등록</button>'
        );
        $('#storage-room-modal').modal('show');
    });

    $('#storage-room-modify').click(function (e) {
        if (storage_room_pk) {
            $('form#form-storage-room input#id_storage_room_name').val(storage_room_name);

            $('#storage-room-modal-title').html(
                '<i class="fas fa-exclamation-circle fa-fw text-primary"></i> 생물실 변경'
            );
            $('#storage-room-modal-footer').html(
                '<div class="btn-group">\
                    <button type="button" class="btn btn-default" data-http-method="delete">삭제</button>\
                    <button type="submit" class="btn btn-primary" data-http-method="put">변경</button>\
                </div>'
            );
            $('#storage-room-modal').modal('show');
        }
    });

    $('#aquarium-section-register').click(function (e) {
        $('#aquarium-section-modal-title').html(
            '<i class="fas fa-exclamation-circle fa-fw text-primary"></i> 섹션 / 수조 등록'
        );
        $('#aquarium-section-modal-footer').html(
            '<button type="submit" class="btn btn-primary" data-http-method="post">등록</button>'
        );
        $('#aquarium-section-modal').modal('show');
    });

    $('#aquarium-section-modify').click(function (e) {
        if (section_pk && section_color) {
            $('form#form-aquarium-section input#id_section_name').val(section_name);
            $('form#form-aquarium-section input#id_aquarium_num_of_rows').val(aquarium_num_of_rows);
            $('form#form-aquarium-section input#id_aquarium_num_of_columns').val(aquarium_num_of_columns);
            $('form#form-aquarium-section input#id_section_color').val(section_color);
            $('#aquarium-section-edit-color-selected').css({ 'background': section_color });

            $('#aquarium-section-modal-title').html(
                '<i class="fas fa-exclamation-circle fa-fw text-primary"></i> 섹션 / 수조 변경'
            );
            $('#aquarium-section-modal-footer').html(
                '<div class="btn-group">\
                    <button type="button" class="btn btn-default" data-http-method="delete">삭제</button>\
                    <button type="submit" class="btn btn-primary" data-http-method="put">변경</button>\
                </div>'
            );
            $('#aquarium-section-modal').modal('show');
        }
    });

    /**
     * 생물실 입력 데이터 전송.
     * Rest API 구조를 따름.
     * @param {string} http_method post (데이터 저장) or put (데이터 수정).
     */

    $(document).on('submit', 'form#form-storage-room', function (e) {
        e.preventDefault();
        var http_method = $('button[type=submit]', this).data('http-method');
        var params = $('form#form-storage-room').serializeObject();

        if (http_method == 'put') {
            params = $.extend(
                params,
                {
                    'PK': storage_room_pk
                }
            );
        }

        $.ajax({
            url: 'storage-room/',
            method: http_method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (res, status, xhr) {
            $('#storage-room-modal').modal('hide');
            $('#storage-room-modal').on('hidden.bs.modal', function (e) {
                location.reload(true);
            });
        }).fail(function (res, status, xhr) {
        });
    });

    // 생물실 데이터 삭제.

    $(document).on('click', '#storage-room-modal-footer button[type=button]', function (e) {
        var http_method = $(this).data('http-method');
        var params = {
            'PK': storage_room_pk
        };

        $.ajax({
            url: 'storage-room/',
            method: http_method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (res, status, xhr) {
            $('#storage-room-modal').modal('hide');
            $('#storage-room-modal').on('hidden.bs.modal', function (e) {
                location.reload(true);
            });
        }).fail(function (res, status, xhr) {
        });
    });

    /**
     * 섹션 입력 데이터 전송.
     * Rest API 구조를 따름.
     * @param {string} http_method post (데이터 저장) or put (데이터 수정).
     */

    $(document).on('submit', 'form#form-aquarium-section', function (e) {
        e.preventDefault();
        var http_method = $('button[type=submit]', this).data('http-method');
        var params = $('form#form-aquarium-section').serializeObject();

        if (http_method == 'post') {
            params = $.extend(
                params,
                {
                    'FK': storage_room_pk
                }
            );
        }
        else if (http_method == 'put') {
            params = $.extend(
                params,
                {
                    'PK': section_pk,
                    'FK': storage_room_pk
                }
            );
        }

        $.ajax({
            url: 'aquarium-section/',
            method: http_method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (res, status, xhr) {
            $('#aquarium-section-modal').modal('hide');
            $('#aquarium-section-modal').on('hidden.bs.modal', function (e) {
                async_aquarium_section(null);
            });
        }).fail(function (res, status, xhr) {
            console.log(res);
        });
    });

    // 섹션 데이터 삭제.

    $(document).on('click', '#aquarium-section-modal-footer button[type=button]', function (e) {
        var http_method = $(this).data('http-method');
        var params = {
            'PK': section_pk
        };

        $.ajax({
            url: 'aquarium-section/',
            method: http_method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(params),
            dataType: 'json',
        }).done(function (res, status, xhr) {
            $('#aquarium-section-modal').modal('hide');
            $('#aquarium-section-modal').on('hidden.bs.modal', function (e) {
                async_aquarium_section(null);
            });
        }).fail(function (res, status, xhr) {
            console.log(res);
        });
    });
});

/**
 * 섹션 안에 있는 수조를 그림.
 * @param {string} callback 콜백 처리 변수.
 * @returns 없음.
 */

var async_aquarium_section = function (callback) {
    var params = {
        'FK': storage_room_pk
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
                                data-section-id="' + data[i]['pk'] + '"\
                                data-section-name="' + data[i]['section_name'] + '"\
                                data-section-color="' + data[i]['section_color'] + '"\
                                data-aquarium-num-of-rows="' + data[i]['aquarium_num_of_rows'] + '"\
                                data-aquarium-num-of-columns="' + data[i]['aquarium_num_of_columns'] + '"></span>\
                            <div class="media-left">\
                                <img class="media-object" src="' + DJANGO_STATIC_URL + '/assets/img/icon/Mimetypes-application-x-archive-icon-64x64.png">\
                            </div>\
                            <div class="media-body w-100">\
                                <p class="font-weight-bold">\
                                    <i class="fas fa-circle fa-fw" style="color: ' + data[i]['section_color'] + '"></i> ' + data[i]['section_name'] + '\
                                </p>\
                                가로: ' + data[i]['aquarium_num_of_columns'] + '개 / 높이: ' + data[i]['aquarium_num_of_rows'] + '층 / 총: ' + aquarium_total + '개\
                            </div>\
                        </div>\
                    </a>\
                ');
            }

            $('#aquarium-section-list > a').click(function (e) {
                e.preventDefault();

                if (!$(this).hasClass('selected')) {
                    $('#aquarium-section-list > a').removeClass('selected');
                    $('#aquarium-section-list > a > div.media > div.media-body > p > span').remove();

                    $(this).addClass('selected');
                    $('div.media > div.media-body > p', this).append(
                        '<span class="text-primary pull-right"><i class="fas fa-check fa-fw"></i></span>'
                    );
                    section_pk = $('div.media > span.data-bind', this).data('section-id');
                    section_color = $('div.media > span.data-bind', this).data('section-color');

                    section_name = $('div.media > span.data-bind', this).data('section-name');
                    aquarium_num_of_rows = $('div.media > span.data-bind', this).data('aquarium-num-of-rows');
                    aquarium_num_of_columns = $('div.media > span.data-bind', this).data('aquarium-num-of-columns');

                    $('#aquarium-section-modify').removeAttr('disabled');
                    $('#move-store-layout').removeAttr('disabled');
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
        if (callback) {
            callback();
        }
    }).fail(function (res, status, xhr) {
        console.log(res);
    });
}

/**
 * 매장 레이아웃을 그림.
 * @param {string} url 데이터를 가져오기 위한 경로 지정.
 * @param {string} callback 콜백 처리 변수.
 * @returns 없음.
 */

var draw_store_layout = function (url, callback) {
    var params = {
        'FK1': storage_room_pk,
        'FK2': section_pk
    };

    $.ajax({
        url: url,
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
                    }).done(function (res, status, xhr) {
                        draw_store_layout('store-layout/', null);
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

            $('#store-layout-console').html(
                '<i class="fas fa-circle fa-fw" style="color: ' + section_color + '"></i> ' + section_name
            );
        }
        else {
            alert('SVG를 지원하지 않는 브라우저입니다.');
        }
        if (callback) {
            callback();
        }
    }).fail(function (data) {
    });
}

/**
 * 매장 레이아웃 좌표 값 저장.
 * @param {string} row 매장 레이아웃 (행) 값.
 * @param {string} column 매장 레이아웃 (열) 값.
 * @returns 없음.
 */

var save_store_layout = function (row, column) {
    var params = {
        'FK1': storage_room_pk,
        'FK2': section_pk,
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
    }).done(function (res, status, xhr) {
        draw_store_layout('store-layout/', null);
    }).fail(function (res, status, xhr) {
    });
}