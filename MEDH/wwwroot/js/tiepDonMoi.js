
// XÁC NHẬN TIẾP ĐÓN
function xacNhan() {
    const requiredFields = [
        'hoTen', 'gioiTinh', 'ngaySinh', 'ngheNghiep',
        'diaChi', 'soGiayTo', 'lyDoKham', 'loaiDoiTuong',
        'chonQuay'
    ];

    const loaiDoiTuong = document.getElementById('loaiDoiTuong').value;

    // Nếu là BHYT thì bắt buộc thêm các trường BHYT
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

    const data = {
        hanhChinh: {
            hoTen: document.getElementById('hoTen').value,
            gioiTinh: document.getElementById('gioiTinh').value,
            ngaySinh: document.getElementById('ngaySinh').value,
            tuoi: document.getElementById('tuoi').value,
            ngheNghiep: document.getElementById('ngheNghiep').value,
            diaChi: document.getElementById('diaChi').value,
            soGiayTo: document.getElementById('soGiayTo').value
        },
        bhyt: {
            maThe: document.getElementById('maThe').value,
            mucHuong: document.getElementById('mucHuong').value,
            ngayCapThe: document.getElementById('ngayCapThe').value,
            ngayHetHan: document.getElementById('ngayHetHan').value,
            noiDangKy: document.getElementById('noiDangKy').value,
            noiGioiThieu: document.getElementById('noiGioiThieu').value,
            thongTuyen: document.getElementById('thongTuyen').checked
        },
        lyDo: {
            lyDoKham: document.getElementById('lyDoKham').value,
            loaiDoiTuong: loaiDoiTuong,
            maNbCu: document.getElementById('maNbCu').value,
            maDinhDanh: document.getElementById('maDinhDanh').value
        },
        quay: {
            chonQuay: document.getElementById('chonQuay').value
        }
    };

    console.log("Thông tin tiếp đón:", data);
    alert("Thông tin đã được log ra console!");
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