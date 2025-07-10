let currentMaPhieuIn = null;
let currentLoaiIn = null;
// FUNCTION THU TẠM TỨNG
async function ThuTamTung(sotien, mahoso) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("❌ Không tìm thấy token đăng nhập.");
        return;
    }

    const tienFormatted = Number(sotien).toLocaleString('vi-VN');
    const xacNhan = confirm(`💰 Mã đợt khám: ${mahoso}\nSố tiền cần thu: ${tienFormatted} đ\n\nBạn có chắc chắn muốn thu tạm ứng?`);

    if (!xacNhan) return;

    try {
        const response = await fetch('/ThuNgan/ThuTamUng', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                ma_dot_kham: mahoso,
                so_tien: Number(sotien)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Thu tạm ứng thất bại:", result);
            alert(`❌ Lỗi: ${result.message || 'Không thể thu tạm ứng.'}`);
            return;
        }

        alert(`✅ ${result.r_message || 'Thu tạm ứng thành công.'}`);
        window.location.href = `/Thungan/chitiettamung?maHS=${encodeURIComponent(mahoso)}`;
    } catch (err) {
        console.error("❌ Lỗi kết nối khi thu tạm ứng:", err);
        alert("❌ Không thể kết nối tới máy chủ.");
    }
}
// FUNCTION HOÀN TẠM ỨNG
async function HoanTamUng(maphieuthu) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("❌ Không tìm thấy token đăng nhập.");
        return;
    }
    const xacNhan = confirm(`Xác nhận hoàn cho phiếu thu: ${maphieuthu}`);

    if (!xacNhan) return;

    try {
        const response = await fetch('/ThuNgan/HoanTamUng', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                ma_phieu_thu_tam_ung: maphieuthu
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Hoàn tạm ứng thất bại:", result);
            alert(`❌ Lỗi: ${result.message || 'Không thể Hoàn tạm ứng.'}`);
            return;
        }

        alert(`✅ ${result.r_message || 'Hoàn tạm ứng thành công.'}`);
    } catch (err) {
        console.error("❌ Lỗi kết nối khi thu tạm ứng:", err);
        alert("❌ Không thể kết nối tới máy chủ.");
    }
}

// FUNCTION THU TẠM TỨNG KHÁC
function ThuTamTungKhac(maDotKham) {
    const sotien = document.getElementById('soTienThu').value.trim();
    const mahoso = maDotKham;

    if (!sotien || isNaN(sotien) || Number(sotien) <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ.");
        return;
    }
    ThuTamTung(sotien, mahoso)
    document.getElementById('soTienThu').value = "";
    document.getElementById('lyDoThu').value = "";
}



// FUNCTION In Phiếu HTMl
function InHtml(main) {
    currentMaPhieuIn = null;
    currentLoaiIn = null;

    const iframe = document.getElementById("iframePhieuIn");

    // Hiển thị trạng thái đang tải trong iframe
    iframe.srcdoc = `
        <div style="font-family: Arial; padding: 20px; text-align: center;">
            <i class="fa-solid fa-spinner fa-spin me-2 text-muted"></i> Đang tải phiếu <strong id="maPhieuIn">${main}</strong>...
        </div>
    `;

    if (main === 'lich_su_tam_ung') {
        displayText = 'Lịch sử tạm ứng';
        currentLoaiIn = 'lich_su';

        // Nếu có endpoint riêng cho in lịch sử, gọi fetch tại đây
        iframe.srcdoc = `<div class="p-4 text-muted text-center">Tính năng in lịch sử chưa được triển khai.</div>`;
    }
    else if (main.startsWith('pt-')) {
        const ma = parseInt(main.slice(3));
        if (isNaN(ma)) {
            alert("Mã phiếu không hợp lệ.");
            return;
        }

        currentMaPhieuIn = ma;
        currentLoaiIn = 'phieu_thu';
        displayText = `Phiếu thu #${ma}`;

        const payload = LayThongTinPhieuThuTamUng(ma);
        if (!payload) {
            iframe.srcdoc = `<div class="p-4 text-danger text-center fw-bold">Không lấy được dữ liệu phiếu thu.</div>`;
            return;
        }

        fetch("/Thungan/InPhieuTamUng", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/html"
            },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi khi gọi controller InPhieuTamUng");
                return res.text();
            })
            .then(html => {
                iframe.srcdoc = html;
            })
            .catch(err => {
                iframe.srcdoc = `<div class="p-4 text-danger fw-bold">Lỗi khi in phiếu: ${err.message}</div>`;
            });
    }
    else {
        alert("Loại in không được hỗ trợ.");
        return;
    }


    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('modalInPhieu'));
    modal.show();
}

//Lấy thông tin để in phiếu tạm ứng
function LayThongTinPhieuThuTamUng(MaPhieu) {
    const rows = document.querySelectorAll("#thuTamUng tbody tr");

    let soTien = "", ngayThu = "", tenNguoiThu = "";

    for (const row of rows) {
        const maPhieuCell = row.querySelector("td:nth-child(2)");
        if (!maPhieuCell) continue;

        const maPhieuText = maPhieuCell.innerText.trim();
        if (maPhieuText === String(MaPhieu)) {
            soTien = row.querySelector("td:nth-child(3)")?.innerText.trim() || "";
            ngayThu = row.querySelector("td:nth-child(4)")?.innerText.trim() || "";
            tenNguoiThu = row.querySelector("td:nth-child(5)")?.innerText.trim() || "";
            break;
        }
    }

    if (!soTien) {
        console.warn("Không tìm thấy phiếu thu với mã:", MaPhieu);
        return null;
    }

    const getValueByLabel = (labelText) => {
        const labels = document.querySelectorAll(".label");
        for (const label of labels) {
            if (label.innerText.trim() === labelText) {
                const valueSpan = label.nextElementSibling;
                return valueSpan ? valueSpan.innerText.trim() : "";
            }
        }
        return "";
    };

    const payload = {
        ma_nguoi_benh: getValueByLabel("Mã BN:"),
        ma_dot_kham: getValueByLabel("Mã HS:"),
        ho_ten: getValueByLabel("Họ tên:"),
        gioi_tinh: convertGioiTinh(getValueByLabel("Giới tính:")),
        ngay_sinh: toNgayVN(getValueByLabel("Ngày sinh:")),
        dia_chi: getValueByLabel("Địa chỉ:"),
        so_tien_tam_ung: soTien,
        ngay_thu: toNgayVN(ngayThu),
        ten_nguoi_thu: tenNguoiThu
    };

    console.log("📄 Dữ liệu in phiếu:", payload);
    return payload;
}

function convertGioiTinh(gioiTinhRaw) {
    const value = gioiTinhRaw?.trim().toUpperCase();
    if (value === "M") return "Nam";
    if (value === "F") return "Nữ";
    return value || "";
}

function toNgayVN(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr; // fallback nếu không parse được
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

//Thực hiện in PDF
function ThucHienInPhieu() {
    const iframe = document.getElementById("iframePhieuIn");
    if (!iframe || !iframe.contentWindow) {
        console.error("Không tìm thấy iframe hoặc iframe chưa sẵn sàng.");
        return;
    }

    // Lấy nội dung của iframe
    const iframeWindow = iframe.contentWindow;

    // In nội dung trong iframe
    iframeWindow.focus();  // đảm bảo iframe được focus trước khi in
    iframeWindow.print();

    // Ẩn modal sau khi gọi in
    const modalElement = document.getElementById('modalInPhieu');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();

    // Reset biến toàn cục nếu cần
    currentMaPhieuIn = null;
}
