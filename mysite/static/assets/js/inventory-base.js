var storage_room_pk = null;
var aquarium_section_pk = null;
var aquarium_selection_row = null;
var aquarium_selection_column = null;

var table = null;

$(function () {
    $("#console-menu").metisMenu();
    $(".nav-second-level").removeClass("d-none");

    $("#redo-store-layout").click(function (e) {
        $(".nav-tabs a[href='#store-layout']").tab("show");
        aquarium_selection_row = null;
        aquarium_selection_column = null;
    });

    $("#storage-room-list > a").click(function (e) {
        e.preventDefault();

        if (!$(this).hasClass("selected")) {
            $("#storage-room-list > a").removeClass("selected");
            $("#storage-room-list > a > div.media > div.media-body > p > span").remove();

            $(this).addClass("selected");
            $("div.media > div.media-body > p", this).append(
                "<span class='text-primary pull-right'><i class='fas fa-check'></i></span>"
            );

            storage_room_pk = $("div.media > span.data-binding", this).data("storage-room-id");
            storage_room_name = $("div.media > span.data-binding", this).data("storage-room-name");

            draw_store_layout("store-layout/", function () {
                $(".nav-tabs a[href='#store-layout']").tab("show");
            });
        }
    });

    table = $("#inventory_table").DataTable({
        buttons: [
            {
                extend: "csv",
                text: "<i class='far fa-save'></i> CSV",
                filename: "재고 목록 " + year + "-" + month + "-" + day,
                exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                }
            },
            {
                extend: "excel",
                text: "<i class='far fa-save'></i> Excel",
                filename: "재고 목록 " + year + "-" + month + "-" + day,
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

            $(".dataTables_info").detach().appendTo("#inventory-info");
            $(".dataTables_paginate").detach().appendTo("#inventory-pagination");

            $(".dt-buttons").detach().appendTo("#inventory-menu");
            $(".dataTables_length").detach().appendTo("#inventory-tool");
            $(".dataTables_filter").detach().appendTo("#inventory-tool");
        }
    });
});