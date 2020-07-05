/**
 * Order Register JS
 * @author roh-j
 * @version 2019-07-26, 코드 표준화.
 */

var customer_table = null;
var product_table = null;
var cart_table = null;

$(function () {

    $("#console-menu").metisMenu();
    $(".nav-second-level").removeClass("d-none");

    init_horizontal_spinner();
    init_checkbox_select_all();

    $("#add-order").click(function (e) {
        $("#add-order-modal").modal("show");
    });

    customer_table = $("#customer_table").DataTable({
        lengthChange: false,
        info: false,
        autoWidth: false,
        pageLength: 10,
        pagingType: "simple",
        order: [[ 1, "desc" ]],
        columnDefs: [
            {
                "targets": [0],
                "searchable": false,
                "orderable": false
            }
        ],
        dom: "f" + "t" + "p",
        language: {
            emptyTable: "데이터가 존재하지 않습니다.",
            zeroRecords: "일치하는 레코드가 없습니다.",
            lengthMenu: "_MENU_",
            search: "",
            searchPlaceholder: "\uf002",
            paginate: {
                previous: "이전",
                next: "다음"
            }
        },
        initComplete: function () {
            $("#customer_table_filter input").removeClass("input-sm").unwrap("label").addClass("fas fa-search");
            $("#customer_table_paginate").detach().appendTo("#customer-pagination");
            $("#customer_table_filter").detach().appendTo("#customer-tool");
        }
    });

    product_table = $("#product_table").DataTable({
        lengthChange: false,
        info: false,
        autoWidth: false,
        pageLength: 10,
        pagingType: "simple",
        order: [[1, "desc"]],
        columnDefs: [
            {
                "targets": [0],
                "searchable": false,
                "orderable": false
            }
        ],
        dom: "f" + "t" + "p",
        language: {
            emptyTable: "데이터가 존재하지 않습니다.",
            zeroRecords: "일치하는 레코드가 없습니다.",
            lengthMenu: "_MENU_",
            search: "",
            searchPlaceholder: "\uf002",
            paginate: {
                previous: "이전",
                next: "다음"
            }
        },
        initComplete: function () {
            $("#product_table_filter input").removeClass("input-sm").unwrap("label").addClass("fas fa-search");
            $("#product_table_paginate").detach().appendTo("#product-pagination");
            $("#product_table_filter").detach().appendTo("#product-tool");
        }
    });

    cart_table = $("#cart_table").DataTable({
        lengthChange: false,
        info: false,
        autoWidth: false,
        pageLength: 10,
        pagingType: "simple",
        dom: "f" + "t" + "p",
        language: {
            emptyTable: "데이터가 존재하지 않습니다.",
            zeroRecords: "일치하는 레코드가 없습니다.",
            lengthMenu: "_MENU_",
            search: "",
            searchPlaceholder: "\uf002",
            paginate: {
                previous: "이전",
                next: "다음"
            }
        },
        initComplete: function () {
            $("#cart_table_filter input").removeClass("input-sm").unwrap("label").addClass("fas fa-search");
            $("#cart_table_paginate").detach().appendTo("#cart-pagination");
            $("#cart_table_filter").detach().appendTo("#cart-tool");
        }
    });

    load_complete();
});