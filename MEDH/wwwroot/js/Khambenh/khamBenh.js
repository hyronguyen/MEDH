document.addEventListener("DOMContentLoaded", function () {
    Queuecheck();
    const ngaykeInput = document.getElementById('ngayke');
    const today = new Date();

    // Định dạng ngày theo chuẩn yyyy-mm-dd
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Tháng từ 0-11 nên +1
    const dd = String(today.getDate()).padStart(2, '0');

    ngaykeInput.value = `${yyyy}-${mm}-${dd}`;

 
});

// VARIBLES ------------------------------------------------------------------------------------

const input = document.getElementById('icd-input');
const input_des = document.getElementById('icd-desc-input');
const suggestionsBox = document.getElementById('icd-suggestions');
const tabs = document.querySelectorAll('.kb-tab');
const sections = document.querySelectorAll('.kb-col.kb-col-center');    

const popup = document.getElementById('popupDichVu');
const listDichVuBody = document.querySelector('#listDichVu tbody');
const filterInput = document.getElementById('filterDichVu');
const dsDichVuBody = document.querySelector('#dsDichVu tbody');


// Sau này đổ dữ liệu vào đây
const dichVuCoSan = [
    { ten: "Siêu âm bụng tổng quát", gia: 500000, phong: "Phòng siêu âm 1", loai: "CDHA" },
    { ten: "Xét nghiệm máu", gia: 150000, phong: "Phòng xét nghiệm", loai: "Xét nghiệm" },
    { ten: "Chụp X-quang ngực", gia: 300000, phong: "Phòng X-quang 2", loai: "CDHA" },
    { ten: "Điện tim (ECG)", gia: 200000, phong: "Phòng điện tim", loai: "CDHA" },
    { ten: "Test nhanh COVID-19", gia: 250000, phong: "Phòng xét nghiệm", loai: "Xét nghiệm" },
    { ten: "Khám chuyên khoa nội", gia: 100000, phong: "Phòng khám nội", loai: "Dịch vụ khám" },
    { ten: "Khám chuyên khoa ngoại", gia: 120000, phong: "Phòng khám ngoại", loai: "Dịch vụ khám" },
    { ten: "Đo điện não", gia: 400000, phong: "Phòng điện não", loai: "CDHA" },
    { ten: "Nội soi dạ dày", gia: 700000, phong: "Phòng nội soi", loai: "CDHA" },
    { ten: "Siêu âm tim", gia: 550000, phong: "Phòng siêu âm tim", loai: "CDHA" },
    { ten: "Xét nghiệm nước tiểu", gia: 130000, phong: "Phòng xét nghiệm", loai: "Xét nghiệm" },
];


const dsDichVu = [];




