let tongTien = 0;
const dichVuDaChon = [];

// INIT --------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    LoadDanhSachDichVu();
});


//FUNCTION ------------------------------------------------------------------------------------------------------------
//THÊM DỊCH VỤ
function themDichVu(dv) {
    // Kiểm tra trùng
    if (dichVuDaChon.some(item => item.ma_dich_vu === dv.ma_dich_vu)) {
        alert("Người bệnh đã được kê dịch vụ này");
        return;
    }
       
    dichVuDaChon.push(dv);
    renderBangDichVu();
}

//XÓA DỊCH VỤ
function xoaDichVu(ma) {
    const index = dichVuDaChon.findIndex(dv => dv.ma_dich_vu === ma);
    if (index !== -1) {
        dichVuDaChon.splice(index, 1);
        renderBangDichVu();
    }
}

//LỌC DỊCH VỤ
function locDichVu() {
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const items = document.querySelectorAll('.dich-vu-item');
    items.forEach(item => {
        const ma = item.dataset.ma.toLowerCase();
        const ten = item.dataset.ten.toLowerCase();
        const match = ma.includes(keyword) || ten.includes(keyword);
        item.style.display = match ? 'table-row' : 'none';
    });
}

//RENDER BẢNG DỊCH VỤ ĐÃ CHỌN
function renderBangDichVu() {
    const tbody = document.getElementById("bangDichVuDaChon");
    tbody.innerHTML = "";

    const mucHuongEl = document.getElementById("muchuong");
    const theBHYTEl = document.getElementById("thebhyt");

    let mucHuong = 0;
    if (theBHYTEl && theBHYTEl.textContent.trim() !== "" &&
        mucHuongEl && mucHuongEl.textContent.includes(":")) {
        const phanTram = mucHuongEl.textContent.split(":")[1].trim();
        mucHuong = parseFloat(phanTram);
    }

    let tongTien = 0;
    let tienBH = 0;

    dichVuDaChon.forEach((dv, index) => {
        tongTien += dv.don_gia;

        let giam = 0;
        if (dv.thanh_toan === 'BH' && mucHuong > 0) {
            giam = dv.don_gia * mucHuong / 100;
            tienBH += giam;
        }

        const thanhTien = dv.don_gia - giam;

        // Build select options for bác sĩ
        let bacSiOptions = `<option value="">-- Chọn bác sĩ --</option>`;
        if (Array.isArray(dv.cac_bac_si_thuc_hien)) {
            bacSiOptions += dv.cac_bac_si_thuc_hien
                .map(bs => `<option value="${bs.ma_nhan_vien}">${bs.ho_ten}</option>`)
                .join("");
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${dv.ma_dich_vu}</td>
            <td>${dv.ten_dich_vu}</td>
            <td>${dv.don_gia.toLocaleString()}</td>
            <td value="${dv.ma_phong}">${dv.ten_phong}</td>
            <td>${dv.thanh_toan}</td>
            <td value="${dv.ma_dich_vu}">${thanhTien.toLocaleString()}</td>
            <td>
                <select class="form-select form-select-sm" name="bac_si_thuc_hien_${dv.ma_dich_vu}">
                    ${bacSiOptions}
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="xoaDichVu(${dv.ma_dich_vu})">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    const tuTuc = tongTien - tienBH;

    document.getElementById("tongTien").textContent = tongTien.toLocaleString();
    document.getElementById("tienBH").textContent = tienBH.toLocaleString();
    document.getElementById("tuTuc").textContent = tuTuc.toLocaleString();
}

//TẠO PAYLOAD REQUEST
function taoPayloadKeDichVu(maDotKham) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return [];
    }

    const tbody = document.getElementById("bangDichVuDaChon");
    if (!tbody) {
        alert("Không tìm thấy bảng dịch vụ đã chọn.");
        return [];
    }

    const rows = tbody.querySelectorAll("tr");
    const payloads = [];
    let chuaChonBacSi = null;

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 6) return;

        const ma_dich_vu = parseInt(cells[0].textContent.trim());
        const ten_dich_vu = cells[1].textContent.trim();
        const don_gia_text = cells[2].textContent.replace(/[^\d]/g, "");
        const don_gia = parseInt(don_gia_text) || 0;

        const tdPhong = cells[3];
        const p_ma_phong = parseInt(tdPhong.getAttribute("value")) || null;

        const thanh_toan = cells[4].textContent.trim();
        const thanh_tien_text = cells[5].textContent.replace(/[^\d]/g, "");
        const thanh_tien = parseInt(thanh_tien_text) || 0;

        const select = row.querySelector("select");
        const ma_bac_si = select ? parseInt(select.value) || null : null;

        if (ma_bac_si === null) {
            chuaChonBacSi = ten_dich_vu;
            return;
        }

        payloads.push({
            p_token: token,
            p_ma_dot_kham: maDotKham,
            p_ma_dich_vu: ma_dich_vu,
            p_ma_bac_si: ma_bac_si,
            p_ma_phong: p_ma_phong,
            p_don_gia_thuc_the: thanh_tien
        });
    });

    if (chuaChonBacSi) {
        alert(`Vui lòng chọn bác sĩ thực hiện cho dịch vụ: "${chuaChonBacSi}"`);
        return [];
    }

    console.log("Payload kê dịch vụ:", payloads);

    if (payloads.length > 0) {
        const success =  apiKeDichVu(payloads);
        if (success) {
            alert("✅ Kê dịch vụ thành công.");
        } else {
            alert("❌ Có lỗi xảy ra khi kê một số dịch vụ.");
        }
    }
}


//LẤY DANH SÁCH DỊCH VỤ TỪ DATABASE
async function LoadDanhSachDichVu() {
    try {
        const result = await LayDanhSachDichVu();

        if (result[0]?.r_status === "SUCCESS") {
            const danhSach = result[0].r_data;
            renderDanhSachDichVu(danhSach);
        } else {
            console.error("Không lấy được danh sách dịch vụ:", result[0]?.r_message);
        }
    } catch (err) {
        console.error("Lỗi khi gọi API:", err);
     
    }
}

//RENDER DANH SÁCH DỊCH VỤ TỪ DATABASE
function renderDanhSachDichVu(ds) {
    const tbody = document.getElementById("danhSachDichVu");
    tbody.innerHTML = "";

    ds.forEach(dv => {
        const row = document.createElement("tr");
        row.classList.add("dich-vu-item");
        row.dataset.ma = dv.ma_dich_vu;
        row.dataset.ten = dv.ten_dich_vu;

        row.innerHTML = `
    <td>${dv.ma_dich_vu}</td>
    <td>${dv.ten_dich_vu}</td>
    <td>${dv.don_gia.toLocaleString()}</td>
    <td>${dv.ten_phong}</td>
    <td>${dv.thanh_toan}</td>
    <td>
        <button class="btn btn-sm btn-success"
            onclick="themDichVu({
                ma_dich_vu: ${dv.ma_dich_vu},
                ten_dich_vu: '${dv.ten_dich_vu.replace(/'/g, "\\'")}',
                don_gia: ${dv.don_gia},
                thanh_toan: '${dv.thanh_toan}',
                ten_phong: '${dv.ten_phong.replace(/'/g, "\\'")}',
                ma_phong: ${dv.phong_thuc_hien},
                cac_bac_si_thuc_hien: ${JSON.stringify(dv.cac_bac_si_thuc_hien).replace(/"/g, '&quot;')}
            })">
            <i class="fa fa-plus"></i>
        </button>
    </td>
`;


        tbody.appendChild(row);
    });
}
