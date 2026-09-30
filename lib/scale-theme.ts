/**
 * Chế độ sáng/tối cho khu cân điện tử.
 *
 * Chép từ dự án digital-scale gốc. Đổi khoá lưu thành "scale-theme" thay vì
 * "theme": website bán hàng có thể dùng khoá "theme" cho việc khác, trùng tên
 * là hai bên ghi đè lẫn nhau.
 */
export const THEME_STORAGE_KEY = 'scale-theme';

/**
 * Chạy ngay trong <head> TRƯỚC khi trang vẽ lần đầu.
 *
 * Nếu để React bật chế độ tối sau khi tải xong, khách sẽ thấy màn hình loé
 * trắng một nhịp rồi mới chuyển sang tối — chói mắt khi làm việc ban đêm.
 *
 * Mặc định theo cài đặt của hệ điều hành cho tới khi khách tự chọn.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
