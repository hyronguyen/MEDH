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
});

function updateClock() {
        const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN');
    document.getElementById('clock').textContent = timeString;
    }


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