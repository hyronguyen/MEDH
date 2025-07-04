document.addEventListener("DOMContentLoaded", function () {


// Ke thuoc
    const ngaykeInput = document.getElementById('ngayke');
    const today = new Date();

    // Định dạng ngày theo chuẩn yyyy-mm-dd
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Tháng từ 0-11 nên +1
    const dd = String(today.getDate()).padStart(2, '0');

    ngaykeInput.value = `${yyyy}-${mm}-${dd}`;

    StartUp();
});

window.addEventListener("beforeunload", function () {
    if (location.pathname === "/Khambenh/Khambenhngoaitru") {
        localStorage.removeItem("ho_so_chi_tiet");
    }
});

// VARIBLES -----------------------------------------------------------------------------------------------------------------------

const input = document.getElementById('icd-input');
const input_des = document.getElementById('icd-desc-input');
const suggestionsBox = document.getElementById('icd-suggestions');
const tabs = document.querySelectorAll('.kb-tab');
const sections = document.querySelectorAll('.kb-col.kb-col-center');    


//Call API ĐỔ vào danh sách này
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

//Call API ĐỔ vào danh sách này
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


function StartUp() {
    const token = localStorage.getItem("token");

    if (!token || token.trim() === "") {
        window.location.href = "/Auth/Login";
        return;
    }
    const decoded = parseJwt(token);
    if (!decoded || !decoded.sub) {
        console.warn("Token không hợp lệ hoặc thiếu trường sub.");
        window.location.href = "/Auth/Login";
        return;
    }
    const sub = decoded.sub;
    PreLoadThongTinNB();
    LoadDanhSachphong(sub);
    ChonPhongKham(sub);
    InPhieu();
}


// FUNCTION: LẤY TOKEN
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
// FUNTION: LẤY NGƯỜI BỆNH TẠI PHÒNG
    async function LoadDanhSachkham(mabacsi, maphong) {
    try {
        const response = await fetch(`/Khambenh/Laydanhsachnguoibenhtaiphong?mabacsi=${mabacsi}&maPhong=${maphong}`);

        if (!response.ok) {
            const error = await response.json();
            console.error("Lỗi khi lấy danh sách khám:", error.detail || error.message);
            alert(`Không thể tải danh sách khám: ${error.message}`);
            return;
        }

        const danhSach = await response.json();
        Queuecheck(danhSach);
    } catch (err) {
        console.error("Lỗi hệ thống:", err);
        alert("Lỗi kết nối tới server.");
    }
}
// FUNCTION: LOAD DANH SÁCH PHÒNG KHÁM THUỘC BÁC SĨ
    async function LoadDanhSachphong(manhanvien) {
    try {
        const response = await fetch(`/Khambenh/Laydanhsachphongthuocbacsi?mabacsi=${manhanvien}`);

        if (!response.ok) {
            const error = await response.json();
            console.error("Lỗi khi lấy danh sách phòng:", error.detail || error.message);
            alert(`Không thể tải danh sách phòng: ${error.message}`);
            return;
        }

        const danhSach = await response.json();
        const phongList = danhSach.r_data;

        if (!Array.isArray(phongList) || phongList.length === 0) {
            alert("Không tìm thấy phòng khám nào.");
            return;
        }

        const select = document.getElementById("phong-kham-select");
        select.innerHTML = `<option value="">-- Chọn phòng khám --</option>`;

        phongList.forEach(phong => {
            const option = document.createElement("option");
            option.value = phong.ma_phong;
            option.textContent = phong.ten_phong;
            select.appendChild(option);
        });

        const storedMaPhong = localStorage.getItem("phong_dang_chon");
        const matched = phongList.find(p => p.ma_phong.toString() === storedMaPhong);

        const selectedPhong = matched || phongList[0]; // nếu không có trong local thì lấy đầu tiên
        select.value = selectedPhong.ma_phong;
        localStorage.setItem("phong_dang_chon", selectedPhong.ma_phong); // cập nhật lại (trường hợp fallback)

        LoadDanhSachkham(manhanvien, selectedPhong.ma_phong); 
    } catch (err) {
        console.error("Lỗi hệ thống:", err);
        alert("Lỗi kết nối tới server.");
    }
}
// FUNCTION CHỌN PHÒNG KHÁM
    function ChonPhongKham(mabacsi) {
    const select = document.getElementById("phong-kham-select");

    if (!select) {
        console.error("Không tìm thấy phần tử <select> có id='phong-kham-select'");
        return;
    }

    select.addEventListener("change", function () {
        const maPhong = this.value;
        if (maPhong) {
            localStorage.setItem("phong_dang_chon", maPhong); // Lưu phòng được chọn
            LoadDanhSachkham(mabacsi, maPhong);
        }
    });
}
// FUNCTION IN PHIẾU
    function InPhieu() {
        const popupPhieuIn = new bootstrap.Modal(document.getElementById("popupPhieuIn"));
        const contentDiv = document.querySelector("#popupPhieuIn .modal-body");

        document.querySelectorAll("#printContextMenu a").forEach(item => {
            item.addEventListener("click", function (e) {
                e.preventDefault();

                const value = this.getAttribute("value");

                // Hiển thị nội dung tạm (sau này sẽ là nội dung phiếu)
                contentDiv.innerHTML = `<div style="padding: 20px; font-weight: bold;">Bạn đã chọn in phiếu loại <span style="color:blue;">[${value}]</span></div>`;

                // Hiển thị modal
                popupPhieuIn.show();
            });
        });
    }
