const canvas = document.getElementById('pdf-viewer');
const ctx = canvas.getContext('2d');
const pdfUrl = "/assets/pdfs/nhap_vien_ver11.pdf";

// Ẩn canvas lúc đầu
canvas.style.display = "none";

document.getElementById('huong-dieu-tri').addEventListener('change', function () {
    const selectedValue = this.value;

    if (selectedValue === 'nhap-vien') {
        // Hiển thị canvas
        canvas.style.display = "block";

        // Tải PDF và hiển thị
        pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc => {
            return pdfDoc.getPage(1);
        }).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            page.render(renderContext);
        }).catch(err => {
            console.error('Lỗi load PDF:', err);
        });

    } else {
        // Ẩn canvas nếu không phải "nhập viện"
        canvas.style.display = "none";
    }
});

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
        token = localStorage.getItem('token');
        const response = await fetch(`/Khambenh/KetLuanKham?MaHoSo=${mahs}&ketluan=${payload}&token=${token}`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Lỗi máy chủ");
        }

        const result = await response.json();

        if (result.status === "success") {
            alert("kết luận thành công");
            window.location.href = `/Khambenh/Khambenhngoaitru?MaHoso=${encodeURIComponent(mahs)}`;
        } else {
            alert(result.message || "Lỗi không xác định");
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra khi đống hồ sơ");
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
