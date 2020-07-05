/**
 * Common JS
 * @author roh-j
 * @version 2019-07-31, 코드 표준화, 모듈 추가.
 */

var DJANGO_STATIC_URL = '/static';

var username = null;

var date = new Date();
var year = date.getFullYear();
var month = new String(date.getMonth() + 1);
var day = new String(date.getDate());

if (month.length == 1) {
    month = '0' + month;
}
if (day.length == 1) {
    day = '0' + day;
}

$(function () {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            }
        }
    });
});

var toast = function (type, message) {
    bootoast.toast({
        'message': message,
        'type': type,
        'position': 'right-top',
        'icon': null,
        'timeout': '3',
        'dismissable': true
    });
}

/**
 * loading - load_complete.
 * 로드 중 화면 생성과 로드 완료 처리.
 */

var loading = function () {
    $('#page-wrapper').addClass('d-none');
    $('#content-section').removeClass('d-none');
}

var load_complete = function () {
    $('#page-wrapper').removeClass('d-none');
    $('#content-section').addClass('d-none');
}

/**
 * Input Spinner.
 * Float, Int 형 지원.
 */

var init_horizontal_spinner = function () {
    $('.input-spinner > button').on('click', function () {
        value = $(this).data('spinner-value');
        target = $(this).data('spinner-target');
        type = $(target).data('input-type');
        pre_value = $(target).val();

        if (type == 'float') {
            pre_value = parseFloat(pre_value);
            value = parseFloat(value);

            res_value = (pre_value + value).toFixed(1);

            if (res_value >= 0.0) {
                $(target).val(res_value);
            }
        }
        else if (type == 'int') {
            pre_value = parseInt(pre_value);
            value = parseInt(value);

            res_value = pre_value + value;

            if (res_value >= 0) {
                $(target).val(res_value);
            }
        }
    });
}

var init_vertical_spinner = function (callback) {
    $('.spinner .btn:first-of-type').on('click', function () {
        var target = $(this).closest('div.spinner').find('input[type=text]');
        var pre_value = parseInt(target.val());
        var res_value = pre_value + 1;

        if (res_value >= 1) {
            $(target).val(res_value);
        }
    });
    $('.spinner .btn:last-of-type').on('click', function () {
        var target = $(this).closest('div.spinner').find('input[type=text]');
        var pre_value = parseInt(target.val());
        var res_value = pre_value - 1;

        if (res_value >= 1) {
            $(target).val(res_value);
        }
    });
}

/**
 * Custom Radio Button Reset.
 */

var init_radio_reset = function () {
    $('button[type=reset]').closest('form').on('reset', function (e) {
        form = $(this);

        setTimeout(function () {
            form.find('input[type=radio]').parents().removeClass('active');
            form.find('input[type=radio]:checked').parents().addClass('active');
        });
    });
}

/**
 * 테이블 체크박스 모두 선택 / 해제 기능
 */

var init_checkbox_select_all = function () {
    $('table thead input[type=checkbox]').on('click', function () {
        target = $(this).closest('table');

        $('input:checkbox', target).not(this).prop('checked', this.checked);
    })
}