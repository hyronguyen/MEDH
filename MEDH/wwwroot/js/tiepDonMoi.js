
document.addEventListener('DOMContentLoaded', () => {
    Laythongtinquay();
});


// XÁC NHẬN TIẾP ĐÓN
async function xacNhan() {
    const requiredFields = [
        'hoTen', 'gioiTinh', 'ngaySinh', 'ngheNghiep',
        'diaChi', 'soGiayTo', 'lyDoKham', 'loaiDoiTuong',
        'chonQuay'
    ];

    const loaiDoiTuong = document.getElementById('loaiDoiTuong').value;

    if (loaiDoiTuong === 'BHYT') {
        requiredFields.push('maThe', 'mucHuong', 'ngayCapThe', 'ngayHetHan', 'noiDangKy', 'noiGioiThieu');
    }

    let isValid = true;
    let firstInvalidField = null;

    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (!field || field.value.trim() === "") {
            isValid = false;
            field.classList.add('is-invalid');
            if (!firstInvalidField) firstInvalidField = field;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    if (!isValid) {
        alert("Vui lòng nhập đầy đủ các trường bắt buộc!");
        if (firstInvalidField) firstInvalidField.focus();
        return;
    }

    // Thu thập dữ liệu
    const getValue = id => {
        const el = document.getElementById(id);
        return el && el.value.trim() !== "" ? el.value.trim() : undefined;
    };

    const getChecked = id => {
        const el = document.getElementById(id);
        return el ? el.checked : undefined;
    };

    const gioiTinhRaw = getValue('gioiTinh');
    const gioiTinh = gioiTinhRaw === 'Nam' ? 'M' :
        gioiTinhRaw === 'Nữ' ? 'F' : null;

    const payload = {
        p_token: localStorage.getItem('token') || null,
        p_ho_ten: getValue('hoTen') || null,
        p_gioi_tinh: gioiTinh,
        p_ngay_sinh: getValue('ngaySinh') || null,
        p_so_dien_thoai: getValue('soDienThoai') || "",
        p_dia_chi: getValue('diaChi') || null,
        p_nghe_nghiep: getValue('ngheNghiep') || null,
        p_giay_to: getValue('soGiayTo') || null,
        p_ly_do_den_kham: getValue('lyDoKham') || null,
        p_so_the_bhyt: loaiDoiTuong === 'BHYT' ? getValue('maThe') || null : null,
        p_noi_dang_ky_kcb: loaiDoiTuong === 'BHYT' ? getValue('noiDangKy') || null : null,
        p_ngay_bat_dau_bhyt: loaiDoiTuong === 'BHYT' ? getValue('ngayCapThe') || null : null,
        p_ngay_ket_thuc_bhyt: loaiDoiTuong === 'BHYT' ? getValue('ngayHetHan') || null : null,
        p_muc_huong_bhyt: loaiDoiTuong === 'BHYT' ? parseFloat(getValue('mucHuong') || 0) : null
    };

    console.log("Payload gửi lên:", JSON.stringify(payload, null, 2));

    Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
    });

    TiepDonNguoiBenh(payload);
}


