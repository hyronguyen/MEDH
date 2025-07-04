document.addEventListener('DOMContentLoaded', () => {
    initContextMenus();
    CheckPhanQuyen();

});

// ------------------- Hàm chính khởi tạo menu ngữ cảnh -------------------
function CheckPhanQuyen() {
    const token = localStorage.getItem("token");

    if (!token || token.trim() === "") {
        window.location.href = "/Auth/Login";
        return;
    }

    const decoded = parseJwt(token);

    if (!decoded || !decoded.role) {
        console.warn("Token không hợp lệ hoặc thiếu role.");
        window.location.href = "/Auth/Login";
        return;
    }

    const role = decoded.role;

    // Nếu đúng quyền, tiếp tục
    hideCardsByRole(role);
}

//FUNCTION: ẩn các module được phân quyền
function hideCardsByRole(role) {
    const cardsToHide = {
        tiep_don: ['qms', 'kiosk','khambenh','hoichan', 'kho', 'xetnghiem', 'thungan', 'nhathuoc', 'cdha', 'khomau', 'danhmuc', 'dinhduong', 'thietlap'],
        bac_si: ['tiepdon', 'kho', 'thungan', 'nhathuoc', 'khomau', 'danhmuc', 'qms', 'kiosk', 'dinhduong', 'thietlap'],
        thu_ngan: ['tiepdon','khambenh','hoichan', 'kho', 'xetnghiem', 'nhathuoc', 'hsba', 'cdha', 'khomau', 'danhmuc', 'nhapvien', 'qms', 'kiosk', 'dinhduong', 'thietlap'],
        duoc: ['danhmuc','tiepdon', 'khambenh', 'thungan', 'hoichan', 'xetnghiem', 'nhapvien', 'cdha', 'hsba', 'qms', 'kiosk', 'dinhduong', 'thietlap'],
        quan_tri: []
    };

    const toHide = cardsToHide[role] || [];

    toHide.forEach(name => {
        let el = document.getElementById(`card-${name}`);
        if (!el) return;

        // Nếu phần tử là module-card nằm trong <a>, ẩn thẻ <a> thay vì chỉ .module-card
        if (el.tagName === 'DIV' && el.classList.contains('module-card') && el.parentElement.tagName === 'A') {
            el = el.parentElement;
        }

        el.style.display = 'none';
    });
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
    } catch (error) {
        console.error("Không thể giải mã token:", error);
        return null;
    }
}

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
