
let filteredData = [];
let charts = {};
let importedData = [];
let currentPage = 1;  // 当前页码
let pageSize = 10;    // 每页显示条数

//监听文件上传
//页面加载时从服务器获取数据
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromServer();
    initTabSwitching();
});

//从服务器获取数据
async function loadDataFromServer() {
     try {
        console.log('正在加载数据...');
        const response = await fetch('/api/data');
        console.log('服务器响应状态:', response.status);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log('服务器返回数据:', result);
    
    if (result.success) {
      importedData = result.data;
      filteredData = [...importedData];
      
      // 初始化筛选器
      initFilters();
      
      // 生成图表
      generateCharts();

      //初始化地图
      initMap();
      
      // 更新界面
      updateUI();
      
      console.log('数据加载成功，共', importedData.length, '条记录');
    } else {
      alert('数据加载失败');
    }
  } catch (error) {
    console.error('加载数据时出错:', error);
    // alert('无法连接到服务器，请确保服务器正在运行');
  }
}

// 初始化筛选器选项
function initFilters() {
    // 清空现有选项
    document.getElementById('year-range').innerHTML = '<option value="all">全部年份/All Years</option>';
    document.getElementById('disaster-type').innerHTML = '<option value="all">全部类型/All Types</option>';
    document.getElementById('region').innerHTML = '<option value="all">全部地区/All Regions</option>';

    // 年份选项
    const years = [...new Set(importedData.map(item => item['Start Year']))].sort();
    const yearSelect = document.getElementById('year-range');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // 灾害类型选项
    const types = [...new Set(importedData.map(item => item['Disaster Type']))];
    const typeSelect = document.getElementById('disaster-type');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });

    // 地区选项
    const regions = [...new Set(importedData.map(item => item['Classified Region']))];
    const regionSelect = document.getElementById('region');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

// 根据用户选择的条件来筛选数据
function applyFilters() {

    // 网页上找到那三个下拉菜单，看看用户分别选了什么
    const yearFilter = document.getElementById('year-range').value;
    const typeFilter = document.getElementById('disaster-type').value;
    const regionFilter = document.getElementById('region').value;

    //过滤器获取信息
    filteredData = importedData.filter(item => {
        // 是获取每条记录的具体信息
        const year = item['Start Year'];
        const type = item['Disaster Type'];
        const province = item['Classified Region'];
    

        
        return (yearFilter === 'all' || year == yearFilter) &&
                (typeFilter === 'all' || type === typeFilter) &&
                (regionFilter === 'all' || province === regionFilter);
    });
    currentPage = 1;
    updateUI();
}

 // 重置筛选
function resetFilters() {

    document.getElementById('year-range').value = 'all';
    document.getElementById('disaster-type').value = 'all';
    document.getElementById('region').value = 'all';
    filteredData = [...importedData];
    currentPage = 1; // 重置到第一页
    updateUI();

}

function updateStatsOverview() {
    // 如果没有数据，直接返回
    if (filteredData.length === 0) {
        document.getElementById('total-events').textContent = '0';
        document.getElementById('total-deaths').textContent = '0';
        document.getElementById('total-loss').textContent = '0';
        document.getElementById('most-common-type').textContent = '-';
        return;
    }

    // 总事件数,用id去显示
    document.getElementById('total-events').textContent = filteredData.length;

    // 总死亡人数
    const totalDeaths = filteredData.reduce((sum, item) => {
        return sum + (parseInt(item['Total Deaths']) || 0);
    }, 0);
    document.getElementById('total-deaths').textContent = totalDeaths.toLocaleString();

    // 总经济损失
    const totalLoss = filteredData.reduce((sum, item) => {
        return sum + (parseFloat(item["Total Damage ('000 US$)"]) || 0);
    }, 0);
    document.getElementById('total-loss').textContent = Math.round(totalLoss).toLocaleString();

    // 最常见灾害类型
    const typeCount = {};
    filteredData.forEach(item => {
        const type = item["Disaster Type"];
        typeCount[type] = (typeCount[type] || 0) + 1;
    });
    // 找出出现次数最多的灾害类型
    //Object.entries(typeCount): 将对象转换为键值对数组
    //reduce((a, b):遍历数组，并将所有元素“浓缩”成一个最终值。
    //a,b是一个 [名称, 次数] 格式的数组
    // => a[1] > b[1] ? a : b, ['', 0]): 找出值最大的键值对
    //a : b 的意思是：如果擂主 a 的次数比挑战者 b 多，那么擂主 继续留在擂台，否则挑战者 b 成为新的擂主
    //['', 0]: 初始值，表示还没有任何键值对参与比较
    //[0]: 取出键（灾害类型）
    const mostCommon = Object.entries(typeCount).reduce((a, b) => 
        a[1] > b[1] ? a : b, ['', 0]
    )[0];
    document.getElementById('most-common-type').textContent = mostCommon || '-';
}

