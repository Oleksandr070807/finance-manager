<?php
// wp-content/themes/finance-manager-child/functions.php

add_action( "wp_enqueue_scripts", function () {
    wp_enqueue_style( "parent-style",
        get_template_directory_uri() . "/style.css" );
    wp_enqueue_style( "child-style",
        get_stylesheet_directory_uri() . "/style.css",
        [ "parent-style" ], "1.0" );
} );
add_action( "init", function () {
    // Реєстрація довільного типу записів для транзакцій
    register_post_type( "finance_transaction", [
        "label"         => "Транзакції",
        "public"        => true,
        "has_archive"   => true,
        "menu_icon"     => "dashicons-money-alt",
        "rewrite"       => [ "slug" => "transactions" ],
        "supports"      => [ "title", "editor", "thumbnail", "excerpt", "custom-fields" ],
        "show_in_rest"  => true, // доступ через REST API та блок-редактор
    ] );

    // Реєстрація таксономії (категорій доходів/витрат)
    register_taxonomy( "transaction_cat", "finance_transaction", [
        "label"        => "Категорії транзакцій",
        "hierarchical" => true,
        "rewrite"      => [ "slug" => "transaction-category" ],
        "show_in_rest" => true,
    ] );
} );

// виведення суми транзакції через шорткод [transaction_sum]
add_shortcode( "transaction_sum", function () {
    $price = get_post_meta( get_the_ID(), "price", true );
    if ( ! $price ) { return ""; }
    return "<p class=\"price\">" . number_format( (float) $price, 0, ",", " " )
         . " ₴</p>";
} );