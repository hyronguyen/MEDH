document.addEventListener("DOMContentLoaded", function () {

    const table = document.querySelector("#tableTiepDon tbody");
    const searchMaNB = document.getElementById("searchMaNB");
    const searchMaHS = document.getElementById("searchMaHS");
    const searchTen = document.getElementById("searchTen");
    const searchNguoiTiep = document.getElementById("searchNguoiTiep");
    const searchNgayTiep = document.getElementById("searchNgayTiep");

// FUNCTION: Lọc bản
    function filterTable() {
        const valMaNB = searchMaNB.value.trim().toLowerCase();
        const valMaHS = searchMaHS.value.trim().toLowerCase();
        const valTen = searchTen.value.trim().toLowerCase();
        const valNguoi = searchNguoiTiep.value.trim().toLowerCase();
        const valNgay = searchNgayTiep.value;

        const isFiltering = valMaNB || valMaHS || valTen || valNguoi || valNgay;

        let matchCount = 0;

        Array.from(table.rows).forEach(row => {
            const maNB = row.cells[1].textContent.toLowerCase();
            const maHS = row.cells[2].textContent.toLowerCase();
            const ten = row.cells[3].textContent.toLowerCase();
            const nguoi = row.cells[6].textContent.toLowerCase();
            const ngay = row.cells[5].textContent;

            const match =
                maNB.includes(valMaNB) &&
                maHS.includes(valMaHS) &&
                ten.includes(valTen) &&
                nguoi.includes(valNguoi) &&
                (!valNgay || ngay === valNgay);

            row.style.display = match ? '' : 'none';
            if (match) matchCount++;
        });

    }

    // Gắn sự kiện
    [searchMaNB, searchMaHS, searchTen, searchNguoiTiep, searchNgayTiep].forEach(input =>
        input.addEventListener("input", filterTable)
    );
    loadDanhSachTiepDon();
  
    
});


// FUNCTION: Chi tiết người bệnh
function LoadChitietTiepdon() {
    const rows = document.querySelectorAll("#tableTiepDon tbody tr");

    rows.forEach(row => {
        row.style.cursor = "pointer";

        row.addEventListener("click", function () {
          
            const maHS = row.cells[2].textContent.trim();
            if (maHS) {
                window.location.href = `/Tiepdon/Chitietnbtiepdon?maHS=${encodeURIComponent(maHS)}`;
            }
        });
    });
}
// FUNCTION: Load Danh sách người bệnh đã tiếp đón
async function loadDanhSachTiepDon() {
    try {
        const response = await fetch('/Tiepdon/Laydanhsachbndatiepdon')

        if (!response.ok) {
            const error = await response.json();
            console.error("❌ Lỗi khi tải danh sách tiếp đón:", error.message || error.detail);
            alert("Không thể tải danh sách tiếp đón.");
            return;
        }

        const data = await response.json();

        const tbody = document.querySelector('#tableTiepDon tbody');
        tbody.innerHTML = ''; // Xóa dữ liệu cũ

        data.forEach((item, index) => {
            const tr = document.createElement('tr');

            const namSinh = item.ngay_sinh ? new Date(item.ngay_sinh).getFullYear() : '';
            const ngayTiep = item.ngay_tiep_don
                ? new Date(item.ngay_tiep_don).toLocaleDateString('vi-VN')
                : '';

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.ma_nguoi_benh || ''}</td>
                <td>${item.ma_dot_kham || ''}</td>
                <td>${item.ten_nguoi_benh || ''}</td>
                <td>${namSinh}</td>
                <td>${ngayTiep}</td>
                <td>${item.ten_nhan_vien_tiep_don || ''}</td>
                <td><span class="badge bg-success">Đã tiếp đón</span></td>
            `;

            tbody.appendChild(tr);
        });
        LoadChitietTiepdon();
    } catch (error) {
        console.error("❌ Lỗi kết nối tới Supabase:", error);
        alert("Không thể kết nối tới máy chủ.");
    }
}
