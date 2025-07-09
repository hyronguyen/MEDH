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
        localStorage.removeItem("phong_dang_chon");
        localStorage.removeItem("ma_don_thuoc_moi_tam_thoi");
        localStorage.removeItem("queueData");

    }
});

// VARIBLES -----------------------------------------------------------------------------------------------------------------------
const input = document.getElementById('icd-input');
const input_des = document.getElementById('icd-desc-input');
const suggestionsBox = document.getElementById('icd-suggestions');
const tabs = document.querySelectorAll('.kb-tab');
const sections = document.querySelectorAll('.kb-col.kb-col-center');    
const printBtn = document.getElementById('printbutton');
const menu = document.getElementById('printContextMenu');

//Call API ĐỔ vào danh sách này
let dichVuCoSan = [];

//Call API ĐỔ vào danh sách này
const danhSachThuoc = [
    { ma: "T001", ten: "Paracetamol 500mg", gia: 5000,tt: "BH", ton: 100 },
    { ma: "T002", ten: "Amoxicillin 250mg", gia: 12000, tt: "BH", ton: 50 },
    { ma: "T003", ten: "Vitamin C 1000mg", gia: 8000, tt: "DV", ton: 75 }
];

//FUNCTION CHUNG #########################################################################################################################################################
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
        capNhatDanhSach();
        CapNhatNutDongMoHoSo();
        InPhieu();
        Kiemtradonthuoc();
        HienThiLichSuKham();
}
    // FUNCTION: GIẢI MÃ TOKEN
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
    // FUNTION: LOAD NGƯỜI BỆNH TẠI PHÒNG
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
    // FUNCTION Hiển thị nút đống hay mở hồ sơ
    function CapNhatNutDongMoHoSo() {
        const btn = document.getElementById("btnclosehs");
        const trangThai = LayTrangThaiKham();
        console.log("Hồ sơ đang ở trạng thái: " + trangThai);
        const huongDieuTriSelect = document.getElementById("huong-dieu-tri");
        const ketQuaSelect = document.getElementById("ket-qua");

        // Xoá cả hai class trạng thái trước
        btn.classList.remove("mo", "dong");

        if (trangThai === false) {
            // Hồ sơ đang mở → hiển thị nút ĐÓNG HS
            btn.innerHTML = '<i class="fa fa-circle-check"></i><span> Đóng HS</span>';
            btn.classList.add("mo");
            huongDieuTriSelect.disabled = false;
            ketQuaSelect.disabled = false;
        } else {
            // Hồ sơ đã đóng → hiển thị nút MỞ HS
            btn.innerHTML = '<i class="fa fa-folder-open"></i><span> Mở HS</span>';
            btn.classList.add("dong");
            huongDieuTriSelect.disabled = true;
            ketQuaSelect.disabled = true;
        }

        const nutCanXuLy = [
            "btnthemdichvutupopup",
            "luuthongtinkham",
            "btnluuchidinhdv",
            "timDichVu",
            "btn-luu-ketluan",
            "btnXoaDonThuoc"
        ];

        nutCanXuLy.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = trangThai === true ? "none" : "inline-block";
            }
        });
    }
    // FUNCTION Đóng hồ sơ.
    document.getElementById("btnclosehs").addEventListener('click', async () => {
        const trangThai = LayTrangThaiKham();
        console.log(trangThai + "n");
        const mhs = LayMaHoSo();
        const token = localStorage.getItem("token");
        const madv = LayDichVuThucHienTaiPhong();
        const trangthaiMoi = trangThai ? "false" : "true";

        try {
            const response = await fetch(`/Khambenh/Xulyhosokham?MaHoSo=${mhs}&trangthai=${trangthaiMoi}&madichvukham=${madv}&token=${token}`, {
                method: "POST"
            });

            if (!response.ok) {
                throw new Error("Lỗi máy chủ");
            }

            const result = await response.json();

            if (result.status === "success") {
                alert(trangthaiMoi === "true" ? "Đã đóng hồ sơ thành công." : "Đã mở hồ sơ thành công.");
                window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(mhs)}`;
            } else {
                alert((trangthaiMoi === "true" ? "Đóng" : "Mở") + " hồ sơ thất bại: " + (result.message || "Lỗi không xác định"));
            }
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Có lỗi xảy ra khi " + (trangthaiMoi === "true" ? "đóng" : "mở") + " hồ sơ.");
        }
    });
    // FUNCTION PRE-LOAD THÔNG TIN NGƯỜI BỆNH
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

        // Tên người bệnh
        const nameEl = document.getElementById("kbName");
        nameEl.textContent = nguoi_benh.ho_ten || "";
        nameEl.style.color = "var(--primary-color)";
        nameEl.style.fontWeight = "bold";

        // Tuổi
        const birthYear = new Date(nguoi_benh.ngay_sinh).getFullYear();
        const age = new Date().getFullYear() - birthYear;

        document.getElementById("kbAge").innerHTML = `<strong>Tuổi:</strong> <span style="color: var(--primary-color); font-weight: bold;">${age}</span>`;


    const sex = nguoi_benh.gioi_tinh === "M" ? "Nam" : "Nữ";
    document.getElementById("kbSex").innerHTML = `<strong>Giới tính:</strong> ${sex}`;

        const mucHuong = dot_kham.muc_huong_bhyt || 0;
        let doiTuongText;

        if (mucHuong > 0) {
            doiTuongText = `Bảo hiểm <span style="color: green;">${mucHuong}%</span>`;
        } else {
            doiTuongText = "NB Không bảo hiểm";
        }

        document.getElementById("kbBHYT").innerHTML = `<strong>Đối tượng:</strong> ${doiTuongText}`;


    document.getElementById("kbNbid").innerHTML = `<strong>Mã bệnh nhân:</strong> NB-${nguoi_benh.ma_nguoi_benh}`;

        const vien_phi = Number(dot_kham.vien_phi);
        const tam_ung = Number(dot_kham.so_tien_tam_ung);
        const so_du = tam_ung - vien_phi;
        document.getElementById("kbVienphi").innerHTML = `<strong>Viện phí:</strong> ${vien_phi.toLocaleString('vi-VN')} đ`;
        document.getElementById("kbTamung").innerHTML = `<strong>Tạm ứng:</strong> ${tam_ung.toLocaleString('vi-VN')} đ`;

        const so_du_el = document.getElementById("kbSodu");
        const nhan = so_du >= 0 ? "Số dư" : "Còn thiếu";
        so_du_el.innerHTML = `<strong>${nhan}:</strong> ${Math.abs(so_du).toLocaleString('vi-VN')} đ`;
        so_du_el.style.color = so_du >= 0 ? 'green' : 'red';


    // ✅ Hiển thị wrapper
    wrapper.style.display = "block";

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
        document.getElementById("giaidoanbenh").value = giaiDoan || "";
        }

    // ✅ Hiển thị chuẩn đoán nếu cáo
     if (dot_kham.chuan_doan) {
            const arr = dot_kham.chuan_doan.split("|").map(s => s.trim());
            const [mota, sobo, icd, kemtheo] = arr;

            document.getElementById("icdmotachitiet").value = mota || "";
            document.getElementById("icd-desc-input").value = sobo || "";
            document.getElementById("icd-input").value = icd || "";
            document.getElementById("kemtheo-input").value = kemtheo || "";
        }

    // Hiển thị kết luận nếu có
        const ketluanRaw = LayKetLuanKham(); 
        const ketluan = String(ketluanRaw || "").trim(); 
        if (ketluan.includes("|")) {
            const [huongDieuTriText, ketQuaText] = ketluan.split("|").map(s => s.trim());

            const huongDieuTriMap = {
                "Cho về": "cho-ve",
                "Nhập viện": "nhap-vien",
                "Theo dõi": "theo-doi",
                "Cho đơn về": "cho-don-ve"
            };

            const ketQuaMap = {
                "Khỏi bệnh": "khoi-benh",
                "Tiến triển": "tien-trien",
                "Dừng lại": "dung-lai",
                "Xấu đi": "xau-di",
                "Khác": "khac"
            };

            document.getElementById("huong-dieu-tri").value = huongDieuTriMap[huongDieuTriText] || "";
            document.getElementById("ket-qua").value = ketQuaMap[ketQuaText] || "";
        }
}
    // FUNCCTION GỌI NGƯỜI BỆNH TIẾP THEO
    document.getElementById("btnnguoibenhtieptheo").addEventListener('click', async function () {
        try {
            const token = localStorage.getItem("token");
            const maphong = localStorage.getItem("phong_dang_chon");
            const response = await fetch(`/Khambenh/Goinguoibenhtieptheovaophongkham?token=${token}&maphong=${maphong}`);

            if (!response.ok) {
                const error = await response.json();
                console.error("Lỗi gọi người bệnh", error.detail || error.message);
                alert(`Lỗi gọi người bệnh: ${error.message}`);
                return;
            }
            const result = await response.json();
            if (!result.r_ma_ho_so_kham) {
                alert("Hết người bệnh");
            } else {
                window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(result.r_ma_ho_so_kham)}`;
            }

        } catch (err) {
            console.error("Lỗi hệ thống:", err);
            alert("Lỗi kết nối tới server.");
        }
    });
    // Hiển thị lịch sử khám