// 示例函数：生成图表-----------------------------------------------------------
// 修改 generateCharts 函数
async function generateCharts() {
  try {
    // 获取各类统计数据
    const [yearlyRes, typeRes, regionRes, trendRes] = await Promise.all([
      fetch('/api/yearly-stats'),
      fetch('/api/type-stats'),
      fetch('/api/region-stats'),
      fetch('/api/trend-stats')
    ]);

    const yearlyData = await yearlyRes.json();
    const typeData = await typeRes.json();
    const regionData = await regionRes.json();
    const trendData = await trendRes.json();

    if (yearlyData.success) createYearlyChart(Object.entries(yearlyData.data));
    if (typeData.success) createTypeChart(Object.entries(typeData.data));
    if (regionData.success) createRegionChart(Object.entries(regionData.data));
    if (trendData.success) createTrendChart(Object.entries(trendData.data));
    
  } catch (error) {
    console.error('加载图表数据失败:', error);
  }
}

// 创建年度灾害数量统计图表-----------------------------------------------------
async function createYearlyChart(data) {
    //getContext('2d')：用于获取Canvas元素的2D渲染上下文
    //可以使用各种绘图方法在Canvas上绘制图形、文字、图像等
    const ctx = document.getElementById('yearly-chart').getContext('2d');
    

    //Object.keys: 获取对象的所有键（年份：次数），并排序
    //sort(): 对年份进行排序
    //map(): 对年份进行映射，将每个年份映射为对应的次数
    const sortedData = filteredData.sort((a, b) => a[0] - b[0]);
    const years = data.map(item => item[0]).sort();
    const counts = years.map(year => data.find(item => item[0] === year)[1]);
    
    // 销毁之前的图表（如果存在）
    if (charts.yearly) charts.yearly.destroy();
    
    charts.yearly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: '事件数量',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '年度灾害统计',
                    color: 'white',
                    font: {
                        size: 30
                    }
                },
                legend: {
                    labels: {
                        color: 'white'
                    }
                }                
            },
            scales: {
                y: {
                    ticks: { color: 'white' }
                },

                x: { 
                    ticks: { color: 'white' }
                }

            }
        }
    });
}


// 灾害类型分布图表-----------------------------------------------------
async function createTypeChart(data) {
    const ctx = document.getElementById('type-chart').getContext('2d');
    
    const labels = data.map(item => item[0]);
    const counts = data.map(item => item[1]);


    if (charts.type) charts.type.destroy();
    
    charts.type = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#8AC926', '#1982C4'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '灾害类型分布',
                    color: 'white',
                    font: {
                        size: 30
                    }
                },
                legend: {
                    labels: {
                        color: 'white'
                    }
                }  
            }
        },

    });
}

// 地区分布图表
async function createRegionChart(data) {
    const ctx = document.getElementById('region-chart').getContext('2d');
   
    //排序，取前十
    const sortedData = data.sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = sortedData.map(item => item[0]);
    const counts = sortedData.map(item => item[1]);

    if (charts.region) charts.region.destroy();
    
    charts.region = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '事件数量',
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.8)'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '地区分布',
                    color: 'white',
                    font: {
                        size: 30
                    }
                },
                legend: {
                    labels: {
                        color: 'white'
                    }
                }  
            },
            scales: {
                y: {
                    ticks: { color: 'white' }
                },

                x: { 
                    ticks: { color: 'white' }
                }

            }
        }
    });
}