// FUCNTION CỦA THÔNG TIN KHÁM------------------------------------------------------------------------------------

    // ACtive button khi click
    document.querySelectorAll('.kb-tab-list .kb-tab').forEach(button => {
    button.addEventListener('click', () => {
        // Bỏ active của tất cả button
        document.querySelectorAll('.kb-tab-list .kb-tab').forEach(btn => btn.classList.remove('active'));
        // Thêm active cho button được click
        button.classList.add('active');
    });
});

    // Kiểm tra hàng đợi
    function Queuecheck() {
    const statusButtons = document.querySelectorAll(".kb-status-btn");
    const patientList = document.getElementById("patient-list");
    const patientListContent = document.getElementById("patient-list-content");

    const data = {
        "Chờ khám": ["Nguyễn Văn A", "Lê Thị B", "Trần Văn C"],
        "Đã khám": ["Phạm Thị D", "Ngô Văn E"],
        "Chưa kết luận": ["Huỳnh Tấn F", "Đỗ Thị G", "Mai Văn H"],
        "Đã kết luận": ["Lê Hữu I", "Trần Thị J", "Nguyễn Văn K", "Phạm Hữu L"],
        "Chưa lĩnh thuốc": ["Bùi Thị M", "Đinh Văn N"]
    };

    statusButtons.forEach(button => {
        button.addEventListener("click", function () {
            const label = this.innerText.split(":")[0];

            // Toggle ẩn nếu click lại cùng nút
            if (patientList.style.display === "block" && patientList.previousClicked === this) {
                patientList.style.display = "none";
                return;
            }

            // Cập nhật nội dung
            const list = data[label] || [];
            patientListContent.innerHTML = list.map(name => `<li>${name}</li>`).join("");

            // Lấy vị trí nút được click
            const rect = this.getBoundingClientRect();

            // Đặt vị trí tuyệt đối theo tọa độ
            patientList.style.top = `${rect.bottom + window.scrollY}px`;
            patientList.style.left = `${rect.left + window.scrollX}px`;

            // Hiển thị bảng
            patientList.style.display = "block";
            patientList.previousClicked = this;
        });
    });


    document.addEventListener("click", function (e) {
        if (!patientList.contains(e.target) && ![...statusButtons].some(btn => btn.contains(e.target))) {
            patientList.style.display = "none";
        }
    });
}

    // Lấy mã ICD
    input.addEventListener('input', async () => {
        const query = input.value.trim();
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`/api/ICD/${encodeURIComponent(query)}`);
            const data = await response.json();

            const list = data.Search || [];
            if (list.length === 0) {
                suggestionsBox.style.display = 'none';
                return;
            }

            suggestionsBox.innerHTML = list.map(item =>
                `<div class="suggestion-item" data-code="${item.Name}" data-desc="${item.Description}">
        <strong>${item.Name}</strong> - ${item.Description}
    </div>`
            ).join('');

            suggestionsBox.style.display = 'block';
        } catch (error) {
            console.error("ICD fetch error:", error);
            suggestionsBox.style.display = 'none';
        }
    });

    // Fill khi người dùng chọn gợi ý
    suggestionsBox.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            input.value = item.getAttribute('data-code');
            input_des.value = item.getAttribute('data-desc');
            suggestionsBox.style.display = 'none';
        }
    });

    // Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!suggestionsBox.contains(e.target) && e.target !== input) {
            suggestionsBox.style.display = 'none';
        }
    });

    // Đóng hồ sơ
    document.querySelector('.kb-util-btn-closehs').addEventListener('click', function () {
        if (!kiemTraTruocKhiDongHoSo()) return;

        const section = document.getElementById('thongtinkhambenh');
        const inputs = section.querySelectorAll('input, textarea');
        const data = {};

        inputs.forEach((el, index) => {
            const labelEl = el.closest('label')?.innerText?.split(':')[0]?.trim() ||
                el.closest('.form-group')?.querySelector('label')?.innerText?.split(':')[0]?.trim() ||
                `field_${index}`;

            data[labelEl] = el.value.trim();
        });

        alert("Đóng hồ sơ thành công");
        console.log(data);
    });


    // Kiểm tra các trường bắt buộc trước khi đóng hồ sơ
    function kiemTraTruocKhiDongHoSo() {
        const requiredFields = [
            'mach', 'nhietDo', 'huyetAp', 'nhipTho',
            'benhSu', 'lyDoKham', 'dienBien', 'icd-desc-input', 'icd-input'
        ];

        let isValid = true;
        let firstInvalidField = null;

        requiredFields.forEach(id => {
            const field = document.getElementById(id);
            if (!field) {
                console.warn(`Không tìm thấy trường có id: ${id}`);
                return;
            }

            const group = field.closest('.form-group');
            if (field.value.trim() === "") {
                isValid = false;
                if (group) group.classList.add('is-invalid');
                if (!firstInvalidField) firstInvalidField = field;
            } else {
                if (group) group.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc trước khi đóng hồ sơ.");
            if (firstInvalidField) firstInvalidField.focus();
        }

        return isValid;
    }

    // Đổi tab chức năng (Màn hình tao tác chính)
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Bỏ class active khỏi tất cả tab
            tabs.forEach(t => t.classList.remove('active'));
            // Thêm class active vào tab đang chọn
            tab.classList.add('active');

            // Lấy ID mục tiêu
            const targetId = tab.getAttribute('data-target');

            // Ẩn tất cả các section
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Hiện section tương ứng
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });

