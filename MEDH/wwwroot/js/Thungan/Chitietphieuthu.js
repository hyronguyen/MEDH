function InHtmlPhieuThu(payload) {
    const iframe = document.getElementById("iframePhieuIn-thu");

    if (!iframe) {
        console.error("Không tìm thấy iframe để in.");
        return;
    }

    // Cập nhật style của iframe cho khổ in nhiệt 80mm
    iframe.style.width = "80mm";         // hoặc "302px"
    iframe.style.minHeight = "500px";
    iframe.style.background = "white";
    iframe.style.border = "none";

    // Mở modal chứa iframe
    const modal = new bootstrap.Modal(document.getElementById("modalInPhieuThu"));
    modal.show();

    // Ghi nội dung "Đang tải phiếu..." tạm thời vào iframe
    const loadingHtml = `
        <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; font-family: Arial; font-size: 14px; color: #555;">
            <div>Đang tải phiếu...</div>
        </div>
    `;
    const loadingDoc = iframe.contentWindow.document;
    loadingDoc.open();
    loadingDoc.write(loadingHtml);
    loadingDoc.close();

    // Gọi API để lấy nội dung HTML từ server
    fetch('/ThuNgan/InPhieuThu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/html'
        },
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Không thể tải nội dung phiếu thu.");
            }
            return res.text();
        })
        .then(html => {
            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(html);  // Ghi đè nội dung thực tế vào iframe
            doc.close();
        })
        .catch(error => {
            console.error("Lỗi khi tải nội dung phiếu thu:", error);
            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(`<div style="padding:20px; color:red;">Lỗi khi tải nội dung phiếu thu: ${error.message}</div>`);
            doc.close();
            alert("Đã xảy ra lỗi khi tải nội dung phiếu thu. Vui lòng thử lại.");
        });
}


function ThucHienInPDFThu() {
    const iframe = document.getElementById("iframePhieuIn-thu");
    if (!iframe || !iframe.contentWindow) {
        console.error("Không tìm thấy iframe hoặc iframe chưa sẵn sàng.");
        return;
    }

    const iframeWindow = iframe.contentWindow;

    iframeWindow.focus();
    iframeWindow.print();

    // Ẩn modal sau khi in
    const modalElement = document.getElementById('modalInPhieuThu');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        setTimeout(() => modalInstance.hide(), 500); 
    }
}

async function TatToan(mahoso,sotien) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("❌ Không tìm thấy token đăng nhập.");
        return;
    }
    const xacNhan = confirm(`Xác nhận tất toán cho hồ sơ: ${mahoso}`);

    if (!xacNhan) return;

    try {
        const response = await fetch('/ThuNgan/TatToan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                so_tien_tat_toan: sotien,
                ma_ho_so: mahoso
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Tất toán thất bại:", result);
            alert(`❌ Lỗi: ${result.message || 'Không thể Hoàn tạm ứng.'}`);
            return;
        }

        alert(`✅ ${result.r_message || 'Hoàn tạm ứng thành công.'}`);
    } catch (err) {
        console.error("❌ Lỗi kết nối khi tất toán:", err);
        alert("❌ Không thể kết nối tới máy chủ.");
    }
}