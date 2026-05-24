#!/bin/bash
# ============================================================
# WP-CLI Setup Script cho Web Bán Cân
#
# CÁCH CHẠY (trong LocalWP):
#   1. Mở LocalWP → Click phải vào site → "Open Site Shell"
#   2. cd vào thư mục chứa file này rồi chạy: bash wpcli-setup.sh
#   Hoặc copy từng lệnh và paste vào terminal của LocalWP
# ============================================================

set -e  # Dừng nếu có lỗi

echo ""
echo "====================================================="
echo "  CÀI ĐẶT WORDPRESS CHO WEBSITE BÁN CÂN"
echo "====================================================="
echo ""

# -----------------------------------------------------------
# BƯỚC 1: Cài plugin Advanced Custom Fields (bắt buộc)
# -----------------------------------------------------------
echo "[1/4] Cài Advanced Custom Fields..."
wp plugin install advanced-custom-fields --activate --quiet
echo "      OK: advanced-custom-fields"

# -----------------------------------------------------------
# BƯỚC 2: Cài plugin ACF to REST API (đảm bảo ACF fields xuất ra JSON)
# -----------------------------------------------------------
echo "[2/4] Cài ACF to REST API..."
wp plugin install acf-to-rest-api --activate --quiet
echo "      OK: acf-to-rest-api"

# -----------------------------------------------------------
# BƯỚC 3: Copy và activate plugin ban-can-setup
#   Plugin này tự tạo CPT, Taxonomy và ACF fields
# -----------------------------------------------------------
echo "[3/4] Kích hoạt plugin ban-can-setup..."

# Kiểm tra plugin đã có trong thư mục plugins chưa
WP_PLUGIN_DIR=$(wp eval "echo WP_PLUGIN_DIR;" 2>/dev/null)

if [ ! -d "$WP_PLUGIN_DIR/ban-can-setup" ]; then
    echo ""
    echo "  ⚠️  Chưa tìm thấy plugin ban-can-setup trong $WP_PLUGIN_DIR"
    echo ""
    echo "  → Hãy copy thư mục 'ban-can-setup' từ project Next.js vào:"
    echo "     $WP_PLUGIN_DIR/"
    echo ""
    echo "  Sau đó chạy lại lệnh:"
    echo "     wp plugin activate ban-can-setup"
    echo "     wp rewrite flush"
    exit 1
fi

wp plugin activate ban-can-setup --quiet
echo "      OK: ban-can-setup"

# -----------------------------------------------------------
# BƯỚC 4: Flush rewrite rules (cần thiết sau khi đăng ký CPT mới)
# -----------------------------------------------------------
echo "[4/4] Làm mới permalink rules..."
wp rewrite flush
echo "      OK"

# -----------------------------------------------------------
# KẾT QUẢ
# -----------------------------------------------------------
SITE_URL=$(wp option get siteurl)

echo ""
echo "====================================================="
echo "  HOÀN TẤT! Kiểm tra các API endpoint:"
echo "====================================================="
echo ""
echo "  Sản phẩm : $SITE_URL/wp-json/wp/v2/san-pham?_embed"
echo "  Danh mục : $SITE_URL/wp-json/wp/v2/danh-muc"
echo "  Tin tức  : $SITE_URL/wp-json/wp/v2/posts?_embed"
echo ""
echo "  Nếu muốn test ngay, chạy:"
echo "    curl \"$SITE_URL/wp-json/wp/v2/san-pham\" | head -c 500"
echo ""

# -----------------------------------------------------------
# (TÙY CHỌN) Tạo một số danh mục mẫu
# -----------------------------------------------------------
read -p "Tạo danh mục mẫu? (y/n): " CREATE_SAMPLE

if [[ "$CREATE_SAMPLE" == "y" || "$CREATE_SAMPLE" == "Y" ]]; then
    echo ""
    echo "Tạo danh mục mẫu..."

    wp term create danh-muc "Cân điện tử"       --slug=can-dien-tu       --description="Các loại cân điện tử" --porcelain > /dev/null
    wp term create danh-muc "Cân công nghiệp"   --slug=can-cong-nghiep   --description="Cân sử dụng trong công nghiệp" --porcelain > /dev/null
    wp term create danh-muc "Cân y tế"          --slug=can-y-te          --description="Cân dùng trong y tế, bệnh viện" --porcelain > /dev/null
    wp term create danh-muc "Cân bàn"           --slug=can-ban           --description="Cân bàn thông dụng" --porcelain > /dev/null
    wp term create danh-muc "Cân treo"          --slug=can-treo          --description="Cân treo móc" --porcelain > /dev/null
    wp term create danh-muc "Cân phân tích"     --slug=can-phan-tich     --description="Cân phân tích độ chính xác cao" --porcelain > /dev/null

    echo "  Đã tạo 6 danh mục mẫu!"
    echo ""
    echo "  Kiểm tra: $SITE_URL/wp-json/wp/v2/danh-muc"
fi

echo ""
echo "  Tiếp theo: Vào WP Admin → Sản phẩm → Thêm sản phẩm đầu tiên"
echo "  WP Admin: $SITE_URL/wp-admin"
echo ""