// FUCNTION CỦA KÊ DỊCH VỤ-----------------------------------------------------------------------------------

    // Mở popup khi click input
    document.getElementById('timDichVu').addEventListener('click', openPopup);

    // Render danh sách dịch bụ
    function renderListDichVu(filter = '') {
        const filterLower = filter.toLowerCase();
        listDichVuBody.innerHTML = '';

        const filtered = dichVuCoSan.filter(dv =>
            dv.ten.toLowerCase().includes(filterLower) ||
            dv.loai.toLowerCase().includes(filterLower)
        );

        if (filtered.length === 0) {
            listDichVuBody.innerHTML = '<tr><td colspan="4" style="padding: 8px;">Không tìm thấy dịch vụ</td></tr>';
            return;
        }

        filtered.forEach(dv => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => {
                themDichVuVaoDanhSach(dv);
                closePopup();
            });

            tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${dv.ten}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${dv.loai}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${dv.gia.toLocaleString()}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${dv.phong}</td>
            `;
            listDichVuBody.appendChild(tr);
        });
    }


    filterInput.addEventListener('input', (e) => {
        renderListDichVu(e.target.value);
    });

    function openPopup() {
        popup.style.display = 'block';
        filterInput.value = '';
        renderListDichVu();
        filterInput.focus();
    }

    function closePopup() {
        popup.style.display = 'none';
    }

    function themDichVuVaoDanhSach(dv) {
        if (dsDichVu.some(d => d.ten === dv.ten && d.phong === dv.phong)) return;

        dsDichVu.push(dv);
        capNhatDanhSach();
    }


    function themDichVuTuPopup() {
        openPopup();
    }

    function xoaDichVu(index) {
        dsDichVu.splice(index, 1);
        capNhatDanhSach();
    }


    function capNhatDanhSach() {
        const dsDichVuBody = document.querySelector("#dsDichVu tbody");
        dsDichVuBody.innerHTML = '';

        dsDichVu.forEach((dv, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 8px; color: black; font-weight:600">${dv.ten}</td>
                <td style="padding: 8px;">${dv.loai || ''}</td> 
                <td style="padding: 8px; text-align: right;">${dv.gia.toLocaleString()}</td>
                <td style="padding: 8px;">${dv.phong}</td>
                <td style="text-align: center;">
                    <button onclick="xoaDichVu(${i})" style="background-color: transparent; border: none; cursor: pointer; color: grey;">
                        <i class="fa fa-minus"></i>
                    </button>
                </td>
            `;
            dsDichVuBody.appendChild(tr);
        });
    }


    function luuChiDinh() {
        if (dsDichVu.length === 0) {
            alert('Vui lòng thêm ít nhất một dịch vụ');
            return;
        }
        // Thông báo tạm thời
        let ds = dsDichVu.map(dv => `${dv.ten} - ${dv.gia.toLocaleString()} VNĐ - ${dv.phong}`).join('\n');
        alert('Đã lưu chỉ định:\n' + ds);
        // TODO: Gửi dữ liệu lên server
    }

// FUCNTION CỦA ĐƠN THUỐC------------------------------------------------------------------------------------