async function HienThiLichSuKham() {
    try {
        const nb = LayMaNB();
        console.log(nb);
        if (!nb) {
            console.warn("Không có mã người bệnh.");
            return;
        }

        const response = await fetch(`/Khambenh/LichSuKham?MaHoSo=${encodeURIComponent(nb)}`);

        if (!response.ok) {
            const error = await response.json();
            console.error("❌ Lỗi khi lấy lịch sử khám:", error.detail || error.message);
            return;
        }

        const data = await response.json();
        console.log("✅ Dữ liệu lịch sử khám:", data);

        const container = document.querySelector(".history-cards");
        container.innerHTML = ""; // clear cũ

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<div class="text-muted">Không có lịch sử khám.</div>';
            return;
        }

        data.forEach(item => {
            const ngay = new Date(item.ngay_tiep_don).toLocaleDateString("vi-VN");
            const cdChuoi = item.chuan_doan;
            const cdHienThi = LayChuanDoanTuChuoi(cdChuoi);

            const card = document.createElement("div");
            card.className = "history-card";

            card.innerHTML = `
        <div class="history-date">
            ${ngay}
            ${cdHienThi ? ` - <strong>CĐ: ${cdHienThi}</strong>` : ""}
        </div>
    `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error("❌ Lỗi xử lý lịch sử khám:", err);
    }
}

function LayChuanDoanTuChuoi(cdChuoi) {
    if (!cdChuoi) return null;

    const parts = cdChuoi.split("|");
    // Kiểm tra phần tử thứ 3 (index 2) có tồn tại và khác rỗng
    if (parts.length >= 3 && parts[2].trim() !== "") {
        return parts[2].trim();
    }
    return null;
}

//FUNCTION LẤY THÔNG TIN -------------------------------------------------------------------------------------------------------------------------------------------------
    // FUNCTION LẤY MÃ HỒ SƠ
    function LayMaHoSo() {
        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
        let MaHoSo = null;
        let hoSoParsed = null;

        // Tìm mã hồ sơ
        if (hoSoRaw) {
            try {
                hoSoParsed = JSON.parse(hoSoRaw);
                MaHoSo = hoSoParsed?.data?.dot_kham?.ma_dot_kham || null;
                return MaHoSo;
            } catch (err) {
                console.error("Lỗi parse ho_so_chi_tiet:", err);
            }
        }

        if (!MaHoSo) {
            alert("❌ Không tìm thấy mã hồ sơ đợt khám trong localStorage.");
            return;
        }
}

    function LayMaNB() {
        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
        let MaNB = null;
        let hoSoParsed = null;

        // Tìm mã hồ sơ
        if (hoSoRaw) {
            try {
                hoSoParsed = JSON.parse(hoSoRaw);
                MaNB = hoSoParsed?.data?.nguoi_benh?.ma_nguoi_benh || null;
                return MaNB;
            } catch (err) {
                console.error("Lỗi parse ho_so_chi_tiet:", err);
            }
        }

        if (!MaNB) {
            alert("❌ Không tìm thấy MaNB sơ đợt khám trong localStorage.");
            return;
        }
    }
    // FUNCTION LẤY MÃ ĐƠN THUỐC
    function LayMaDonThuoc() {
        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
        let MaDonThuoc = null;

        if (hoSoRaw) {
            try {
                const hoSoParsed = JSON.parse(hoSoRaw);
                const danhSachDonThuoc = hoSoParsed?.data?.don_thuoc;

                if (Array.isArray(danhSachDonThuoc) && danhSachDonThuoc.length > 0) {
                    MaDonThuoc = danhSachDonThuoc[0].ma_don_thuoc;
                    return MaDonThuoc;
                }
            } catch (err) {
                console.error("Lỗi parse ho_so_chi_tiet:", err);
            }
        }
        return null;
    }
    // FUNCTION LẤY kÊT luận khám
    function LayKetLuanKham() {
            const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
            let KetLuanKham = null;
            let hoSoParsed = null;

            // Tìm mã hồ sơ
            if (hoSoRaw) {
                try {
                    hoSoParsed = JSON.parse(hoSoRaw);
                    KetLuanKham = hoSoParsed?.data?.dot_kham?.ket_luan_kham || null;
                    return KetLuanKham;
                } catch (err) {
                    console.error("Lỗi parse ho_so_chi_tiet:", err);
                }
            }

        if (!KetLuanKham) {
            alert("❌ Không tìm thấy KetLuanKham ở đợt khám trong localStorage.");
                return;
            }
}
    //FUNTION LẤY DỊCH VỤ ĐANG THỰC HIỆN TẠI PHÒNG
    function LayDichVuThucHienTaiPhong() {
        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
        let hoSoParsed = null
        const phongDangChon = parseInt(localStorage.getItem("phong_dang_chon"));

        if (hoSoRaw) {
            hoSoParsed = JSON.parse(hoSoRaw);
            const dichVu = hoSoParsed?.data?.dich_vu_kham?.find(dv => dv.ma_phong_thuc_hien === phongDangChon);
            let dich_vu_kham_input;
            if (dichVu) {
                dich_vu_kham_input = dichVu.ma_dich_vu_kham;
                return dich_vu_kham_input;
            } else {
                console.log("Không tìm thấy dịch vụ phù hợp với phòng đang chọn");
            }
        }

        }
    // FUNCTION LẤY TRẠNG THÁI KHÁM
    function LayTrangThaiKham() {
        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
        let TrangThaiKham = null;
        let hoSoParsed = null;

        // Tìm mã hồ sơ
        if (hoSoRaw) {
            try {
                hoSoParsed = JSON.parse(hoSoRaw);
                TrangThaiKham = hoSoParsed?.data?.dot_kham?.trang_thai_kham ?? null;
                return TrangThaiKham;
            } catch (err) {
                console.error("Lỗi parse ho_so_chi_tiet:", err);
            }
        }

        if (!MaHoSo) {
            alert("❌ Không tìm thấy TrangThaiKham đợt khám trong localStorage.");
            return;
        }
}
    // FUNCTION Lấy đối tượng khám
    function LayDoiTuongKham() {
        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");

        if (!hoSoRaw) {
            alert("❌ Không tìm thấy dữ liệu hồ sơ trong localStorage.");
            return null;
        }

        try {
            const hoSoParsed = JSON.parse(hoSoRaw);
            const mucHuong = hoSoParsed?.data?.dot_kham?.muc_huong_bhyt;

            const doiTuong = mucHuong == null ? "DV" : "BH";
            return doiTuong;
        } catch (err) {
            console.error("❌ Lỗi khi parse ho_so_chi_tiet:", err);
            alert("Lỗi dữ liệu hồ sơ.");
            return null;
        }
}
    // FUNCTION Mức hưởng
    function LayMucHuong() {
        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");

        if (!hoSoRaw) {
            alert("❌ Không tìm thấy dữ liệu hồ sơ trong localStorage.");
            return null;
        }
        try {
            const hoSoParsed = JSON.parse(hoSoRaw);
            const mucHuong = hoSoParsed?.data?.dot_kham?.muc_huong_bhyt ?? 0;
            return mucHuong;
        } catch (err) {
            console.error("❌ Lỗi khi parse ho_so_chi_tiet:", err);
            alert("Lỗi dữ liệu hồ sơ.");
            return null;
        }
    }
    // FUNCTION Đơn thuốc
    function LayDonThuoc() {
        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
        let DonThuoc = null;
        let hoSoParsed = null;

        // Tìm mã hồ sơ
        if (hoSoRaw) {
            try {
                hoSoParsed = JSON.parse(hoSoRaw);
                DonThuoc = hoSoParsed?.data?.don_thuoc ?? null;
                return DonThuoc;
            } catch (err) {
                console.error("Lỗi parse ho_so_chi_tiet:", err);
            }
        }

        if (!DonThuoc) {
            alert("❌ Không tìm thấy DonThuoc đợt khám trong localStorage.");
            return;
        }
    }
   
// FUCNTION CỦA THÔNG TIN KHÁM-------------------------------------------------------------------------------------------------------------------------------------------------------
    document.querySelectorAll('.kb-tab-list .kb-tab').forEach(button => {
    button.addEventListener('click', () => {
        // Bỏ active của tất cả button
        document.querySelectorAll('.kb-tab-list .kb-tab').forEach(btn => btn.classList.remove('active'));
        // Thêm active cho button được click
        button.classList.add('active');
    });

});
    //FUNCTION: Dan sách hàng đợi theo trạng thái chờ - chưa kết luận - đã kết luận; Xử lý khi chọn danh sách 
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

            // Lấy danh sách hàng chờ từ localstorage
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

                // Sự kiện khi click vào bệnh nhân từ danh sách
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
    //FUNCTION: Lấy mã ICD
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
    //FUNCTION: Fill khi người dùng chọn gợi ý
    suggestionsBox.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            input.value = item.getAttribute('data-code');
            input_des.value = item.getAttribute('data-desc');
            suggestionsBox.style.display = 'none';
        }
    });
    //FUNCTION: Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!suggestionsBox.contains(e.target) && e.target !== input) {
            suggestionsBox.style.display = 'none';
        }
    });
    //FUNCTION: Lưu thông tin khám bệnh 
    document.getElementById('luuthongtinkham').addEventListener('click', async function () {
        // Kiểm tra tạm ứng
        const vien_phi_text = document.getElementById("kbVienphi").textContent || "";
        const tam_ung_text = document.getElementById("kbTamung").textContent || "";

        const vien_phi = parseInt(vien_phi_text.replace(/\D/g, ""), 10) || 0;
        const tam_ung = parseInt(tam_ung_text.replace(/\D/g, ""), 10) || 0;

        const so_du = tam_ung - vien_phi;

        if (so_du < 0) {
            alert("Người bệnh cần thanh toán thêm tạm ứng trước khi hoàn tất hồ sơ khám.");
            return;
        }

        // Kiểm tra điều kiện lưu thông tin khám
        if (!kiemTraTruocKhiDongHoSo()) return;

        const sinh_hieu_input = [
            document.getElementById("mach").value,
            document.getElementById("nhietDo").value,
            document.getElementById("huyetAp").value,
            document.getElementById("nhipTho").value,
            document.querySelector('input[placeholder="cm"]').value,
            document.querySelector('input[placeholder="kg"]').value,
            document.querySelector('input[placeholder="%"]').value,
            document.querySelector('input[placeholder^="A"]').value,
            document.getElementById("bmi").value,
            document.querySelector('input[placeholder="lít/phút"]').value,
            document.querySelector('input[placeholder="ACVPU"]').value,
            document.querySelector('input[placeholder="Vị trí"]').value
        ].map(s => s.trim()).join("|");

        // === ✅ Collect Hỏi bệnh ===
        const hoi_benh_input = [
            document.getElementById("benhSu").value,
            document.querySelectorAll("textarea")[1].value,
            document.querySelectorAll("textarea")[2].value,
            document.getElementById("diungthuoc").value,
            document.getElementById("lyDoKham").value
        ].map(s => s.trim()).join("|");

        // === ✅ Collect Khám xét ===
        const kham_xet_input = [
            document.querySelectorAll("textarea")[3].value,
            document.querySelectorAll("textarea")[4].value,
            document.querySelectorAll("textarea")[5].value,
            document.getElementById("dienBien").value,
            document.getElementById("giaidoanbenh").value
        ].map(s => s.trim()).join("|");

        // === ✅ Collect chuẩn đoán ===
        const textareaChanDoan = document.getElementById("icdmotachitiet");
        const inputChanDoanSoBo = document.getElementById("icd-desc-input");
        const inputICD = document.getElementById("icd-input");
        const inputChanDoanKem = document.querySelectorAll("fieldset h5")[0].parentElement.querySelectorAll("input")[2];

        const chuan_doan_input = [
            textareaChanDoan?.value || "",
            inputChanDoanSoBo?.value || "",
            inputICD?.value || "",
            inputChanDoanKem?.value || ""
        ].map(s => s.trim()).join("|");
        const token = localStorage.getItem("token");


        const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
        let MaHoSo = null;
        let hoSoParsed = null;

        // Tìm mã hồ sơ
        if (hoSoRaw) {
            try {
                hoSoParsed = JSON.parse(hoSoRaw);
                MaHoSo = hoSoParsed?.data?.dot_kham?.ma_dot_kham || null;
            } catch (err) {
                console.error("Lỗi parse ho_so_chi_tiet:", err);
            }
        }

        if (!MaHoSo) {
            alert("❌ Không tìm thấy mã hồ sơ đợt khám trong localStorage.");
            return;
        }

        // Tìm các dịch vụ khám của phòng đang chọn
        const phongDangChon = parseInt(localStorage.getItem("phong_dang_chon"));
        const dichVu = hoSoParsed?.data?.dich_vu_kham?.find(dv => dv.ma_phong_thuc_hien === phongDangChon);
        let dich_vu_kham_input;
        if (dichVu) {
            dich_vu_kham_input = dichVu.ma_dich_vu_kham;
        } else {
            console.log("Không tìm thấy dịch vụ phù hợp với phòng đang chọn");
        }

        // Encode dữ liệu an toàn
        const query = new URLSearchParams({
            token,
            MaHoSo,
            sinhhieu: sinh_hieu_input,
            hoibenh: hoi_benh_input,
            khamxet: kham_xet_input,
            chuandoan: chuan_doan_input,
            dichvukham: dich_vu_kham_input 
        });

        console.log();
        const url = `/Khambenh/Luuthongtinkhambenh?${query.toString()}`;
        try {
            const res = await fetch(url, {
                method: "POST"
            });

            const result = await res.json();
            if (result.status === "SUCCESS") {
                alert("✅ Đã lưu thông tin thành công");
                window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(MaHoSo)}`;
            } else {
                alert("❌ Thất bại: " + result.message);
            }
        } catch (err) {
            console.error("Lỗi API:", err);
            alert("❌ Gọi API thất bại");
        }
    });
    //FUNCTION: In giấy tờ
    printBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        const btnRect = printBtn.getBoundingClientRect();

        menu.style.top = `${btnRect.top}px`;
        menu.style.left = `${btnRect.left - menu.offsetWidth - 200}px`; // 10px cách trái
        menu.classList.toggle('d-none');
    });
    //FUNCTION: Ẩn menu nếu nhấn ra ngoài
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !printBtn.contains(e.target)) {
            menu.classList.add('d-none');
        }
    });
    //FUCNTION: Kiểm tra các trường bắt buộc trước khi đóng hồ sơ
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
    //FUCNTION:  Đổi tab chức năng (Màn hình tao tác chính)
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
// FUCNTION CỦA KÊ DỊCH VỤ-------------------------------------------------------------------------------------------------------------------------------------------------------------
// Biến toàn cục - Kê dịch vụ
const popup = document.getElementById('popupDichVu');
const listDichVuBody = document.querySelector('#listDichVu tbody'); 
const filterInput = document.getElementById('filterDichVu');
const dsDichVuBody = document.querySelector('#dsDichVu tbody');   
let dsDichVu = []; // <-- list chứa các dịch vụ đã chọn
let dsDaXoaTuHoSo = []; // <-- list chứa các dịch vụ đã xóa
 //FUNCTION: Mở popup kê dịch vụ khi click input
    popup.addEventListener('show.bs.modal', async () => {
    try {
        const response = await LayDanhSachDichVu();

        // Đảm bảo có dữ liệu
        const data = Array.isArray(response) && response[0]?.r_status === 'SUCCESS'
            ? response[0].r_data
            : [];

        if (data.length === 0) {
            alert("Không có dữ liệu dịch vụ.");
            return;
        }

        // Map về định dạng dichVuCoSan
        dichVuCoSan = data.filter(dv => dv.loai_dich_vu !== 'kham').map(dv => ({
            madichvu: dv.ma_dich_vu,
            ten: dv.ten_dich_vu,
            gia: dv.don_gia,
            maphong: dv.phong_thuc_hien,
            phong: dv.ten_phong,
            loai: chuanHoaLoaiDichVu(dv.loai_dich_vu),
            thanhtoan: dv.thanh_toan
        }));

        console.log("✅ Dịch vụ có sẵn:", dichVuCoSan);

        renderListDichVu();

    } catch (error) {
        console.error("❌ Lỗi khi hiển thị popup dịch vụ:", error);
        alert("Đã xảy ra lỗi khi tải danh sách dịch vụ.");
    }
});
   //FUNCTION: Render danh sách dịch vụ trong popup
    function chuanHoaLoaiDichVu(loai) {
    switch (loai) {
        case 'xet_nghiem': return 'Xét nghiệm';
        case 'chan_doan': return 'CDHA';
        case 'pttt': return 'Thủ thuật';
        case 'kham': return 'Dịch vụ khám';
        default: return 'Khác';
    }
}
    //FUNCTION: Render danh sách dịch vụ trong popup
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
    // FUNCTION Dịch vụ của popup
    filterInput.addEventListener('input', (e) => {
        renderListDichVu(e.target.value);
    });
    // FUNCTION ĐỐNG POPUP THUỐC
    function closePopup() {
        const popupInstance = bootstrap.Modal.getInstance(popup);
        if (popupInstance) {
            popupInstance.hide();
        }
    }
    // Thêm dịch vụ vào danh sách
    function themDichVuVaoDanhSach(dv) {

    if (dsDichVu.some(d => d.ten === dv.ten && d.phong === dv.phong)) return;

 
    let mucHuong = 0;
    try {
        const hoSoJson = localStorage.getItem('ho_so_chi_tiet');
        if (hoSoJson) {
            const hoSo = JSON.parse(hoSoJson);
            mucHuong = Number(hoSo.data?.dot_kham?.muc_huong_bhyt || 0);
        }
    } catch (e) {
        console.error("❌ Lỗi khi đọc mức hưởng BHYT:", e);
    }


    let giaSauBHYT = dv.gia;
    if (dv.thanhtoan === 'BH' && mucHuong > 0) {
        giaSauBHYT = Math.round(dv.gia * (1 - mucHuong / 100));
    }
    const dvMoi = {
        ...dv,
        gia_sau_bhyt: giaSauBHYT
    };
        
    dsDichVu.push(dvMoi);
    capNhatDanhSach();
}
    // FUNCTION THÊM DỊCH VỤ TẠI POPUP TIẾP ĐÓN
    function themDichVuTuPopup() {
        const popupInstance = new bootstrap.Modal(popup); 
        popupInstance.show();
    }
 // FUNCTION XÓA DỊCH VỤ
  async function xoaDichVu(index) {
    const dv = dsTatCaDichVu[index];
    if (!dv) return;

    if (dv.nguon === 'them_moi') {
        // Xóa khỏi danh sách thêm mới
        const viTri = dsDichVu.findIndex(item =>
            item.madichvu === dv.madichvu && item.maphong === dv.maphong
        );
        if (viTri !== -1) dsDichVu.splice(viTri, 1);
        capNhatDanhSach();
    }
    else if (dv.nguon === 'ho_so') {
        // Kiểm tra trạng thái cho phép xóa
        if (dv.trang_thai !== 'cho_thuc_hien') {
            alert(`⚠️ Không thể xóa dịch vụ đã ở trạng thái: ${dv.trang_thai}`);
            return;
        }

        const xacNhan = confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${dv.ten}" khỏi hồ sơ?`);
        if (!xacNhan) return;

        try {
            const response = await fetch(`/Khambenh/Xoadichvukham?madichvukham=${dv.madichvukham}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Lỗi khi xóa dịch vụ:", error.detail || error.message);
                alert(`Không thể xóa dịch vụ: ${error.message}`);
                return;
            }

            alert(`✅ Đã xóa dịch vụ "${dv.ten}" khỏi hồ sơ.`);
            capNhatDanhSach();
        } catch (err) {
            console.error("❌ Lỗi kết nối khi xóa dịch vụ:", err);
            alert("❌ Không thể kết nối tới máy chủ.");
        }
    }
}
// FUNCTION HIỂN THỊ DỊCH VỤ ĐÃ KÊ
 function capNhatDanhSach() {
    const dsDichVuBody = document.querySelector("#dsDichVu tbody");
    dsDichVuBody.innerHTML = '';

    const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");
    let dichVuTrongHoSo = [];

    if (hoSoRaw) {
        try {
            const parsed = JSON.parse(hoSoRaw);
            const dvkList = parsed?.data?.dich_vu_kham || [];

            dichVuTrongHoSo = dvkList
                .filter(dv => !dsDaXoaTuHoSo.some(x => x.ma_dich_vu === dv.ma_dich_vu && x.ma_phong_thuc_hien === dv.ma_phong_thuc_hien))
                .map(dv => ({
                    ten: dv.ten_dich_vu,
                    loai: chuanHoaLoaiDichVu(dv.loai_dich_vu),
                    gia: dv.gia_tien,
                    gia_sau_bhyt: dv.gia_tien,
                    phong: dv.ten_phong_thuc_hien,
                    madichvu: dv.ma_dich_vu,
                    madichvukham: dv.ma_dich_vu_kham,
                    maphong: dv.ma_phong_thuc_hien,
                    thanhtoan: dv.thanh_toan,
                    da_co_trong_ho_so: true,
                    trang_thai: dv.trang_thai,
                    nguon: 'ho_so'
                }));
        } catch (err) {
            console.error("❌ Lỗi khi parse ho_so_chi_tiet:", err);
        }
    }

    const dsThemMoi = dsDichVu.map(dv => ({ ...dv, nguon: 'them_moi' }));
    dsTatCaDichVu = [...dichVuTrongHoSo, ...dsThemMoi];

    dsTatCaDichVu.forEach((dv, i) => {
        const isHuongBH = dv.gia_sau_bhyt !== dv.gia;
        const canXoa = dv.nguon === 'them_moi' || dv.trang_thai === 'cho_thuc_hien';
        // ✅ Hiển thị giá có hoặc không hưởng BHYT
        const tdGia = isHuongBH
            ? `<span style="color: green; font-weight: bold;">${dv.gia_sau_bhyt.toLocaleString()} đ</span><br>
       <small style="color: #555;">Hưởng BH (${dv.gia.toLocaleString()} đ)</small>`
            : `${dv.gia.toLocaleString()} đ`;

        // ✅ Hiển thị biểu tượng trạng thái
        let iconTrangThai = '';
        if (dv.trang_thai === 'dang_thuc_hien') {
            iconTrangThai = `<i class="fa fa-clock text-warning" title="Đang thực hiện"></i>`;
        } else if (dv.trang_thai === 'da_thuc_hien') {
            iconTrangThai = `<i class="fa fa-check-circle text-success" title="Đã thực hiện"></i>`;
        }

        // ✅ Nút xóa hoặc icon trạng thái
        const btnXoa = canXoa
            ? `<button onclick="xoaDichVu(${i})" style="background-color: transparent; border: none; cursor: pointer; color: grey;">
            <i class="fa-solid fa-square-minus" title="Chờ thực hiện có thể xóa"></i>
       </button>`
            : iconTrangThai;


        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 8px; color: black; font-weight:600">${dv.ten}</td>
            <td style="padding: 8px;">${dv.loai || ''}</td> 
            <td style="padding: 8px; text-align: right;">${tdGia}</td>
            <td style="padding: 8px;">${dv.phong}</td>
            <td style="text-align: center;">${btnXoa}</td>
        `;
        dsDichVuBody.appendChild(tr);
    });
}
 //FUNCTION: Lưu chỉ định đã kê 
 async function luuChiDinh() {
            if (dsDichVu.length === 0) {
                alert('⚠️ Vui lòng thêm ít nhất một dịch vụ');
                return;
            }

            const token = localStorage.getItem('token');
            const hoSoRaw = localStorage.getItem("ho_so_chi_tiet");

            let MaHoSo = null;
            let hoSoParsed = null;
            let dichVuDaKe = [];

            if (hoSoRaw) {
                try {
                    hoSoParsed = JSON.parse(hoSoRaw);
                    MaHoSo = hoSoParsed?.data?.dot_kham?.ma_dot_kham || null;
                    dichVuDaKe = hoSoParsed?.data?.dich_vu_kham || [];
                } catch (err) {
                    console.error("❌ Lỗi khi parse ho_so_chi_tiet:", err);
                }
            }

            if (!MaHoSo) {
                alert("❌ Không tìm thấy mã hồ sơ đợt khám trong localStorage.");
                return;
            }

            const payloads = [];
            const tenDichVuBiTrung = [];

            dsDichVu.forEach(dv => {
                const daKe = dichVuDaKe.some(dvk => dvk.ma_dich_vu === dv.madichvu);
                if (daKe) {
                    tenDichVuBiTrung.push(dv.ten);
                } else {
                    payloads.push({
                        p_token: token,
                        p_ma_dot_kham: MaHoSo,
                        p_ma_dich_vu: dv.madichvu,
                        p_ma_bac_si: null,
                        p_ma_phong: dv.maphong,
                        p_don_gia_thuc_the: dv.gia_sau_bhyt
                    });
                }
            });

            if (tenDichVuBiTrung.length > 0) {
                alert(`⚠️ Các dịch vụ đã được kê trước đó và sẽ không thêm lại:\n- ${tenDichVuBiTrung.join('\n- ')}`);
            }

            if (payloads.length === 0) {
                alert("❌ Không có dịch vụ nào mới để chỉ định.");
                return;
            }

            console.log("📦 Payloads gửi lên:", payloads);

            try {
                const success = await apiKeDichVu(payloads); // API phải là async
                if (success) {
                    alert("✅ Kê dịch vụ thành công.");
                } else {
                    alert("❌ Có lỗi xảy ra khi kê một số dịch vụ.");
                }
            } catch (err) {
                console.error("❌ Lỗi khi gọi apiKeDichVu:", err);
                alert("❌ Lỗi hệ thống khi kê dịch vụ.");
            }
        }
// FUCNTION CỦA ĐƠN THUỐC-------------------------------------------------------------------------------------------------------------------------------------------------------------
const ngaykeInput = document.getElementById('ngayke');
const ngaydenInput = document.getElementById('ngayden');
const songayInput = document.getElementById('songay');
const tbodyDanhSachThuoc = document.getElementById('tbodyDanhSachThuoc');
const tbodyThuocDaChon = document.getElementById('thuoc-da-chon');
const btnLuuThuoc = document.getElementById('luu-thuoc');
const tbodyDanhSachThuocChonNgoai = document.querySelector('#danhsach-thuoc-chon tbody');
const popupThuoc = document.getElementById('popupThuoc');
const timKiemThuocInput = document.getElementById('timKiemThuoc');

let thuocDaChon = new Map(); // <-- Danh sách thuốc đã chọn
//FUCNTION TÍNH SỐ NGÀY
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
// FUNCTION: Render DANH SÁCH THUỐC TỪ DS ĐÃ CÓ
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
    <td>${thuoc.tt}</td>
      <td><input type="checkbox" class="chkChonThuoc" 
          data-mathu="${thuoc.ma}" 
          data-tenthuoc="${thuoc.ten}" 
          data-gia="${thuoc.gia}"
          data-tt="${thuoc.tt}" 
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
    const tt = cb.dataset.tt;
    if (cb.checked) {
        if (!thuocDaChon.has(mathuoc)) {
            thuocDaChon.set(mathuoc, {
                mathuoc,
                tenthuoc,
                gia,
                ton,
                tt,
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
// KÊ THUỐC TRONG POPUP
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
//FUNCTION TÌM KIẾM THUỐC
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
//FUCNTION Nút lưu thuốc trong popup, thêm thuốc đã chọn ra bảng ngoài
btnLuuThuoc.onclick = () => {
    tbodyDanhSachThuocChonNgoai.innerHTML = '';
    const mucHuong = Number(LayMucHuong()) / 100;

    thuocDaChon.forEach(item => {
        const tr = document.createElement('tr');
        const sang = Number(item.sang) || 0;
        const chieu = Number(item.chieu) || 0;
        const toi = Number(item.toi) || 0;
        const tongLieuTrongNgay = sang + chieu + toi;
        if (tongLieuTrongNgay === 0) return;
        const soNgay = Number(document.getElementById('songay').value) || 1;
        const soluong = tongLieuTrongNgay * soNgay;
        const thanhTienGoc = tongLieuTrongNgay * soNgay * Number(item.gia);

        let thanhTienSauGiam = thanhTienGoc;
        let ghiChuGiam = "";

        // Nếu là thuốc BH thì áp dụng mức hưởng
        if (item.tt === "BH") {
            thanhTienSauGiam = thanhTienGoc * (1 - mucHuong); // phần còn lại NB phải trả
            ghiChuGiam = `<div class="text-success small">Đã được hưởng BHYT</div>`;
        }

        const thanhTienFormatted = thanhTienSauGiam.toLocaleString('vi-VN') + ' đ';

        tr.innerHTML = `
          <td>${item.mathuoc}</td>
          <td><strong>${item.tenthuoc}</strong></td>
          <td>Sáng: ${item.sang}, Chiều: ${item.chieu}, Tối: ${item.toi}<br><small>${item.ghichu || ''}</small></td>
          <td>${soluong}</td>
          <td>${thanhTienFormatted} ${ghiChuGiam}</td>
          <td><button class="btn btn-grey btn-sm btn-xoa-ngoai" data-mathu="${item.mathuoc}">&times;</button></td>
        `;
        tbodyDanhSachThuocChonNgoai.appendChild(tr);
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById('popupThuoc'));
    modal.hide();
};

//FUCNTION xử lý bảng thuốc đã chọn
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
// FUNCTION LOAD LẠI DANH SÁCH THUỐC ĐÃ CHỌN VÀO POPUP
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
//FUNCTION: LƯU ĐƠN THUỐC
document.getElementById('btn-luu-donthuoc').addEventListener('click',async function () {
        // Lấy giá trị các trường
        const ngayKe = document.getElementById('ngayke').value;
        const ngayDen = document.getElementById('ngayden').value;
        const soNgay = document.getElementById('songay').value;
    const ghiChu = document.getElementById('ghichu').value;
    const token = localStorage.getItem("token");
    
    const mHS = LayMaHoSo();

    let p_ma_don_thuoc = Number(localStorage.getItem("ma_don_thuoc_moi_tam_thoi"));
    if (!p_ma_don_thuoc) {
        p_ma_don_thuoc = Number(LayMaDonThuoc());
            }
        const thuocRows = document.querySelectorAll('#danhsach-thuoc-chon tbody tr');
        const payloads = [];
        
        thuocRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                payloads.push({
                    p_ma_don_thuoc,
                    p_ma_thuoc: Number(cells[0].innerText.trim()),
                    p_lieu_dung: cells[2].innerText.trim(),
                    p_so_luong: Number(cells[3].innerText),
                    p_thanh_tien: Number(cells[4].innerText.replace(/[^\d]/g, ''))
                });
            }
        });


    if (payloads.length === 0) {
        alert("Không có thuốc nào được chọn. Vui lòng chọn thuốc trước khi lưu đơn.");
        return;
    }
    
    try {
        const response = await fetch(`/Khambenh/KeThuoc?token=${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloads)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("❌ Lỗi khi kê thuốc:", error.detail || error.message);
            alert("❌ Không thể kê thuốc. Vui lòng thử lại.");
            return;
        }

        const result = await response.json();
        console.log("✅ Kết quả kê thuốc:", result);

        if (result.status === 'success') {
            alert("✅ Đã kê thuốc thành công.");
            window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(mHS)}`;
        } else {
            alert(`⚠️ Có một số thuốc kê không thành công. Xem console để biết chi tiết.`);
            //window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(mHS)}`;
        }

    } catch (err) {
        console.error("❌ Lỗi kết nối tới máy chủ:", err);
        alert("❌ Không thể kết nối tới máy chủ.");
    }
});

//FUNCTION: Mở model thuốc - check điều kiện đã kết luận hay chưa - và load thuốc từ server
document.getElementById("btnChonThuoc").addEventListener("click", async function () {
    const ketluankham = LayKetLuanKham();
    const doiTuong = LayDoiTuongKham();
    const HS = LayMaHoSo();

    if (!ketluankham) {
        alert("❌ Chưa có kết luận khám. Không thể kê thuốc.");
        return;
    }

    if (!doiTuong) {
        alert("❌ Không xác định được đối tượng khám.");
        return;
    }

    try {
        const response = await fetch(`/Khambenh/LayDanhSachThuocTheoDoiTuong?doiTuong=${doiTuong}`);
        if (!response.ok) {
            const error = await response.json();
            console.error("❌ Lỗi khi lấy danh sách thuốc:", error.detail || error.message);
            alert("Không thể tải danh sách thuốc.");
            return;
        }

        const data = await response.json();

        danhSachThuoc.length = 0;

        data.forEach(thuoc => {
            danhSachThuoc.push({
                ma: `${thuoc.ma_thuoc.toString().padStart(3, "0")}`, 
                ten: thuoc.ten_thuoc,
                gia: thuoc.don_gia,
                tt: thuoc.thanh_toan,
                ton: thuoc.so_luong_ton
            });
        });

        const donthuoctamthoi = localStorage.getItem("ma_don_thuoc_moi_tam_thoi");
        if (donthuoctamthoi) {
            console.log("⚠️ Đã có đơn thuốc tạm thời:", donthuoctamthoi);
            // Không tạo lại đơn, nhưng vẫn mở modal
        } else {
            // Nếu chưa có, kiểm tra danh sách đơn thuốc hiện tại
            const don = LayDonThuoc();
            if (!don || !Array.isArray(don) || don.length === 0) {
                const token = localStorage.getItem("token");
                const response = await fetch(`/Khambenh/TaoDonThuoc?token=${token}&maDotKham=${HS}`);
                if (!response.ok) {
                    const error = await response.json();
                    console.error("❌ Lỗi khi tạo đơn thuốc:", error.detail || error.message);
                    alert("Không thể tạo đơn thuốc.");
                    return;
                }

                const data = await response.json();
                if (data.status === "TAO_MOI_THANH_CONG" && data.ma_don_thuoc) {
                    localStorage.setItem("ma_don_thuoc_moi_tam_thoi", data.ma_don_thuoc);
                    console.log("✅ Đã lưu đơn thuốc tạm thời:", data.ma_don_thuoc);
                } else {
                    alert("Tạo đơn thuốc không thành công.");
                    return;
                }
            }
        }

        // Sau khi tải thuốc thành công, mở modal
        const modalElement = document.getElementById('popupThuoc');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (err) {
        console.error("❌ Lỗi kết nối khi lấy danh sách thuốc:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
});
//FUNCTION: Kiểm tra đơn thuốc của người bệnh, đã có đơn thuốc hay chưa

function Kiemtradonthuoc() {
    const donthuoc = LayDonThuoc();
    const madonthuoc = LayMaDonThuoc(); // Kiểm tra ID đơn thuốc
    const chiTiet = donthuoc?.[0]?.chi_tiet;

    const formDaKe = document.getElementById("form-donthuocdake");
    const formChuaKe = document.getElementById("form-donthuoc");
    const tableBody = document.querySelector("#danhsachthuoctuhoso tbody");

    // Nếu có mã đơn thuốc (dù không có chi tiết), vẫn coi là đã kê
    if (madonthuoc) {
        console.log("đã kê");

        // Hiển thị form đã kê, ẩn form kê thuốc
        formDaKe.style.display = "block";
        formChuaKe.style.display = "none";

        // Xóa nội dung cũ của bảng (nếu có)
        tableBody.innerHTML = "";

        // Nếu có chi tiết thuốc thì hiển thị vào bảng
        if (Array.isArray(chiTiet) && chiTiet.length > 0) {
            chiTiet.forEach((thuoc, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${thuoc.ten_thuoc}</td>
                    <td>${thuoc.lieu_dung}</td>
                    <td>${thuoc.so_luong} ${thuoc.don_vi}</td>
                    <td>${thuoc.thanh_tien_thuoc.toLocaleString()}đ</td>
                `;

                tableBody.appendChild(row);
            });
        } else {
            // Nếu không có chi tiết, thông báo là chưa có thuốc nào
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="5" class="text-center text-muted">Đơn thuốc trắng</td>`;
            tableBody.appendChild(row);
        }
    } else {
        // Không có đơn thuốc ⇒ cho phép kê mới
        formDaKe.style.display = "none";
        formChuaKe.style.display = "block";
    }
}


//FUNTION: Xóa đơn thuốc
document.getElementById("btnXoaDonThuoc").addEventListener("click", async function () {
    const maDonThuoc = LayMaDonThuoc();
    const mHS = LayMaHoSo();
    if (!maDonThuoc) {
        alert("❌ Không tìm thấy mã đơn thuốc để xóa.");
        return;
    }

    const xacNhan = confirm("Bạn có chắc chắn muốn xóa đơn thuốc này?");
    if (!xacNhan) return;

    try {
        const response = await fetch(`/Khambenh/XoaDonThuoc?maDonThuoc=${maDonThuoc}`, {
            method: "POST"
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Lỗi khi xóa đơn thuốc:", error.detail || error.message);
            alert("❌ Không thể xóa đơn thuốc.");
            return;
        }

        const result = await response.json();
        const status = result?.[0]?.r_status;
        const message = result?.[0]?.r_message;

        if (status === "success") {
            alert(`✅ ${message}`);
            window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(mHS)}`;
        } else {

            alert(`⚠️ ${message}`);
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("❌ Không thể kết nối tới máy chủ.");
    }
});





