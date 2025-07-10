// Nhấn tiêu đề => mở modal nhập PIN
document.getElementById("kioskTitle").addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("pinModal")).show();
});

// Xác thực PIN
document.getElementById("validatePinBtn").addEventListener("click", () => {
    const pin = document.getElementById("pinInput").value;
    const pinModal = bootstrap.Modal.getInstance(document.getElementById("pinModal"));

    if (pin === "1234") {
        pinModal.hide();

        // Đợi backdrop ẩn rồi mới mở modal khu vực
        setTimeout(() => {
            new bootstrap.Modal(document.getElementById("zoneModal")).show();
        }, 300);
    } else {
        document.getElementById("pinError").style.display = "block";
    }
});

// Lưu khu vực
document.getElementById("saveZoneBtn").addEventListener("click", () => {
    const zone = document.getElementById("zoneSelect").value;
    if (zone && zone !== "-- Chọn khu vực --") {
        document.getElementById("kioskTitle").textContent = `KIOSK - ${zone}`;
        bootstrap.Modal.getInstance(document.getElementById("zoneModal")).hide();

        // Cleanup backdrop nếu còn sót
        setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }, 300);
    }
});


function layVaInSTT(loai) {
    fetch(`/Qms/LaySTTKiosk?loai=${loai}`)
        .then(res => res.json())
        .then(data => {
            if (!data.html) throw new Error("Không có HTML phiếu");

            const iframe = document.getElementById("iframePhieuSTT");
            if (!iframe) return alert("Không tìm thấy iframe!");

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(data.html);
            doc.close();

            // Đợi iframe render xong rồi mới gọi in
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }, 300); // thời gian chờ nhỏ để đảm bảo render xong
            };

            // Hiển thị modal (nếu muốn người dùng thấy phiếu đang hiển thị)
            const modal = new bootstrap.Modal(document.getElementById("modalPhieuSTT"));
            modal.show();
        })
        .catch(err => {
            console.error(err);
            alert("Không thể lấy STT hoặc in phiếu.");
        });
}

