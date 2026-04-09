const express = require('express');
const XLSX = require('xlsx');
const path = require('path');
const app = express();
// 使用 fs 模块
const fs = require('fs');//读取写入文件，创建目录


// 读取Excel文件的函数
function readClimateData() {
  try {
    // 构建文件路径
    const filePath = path.join(__dirname, '极端气候-中国(2000-2025).xlsx');
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error('文件不存在:', filePath);
      return [];
    }
    
    // 读取工作簿
    const workbook = XLSX.readFile(filePath);
    
    // 打印所有工作表名称
    console.log('所有工作表:', workbook.SheetNames);
    
    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    console.log('第一个工作表名称:', firstSheetName);
    
    // 获取工作表
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 打印工作表范围
    console.log('工作表范围:', worksheet['!ref']);//！ref表示excel表格的有效范围如A1:C10
    

    let data = [];
    
    // 转换为JSON
    try {
      data = XLSX.utils.sheet_to_json(worksheet);
      console.log('成功使用 sheet_to_json 读取数据:', data.length, '条记录');
    } catch (error) {
      console.log('sheet_to_json 失败:', error.message);
      }
    return data;
    } catch (error) {
    console.error('读取文件失败:', error.message);
    return [];
  }
}



// 读取数据
const climateData = readClimateData();//数据实例

//让express托管该目录下的静态文件，如html,css,js等，
//客户端可以直接通过URL访问这些文件

app.use(express.static(path.join(__dirname))); // 将根目录设置为项目根目录

// API 路由，显示的内容，根据文件名改动
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home/Home.html'));
});

app.get('/Data', (req, res) => {
  res.sendFile(path.join(__dirname, 'Data/Data.html'));
});

app.get('/Method', (req, res) => {
  res.sendFile(path.join(__dirname, 'Method/Method.html'));
});

app.get('/Info', (req, res) => {
  res.sendFile(path.join(__dirname, 'Info/Query.html'));
});


//获取所有天气的数据
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    count: climateData.length,
    data: climateData
  });
});

// 获取统计数据，stateoverview
app.get('/api/stats', (req, res) => {
  if (climateData.length === 0) {
    return res.json({ success: true, data: {} });
  }

  // 计算统计数据
  const stats = {
    totalEvents: climateData.length,
    //.reduce()方法对数组中的每个元素执行一个由您提供的函数，将其结果汇总为单个返回值。
    //parseInt()将字符串转换为整数
    totalDeaths: climateData.reduce((sum, item) => sum + (parseInt(item['Total Deaths']) || 0), 0),
    totalLoss: climateData.reduce((sum, item) => sum + (parseFloat(item["Total Damage ('000 US$)"]) || 0), 0)
  };

  res.json({ success: true, data: stats });
});


// 获取年份统计数据
app.get('/api/yearly-stats', (req, res) => {
  const yearlyData = {};
  climateData.forEach(item => {
    const year = item['Start Year'];
    if (year) {
      yearlyData[year] = (yearlyData[year] || 0) + 1;
    }//统计某个年份的出现次数
  });

  res.json({ success: true, data: yearlyData });
});

//获取灾害类型统计数据
app.get('/api/type-stats', (req, res) => {
  const typeData = {};
  climateData.forEach(item => {
    const type = item['Disaster Type'];
    if (type) {
      typeData[type] = (typeData[type] || 0) + 1;
    }
  });

  res.json({ success: true, data: typeData });
});

// 获取地区统计数据
app.get('/api/region-stats', (req, res) => {
  const regionData = {};
  climateData.forEach(item => {
    const region = item['Classified Region'];
    if (region) {
      regionData[region] = (regionData[region] || 0) + 1;
    }
  });

  res.json({ success: true, data: regionData });
});


// 获取趋势数据
app.get('/api/trend-stats', (req, res) => {
  const trendData = {};
  climateData.forEach(item => {
    const year = item['Start Year'];
    if (year) {
      if (!trendData[year]) {
        trendData[year] = { deaths: 0, loss: 0 };
      }
      trendData[year].deaths += parseInt(item['Total Deaths']) || 0;
      trendData[year].loss += parseFloat(item["Total Damage ('000 US$)"]) || 0;
    }
  });

  res.json({ success: true, data: trendData });
});





const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);

});