$(document).on("submit", "form#form-storage-room", function (e) {
    e.preventDefault();
    var http_method = $("button[type=submit]", this).data("http-method");
    var params = $("form#form-storage-room").serializeObject();

    if (http_method == "put") {
        params = $.extend(
            params,
            {
                "PK": storage_room_pk
            }
        );
    }

    $.ajax({
        url: "storage-room/",
        method: http_method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(params),
        dataType: "json",
    }).done(function (res, status, xhr) {
        $("#storage-room-modal").modal("hide");
        $("#storage-room-modal").on("hidden.bs.modal", function (e) {
            location.reload(true);
        });
    }).fail(function (res, status, xhr) {
    });
});

$(document).on("click", "#storage-room-modal-footer button[type=button]", function (e) {
    var http_method = $(this).data("http-method");
    var params = {
        "PK": storage_room_pk
    };

    $.ajax({
        url: "storage-room/",
        method: http_method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(params),
        dataType: "json",
    }).done(function (res, status, xhr) {
        $("#storage-room-modal").modal("hide");
        $("#storage-room-modal").on("hidden.bs.modal", function (e) {
            location.reload(true);
        });
    }).fail(function (res, status, xhr) {
    });
});

$(document).on("submit", "form#form-aquarium-section", function (e) {
    e.preventDefault();
    var http_method = $("button[type=submit]", this).data("http-method");
    var params = $("form#form-aquarium-section").serializeObject();

    if (http_method == "post") {
        params = $.extend(
            params,
            {
                "FK": storage_room_pk
            }
        );
    }
    else if (http_method == "put") {
        params = $.extend(
            params,
            {
                "PK": section_pk,
                "FK": storage_room_pk
            }
        );
    }

    $.ajax({
        url: "aquarium-section/",
        method: http_method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(params),
        dataType: "json",
    }).done(function (res, status, xhr) {
        $("#aquarium-section-modal").modal("hide");
        $("#aquarium-section-modal").on("hidden.bs.modal", function (e) {
            async_aquarium_section(null);
        });
    }).fail(function (res, status, xhr) {
        console.log(res);
    });
});

$(document).on("click", "#aquarium-section-modal-footer button[type=button]", function (e) {
    var http_method = $(this).data("http-method");
    var params = {
        "PK": section_pk
    };

    $.ajax({
        url: "aquarium-section/",
        method: http_method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(params),
        dataType: "json",
    }).done(function (res, status, xhr) {
        $("#aquarium-section-modal").modal("hide");
        $("#aquarium-section-modal").on("hidden.bs.modal", function (e) {
            async_aquarium_section(null);
        });
    }).fail(function (res, status, xhr) {
        console.log(res);
    });
});