const danhSachThuoc = [
    { ma: "T001", ten: "Paracetamol 500mg", gia: 5000, ton: 100 },
    { ma: "T002", ten: "Amoxicillin 250mg", gia: 12000, ton: 50 },
    { ma: "T003", ten: "Vitamin C 1000mg", gia: 8000, ton: 75 },
    { ma: "T004", ten: "Ibuprofen 400mg", gia: 9000, ton: 60 },
    { ma: "T005", ten: "Metformin 500mg", gia: 15000, ton: 40 },
    { ma: "T006", ten: "Loratadine 10mg", gia: 7000, ton: 30 },
    { ma: "T007", ten: "Omeprazole 20mg", gia: 20000, ton: 25 },
    { ma: "T008", ten: "Captopril 25mg", gia: 10000, ton: 45 },
    { ma: "T009", ten: "Simvastatin 20mg", gia: 18000, ton: 20 },
    { ma: "T010", ten: "Cetirizine 10mg", gia: 6000, ton: 80 },
];

const ngaykeInput = document.getElementById('ngayke');
const ngaydenInput = document.getElementById('ngayden');
const songayInput = document.getElementById('songay');

function tinhSoNgay() {
    const ngayke = new Date(ngaykeInput.value);
    const ngayden = new Date(ngaydenInput.value);

    if (!ngaykeInput.value || !ngaydenInput.value) {
        songayInput.value = '';
        return;
    }

    if (ngayden >= ngayke) {
        const diffTime = ngayden - ngayke;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        songayInput.value = diffDays;
    } else {
        songayInput.value = '';
    }
}

ngaykeInput.addEventListener('change', tinhSoNgay);
ngaydenInput.addEventListener('change', tinhSoNgay);

const tbodyDanhSachThuoc = document.getElementById('tbodyDanhSachThuoc');
const tbodyThuocDaChon = document.getElementById('thuoc-da-chon');

let thuocDaChon = new Map();

function loadDanhSachThuoc(filter = "") {
    tbodyDanhSachThuoc.innerHTML = "";

    const filteredThuoc = danhSachThuoc.filter(thuoc =>
        thuoc.ma.toLowerCase().includes(filter.toLowerCase()) ||
        thuoc.ten.toLowerCase().includes(filter.toLowerCase())
    );

    filteredThuoc.forEach(thuoc => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
      <td>${thuoc.ma}</td>
      <td>${thuoc.ten}</td>
      <td>${thuoc.gia.toLocaleString('vi-VN')} đ</td>
      <td>${thuoc.ton}</td>
      <td><input type="checkbox" class="chkChonThuoc" 
          data-mathu="${thuoc.ma}" 
          data-tenthuoc="${thuoc.ten}" 
          data-gia="${thuoc.gia}" 
          data-ton="${thuoc.ton}"></td>
    `;
        tbodyDanhSachThuoc.appendChild(tr);
    });
}

// Dùng event delegation cho checkbox thuốc bên trái popup
tbodyDanhSachThuoc.addEventListener('change', e => {
    if (!e.target.classList.contains('chkChonThuoc')) return;

    const cb = e.target;
    const mathuoc = cb.dataset.mathu;
    const tenthuoc = cb.dataset.tenthuoc;
    const gia = parseInt(cb.dataset.gia);
    const ton = parseInt(cb.dataset.ton);

    if (cb.checked) {
        if (!thuocDaChon.has(mathuoc)) {
            thuocDaChon.set(mathuoc, {
                mathuoc,
                tenthuoc,
                gia,
                ton,
                sang: 0,
                chieu: 0,
                toi: 0,
                ghichu: ''
            });
        }
    } else {
        thuocDaChon.delete(mathuoc);
    }
    renderThuocDaChon();
});

// Render thuốc đã chọn bên phải popup
function renderThuocDaChon() {
    tbodyThuocDaChon.innerHTML = '';

    const soNgay = parseInt(songayInput.value) || 1;

    thuocDaChon.forEach(item => {
        const slTong = (item.sang + item.chieu + item.toi) * soNgay;

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${item.mathuoc}</td>
      <td>${item.tenthuoc}</td>
      <td><input type="number" min="0" value="${item.sang}" class="form-control form-control-sm input-sang" data-mathu="${item.mathuoc}"></td>
      <td><input type="number" min="0" value="${item.chieu}" class="form-control form-control-sm input-chieu" data-mathu="${item.mathuoc}"></td>
      <td><input type="number" min="0" value="${item.toi}" class="form-control form-control-sm input-toi" data-mathu="${item.mathuoc}"></td>
      <td>${slTong}</td>
      <td><input type="text" class="form-control form-control-sm input-ghichu" value="${item.ghichu}" data-mathu="${item.mathuoc}"></td>
      <td><button class="btn btn-danger btn-sm btn-xoa-popup" data-mathu="${item.mathuoc}">&times;</button></td>
    `;
        tbodyThuocDaChon.appendChild(tr);
    });

    // Gán lại event cho các input số lượng và ghi chú
    addEventListenersThuocDaChon();
}