// FUNCTION PRE LOAD THÔNG TIN NGƯỜI BỆNH
function PreLoadThongTinNB() {
    const jsonScript = document.getElementById("json-data");
    const wrapper = document.getElementById("patient-info-wrapper");

    let data = null;

    if (jsonScript) {
        try {
            data = JSON.parse(jsonScript.textContent);
            if (data) {
                localStorage.setItem("ho_so_chi_tiet", JSON.stringify(data));
            }
        } catch (e) {
            console.error("Lỗi khi parse JSON:", e);
        }
    }

    if (!data) {
        const stored = localStorage.getItem("ho_so_chi_tiet");
        if (stored) {
            try {
                data = JSON.parse(stored);
            } catch (e) {
                console.error("Lỗi khi parse từ localStorage:", e);
            }
        }
    }

    if (!data || !data.data || !data.data.dot_kham || !data.data.nguoi_benh) {
        wrapper.style.display = "none";
        return;
    }

    const { dot_kham, nguoi_benh } = data.data;

    document.getElementById("kbName").textContent = nguoi_benh.ho_ten || "";

    const birthYear = new Date(nguoi_benh.ngay_sinh).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    document.getElementById("kbAge").innerHTML = `<strong>Tuổi:</strong> ${age}`;

    const sex = nguoi_benh.gioi_tinh === "M" ? "Nam" : "Nữ";
    document.getElementById("kbSex").innerHTML = `<strong>Giới tính:</strong> ${sex}`;

    const mucHuong = dot_kham.muc_huong_bhyt || 0;
    const doiTuongText = mucHuong > 0 ? `Bảo hiểm ${mucHuong}%` : "NB Không bảo hiểm";
    document.getElementById("kbBHYT").innerHTML = `<strong>Đối tượng:</strong> ${doiTuongText}`;

    document.getElementById("kbNbid").innerHTML = `<strong>Mã bệnh nhân:</strong> NB${nguoi_benh.ma_nguoi_benh}`;
    document.getElementById("kbVienphi").innerHTML = `<strong>Viện phí:</strong> 1.000.000 đ`;
    document.getElementById("kbNbtra").innerHTML = `<strong>NB trả:</strong> 0 đ`;
    document.getElementById("kbBHtra").innerHTML = `<strong>BH trả:</strong> 1.000.000 đ`;
    document.getElementById("kbTamung").innerHTML = `<strong>Tạm ứng:</strong> 0 đ`;

    // ✅ Hiển thị wrapper
    wrapper.style.display = "block";

    // ----------------------------------
    // ✅ Hiển thị Sinh hiệu nếu có
    if (dot_kham.sinh_hieu) {
        const arr = dot_kham.sinh_hieu.split("|").map(s => s.trim());
        const [
            mach, nhietDo, huyetAp, nhipTho, chieuCao, canNang,
            spo2, nhomMau, bmi, thoOxy, triGiac, diemDau
        ] = arr;
        document.getElementById("mach").value = mach || "";
        document.getElementById("nhietDo").value = nhietDo || "";
        document.getElementById("huyetAp").value = huyetAp || "";
        document.getElementById("nhipTho").value = nhipTho || "";
        document.querySelector('input[placeholder="cm"]').value = chieuCao || "";
        document.querySelector('input[placeholder="kg"]').value = canNang || "";
        document.querySelector('input[placeholder="%"]').value = spo2 || "";
        document.querySelector('input[placeholder^="A"]').value = nhomMau || "";
        document.getElementById("bmi").value = bmi || "";
        document.querySelector('input[placeholder="lít/phút"]').value = thoOxy || "";
        document.querySelector('input[placeholder="ACVPU"]').value = triGiac || "";
        document.querySelector('input[placeholder="Vị trí"]').value = diemDau || "";
    }

    // ✅ Hiển thị Hỏi bệnh nếu có
    if (dot_kham.hoi_benh) {
        const arr = dot_kham.hoi_benh.split("|").map(s => s.trim());
        const [benhSu, tienSuBanThan, tienSuGiaDinh, diUngThuoc, lyDoKham] = arr;

        document.getElementById("benhSu").value = benhSu || "";
        document.querySelectorAll("textarea")[1].value = tienSuBanThan || "";
        document.querySelectorAll("textarea")[2].value = tienSuGiaDinh || "";
        document.getElementById("diungthuoc").value = diUngThuoc || "";
        document.getElementById("lyDoKham").value = lyDoKham || "";
    }

    // ✅ Hiển thị Khám xét nếu có
    if (dot_kham.kham_xet) {
        const arr = dot_kham.kham_xet.split("|").map(s => s.trim());
        const [toanThan, cacBoPhan, luuY, dienBien, giaiDoan] = arr;

        document.querySelectorAll("textarea")[3].value = toanThan || "";
        document.querySelectorAll("textarea")[4].value = cacBoPhan || "";
        document.querySelectorAll("textarea")[5].value = luuY || "";
        document.getElementById("dienBien").value = dienBien || "";
        document.querySelectorAll("input[type='text']")[1].value = giaiDoan || "";
    }
}

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
function Queuecheck(danhSach) {
    const statusButtons = document.querySelectorAll(".kb-status-btn");
    const patientList = document.getElementById("patient-list");
    const patientListContent = document.getElementById("patient-list-content");

    const statusMap = {
        "cho_thuc_hien": "Chờ khám",
        "dang_thuc_hien": "Chưa kết luận",
        "da_thuc_hien": "Đã kết luận",
        "huy": "Hủy khám"
    };

    // Khởi tạo khung dữ liệu
    const data = {
        "Chờ khám": [],
        "Hủy khám": [],
        "Chưa kết luận": [],
        "Đã kết luận": [],
        "Chưa lĩnh thuốc": []
    };

    // Nếu không có người bệnh → clear localStorage + reset giao diện
    if (!danhSach.r_data || danhSach.r_data.length === 0) {
        alert("Không có người bệnh.");

        // Xóa localStorage
        localStorage.removeItem("queueData");

        // Reset số lượng hiển thị
        statusButtons.forEach(btn => {
            const countSpan = btn.querySelector(".count");
            if (countSpan) countSpan.textContent = "0";
        });

        // Xóa nội dung hiển thị
        patientListContent.innerHTML = `<li style="padding:8px;">Không có người bệnh</li>`;
        return;
    }

    // Gom dữ liệu theo trạng thái
    danhSach.r_data.forEach(item => {
        const mappedStatus = statusMap[item.trang_thai_dich_vu];
        if (mappedStatus && data[mappedStatus]) {
            data[mappedStatus].push(item);
        }
    });

    // Cập nhật localStorage (mã hóa base64)
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    localStorage.setItem("queueData", encoded);

    // Cập nhật số lượng hiển thị
    statusButtons.forEach(btn => {
        const status = btn.getAttribute("data-status");
        const countSpan = btn.querySelector(".count");
        if (countSpan && data[status]) {
            countSpan.textContent = data[status].length;
        }
    });

    // Gắn sự kiện click
    statusButtons.forEach(button => {
        button.onclick = function () {
            const label = button.getAttribute("data-status");

            // Toggle ẩn nếu click lại cùng nút
            if (patientList.style.display === "block" && patientList.previousClicked === this) {
                patientList.style.display = "none";
                return;
            }

            // Lấy lại dữ liệu từ localStorage
            let restoredData = {
                "Chờ khám": [],
                "Hủy khám": [],
                "Chưa kết luận": [],
                "Đã kết luận": [],
                "Chưa lĩnh thuốc": []
            };

            const raw = localStorage.getItem("queueData");
            if (raw) {
                try {
                    const json = decodeURIComponent(escape(atob(raw)));
                    restoredData = JSON.parse(json);
                } catch (e) {
                    console.warn("Lỗi đọc queueData từ localStorage:", e);
                }
            }

            const list = restoredData[label] || [];

            // Cập nhật nội dung danh sách
            if (list.length === 0) {
                patientListContent.innerHTML = `<li style="padding:8px;">Không có người bệnh</li>`;
            } else {
                patientListContent.innerHTML = list.map(item => {
                    const text = `P${item.ma_phong}.${item.so_thu_tu} - ${item.ten_nguoi_benh} - HS: ${item.ma_ho_so}`;
                    return `<li class="benh-nhan-item" data-info='${JSON.stringify(item)}'>${text}</li>`;
                }).join("");

                // Gắn sự kiện cho từng bệnh nhân
                document.querySelectorAll(".benh-nhan-item").forEach(li => {
                    li.onclick = function () {
                        const info = JSON.parse(this.getAttribute("data-info"));
                        const log = `P${info.ma_phong}.${info.so_thu_tu} - ${info.ten_nguoi_benh} - HS: ${info.ma_ho_so}`;
                        window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(info.ma_ho_so)}`;
                    };
                });
            }

            // Hiển thị danh sách tại vị trí đúng
            const rect = this.getBoundingClientRect();
            patientList.style.top = `${rect.bottom + window.scrollY}px`;
            patientList.style.left = `${rect.left + window.scrollX}px`;
            patientList.style.display = "block";
            patientList.previousClicked = this;
        };
    });

    // Ẩn danh sách nếu click ra ngoài
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


    const printBtn = document.getElementById('printbutton');
    const menu = document.getElementById('printContextMenu');

    printBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện lan ra document

        const btnRect = printBtn.getBoundingClientRect();

        menu.style.top = `${btnRect.top}px`;
        menu.style.left = `${btnRect.left - menu.offsetWidth - 200}px`; // 10px cách trái
        menu.classList.toggle('d-none');
    });

    // Ẩn menu nếu nhấn ra ngoài
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !printBtn.contains(e.target)) {
            menu.classList.add('d-none');
        }
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

const popup = document.getElementById('popupDichVu');
const listDichVuBody = document.querySelector('#listDichVu tbody'); // OK
const filterInput = document.getElementById('filterDichVu');
const dsDichVuBody = document.querySelector('#dsDichVu tbody');     // <-- cần chắc #dsDichVu tồn tại

let dsDichVu = []; // <-- phải có

    // Mở popup khi click input
    popup.addEventListener('show.bs.modal', () => {
        loadDanhSachThuoc();
        renderListDichVu();
    });

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

    // Đóng popup thuốc
    function closePopup() {
        const popupInstance = bootstrap.Modal.getInstance(popup);
        if (popupInstance) {
            popupInstance.hide();
        }
    }

    // Thêm dịch vụ vào danh sách
    function themDichVuVaoDanhSach(dv) {
        if (dsDichVu.some(d => d.ten === dv.ten && d.phong === dv.phong)) return;

        dsDichVu.push(dv);
        capNhatDanhSach();
    }


    function themDichVuTuPopup() {
        const popupInstance = new bootstrap.Modal(popup); 
        popupInstance.show();
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
          <td><strong>${item.tenthuoc}</strong></td>
          <td>Sang:${item.sang} Chiều:${item.chieu} Tối:${item.toi}  ${item.ghichu}</td>
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
