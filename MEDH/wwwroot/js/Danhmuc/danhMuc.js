// LOCAL VARIBLE ---------------------------------------------------------------------------------
let currentCategory = "NhanVien";

// ON LOAD ---------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    renderTable(currentCategory);

});

// VARIBLE ---------------------------------------------------------------------------------
    const columns = {
    NhanVien: ["ID", "Họ tên", "Vai trò", "Tài khoản", "Mật khẩu", "Hành động"],
        Phong: ["ID", "Tên phòng", "Khoa", "Loại phòng", "Hành động"],
        VaiTro: ["ID", "Mã nhân viên", "Mã phòng", "Vai trò", "Ngày bắt đầu", "Hành động"],
        Thuoc: ["ID", "Tên thuốc", "Đơn vị", "Đơn giá", "Thanh toán", "Hành động"],
        DichVuKham: ["ID", "Tên DV", "Loại", "Đơn giá", "Thanh toán", "Phòng", "Hành động"],
        XetNghiem: ["ID", "Tên DV", "Loại", "Đơn giá", "Thanh toán", "Phòng", "Hành động"],
        ChanDoan: ["ID", "Tên DV", "Loại", "Đơn giá", "Thanh toán", "Phòng", "Hành động"],
        PhauThuat: ["ID", "Tên DV", "Loại", "Đơn giá", "Thanh toán", "Phòng", "Hành động"]
};

const categoryFields = {
    NhanVien: ["Họ tên", "Vai trò", "Tài khoản", "Mật khẩu"],
    Phong: ["Tên phòng", "Khoa", "Loại phòng"],
    VaiTro: ["Mã nhân viên", "Mã phòng", "Vai trò", "Ngày bắt đầu"],
    Thuoc: ["Tên thuốc", "Đơn vị", "Đơn giá", "Thanh toán"],
    DichVuKham: ["Tên DV", "Loại", "Đơn giá", "Thanh toán", "Phòng"],
    XetNghiem: ["Tên DV", "Loại", "Đơn giá", "Thanh toán", "Phòng"],
    ChanDoan: ["Tên DV", "Loại", "Đơn giá", "Thanh toán", "Phòng"],
    PhauThuat: ["Tên DV", "Loại", "Đơn giá", "Thanh toán", "Phòng"]
};


const tableBodyTemplates = {
    NhanVien: [
        ["Nguyễn Văn A", "bác sĩ", "vana", "••••"],
        ["Trần Thị B", "tiep_don", "tranb", "••••"]
    ],
    Phong: [
        ["Phòng khám 1", "Nội", "kham"],
        ["Phòng thuốc", "Dược", "duoc"]
    ],
    VaiTro: [
        ["101", "1", "Bác sĩ chính", "2024-01-01"],
        ["102", "2", "Phụ tá", "2024-06-01"]
    ],
    Thuoc: [
        ["Paracetamol", "Viên", "5,000", "BH"],
        ["Amoxicillin", "Viên", "6,500", "DV"]
    ],
    default: [
        ["Dịch vụ A", "kham", "200,000", "DV", "P1"],
        ["Dịch vụ B", "xet_nghiem", "150,000", "BH", "P2"]
    ]
};

// FUNTION ---------------------------------------------------------------------------------
function actionButtons(id) {
    return `
        <button class='btn btn-sm btn-outline-primary' onclick='editItem(${id})'>Sửa</button>
        <button class='btn btn-sm btn-outline-danger' onclick='deleteItem(${id})'>Xóa</button>
    `;
}

//FUNCTION: Sửa từng ITEM
    function editItem() {
        alert(`Sửa mục trong danh mục: ${currentCategory}`);
        }
//FUNCTION: Xóa từng ITEM
    function deleteItem(id) {
        if (!confirm(`Bạn có chắc chắn muốn xóa ID ${id} trong danh mục ${currentCategory}?`)) return;

        alert(`Giả lập xóa ID ${id} trong danh mục: ${currentCategory}`);

    }


// FUNCTION: CHỌN DANH MỤC
document.querySelectorAll("#categoryList .nav-link").forEach(link => {
    link.addEventListener("click", function () {
        document.querySelectorAll("#categoryList .nav-link").forEach(l => l.classList.remove("active"));
        this.classList.add("active");

        currentCategory = this.dataset.category;
        document.getElementById("categoryTitle").textContent = "Danh sách " + this.textContent;
        document.getElementById("popupForm").style.display = "none";
        // Gọi hàm xử lý theo danh mục
        switch (currentCategory) {
            case "Thuoc":
                LoadDanhMucThuoc();
                break;
            case "NhanVien":
                LoadDanhMucNhanVien();
                break;
            case "Phong":
                LoadDanhMucPhong();
                break;
            case "VaiTro":
                LoadDanhMucPhongVaNhanSu();
                break;
            case "DichVuKham":
                LoadDanhMucDVKham();
                break;
            case "XetNghiem":
                LoadDanhMucDVXetnghiem();
                break;
            case "ChanDoan":
                LoadDanhMucDVCDHA();
                break;
            case "PhauThuat":
                LoadDanhMucDVPTTT();
                break;
            default:
                alert("Danh mục không xác định: " + currentCategory);
                break;
        }

        renderTable(currentCategory);
    });
});


