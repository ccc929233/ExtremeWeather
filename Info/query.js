const errorContainer = document.getElementById('errorContainer');
const emptyTip = document.getElementById('emptyTip');
const tableBody = document.getElementById('tableBody');
const resultTable = document.getElementById('resultTable');
const yearInput = document.getElementById('yearInput');
const locationInput = document.getElementById('locationInput');
const typeInput = document.getElementById('typeInput');
const disNoInput = document.getElementById('disNoInput');
const getAllBtn = document.getElementById('getAllBtn');
const getByYearBtn = document.getElementById('getByYearBtn');
const getByLocationBtn = document.getElementById('getByLocationBtn');
const getByTypeBtn = document.getElementById('getByTypeBtn');
const getByDisNoBtn = document.getElementById('getByDisNoBtn');

const baseUrl = 'http://localhost:8080/api/disasters';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 关键：展开/收起切换函数（控制当前行所有超长数据显示）
function toggleExpand(rowId, btn) {
    // 获取当前行所有需要展开的单元格（添加.data-cell类的列）
    const dataCells = document.querySelectorAll(`#${rowId} .data-cell`);
    // 切换单元格展开状态
    dataCells.forEach(cell => cell.classList.toggle('expanded'));
    // 切换按钮文本和样式
    if (dataCells[0].classList.contains('expanded')) {
        btn.textContent = '收起';
        btn.classList.add('collapse');
    } else {
        btn.textContent = '展开';
        btn.classList.remove('collapse');
    }
}

function clearPageState() {
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';
    tableBody.innerHTML = '';
    emptyTip.style.display = 'none';
    resultTable.style.display = 'table';
}

// 关键：渲染表格时，为超长数据列添加.data-cell类，并在最后一列加展开按钮
function renderTable(data) {
    if (!data || data.length === 0) {
        resultTable.style.display = 'none';
        emptyTip.style.display = 'flex';
        return;
    }

    data.forEach((item, index) => {
        const rowId = `row-${index}`; // 给每行设置唯一ID，用于展开控制
        const tr = document.createElement('tr');
        tr.id = rowId; // 绑定行ID

        // 表格内容：为“发生地点”等易超长列添加.data-cell类
        tr.innerHTML = `
            <td class="data-cell">${item.disNo || '无'}</td>
            <td class="data-cell">${item.disasterType || '无'}</td>
            <td class="data-cell">${item.country || '无'}</td>
            <td class="data-cell">${item.location || '无'}</td> <!-- 最易超长，必加类 -->
            <td class="data-cell">${item.startYear || '无'}</td>
            <td class="data-cell">${item.totalDamage || '无'}</td>
            <td class="data-cell">${item.totalAffected || '无'}</td>
            <td class="data-cell">${item.magnitude || '无'}</td>
            <!-- 新增：展开按钮，点击时触发toggleExpand函数 -->
            <td>
                <button class="expand-btn" onclick="toggleExpand('${rowId}', this)">展开</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function showError(message) {
    errorContainer.style.display = 'block';
    errorContainer.textContent = `错误：${message}`;
}

// 按钮点击事件（保持不变）
getByDisNoBtn.addEventListener('click', async () => {
    const disNo = disNoInput.value.trim();
    if (!disNo) {
        showError('请输入灾害编号（DisNo.）');
        return;
    }
    clearPageState();
    try {
        const response = await axios.get(`${baseUrl}/by-disno?disNo=${disNo}`);
        renderTable(response.data);
        disNoInput.value = '';
    } catch (err) {
        const errorMsg = err.response?.data?.error || '按DisNo.查询失败';
        showError(errorMsg);
    }
});

getAllBtn.addEventListener('click', async () => {
    clearPageState();
    try {
        const response = await axios.get(baseUrl);
        renderTable(response.data);
    } catch (err) {
        const errorMsg = err.response?.data?.error || '获取数据失败';
        showError(errorMsg);
    }
});

getByYearBtn.addEventListener('click', async () => {
    const year = yearInput.value.trim();
    if(!year || year>2025 || year<2000)
    {
        yearInput.value = '';
        showError('年份输入超出数据库内容');
        return;
    }
    clearPageState();
    try {
        const response = await axios.get(`${baseUrl}/by-year?year=${year}`);
        renderTable(response.data);
        yearInput.value = '';
    } catch (err) {
        const errorMsg = err.response?.data?.error || '查询失败';
        showError(errorMsg);
    }
});

getByLocationBtn.addEventListener('click', async () => {
    const location = locationInput.value.trim();
    if (!location) {
        showError('请输入地址关键词');
        return;
    }
    clearPageState();
    try {
        const response = await axios.get(`${baseUrl}/by-location?location=${location}`);
        renderTable(response.data);
        locationInput.value = '';
    } catch (err) {
        const errorMsg = err.response?.data?.error || '查询失败';
        showError(errorMsg);
    }
});

getByTypeBtn.addEventListener('click', async () => {
    const type = typeInput.value.trim();
    if (!type) {
        showError('请输入灾害类型');
        return;
    }
    clearPageState();
    try {
        const response = await axios.get(`${baseUrl}/by-type?type=${type}`);
        renderTable(response.data);
        typeInput.value = '';
    } catch (err) {
        const errorMsg = err.response?.data?.error || '查询失败';
        showError(errorMsg);
    }
});