function addEventListenersThuocDaChon() {
    // Sáng
    tbodyThuocDaChon.querySelectorAll('.input-sang').forEach(input => {
        input.onchange = e => {
            const mathuoc = e.target.dataset.mathu;
            const val = parseInt(e.target.value);
            if (val >= 0) {
                const item = thuocDaChon.get(mathuoc);
                item.sang = val;
                thuocDaChon.set(mathuoc, item);
                renderThuocDaChon();
            }
        };
    });

    // Chiều
    tbodyThuocDaChon.querySelectorAll('.input-chieu').forEach(input => {
        input.onchange = e => {
            const mathuoc = e.target.dataset.mathu;
            const val = parseInt(e.target.value);
            if (val >= 0) {
                const item = thuocDaChon.get(mathuoc);
                item.chieu = val;
                thuocDaChon.set(mathuoc, item);
                renderThuocDaChon();
            }
        };
    });

    // Tối
    tbodyThuocDaChon.querySelectorAll('.input-toi').forEach(input => {
        input.onchange = e => {
            const mathuoc = e.target.dataset.mathu;
            const val = parseInt(e.target.value);
            if (val >= 0) {
                const item = thuocDaChon.get(mathuoc);
                item.toi = val;
                thuocDaChon.set(mathuoc, item);
                renderThuocDaChon();
            }
        };
    });

    // Ghi chú
    tbodyThuocDaChon.querySelectorAll('.input-ghichu').forEach(input => {
        input.oninput = e => {
            const mathuoc = e.target.dataset.mathu;
            const val = e.target.value;
            const item = thuocDaChon.get(mathuoc);
            item.ghichu = val;
            thuocDaChon.set(mathuoc, item);
        };
    });

    // Xóa thuốc popup
    tbodyThuocDaChon.querySelectorAll('.btn-xoa-popup').forEach(btn => {
        btn.onclick = e => {
            const mathuoc = e.target.dataset.mathu;
            thuocDaChon.delete(mathuoc);

            // Đồng bộ checkbox bên trái popup
            const checkbox = tbodyDanhSachThuoc.querySelector(`input.chkChonThuoc[data-mathu="${mathuoc}"]`);
            if (checkbox) checkbox.checked = false;

            renderThuocDaChon();
        };
    });
}

// Tìm kiếm thuốc bên trái popup
const timKiemThuocInput = document.getElementById('timKiemThuoc');
timKiemThuocInput.addEventListener('input', e => {
    loadDanhSachThuoc(e.target.value);

    // Đồng bộ checkbox đã chọn sau khi load
    setTimeout(() => {
        thuocDaChon.forEach((value, key) => {
            const cb = tbodyDanhSachThuoc.querySelector(`input.chkChonThuoc[data-mathu="${key}"]`);
            if (cb) cb.checked = true;
        });
    }, 100);
});

// Nút lưu thuốc trong popup, thêm thuốc đã chọn ra bảng ngoài
const btnLuuThuoc = document.getElementById('luu-thuoc');
const tbodyDanhSachThuocChonNgoai = document.querySelector('#danhsach-thuoc-chon tbody');