// 创建时间趋势图表-----------------------------------------------------
function createTrendChart(data) {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    
    const sortedData = data.sort((a, b) => a[0] - b[0]);
    const years = sortedData.map(item => item[0]);
    const deaths = sortedData.map(item => item[1].deaths);
    const losses = sortedData.map(item => item[1].loss);

    if (charts.trend) charts.trend.destroy();
    
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: '死亡人数',
                    data: deaths,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y'
                },
                {
                    label: '经济损失(US$)',
                    data: losses,
                    borderColor: 'rgb(54, 162, 235)',//
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',//
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '年度趋势分析',
                    color: 'white',
                    font: {
                        size: 30
                    }
                },
                legend: {
                    labels: {
                        color: 'white'
                    }
                }

            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: '死亡人数',color: 'white' },
                    ticks: { color: 'white' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: '经济损失(US$)',color: 'white' },
                    grid: { drawOnChartArea: false },
                    ticks: { color: 'white' }
                },
                x: { 
                    ticks: { color: 'white' }
                }

            }
        }
    });
}



//中国地图显示-----------------------------------------------------

// 全局变量，用于存储解析后的数据
let excelData = [];
let disasterTypes = [];
let myChart;

// 省份名称映射表：将Excel中的英文名映射到ECharts地图所需的中文名
// 这是关键一步，确保你的Excel省份名能被正确识别
const provinceMap = {
    'Anhui Province': '安徽', 'Beijing Municipality': '北京', 'Chongqing Municipality': '重庆',
    'Fujian Province': '福建', 'Gansu Province': '甘肃', 'Guangdong Province': '广东',
    'Guangxi Zhuang Autonomous Region': '广西', 'Guizhou Province': '贵州', 'Hainan Province': '海南',
    'Hebei Province': '河北', 'Heilongjiang Province': '黑龙江', 'Henan Province': '河南',
    'Hubei Province': '湖北', 'Hunan Province': '湖南', 'Inner Mongolia Autonomous Region': '内蒙古',
    'Jiangsu Province': '江苏', 'Jiangxi Province': '江西', 'Jilin Province': '吉林',
    'Liaoning Province': '辽宁', 'Ningxia Hui Autonomous Region': '宁夏', 'Qinghai Province': '青海',
    'Shaanxi Province': '陕西', 'Shandong Province': '山东', 'Shanghai Municipality': '上海',
    'Shanxi Province': '山西', 'Sichuan Province': '四川', 'Tianjin Municipality': '天津',
    'Tibet Autonomous Region': '西藏', 'Xinjiang Uygur Autonomous Region': '新疆', 'Yunnan Province': '云南',
    'Zhejiang Province': '浙江'
    // 根据你的Excel表格补充或修改
};

// 在 initMap() 中添加 ResizeObserver 监听
function initMap() {
    const chartDom = document.getElementById('main-map');

    if (!myChart) {
        myChart = echarts.init(chartDom);
    }

    // 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === chartDom && myChart) {
                myChart.resize();
            }
        }
    });

    resizeObserver.observe(chartDom);

    // 设置初始空地图选项
    const option = {
        title: {
            text: '请选择灾害类型',
            left: 'center'
        },
        series: [{
            type: 'map',
            map: 'china',
            roam: true,
            itemStyle: {
                areaColor: '#3b569a',
                borderColor: '#fff',
                borderWidth: 1
            },
            emphasis: {
                itemStyle: {
                    areaColor: '#6b8ebe'
                }
            },
            label: {
                show: true,
                color: '#333',
                fontSize: 10
            }
        }]
    };

    myChart.setOption(option);

    // 强制 resize 两次，确保兼容性
    setTimeout(() => {
        myChart.resize();
        setTimeout(() => myChart.resize(), 200);
    }, 50);

    loadMapData();
}

// 2. 从服务器中获取加载地图数据
async function loadMapData() {
  try {
    const response = await fetch('/api/data');
    const result = await response.json();
    
    if (result.success) {
      excelData = result.data;
      processMapData(excelData);
    }
  } catch (error) {
    console.error('加载地图数据失败:', error);
  }
}


