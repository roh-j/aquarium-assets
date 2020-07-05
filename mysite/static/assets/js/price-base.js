var table = null;
var species = [];
var breed = [];

$(function () {
    $("#console-menu").metisMenu();
    $(".nav-second-level").removeClass("d-none");

    $("#unit-price-register").click(function (e) {
        $.ajax({
            url: "unit-price/species/",
            method: "get",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            dataType: "json",
        }).done(function (data, status, xhr) {
            species = [];

            for (i = 0; i < data.length; i++) {
                species.push(data[i]["species"]);
                $("#species-dropdown-menu").append(
                    "<li><a href='#'>" + data[i]["species"] + "</a></li>"
                );
            }

            $("#id_species").typeahead({
                source: species,
                items: 3
            });

            $.ajax({
                url: "unit-price/breed/",
                method: "get",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                dataType: "json",
            }).done(function (data, status, xhr) {
                breed = [];
                
                for (i = 0; i < data.length; i++) {
                    breed.push(data[i]["breed"]);
                    $("#breed-dropdown-menu").append(
                        "<li><a href='#'>" + data[i]["breed"] + "</a></li>"
                    );
                }

                $("#id_breed").typeahead({
                    source: breed,
                    items: 3
                });

                $("#unit-price-modal").modal("show");
            }).fail(function (res) {
            });
        }).fail(function (res) {
        });
    });
    
    table = $("#unit_price_table").DataTable({
        buttons: [
            {
                extend: "csv",
                text: "<i class='far fa-save'></i> CSV",
                filename: "열대어 단가 " + year + "-" + month + "-" + day,
                exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                }
            },
            {
                extend: "excel",
                text: "<i class='far fa-save'></i> Excel",
                filename: "열대어 단가 " + year + "-" + month + "-" + day,
                title: "",
                exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                },
                customize: function (xlsx) {
                    var sheet = xlsx.xl.worksheets["sheet1.xml"];
                    var col = $("col", sheet);

                    col.each(function () {
                        $(this).attr("width", 35);
                    });
                }
            }
        ],
        columnDefs: [
            {
                "targets": [6],
                "searchable": false,
                "orderable": false
            }
        ],
        pageLength: 10,
        pagingType: "simple",
        lengthMenu: [10, 25, 50],
        dom: "l" + "B" + "f" + "tr" + "p" + "i",
        language: {
            emptyTable: "데이터가 존재하지 않습니다",
            zeroRecords: "일치하는 레코드가 없습니다",
            lengthMenu: "_MENU_",
            search: "",
            paginate: {
                previous: "이전",
                next: "다음"
            }
        },
        initComplete: function () {
            $(".dt-buttons").addClass("btn-group ml-3");
            $(".dt-buttons > .dt-button").addClass("btn btn-default");
            $(".dataTables_length").addClass("mr-3");

            $(".dataTables_filter").addClass("d-inline-block align-middle");
            $(".dataTables_length").addClass("d-inline-block align-middle");
            $(".dataTables_filter input").removeClass("input-sm");
            $(".dataTables_length select").removeClass("input-sm");

            $(".dataTables_info").detach().appendTo("#unit-price-info");
            $(".dataTables_paginate").detach().appendTo("#unit-price-pagination");

            $(".dt-buttons").detach().appendTo("#unit-price-menu");
            $(".dataTables_length").detach().appendTo("#unit-price-tool");
            $(".dataTables_filter").detach().appendTo("#unit-price-tool");

            async_unit_price(null);
        }
    });
});