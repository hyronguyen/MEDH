document.addEventListener("DOMContentLoaded", () => {
    const qmsTitle = document.getElementById('qmsTitle');
    const pinModalEl = document.getElementById('pinModal');
    const roomModalEl = document.getElementById('roomModal');
    const pinInput = document.getElementById('pinInput');
    const pinError = document.getElementById('pinError');
    const validatePinBtn = document.getElementById('validatePinBtn');
    const saveRoomBtn = document.getElementById('saveRoomBtn');
    const roomSelect = document.getElementById('roomSelect');

    // Khởi tạo modal
    const pinModal = new bootstrap.Modal(pinModalEl);
    const roomModal = new bootstrap.Modal(roomModalEl);

    // Mở modal nhập PIN khi nhấn tiêu đề
    qmsTitle.addEventListener('click', () => {
        pinError.style.display = 'none';
        pinInput.value = '';
        pinModal.show();
    });

    // Xác thực PIN
    validatePinBtn.addEventListener('click', () => {
        const pin = pinInput.value.trim();
        if (pin === '1234') {
            pinModal.hide();

            setTimeout(() => {
                roomModal.show();
            }, 300);
        } else {
            pinError.style.display = 'block';
        }
    });

    // Lưu quầy / phòng được chọn
    saveRoomBtn.addEventListener('click', () => {
        const selectedRoom = roomSelect.value;
        if (!selectedRoom || selectedRoom === 'Chọn quầy / phòng...') return;

        roomModal.hide();

        // Đặt lại tiêu đề
        qmsTitle.textContent = `QMS - ${selectedRoom}`;

        // Xử lý backdrop (nếu có sự cố)
        setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }, 300);
    });
});
