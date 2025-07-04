document.addEventListener('DOMContentLoaded', () => {
    setInterval(updateClock, 1000);
    updateClock(); // Gọi lần đầu

    const button = document.getElementById('menuButton');
    if (button) {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn click này nổi bọt lên document (để không đóng popup ngay)
            togglePopupMenu();
        });
    }
    Startup();
});

function Startup() { 
    const token = localStorage.getItem("token");

    if (!token || token.trim() === "") {
        window.location.href = "/Auth/Login";
        return;
    }

    const decoded = parseJwt(token);

    if (!decoded || !decoded.name || !decoded.sub) {
        console.warn("Token không chứa thông tin cần thiết.");
        window.location.href = "/Auth/Login";
        return;
    }

    // Gán thông tin vào giao diện
    document.getElementById("display-name").textContent = decoded.name;
    document.getElementById("user-id").value = decoded.sub;

}

//FUNCTION --------------------------------------------------------------------------------------------------
function updateClock() {
        const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN');
    document.getElementById('clock').textContent = timeString;
    }

document.getElementById("logout-btn").addEventListener("click", function (event) {
    event.preventDefault(); // Ngăn chuyển trang

    // Xóa token và các dữ liệu khác nếu cần
    localStorage.removeItem("token");

    // Chuyển hướng về trang đăng nhập
    window.location.href = "/Auth/Login";
});


// Đóng popup nếu click ngoài
document.addEventListener('click', function (event) {
    const menu = document.getElementById('popupMenu');
    const button = document.getElementById('menuButton');

    if (menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
        menu.classList.add('d-none');
    }
});

function togglePopupMenu() {
    const menu = document.getElementById('popupMenu');
    menu.classList.toggle('d-none');
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Token không hợp lệ", e);
        return null;
    }
}

