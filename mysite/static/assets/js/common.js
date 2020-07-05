/**
 * common javascript
 * @author roh-j
 * @version 2019-08-10
 */

var DJANGO_STATIC_URL = '/static';
var USERNAME = null;

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

var loading = function () {
    $('#page-wrapper').addClass('d-none');
    $('#content-section').removeClass('d-none');
};

var load_complete = function () {
    $('#page-wrapper').removeClass('d-none');
    $('#content-section').addClass('d-none');
};

var init_toast = function () {
    toastr.options = {
        "closeButton": true,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "timeOut": "3000",
    };
};

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
};

var init_vertical_spinner = function () {
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
};

var init_custom_radio_reset = function () {
    $('button[type=reset]').closest('form').on('reset', function (e) {
        form = $(this);

        setTimeout(function () {
            form.find('input[type=radio]').closest('label').removeClass('active');
            form.find('input[type=radio]:checked').closest('label').addClass('active');
        });
    });
};

var init_checkbox_select_all = function () {
    $('table thead .check-all').on('click', function () {
        target = $(this).closest('table');

        $('input:checkbox', target).not(this).prop('checked', this.checked);
    })
};

var entity_map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};
function escape_html(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entity_map[s];
    });
}