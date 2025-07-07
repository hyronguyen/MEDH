import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/+esm';

window.supabase = createClient(api_host, apikey);
let maPhongHienTai = null;

document.addEventListener("DOMContentLoaded", () => {    
    ModelChonQms();
    Laythongtinquay();
});

// REALTIME: KIỂM TRA TRẠNG THÁI GỘi
window.supabase
    .channel('realtime:hangdoi')
    .on(
        'postgres_changes',
        {
            event: 'UPDATE',
            schema: 'public',
            table: 'hangdoi',
            filter: 'trang_thai=eq.da_goi'  // chỉ cần điều kiện thay đổi thành true
        },
        async (payload) => {
            console.log('📡 Cập nhật từ Realtime:', payload);
            if (maPhongHienTai) {
                await capNhatSTT(maPhongHienTai);
            }
        }
    )
    .subscribe();



// FUNCTION: CẬP NHẬT HIỂN THỊ MÀN HÌNH QMS
async function capNhatSTT(maPhong) {
    const stt = await LaySTTDaGoiMoiNhat(maPhong);
    if (stt !== null) {
        const currentTicketEl = document.getElementById("currentTicket");
        if (currentTicketEl) {
            currentTicketEl.textContent = stt.toString().padStart(4, '0');
        }
    }
}


// FUNCTION: CHỌN MÀN HÌNH QMS
function ModelChonQms() {
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
        const selectedRoom = roomSelect.options[roomSelect.selectedIndex].text;
        maPhongHienTai = roomSelect.value;
        if (!selectedRoom || selectedRoom === 'Chọn quầy / phòng...') return;

        roomModal.hide();

        
        qmsTitle.textContent = `QMS - ${selectedRoom}`;
        capNhatSTT(maPhongHienTai);

        // Xử lý backdrop (nếu có sự cố)
        setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }, 300);

        
    });
}

// FUNCTION: LOAD DANH SÁCH MÀN HÌNH
async function Laythongtinquay() {
    const selectElement = document.getElementById("roomSelect");

    if (!selectElement) {
        console.error("Không tìm thấy phần tử #roomSelect trong DOM.");
        return;
    }

    // Gợi ý: đặt sẵn option tạm thời
    selectElement.innerHTML = `<option disabled selected>Đang tải Màn hình QMS...</option>`;

    // Gọi hàm lấy danh sách phòng
    const danhSachPhong = await LayDanhSachPhong();

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