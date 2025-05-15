document.addEventListener('DOMContentLoaded', () => {
    initContextMenus();
});

// ------------------- Hàm chính khởi tạo menu ngữ cảnh -------------------

function initContextMenus() {
    const cards = document.querySelectorAll('.module-card');
    const contextMenus = document.querySelectorAll('.context-menu');

    hideAllContextMenus();

    // Gắn sự kiện cho từng card
    cards.forEach(card => {
        const menu = card.querySelector('.context-menu');
        if (!menu) return;

        handleCardClick(card, menu, contextMenus);
        handleCardMouseLeave(card, menu);
    });

    // Click bên ngoài thì ẩn hết
    document.addEventListener('click', () => {
        hideAllContextMenus();
    });
}

// ------------------- Các hàm chức năng -------------------

// Ẩn toàn bộ context menu
function hideAllContextMenus() {
    document.querySelectorAll('.context-menu').forEach(menu => {
        menu.style.display = 'none';
    });
}

// Xử lý sự kiện click vào card
function handleCardClick(card, menu, allMenus) {
    card.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn lan ra ngoài

        // Ẩn các menu khác
        allMenus.forEach(m => {
            if (m !== menu) m.style.display = 'none';
        });

        // Toggle hiển thị menu hiện tại
        menu.style.display = 'block';
    });
}

// Xử lý khi chuột rời khỏi card
function handleCardMouseLeave(card, menu) {
    card.addEventListener('mouseleave', () => {
        menu.style.display = 'none';
    });
}