// FUNCTION: THUỐC
function LoadDanhMucThuoc() {
    fetch("/Danhmuc/Danhmucthuoc")
        .then(response => {
            if (!response.ok) {
                throw new Error("Lỗi khi gọi API danh mục thuốc.");
            }
            return response.json();
        })
        .then(data => {
            const columns = ["#", "Tên thuốc", "Đơn vị", "Đơn giá", "Thanh toán", "Hành động"];
            const thead = document.getElementById("tableHead");
            const tbody = document.getElementById("tableBody");

            // Render header
            thead.innerHTML = `<tr>${columns.map(col => `<th>${col}</th>`).join("")}</tr>`;

            // Render body
            tbody.innerHTML = data.map((item, index) => `
                <tr>
                    <td>${item.ma_thuoc}</td>
                    <td>${item.ten_thuoc}</td>
                    <td>${item.don_vi}</td>
                    <td>${item.don_gia.toLocaleString("vi-VN")}₫</td>
                    <td>${item.thanh_toan}</td>
                    <td>${actionButtons(item.ma_thuoc)}</td>
                </tr>
            `).join("");
        })
        .catch(error => {
            alert("Không thể tải danh mục thuốc: " + error.message);
        });
}


// FUNCTION: NHÂN VIÊN
function LoadDanhMucNhanVien() {
    alert("Đang tải danh mục: Nhân viên");
}

// FUNCTION: PHÒNG
function LoadDanhMucPhong() {
    alert("Đang tải danh mục: Phòng");
}

// FUNCTION: PHÂN CÔNG NHÂN VIÊN PHÒNG
function LoadDanhMucPhongVaNhanSu() {
    alert("Đang tải danh mục: Vai trò nhân sự");
}

// FUNCTION: DỊCH VỤ KHÁM
function LoadDanhMucDVKham() {
    alert("Đang tải danh mục: Dịch vụ khám");
}

// FUNCTION: XÉT NGHIỆM
function LoadDanhMucDVXetnghiem() {
    alert("Đang tải danh mục: Dịch vụ xét nghiệm");
}

// FUNCTION: CĐHA - PHCN
function LoadDanhMucDVCDHA() {
    alert("Đang tải danh mục: Chẩn đoán hình ảnh / PHCN");
}

// FUNCTION: PHẪU THUẬT - THỦ THUẬT
function LoadDanhMucDVPTTT() {
    alert("Đang tải danh mục: Phẫu thuật thủ thuật");
}



//FUNCTION: render danh sách bên phải
function renderTable(category) {
    const cols = columns[category] || [];
    const headHtml = cols.map(c => `<th>${c}</th>`).join('');
    document.getElementById("tableHead").innerHTML = `<tr>${headHtml}</tr>`;

    const rows = tableBodyTemplates[category] || tableBodyTemplates.default;
    let bodyHtml = "";

    rows.forEach((data, index) => {
        const cells = [`<td>${index + 1}</td>`]
            .concat(data.map(cell => `<td>${cell}</td>`))
            .concat([`<td>${actionButtons()}</td>`]);
        bodyHtml += `<tr>${cells.join('')}</tr>`;
    });

    document.getElementById("tableBody").innerHTML = bodyHtml;
}

//FUNCTION: Them mới Item
document.getElementById("btnAdd").addEventListener("click", () => {
    if (!currentCategory || !categoryFields[currentCategory]) {
        alert("Vui lòng chọn danh mục trước khi thêm mới.");
        return;
    }

    const fields = categoryFields[currentCategory];
    const formContainer = document.getElementById("popupFields");
    const popupTitle = document.getElementById("popupTitle");

    popupTitle.textContent = `Thêm mới - ${currentCategory}`;
    formContainer.innerHTML = ""; 

    fields.forEach((field, i) => {
        const id = `field_${i}`;
        formContainer.innerHTML += `
            <div class="form-group">
                <label for="${id}">${field}</label>
                <input type="text" class="form-control" id="${id}" name="${field}">
            </div>
        `;
    });

    document.getElementById("popupForm").style.display = "block";
});


//FUNCTION: SUBMIT THÊ MỚI ITEM TRONG DANH MÚC
document.getElementById("addForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = this.querySelectorAll("input");
    const values = Array.from(inputs).map(input => input.value.trim());

    alert(`Đã thêm mới trong danh mục: ${currentCategory}\nThông tin:\n` + values.join(" | "));

    // ✅ Gọi hàm tương ứng theo danh mục
    switch (currentCategory) {
        case "Thuoc":
            ADDthuoc(values);
            break;
        case "NhanVien":
            ADDnhanvien(values);
            break;
        case "Phong":
            ADDphong(values);
            break;
        case "VaiTro":
            ADDvaitro(values);
            break;
        case "DichVuKham":
        case "XetNghiem":
        case "ChanDoan":
        case "PhauThuat":
            ADDdichvu(values);
            break;
        default:
            alert("Danh mục chưa hỗ trợ thêm mới.");
            break;
    }

    // Ẩn popup và reset form
    document.getElementById("popupForm").style.display = "none";
    this.reset();
});


function ADDthuoc(values) {
    const data = {
        ten_thuoc: values[0],
        don_vi: values[1],
        don_gia: parseFloat(values[2]),
        thanh_toan: values[3],
    };

        fetch("/Danhmuc/Adddanhmucthuoc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error("Thêm thuốc thất bại");
                return res.json();
            })
            .then(result => {
                alert("Thêm thuốc thành công: ");
                LoadDanhMucThuoc(); 
            })
            .catch(error => {
                alert("Lỗi: " + error.message);
            });
    }



//ĐỐNG POPUP THÊM MỚI
document.addEventListener("click", function (event) {
    const popup = document.getElementById("popupForm");
    const btnAdd = document.getElementById("btnAdd");

    if (popup.style.display === "none") return;

    // Nếu click bên ngoài popup và không phải nút "Thêm mới"
    if (!popup.contains(event.target) && event.target !== btnAdd) {
        popup.style.display = "none";
    }
});

 