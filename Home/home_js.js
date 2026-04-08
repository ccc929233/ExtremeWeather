document.addEventListener('DOMContentLoaded', () => {
    // 侧边栏相关元素
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');


    // 侧边栏切换 - 保持逻辑不变，动画由CSS控制
    menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
    });

    // 点击页面其他区域关闭侧边栏
    document.addEventListener('click', (e) => {
    // 如果点击的不是侧边栏也不是菜单按钮，则关闭
    if (!sidebar.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }
    });

    // 页面加载完成后自动获取定位天气
    window.addEventListener('load', getLocationWeather);

    async function getLocationWeather() {
        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await getWeatherByCoords(lat, lon);
            },
            (error) => {
            console.error('Geolocation error:', error);
            // 定位失败时显示默认提示
            document.getElementById('location').textContent = '定位失败';
            document.getElementById('temp').textContent = '--';
            document.getElementById('condition').textContent = '请使用搜索功能';
            document.getElementById('high-low').textContent = '-- --';
            document.getElementById('humidity').textContent = '--%';
            }
        );
        } else {
        // 浏览器不支持地理定位
        document.getElementById('location').textContent = '不支持定位';
        document.getElementById('temp').textContent = '--';
        document.getElementById('condition').textContent = '请使用搜索功能';
        document.getElementById('high-low').textContent = '-- --';
        document.getElementById('humidity').textContent = '--%';
        }
    }

    async function getWeatherByCoords(lat, lon) {
        const apiKey = '00ab7b479569de3d351a11f560fc543a';
        
        // 先通过反向地理编码获取城市名称
        const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
        
        try {
            // 获取城市名称
            const reverseResponse = await fetch(reverseGeocodeUrl);
            if (!reverseResponse.ok) throw new Error('无法获取位置信息');
            
            const locationData = await reverseResponse.json();
            let cityName = '未知地区';
            
            if (locationData && locationData.length > 0) {
                // 优先使用城市名称，如果没有则使用地区名称
                cityName = locationData[0].name || locationData[0].locality || locationData[0].state || '未知地区';
            }
            
            // 然后获取天气信息
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=zh_cn`;
            const weatherResponse = await fetch(weatherUrl);
            
            if (!weatherResponse.ok) throw new Error('无法获取天气数据');
            
            const weatherData = await weatherResponse.json();
            // 将通过反向地理编码获取的城市名称添加到天气数据中
            weatherData.name = cityName;
            
            updateWeatherDisplay(weatherData);
        } catch (error) {
            handleWeatherError(error);
        }
    }

    
    function updateWeatherDisplay(data) {
        document.getElementById('location').textContent = data.name || '未知地区';
        document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C` || '--';
        document.getElementById('condition').textContent = data.weather[0].description || '--';
        document.getElementById('high-low').textContent = `${data.main.temp_max ? Math.round(data.main.temp_max)+'°' : '--'} / ${data.main.temp_min ? Math.round(data.main.temp_min)+'°' : '--'}`;
        document.getElementById('humidity').textContent = `${data.main.humidity || '--'}%`;
    }

    function handleWeatherError(error) {
        document.getElementById('location').textContent = '获取失败';
        document.getElementById('temp').textContent = '--';
        document.getElementById('condition').textContent = error.message;
        document.getElementById('high-low').textContent = '--/--';
        document.getElementById('humidity').textContent = '--%';
    }

    // 天气信息DOM元素
    
    // 给搜索框添加键盘事件打开AI对话框
    document.querySelector('.search-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            openAiModal();
        }
    });
    // 给搜索框添加点击事件打开AI对话框
    document.querySelector('.search-input').addEventListener('click', function() {
        openAiModal();
    });

    // 给底部搜索框添加键盘事件
    document.querySelector('.search-input-footer').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const city = this.value.trim();
            if (city) {
            getWeather(city); // 调用已有函数
            } else {
            alert('请输入城市名称');
            }
        }
        });

        async function getWeather(city = null) {
    const apiKey = '00ab7b479569de3d351a11f560fc543a';
    
    // 如果没有传参，则使用输入框中的值
    const cityName = city || document.querySelector('.search-input').value;

    if (!cityName) {
        document.getElementById('location').textContent = '请输入城市名称';
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=zh_cn`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
        if (response.status === 404) {
            throw new Error('找不到该城市，请检查拼写。');
        } else if (response.status === 401) {
            throw new Error('API密钥无效或未提供，请检查代码。');
        } else {
            throw new Error('无法获取天气数据。');
        }
        }

        const data = await response.json();
        updateWeatherDisplay(data);

    } catch (error) {
        handleWeatherError(error);
    }
}

    // AI 对话框相关元素
    const aiModal = document.getElementById('ai-modal');
    const closeAiModal = document.querySelector('#ai-modal .close');
    const aiInput = document.getElementById('ai-input');
    const submitAi = document.getElementById('submit-ai');
    const aiResults = document.getElementById('ai-results');
    // 打开AI对话框
    function openAiModal() {
        aiModal.style.display = 'block';
        aiInput.focus();
    }

    // 关闭AI对话框
    closeAiModal.addEventListener('click', function() {
        aiModal.style.display = 'none';
        aiResults.innerHTML = '';
        aiInput.value = '';
    });

    // 点击模态框外部关闭对话框
    window.addEventListener('click', function(event) {
        if (event.target == aiModal) {
            aiModal.style.display = 'none';
            aiResults.innerHTML = '';
            aiInput.value = '';
        }
    });

    // AI 查询功能
    submitAi.addEventListener('click', async function() {
        const question = aiInput.value.trim();
        
        if (!question) {
            alert('请输入您的问题');
            return;
        }
        
        // 显示加载状态
        aiResults.innerHTML = '<div class="loading">正在思考中...</div>';
        
        try {
            // Gemini API 请求
            const API_KEY = 'AIzaSyCkbtJkkyl8ORO3H4aGJARP4PyYizDD2_A';
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
            
            // 构造请求内容
            const prompt = `你是一个极端天气专家助手，请用中文回答以下问题：${question}
            
            请以以下JSON格式返回结果：
            {
              "results": [
                {
                  "title": "要点1",
                  "description": "详细说明"
                },
                {
                  "title": "要点2", 
                  "description": "详细说明"
                }
              ]
            }`;
            
            const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            };
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            
            // 解析Gemini的响应
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const responseText = data.candidates[0].content.parts[0].text;
                try {
                    // 尝试直接解析标准JSON
                    const jsonData = JSON.parse(responseText);
                    displayAiResults(jsonData);
                } catch (parseError) {
                    // 如果直接解析失败，调用更强的文本清理函数
                    console.error('JSON直接解析失败，尝试清理文本:', parseError);
                    displayTextResults(responseText);
                }
            } else {
                throw new Error('API返回格式不正确');
            }
        } catch (error) {
            console.error('查询出错:', error);
            aiResults.innerHTML = `<div class="error">查询出错: ${error.message}</div>`;
        }
    });

    // 显示AI输出结果
    function displayAiResults(data) {
        if (!data.results || data.results.length === 0) {
            aiResults.innerHTML = '<div class="no-results">未找到相关信息</div>';
            return;
        }

        let html = '<h3>回答：</h3><ul>';
        data.results.forEach(result => {
            const title = result.title ? result.title : '要点';
            const description = result.description ? result.description : '无详细说明';
            html += `<li><strong>${title}:</strong> ${description}</li>`;
        });
        html += '</ul>';

        aiResults.innerHTML = html;
    }

    // 当API返回的不是标准JSON时，尝试清理并解析
    function displayTextResults(text) {
        let cleanedText = text.trim();

        // 移除包裹的Markdown代码块标记 (```json ... ```)
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.substring(3, cleanedText.length - 3).trim();
        }
        
        // 找到第一个 '{' 和最后一个 '}'，提取之间的内容
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace > firstBrace) {
            cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
        }
        
        try {
            const jsonData = JSON.parse(cleanedText);
            displayAiResults(jsonData);
        } catch (parseError) {
            console.error('最终JSON解析尝试失败:', parseError);
            // 如果所有尝试都失败了，则显示原始文本，以便调试
            aiResults.innerHTML = `
                <div class="error">
                <h3>无法解析查询结果，显示原始数据：</h3>
                <pre>${text}</pre>
                </div>
            `;
        }
    }


});