// 3. 处理数据，应用于地图
function processMapData(jsonData) {

    if (jsonData.length === 0) {
        return;
    }
    
    // 从"Disaster Type"列中获取唯一的灾害类型
    const disasterSet = new Set();
    jsonData.forEach(row => {
        if (row['Disaster Type']) {
        disasterSet.add(row['Disaster Type']);
        }
    });

    disasterTypes = Array.from(disasterSet);
    
    if (disasterTypes.length === 0) {
        return;
    }

    // 更新下拉选择框
    const selector = document.getElementById('disaster-selector');
    selector.innerHTML = '';
    disasterTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        selector.appendChild(option);
    });
    selector.disabled = false;

    // 默认显示第一个灾害类型的数据
    updateMap(disasterTypes[0]);
}

// 4. 监听灾害类型选择框的变化
document.getElementById('disaster-selector').addEventListener('change', function(event) {
  const selectedDisaster = event.target.value;
  if (selectedDisaster) {
    updateMap(selectedDisaster);
  }
});

// 5. 根据选择的灾害类型更新地图
function updateMap(disasterType) {
    const provinceCounts = {};

    // 筛选出选定灾害类型的数据并按地区统计
    excelData
        .filter(row => row['Disaster Type'] === disasterType)
        .forEach(row => {
            const provinceNameEn = row['Classified Region'];
            const provinceNameZh = provinceMap[provinceNameEn];
            // 映射为中文名
            // 统计数量
            if (provinceNameZh) {
                provinceCounts[provinceNameZh] = (provinceCounts[provinceNameZh] || 0) + 1;
            }
        });

    // 准备ECharts需要的数据格式: [{name: '北京', value: 5}, ...]
    //Object.keys(provinceCounts): 获取对象的所有键（省份名）
    //.map(): 形成数组方法，匹配键值对
    //province: 回调函数的参数，该参数代表数组中的每个省份名，用以调取灾害次数
    const mapData = Object.keys(provinceCounts).map(province => ({
        name: province,
        value: provinceCounts[province]// 省份名对应的灾害次数
    }));

    renderMap(mapData, disasterType);
}

// 6. 渲染地图的函数
function renderMap(data, title) {
    //调取mapdata中的各省灾害次数
    const values = data.map(item => item.value);
    // 计算数据中的最大值，用于设置visualMap的范围
    const max = values.length > 0 ? Math.max(...values) : 0;

    const option = {
        title: {
            text: `${title} 在中国的分布情况`,
            subtext: '数据来源: 用户导入的Excel文件',
            left: 'center',
            textStyle: {
                color: '#f6f6f6'
            },
            subtextStyle: {
                color: '#cccccc'  // 副标题颜色
            }
            
        },
        tooltip: { // 提示框组件
            trigger: 'item',
            formatter: '{b}<br/>{a}: {c}' // {b}省份名, {a}系列名, {c}数值
        },
        visualMap: { // 视觉映射组件，用于颜色分级
            min: 0,//
            max: max, // 动态设置最大值，设置颜色的区分度
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],
            calculable: true,
            inRange: {
                // 颜色从浅到深
                color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
            }
        },
        
        series: [//设置地图内容
            {
                name: title, // 系列名称，会显示在tooltip中
                type: 'map',
                map: 'china',
                roam: true, // 开启鼠标缩放和漫游
                label: {
                    show: true, // 显示省份标签
                    color: '#333',
                    fontSize: 10
                },
                data: data,
                emphasis: { // 高亮状态下的样式
                    label: {
                        color: '#000'
                    },
                    itemStyle: {
                        areaColor: '#ffc107' // 高亮区域颜色
                    }
                }
            }
        ]
    };

    myChart.setOption(option); // true表示不与之前的option合并
    myChart.resize();
}


// 更新用户界面-----------------------------------------------------
function updateUI() {
    updateStatsOverview();
    renderTable()
}


// ============================================================================
// 添加导航功能
document.addEventListener('DOMContentLoaded', function() {
    // 导航链接点击事件
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            const targetSection = document.getElementById(this.getAttribute('data-target'));
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // 如果是地图部分，确保地图正确渲染
            if (this.getAttribute('data-target') === 'map-section' && myChart) {
                setTimeout(() => {
                    myChart.resize();
                }, 100);
            }
        });
    });
    
});