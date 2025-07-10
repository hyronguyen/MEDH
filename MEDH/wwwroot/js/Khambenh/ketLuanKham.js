document.addEventListener('DOMContentLoaded', () => {
    RenderPhieuNhapVien();
    document.getElementById('huong-dieu-tri')?.addEventListener('change', RenderPhieuNhapVien);
});

function RenderPhieuNhapVien() {
    const selectedValue = document.getElementById('huong-dieu-tri').value;
    const iframe = document.getElementById('iframe-phieu-kham');

    const payload = LayThongTinInPhieuKhamVaoVien();

    if (selectedValue === 'nhap-vien') {


        fetch('/Khambenh/InPhieuKhamVaoVien', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi gọi API");
                return res.text();
            })
            .then(html => {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(html);
                iframeDoc.close();
                iframe.style.display = "block";
            })
            .catch(err => {
                console.error('Lỗi khi tải phiếu khám:', err);
                iframe.style.display = "none";
            });

    } else {
        iframe.style.display = "none";
 
    }
}

function LayThongTinInPhieuKhamVaoVien() {
    const hosoraw = localStorage.getItem("ho_so_chi_tiet");
    const hoso = hosoraw ? JSON.parse(hosoraw) : null;
    const dotkham = hoso?.data?.dot_kham || {};
    const nguoibenh = hoso?.data?.nguoi_benh || {};

    let tuoi = 0;
    if (nguoibenh.ngay_sinh) {
        const birthDate = new Date(nguoibenh.ngay_sinh);
        const today = new Date();
        tuoi = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            tuoi--;
        }
    }

    // Giải mã JWT để lấy thông tin bác sĩ khám
    let bac_si_kham = "Không rõ";
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const payloadBase64 = token.split('.')[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);
            bac_si_kham = payload?.name || "Không rõ";
        }
    } catch (err) {
        console.warn("Lỗi khi giải mã token:", err);
    }

    return {
        ma_nguoi_benh: ChuanHoaMa(nguoibenh.ma_nguoi_benh || "0", "NB"),
        ma_ho_so: ChuanHoaMa(dotkham.ma_dot_kham || "0", "HS"),
        ho_ten: nguoibenh.ho_ten || "Chưa rõ",
        ngay_sinh: nguoibenh.ngay_sinh || "",
        tuoi: tuoi,
        gioi_tinh: nguoibenh.gioi_tinh === "m" ? "Nam" : "Nữ",
        dia_chi: nguoibenh.dia_chi || "Chưa rõ",
        so_the_bhyt: dotkham.so_the_bhyt || "Không BH",
        so_cccd: dotkham.giay_to || "Chưa rõ",
        chuan_doan_ban_dau: dotkham.chuan_doan_ban_dau || "Chưa rõ",
        ly_do_kham: dotkham.ly_do_den_kham || "Chưa rõ",
        bac_si_kham: bac_si_kham
    };
}


// Lưu kết luận khám
document.getElementById("btn-luu-ketluan").addEventListener('click', async () => {
    const huongDieuTriSelect = document.getElementById("huong-dieu-tri");
    const ketQuaSelect = document.getElementById("ket-qua");

    const huongDieuTriText = huongDieuTriSelect.options[huongDieuTriSelect.selectedIndex]?.text;
    const ketQuaText = ketQuaSelect.options[ketQuaSelect.selectedIndex]?.text;

    const payload = huongDieuTriText + " | " + ketQuaText;

    // Kiểm tra nếu người dùng chưa chọn một trong hai
    if (
        huongDieuTriSelect.value === "" ||
        ketQuaSelect.value === "" ||
        huongDieuTriText === "Chọn hướng điều trị" ||
        ketQuaText === "Chọn kết quả"
    ) {
        alert("Vui lòng chọn đầy đủ thông tin");
        return;
    }

    const mahs = LayMaHoSo();

    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`/Khambenh/KetLuanKham?MaHoSo=${mahs}&ketluan=${encodeURIComponent(payload)}&token=${encodeURIComponent(token)}`, {
            method: "POST"
        });

        const result = await response.json();

        if (response.ok) {
            if (result.status === "success") {
                alert("✅ Kết luận thành công");
                window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(mahs)}`;
            } else {
                alert(`${result.message || "Lỗi nghiệp vụ không xác định"}`);
            }
        } else {
            alert(`${result.message || "Lỗi máy chủ"}`);
        }

    } catch (error) {
        alert(`${error.message || "Lỗi kết nối hệ thống"}`);
    }

});


document.addEventListener("keydown", function (event) {
    const trangThai = LayTrangThaiKham();

    // Nếu hồ sơ đã kết luận, không cho dùng phím tắt
    if (trangThai === true) return;

    // Ctrl + S => Lưu thông tin khám
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        const btnLuu = document.getElementById("luuthongtinkham");
        if (btnLuu) btnLuu.click();
        return;
    }

    switch (event.key) {
        case "F2":
            event.preventDefault();
            const btnThemDV = document.getElementById("btnthemdichvutupopup");
            if (btnThemDV) btnThemDV.click();
            break;

        case "F3":
            event.preventDefault();
            const btnChon = document.getElementById("btnChonThuoc");
            if (btnChon) btnChon.click();
            break;

        case "F4":
            event.preventDefault();
            const btnLuuThuoc = document.getElementById("btn-luu-donthuoc");
            if (btnLuuThuoc) btnLuuThuoc.click();
            break;
    }
});


document.addEventListener('keydown', function (event) {
    // Kiểm tra tổ hợp Shift + ArrowUp hoặc Shift + ArrowDown
    if (!event.shiftKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;

    const tabs = Array.from(document.querySelectorAll('.kb-tab'));
    const activeTab = document.querySelector('.kb-tab.active');
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;

    if (event.key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    } else if (event.key === 'ArrowDown') {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    }

    const targetTab = tabs[newIndex];
    if (!targetTab) return;

    // Cập nhật tab active
    tabs.forEach(tab => tab.classList.remove('active'));
    targetTab.classList.add('active');

    // Ẩn tất cả nội dung tab
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    // Hiện nội dung của tab được chọn
    const targetId = targetTab.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
        targetContent.style.display = 'block';
    }

    event.preventDefault();
});
