
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
        p_so_dien_thoai: getValue('soDienThoai') || null,
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


    // Xóa các key undefined để tránh lỗi PostgREST
    Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
    });

    try {
        const response = await fetch(`https://mpmtmnfjswssnkjbrhfw.supabase.co/rest/v1/rpc/tiep_don_nguoi_benh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXRtbmZqc3dzc25ramJyaGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzU3OTEsImV4cCI6MjA2NTQ1MTc5MX0.DpcrSo6Iu9DbEHImq7WSKMXYnne9GHszSWazgia1LJM',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Có lỗi xảy ra khi tiếp đón.');
        }

        const result = await response.json();
        console.log("Tiếp đón thành công:", result);
        alert("Tiếp đón thành công!");
    } catch (err) {
        console.error("Lỗi:", err.message);
        alert("Lỗi khi tiếp đón: " + err.message);
    }
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
 function chuyenBenhNhanTiepTheo() {
        const dangTiepDonEl = document.getElementById("sttDangTiepDon");
        const tiepTheoEl = document.getElementById("sttTiepTheo");

        let dang = parseInt(dangTiepDonEl.textContent);
        let tiep = parseInt(tiepTheoEl.textContent);

        if (!isNaN(dang) && !isNaN(tiep)) {
            dangTiepDonEl.textContent = tiep.toString().padStart(4, '0');
            tiepTheoEl.textContent = (tiep + 1).toString().padStart(4, '0');
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