// Tính tuổi
document.getElementById("ngaySinh").addEventListener("change", function () {
    const dob = new Date(this.value);
    const today = new Date();

    if (!isNaN(dob)) {
        let age = today.getFullYear() - dob.getFullYear();

        // Nếu chưa tới sinh nhật trong năm nay thì trừ đi 1
        const hasHadBirthday =
            today.getMonth() > dob.getMonth() ||
            (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

        if (!hasHadBirthday) age--;

        document.getElementById("tuoi").value = age;
    } else {
        document.getElementById("tuoi").value = "";
    }
});

// chọn loại đối tượng
document.getElementById("loaiDoiTuong").addEventListener("change", function () {
    const isThuPhi = this.value === "Thu phí";
    const bhytFields = document.querySelectorAll("#thongTinBHYT input");

    bhytFields.forEach(field => {
        if (field.type !== "checkbox") {
            field.readOnly = isThuPhi;
        } else {
            field.disabled = isThuPhi;
        }

        // Nếu đang là is-invalid thì loại bỏ
        if (isThuPhi) {
            field.classList.remove("is-invalid");
        }
    });
});

// Người bệnh tiếp theo (UPDATE THEO API)
async function chuyenBenhNhanTiepTheo() {
    
    const maPhong = parseInt(document.getElementById('chonQuay').value);

    const payload = {
        p_token: localStorage.getItem('token') || null,
        ma_phong_input: maPhong
    };

    // Gọi số tiếp theo (RPC goi_so_thu_tu)
    const ketQuaGoi = await GoiSoThuTu(payload);

    // Nếu không còn người chờ thì cảnh báo và kết thúc
    if (!ketQuaGoi || ketQuaGoi.r_ma_hang_doi === null) {
        alert('✅ Đã gọi hết người trong hàng đợi.');
        return;
    }

    // Lấy số thứ tự mới nhất sau khi gọi
    const soDangTiep = await LaySTTDaGoiMoiNhat(maPhong);

    if (soDangTiep !== null) {
        const dangTiepDonEl = document.getElementById('sttDangTiepDon');
        const tiepTheoEl = document.getElementById('sttTiepTheo');

        dangTiepDonEl.textContent = soDangTiep.toString().padStart(4, '0');
        tiepTheoEl.textContent = (soDangTiep + 1).toString().padStart(4, '0');
    } else {
        alert('❌ Không thể lấy số thứ tự đang tiếp đón.');
    }
}


// Kiểm tra mã thẻ với mức hưởng
function kiemTraVaChuyenHoaMaThe() {
    const maTheInput = document.getElementById('maThe');
    // Tự động viết hoa toàn bộ khi nhập
    maTheInput.value = maTheInput.value.toUpperCase();

    // Nếu nhập quá 15 ký tự thì cắt bớt
    if (maTheInput.value.length > 15) {
        maTheInput.value = maTheInput.value.slice(0, 15);
    }
}

function kiemTraMaThe() {
    const maTheInput = document.getElementById('maThe');
    const mucHuongInput = document.getElementById('mucHuong');

    const maThe = maTheInput.value.trim();

    // Kiểm tra 2 ký tự đầu
    const prefix = maThe.slice(0, 2);
    const allowedPrefixes = ['DN', 'SV', 'GD', 'KT'];
    if (!allowedPrefixes.includes(prefix)) {
        alert("Mã thẻ phải bắt đầu bằng DN, SV, GD hoặc KT.");
        mucHuongInput.value = '';
        return;
    }

    // Kiểm tra độ dài 15 ký tự
    if (maThe.length !== 15) {
        alert("Mã thẻ phải đúng 15 ký tự.");
        mucHuongInput.value = '';
        return;
    }

    // Lấy ký tự thứ 3 (index 2)
    const kyTu3 = maThe.charAt(2);

    if (kyTu3 === '1') {
        mucHuongInput.value = '100%';
    } else if (['2', '3', '4', '5'].includes(kyTu3)) {
        mucHuongInput.value = '80%';
    } else if (kyTu3 === '6') {
        alert("Sai mã thẻ: ký tự thứ 3 không hợp lệ.");
        mucHuongInput.value = '';
    } else {
        mucHuongInput.value = '';
    }
}

// tự động viết hóa
function tuDongVietHoa(input) {
    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.value = input.value.toUpperCase();

    input.setSelectionRange(start, end);
}

// Load quầy
 async function Laythongtinquay(){
    const selectElement = document.getElementById("chonQuay");

    if (!selectElement) {
        console.error("Không tìm thấy phần tử #chonQuay trong DOM.");
        return;
    }

    // Gợi ý: đặt sẵn option tạm thời
    selectElement.innerHTML = `<option disabled selected>Đang tải quầy tiếp đón...</option>`;

    // Gọi hàm lấy danh sách phòng
    const danhSachPhong = await LayDanhSachPhongTiepDon();

    // Xóa option tạm nếu có dữ liệu
    if (danhSachPhong.length > 0) {
        selectElement.innerHTML = ""; // Xóa các option cũ

        danhSachPhong.forEach(phong => {
            const option = document.createElement("option");
            option.value = phong.ma_phong;
            option.textContent = phong.ten_phong;
            selectElement.appendChild(option);
        });
    } else {
        // Trường hợp không có dữ liệu
        selectElement.innerHTML = `<option disabled selected>Không có quầy tiếp đón nào</option>`;
    }
}