btnLuuThuoc.onclick = () => {
    tbodyDanhSachThuocChonNgoai.innerHTML = '';

    thuocDaChon.forEach(item => {
        const tr = document.createElement('tr');

        const soNgay = Number(document.getElementById('songay').value) || 1; // mặc định 1 nếu không có

        // Tính tổng liều trong ngày
        const tongLieuTrongNgay = Number(item.sang) + Number(item.chieu) + Number(item.toi);

        // Tính thành tiền
        const thanhTien = tongLieuTrongNgay * soNgay * Number(item.gia);

        // Format thành tiền kiểu VNĐ
        const thanhTienFormatted = thanhTien.toLocaleString('vi-VN') + ' đ';

        tr.innerHTML = `
      <td>${item.mathuoc}</td>
      <td>${item.tenthuoc}</td>
      <td>S:${item.sang} C:${item.chieu} T:${item.toi}</td>
      <td>${thanhTienFormatted}</td>
      <td><button class="btn btn-grey btn-sm btn-xoa-ngoai" data-mathu="${item.mathuoc}">&times;</button></td>
    `;
        tbodyDanhSachThuocChonNgoai.appendChild(tr);
    });

    // Đóng popup sau khi lưu
    const modal = bootstrap.Modal.getInstance(document.getElementById('popupThuoc'));
    modal.hide();
};


tbodyDanhSachThuocChonNgoai.addEventListener('click', e => {
    if (!e.target.classList.contains('btn-xoa-ngoai')) return;

    const mathuoc = e.target.dataset.mathu;
    // Xóa khỏi map, đồng thời bỏ chọn checkbox bên trái popup (nếu mở lại)
    thuocDaChon.delete(mathuoc);

    // Xóa row khỏi bảng ngoài
    e.target.closest('tr').remove();


    const checkbox = tbodyDanhSachThuoc.querySelector(`input.chkChonThuoc[data-mathu="${mathuoc}"]`);
    if (checkbox) checkbox.checked = false;

    // Cập nhật lại popup thuốc đã chọn nếu popup đang mở
    renderThuocDaChon();
});


const popupThuoc = document.getElementById('popupThuoc');
popupThuoc.addEventListener('show.bs.modal', () => {
    loadDanhSachThuoc();
    // Sau khi load, check những thuốc đã chọn
    setTimeout(() => {
        thuocDaChon.forEach((value, key) => {
            const cb = tbodyDanhSachThuoc.querySelector(`input.chkChonThuoc[data-mathu="${key}"]`);
            if (cb) cb.checked = true;
        });
        renderThuocDaChon();
    }, 100);
});

document.getElementById('btn-luu-donthuoc').addEventListener('click', function () {
    // Lấy giá trị các trường
    const ngayKe = document.getElementById('ngayke').value;
    const ngayDen = document.getElementById('ngayden').value;
    const soNgay = document.getElementById('songay').value;
    const ghiChu = document.getElementById('ghichu').value;

    // Lấy danh sách thuốc đã chọn từ bảng #danhsach-thuoc-chon tbody
    // Giả sử mỗi dòng thuốc có các cột: Mã, Tên, Cách dùng, Giá
    const thuocRows = document.querySelectorAll('#danhsach-thuoc-chon tbody tr');
    const danhSachThuoc = [];

    thuocRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
            danhSachThuoc.push({
                ma: cells[0].innerText.trim(),
                ten: cells[1].innerText.trim(),
                cachDung: cells[2].innerText.trim(),
                gia: cells[3].innerText.trim()
            });
        }
    });

    // Tạo đối tượng đơn thuốc
    const donThuoc = {
        ngayKe,
        ngayDen,
        soNgay,
        ghiChu,
        danhSachThuoc
    };

    // In ra console
    console.log('Đơn thuốc:', donThuoc);
});
