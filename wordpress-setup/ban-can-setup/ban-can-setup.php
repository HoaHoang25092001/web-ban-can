<?php
/**
 * Plugin Name:  Ban Can Setup
 * Description:  Tự động tạo Custom Post Type "san-pham", Taxonomy "danh-muc" và toàn bộ ACF fields cho website bán cân.
 * Version:      1.0.0
 * Author:       Web Ban Can
 *
 * CÁCH DÙNG:
 *   1. Copy thư mục "ban-can-setup" vào wp-content/plugins/
 *   2. Vào WP Admin → Plugins → Activate "Ban Can Setup"
 *   3. Xong. Kiểm tra tại /wp-json/wp/v2/san-pham
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ============================================================
// 1. ĐĂNG KÝ CUSTOM POST TYPE: san-pham
// ============================================================
add_action( 'init', 'ban_can_register_post_types' );

function ban_can_register_post_types() {
    register_post_type( 'san-pham', [
        'label'         => 'Sản phẩm',
        'labels'        => [
            'name'               => 'Sản phẩm',
            'singular_name'      => 'Sản phẩm',
            'add_new'            => 'Thêm mới',
            'add_new_item'       => 'Thêm sản phẩm mới',
            'edit_item'          => 'Sửa sản phẩm',
            'new_item'           => 'Sản phẩm mới',
            'view_item'          => 'Xem sản phẩm',
            'view_items'         => 'Xem tất cả',
            'search_items'       => 'Tìm sản phẩm',
            'all_items'          => 'Tất cả sản phẩm',
            'not_found'          => 'Không tìm thấy sản phẩm',
            'not_found_in_trash' => 'Không có trong thùng rác',
            'menu_name'          => 'Sản phẩm',
        ],
        'public'            => true,
        'has_archive'       => true,
        'show_in_rest'      => true,      // BẮT BUỘC để REST API hoạt động
        'rest_base'         => 'san-pham',
        'supports'          => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
        'menu_icon'         => 'dashicons-cart',
        'menu_position'     => 5,
        'rewrite'           => [ 'slug' => 'san-pham' ],
        'taxonomies'        => [ 'danh-muc' ],
    ] );
}

// ============================================================
// 2. ĐĂNG KÝ TAXONOMY: danh-muc
// ============================================================
add_action( 'init', 'ban_can_register_taxonomies' );

function ban_can_register_taxonomies() {
    register_taxonomy( 'danh-muc', [ 'san-pham' ], [
        'label'             => 'Danh mục',
        'labels'            => [
            'name'              => 'Danh mục',
            'singular_name'     => 'Danh mục',
            'add_new_item'      => 'Thêm danh mục mới',
            'edit_item'         => 'Sửa danh mục',
            'update_item'       => 'Cập nhật',
            'all_items'         => 'Tất cả danh mục',
            'search_items'      => 'Tìm danh mục',
            'parent_item'       => 'Danh mục cha',
            'parent_item_colon' => 'Danh mục cha:',
            'not_found'         => 'Không tìm thấy',
            'menu_name'         => 'Danh mục',
        ],
        'hierarchical'      => true,      // Giống Category (có danh mục cha/con)
        'public'            => true,
        'show_in_rest'      => true,      // BẮT BUỘC để REST API hoạt động
        'rest_base'         => 'danh-muc',
        'show_admin_column' => true,
        'rewrite'           => [ 'slug' => 'danh-muc' ],
    ] );
}

// ============================================================
// 3. ĐĂNG KÝ ACF FIELDS (yêu cầu plugin Advanced Custom Fields)
// ============================================================
add_action( 'acf/init', 'ban_can_register_acf_fields' );

function ban_can_register_acf_fields() {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) {
        return; // ACF chưa được cài → bỏ qua
    }

    acf_add_local_field_group( [
        'key'                   => 'group_thong_tin_san_pham',
        'title'                 => 'Thông tin sản phẩm',
        'fields'                => [

            [
                'key'           => 'field_sp_price',
                'label'         => 'Giá',
                'name'          => 'price',
                'type'          => 'text',
                'instructions'  => 'Nhập giá (vd: 1.500.000đ hoặc Liên hệ)',
                'required'      => 0,
                'placeholder'   => 'vd: 1.500.000đ',
                'wrapper'       => [ 'width' => '50%', 'class' => '', 'id' => '' ],
            ],

            [
                'key'           => 'field_sp_capacity',
                'label'         => 'Dung tích / Cân nặng tối đa',
                'name'          => 'capacity',
                'type'          => 'text',
                'instructions'  => 'vd: 500kg, 30kg',
                'required'      => 0,
                'placeholder'   => 'vd: 500kg',
                'wrapper'       => [ 'width' => '50%', 'class' => '', 'id' => '' ],
            ],

            [
                'key'           => 'field_sp_accuracy',
                'label'         => 'Độ chính xác',
                'name'          => 'accuracy',
                'type'          => 'text',
                'instructions'  => 'vd: 0.1g, ±0.5%',
                'required'      => 0,
                'placeholder'   => 'vd: 0.1g',
                'wrapper'       => [ 'width' => '50%', 'class' => '', 'id' => '' ],
            ],

            [
                'key'           => 'field_sp_manufacturer',
                'label'         => 'Nhà sản xuất',
                'name'          => 'manufacturer',
                'type'          => 'text',
                'required'      => 0,
                'placeholder'   => 'vd: Nhơn Hòa, CAS, OHAUS',
                'wrapper'       => [ 'width' => '50%', 'class' => '', 'id' => '' ],
            ],

            [
                'key'           => 'field_sp_origin',
                'label'         => 'Xuất xứ',
                'name'          => 'origin',
                'type'          => 'text',
                'required'      => 0,
                'placeholder'   => 'vd: Việt Nam, Hàn Quốc',
                'wrapper'       => [ 'width' => '50%', 'class' => '', 'id' => '' ],
            ],

            [
                'key'           => 'field_sp_dial_size',
                'label'         => 'Kích thước mặt cân (dialSize)',
                'name'          => 'dial_size',
                'type'          => 'text',
                'required'      => 0,
                'placeholder'   => 'vd: Ø60mm',
                'wrapper'       => [ 'width' => '50%', 'class' => '', 'id' => '' ],
            ],

            [
                'key'           => 'field_sp_scale_size',
                'label'         => 'Kích thước bàn cân (scaleSize)',
                'name'          => 'scale_size',
                'type'          => 'text',
                'required'      => 0,
                'placeholder'   => 'vd: 300x400mm',
                'wrapper'       => [ 'width' => '50%', 'class' => '', 'id' => '' ],
            ],

            [
                'key'              => 'field_sp_featured',
                'label'            => 'Sản phẩm nổi bật',
                'name'             => 'featured',
                'type'             => 'true_false',
                'instructions'     => 'Bật để hiển thị sản phẩm này ở trang chủ',
                'required'         => 0,
                'default_value'    => 0,
                'ui'               => 1,
                'ui_on_text'       => 'Nổi bật',
                'ui_off_text'      => 'Thường',
                'wrapper'          => [ 'width' => '100%', 'class' => '', 'id' => '' ],
            ],

        ],
        'location'              => [
            [
                // Chỉ hiện field group này khi edit "san-pham"
                [ 'param' => 'post_type', 'operator' => '==', 'value' => 'san-pham' ],
            ],
        ],
        'menu_order'            => 0,
        'position'              => 'normal',
        'style'                 => 'default',
        'label_placement'       => 'top',
        'instruction_placement' => 'label',
        'active'                => true,
        'show_in_rest'          => 1,  // Xuất ra REST API
    ] );
}

// ============================================================
// 4. ĐẢM BẢO ACF FIELDS XUẤT RA REST API
//    (Backup nếu không cài plugin "ACF to REST API")
// ============================================================
add_filter( 'rest_prepare_san-pham', 'ban_can_inject_acf_into_rest', 10, 3 );

function ban_can_inject_acf_into_rest( $response, $post, $request ) {
    if ( function_exists( 'get_fields' ) ) {
        $acf_fields = get_fields( $post->ID );
        if ( $acf_fields ) {
            $response->data['acf'] = $acf_fields;
        } else {
            $response->data['acf'] = new stdClass(); // object rỗng nếu chưa có data
        }
    }
    return $response;
}

// ============================================================
// 5. CORS — Cho phép Next.js gọi WordPress REST API
// ============================================================
add_action( 'rest_api_init', 'ban_can_add_cors_headers', 15 );

function ban_can_add_cors_headers() {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );

    add_filter( 'rest_pre_serve_request', function ( $value ) {
        $origin = get_http_origin();

        // ⚠️ Thêm domain Next.js production của bạn vào đây
        $allowed_origins = [
            'http://localhost:3000',
            'http://localhost:3001',
            // 'https://your-nextjs-site.vercel.app',  // thêm sau khi deploy
        ];

        if ( in_array( $origin, $allowed_origins, true ) ) {
            header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
        } elseif ( empty( $origin ) ) {
            // Cho phép nếu không có origin (vd: Postman, server-side fetch)
            header( 'Access-Control-Allow-Origin: *' );
        }

        header( 'Access-Control-Allow-Methods: GET, OPTIONS' );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );

        return $value;
    } );
}

// ============================================================
// 6. XỬ LÝ PREFLIGHT REQUEST (OPTIONS method từ browser)
// ============================================================
add_action( 'init', 'ban_can_handle_preflight' );

function ban_can_handle_preflight() {
    if ( isset( $_SERVER['REQUEST_METHOD'] ) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS' ) {
        if ( isset( $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] ) ) {
            header( 'Access-Control-Allow-Methods: GET, OPTIONS' );
            header( 'Access-Control-Allow-Headers: Authorization, Content-Type' );
            status_header( 200 );
            exit();
        }
    }
}

// ============================================================
// 7. THÔNG BÁO SAU KHI ACTIVATE
// ============================================================
register_activation_hook( __FILE__, 'ban_can_on_activate' );

function ban_can_on_activate() {
    ban_can_register_post_types();
    ban_can_register_taxonomies();
    flush_rewrite_rules(); // Làm mới permalink
}

add_action( 'admin_notices', 'ban_can_admin_notice' );

function ban_can_admin_notice() {
    if ( ! get_transient( 'ban_can_activated' ) ) {
        return;
    }
    $site_url = get_site_url();
    ?>
    <div class="notice notice-success is-dismissible">
        <p>
            <strong>Ban Can Setup đã kích hoạt thành công!</strong><br>
            Kiểm tra API tại:<br>
            &bull; <a href="<?php echo esc_url( $site_url . '/wp-json/wp/v2/san-pham' ); ?>" target="_blank">/wp-json/wp/v2/san-pham</a><br>
            &bull; <a href="<?php echo esc_url( $site_url . '/wp-json/wp/v2/danh-muc' ); ?>" target="_blank">/wp-json/wp/v2/danh-muc</a><br>
            &bull; <a href="<?php echo esc_url( $site_url . '/wp-json/wp/v2/posts' ); ?>" target="_blank">/wp-json/wp/v2/posts</a> (tin tức)
        </p>
    </div>
    <?php
    delete_transient( 'ban_can_activated' );
}

register_activation_hook( __FILE__, function () {
    set_transient( 'ban_can_activated', true, 5 );
} );
