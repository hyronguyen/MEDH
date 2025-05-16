document.addEventListener("DOMContentLoaded", function () {
    Queuecheck();
   

 
});

// FUCNTIONS ------------------------------------------------------------------------------------

function Queuecheck(){
    const statusButtons = document.querySelectorAll(".kb-status-btn");
    const patientList = document.getElementById("patient-list");
    const patientListContent = document.getElementById("patient-list-content");

    const data = {
        "Chờ khám": ["Nguyễn Văn A", "Lê Thị B", "Trần Văn C"],
        "Đã khám": ["Phạm Thị D", "Ngô Văn E"],
        "Chưa kết luận": ["Huỳnh Tấn F", "Đỗ Thị G", "Mai Văn H"],
        "Đã kết luận": ["Lê Hữu I", "Trần Thị J", "Nguyễn Văn K", "Phạm Hữu L"],
        "Chưa lĩnh thuốc": ["Bùi Thị M", "Đinh Văn N"]
    };

    statusButtons.forEach(button => {
        button.addEventListener("click", function () {
            const label = this.innerText.split(":")[0];

            // Toggle ẩn nếu click lại cùng nút
            if (patientList.style.display === "block" && patientList.previousClicked === this) {
                patientList.style.display = "none";
                return;
            }

            // Cập nhật nội dung
            const list = data[label] || [];
            patientListContent.innerHTML = list.map(name => `<li>${name}</li>`).join("");

            // Lấy vị trí nút được click
            const rect = this.getBoundingClientRect();

            // Đặt vị trí tuyệt đối theo tọa độ
            patientList.style.top = `${rect.bottom + window.scrollY}px`;
            patientList.style.left = `${rect.left + window.scrollX}px`;

            // Hiển thị bảng
            patientList.style.display = "block";
            patientList.previousClicked = this;
        });
    });


    document.addEventListener("click", function (e) {
        if (!patientList.contains(e.target) && ![...statusButtons].some(btn => btn.contains(e.target))) {
            patientList.style.display = "none";
        }
    });
}

// ACTIVE BUTTONS
document.querySelectorAll('.kb-tab-list .kb-tab').forEach(button => {
    button.addEventListener('click', () => {
        // Bỏ active của tất cả button
        document.querySelectorAll('.kb-tab-list .kb-tab').forEach(btn => btn.classList.remove('active'));
        // Thêm active cho button được click
        button.classList.add('active');
    });
});

// LẤY MÃ ICD
    const input = document.getElementById('icd-input');
    const suggestionsBox = document.getElementById('icd-suggestions');

    input.addEventListener('input', async () => {
        const query = input.value.trim();
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`/api/ICD/${encodeURIComponent(query)}`);
            const data = await response.json();

            const list = data.Search || [];
            if (list.length === 0) {
                suggestionsBox.style.display = 'none';
                return;
            }

            suggestionsBox.innerHTML = list.map(item =>
                `<div class="suggestion-item" data-code="${item.Name}" data-desc="${item.Description}">
        <strong>${item.Name}</strong> - ${item.Description}
    </div>`
            ).join('');

            suggestionsBox.style.display = 'block';
        } catch (error) {
            console.error("ICD fetch error:", error);
            suggestionsBox.style.display = 'none';
        }
    });

    // Khi người dùng chọn gợi ý
    suggestionsBox.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            input.value = item.getAttribute('data-code');
            suggestionsBox.style.display = 'none';
        }
    });

    // Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!suggestionsBox.contains(e.target) && e.target !== input) {
            suggestionsBox.style.display = 'none';
        }
    });

