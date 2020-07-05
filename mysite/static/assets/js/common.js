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
    function csrfSafeMethod(method) { // these HTTP methods do not require CSRF protection
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
        "timeOut": "3000"
    };
};

var init_spinner = function () {
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
        } else if (type == 'int') {
            pre_value = parseInt(pre_value);
            value = parseInt(value);
            res_value = pre_value + value;

            if (res_value >= 0) {
                $(target).val(res_value);
            }
        }
    });
};

var init_radio_reset = function () {
    $('button[type=reset]').closest('form').on('reset', function () {
        form = $(this);
        setTimeout(function () {
            form
                .find('input[type=radio]')
                .closest('label')
                .removeClass('active');
            form
                .find('input[type=radio]:checked')
                .closest('label')
                .addClass('active');
        });
    });
};

var init_select_all = function () {
    $('table thead .check-all').on('click', function () {
        target = $(this).closest('table');
        $('input:checkbox', target).not(this).prop('checked', this.checked);
    })
};

var conv_unit = function (value) {
    switch (value) {
        case 'none':
            unit = '<i class="fas fa-genderless fa-fw text-secondary"></i> 없음'; break;
        case 'female':
            unit = '<i class="fas fa-venus fa-fw text-danger"></i> 암컷'; break;
        case 'male':
            unit = '<i class="fas fa-mars fa-fw text-primary"></i> 수컷'; break;
    }
    return unit;
};

var conv_stages_of_development = function (value) {
    switch (value) {
        case 'adult':
            stages_of_development = '성어'; break;
        case 'immature':
            stages_of_development = '준성어'; break;
        case 'juvenile':
            stages_of_development = '유어'; break;
        case 'larva':
            stages_of_development = '치어'; break;
    }
    return stages_of_development;
};

var conv_order_type = function (value) {
    switch (value) {
        case 'pickup':
            order_type = '매장'; break;
        case 'delivery':
            order_type = '택배'; break;
    }
    return order_type;
};

var conv_status = function (value) {
    switch (value) {
        case 'available':
            status = '<i class="fas fa-lightbulb fa-fw text-success"></i>'; break;
        case 'unavailable':
            status = '<i class="fas fa-lightbulb fa-fw text-warning"></i>'; break;
    }
    return status;
};

var null_to_empty = function (value) {
    if (value == null) {
        value = '';
    }
    return value;
};

var wide_screen = function (type) {
    if (type == 'toggle') {
        if ($('#page-inner').css('max-width') == '1170px') {
            $('#page-inner').css('max-width', 'none');
            $('footer').css('max-width', 'none');
            $('.wide-screen').text('기본');
        }
        else {
            $('#page-inner').css('max-width', '1170px');
            $('footer').css('max-width', '1170px');
            $('.wide-screen').text('넓게');
        }
    }
    else if (type == 'on') {
        $('#page-inner').css('max-width', 'none');
        $('footer').css('max-width', 'none');
        $('.wide-screen').text('기본');
    }
    else if (type == 'off') {
        $('#page-inner').css('max-width', '1170px');
        $('footer').css('max-width', '1170px');
        $('.wide-screen').text('넓게');
    }
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

var escape_html = function (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entity_map[s];
    });
};