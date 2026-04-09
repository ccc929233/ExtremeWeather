document.addEventListener('DOMContentLoaded', function() {
  const tagItems = document.querySelectorAll('.tag-item');
  const textMask = document.querySelector('.text');
  const methodList = document.querySelector('.method-list');
  const detailLink = document.querySelector('.detail-link');

  // 新增对话框相关元素
  const modal = document.getElementById('info-modal');
  const closeModal = document.querySelector('.close');
  const disasterInput = document.getElementById('disaster-input');
  const submitQuery = document.getElementById('submit-query');
  const queryResults = document.getElementById('query-results');
  const linksContainer = document.getElementById('links-container');

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


  let currentActiveTag = null;

  function closeMask() {
    currentActiveTag = null;
    
    textMask.classList.remove('active');
    document.body.style.overflow = 'auto';
    methodList.innerHTML = '';
    
    tagItems.forEach(item => {
      item.classList.remove('active', 'moved', 'hidden');
    });
  }

  // 点击遮罩内部触发关闭
  textMask.addEventListener('click', function() {
    closeMask();
  });

  // 天气措施映射
  const weatherMethods = {
    rain: [
      "减少外出，避开低洼积水区（如地下通道、涵洞），绕开落水管和电箱",
      "家中提前清理阳台/厨房地漏，防止雨水倒灌；若进水先断电源再排水",
      "驾车遇积水（超过轮胎1/2）立即停车，勿强行通过，避免熄火",
      "户外遇雷电时，远离大树、电线杆、广告牌，不使用手机和金属物品",
      "关注气象预警，若发布红色预警，立即转移至高处安全区域"
    ],
    temp: [
      "10:00-16:00避免外出，外出穿浅色系宽松衣裤，戴遮阳帽和防紫外线墨镜",
      "每1-2小时喝150-200ml温水（加少许盐），忌冰饮，防脱水和中暑",
      "室内开空调温度不低于26℃，定期开窗通风，避免温差过大感冒",
      "老人、儿童、慢性病患者减少外出，备藿香正气水等防暑药品",
      "车内不放打火机、香水等易燃易爆物，避免暴晒后自燃"
    ],
    typhoon: [
      "提前加固门窗（贴米字胶防玻璃碎），收起阳台花盆、衣物等易坠物品",
      "台风期间不外出，远离窗户、广告牌、塔吊、大树等危险区域",
      "检查家中电路、燃气，遇停电/漏气立即关总阀，不使用明火照明",
      "沿海/低洼住户提前转移至社区避险点，备矿泉水、饼干、手电筒等物资",
      "台风后不立即靠近断树、倒杆，确认无漏电/燃气泄漏再通行"
    ],
    freezing: [
      "外出穿防风保暖衣物，戴手套、围巾、耳罩，重点保护手脚末梢部位",
      "室内用空调/暖气取暖时，定期开窗通风，避免一氧化碳中毒",
      "户外水管用保温棉包裹，夜间关紧阳台门窗，防止水管冻裂",
      "驾车出行前检查轮胎胎压，遇结冰路面减速慢行，不猛踩刹车",
      "老人、儿童减少外出，外出返回后用37-40℃温水泡手脚，忌用开水"
    ],
    convection: [
      "短时强降雨+大风时，立即到室内躲避，勿在空旷地、桥下、树下停留",
      "远离户外广告牌、临时搭建物、塔吊，防止被风吹倒砸伤",
      "雷电天气不使用手机、电脑，不触碰水管、暖气片等金属设施",
      "农村地区防范冰雹，关好门窗，用木板覆盖农作物和车辆",
      "强对流过后，检查房屋屋顶和外墙，及时修复脱落瓦片或构件"
    ],
    dry: [
      "日常生活节约用水（淘米水浇花、淋浴限时5分钟），不浪费水资源",
      "农业种植选耐旱作物，采用滴灌技术，避免漫灌浪费水",
      "禁止野外烧烤、烧荒，林区入口不携带火种，防森林火灾",
      "室内用加湿器（湿度保持40%-60%），或放水盆，缓解皮肤干燥",
      "关注当地供水通知，提前储备2-3天生活用水，应对限时供水"
    ],
    sandstorm: [
      "关闭门窗，用湿毛巾堵门缝/窗缝，减少沙尘进入；室内用空气净化器",
      "外出必须戴N95口罩（防沙尘吸入）和防风镜，不戴隐形眼镜",
      "不骑自行车/电动车，驾车减速慢行，开雾灯+示廓灯，保持安全车距",
      "外出返回后，立即清洗面部、口鼻，更换衣物，避免沙尘残留引发过敏",
      "呼吸道敏感人群（哮喘/鼻炎患者）减少外出，遵医嘱备急救药品"
    ]
  };
  const disasterLinks = {
    "暴雨": [
      {
        title: "暴雨与极端天气：香港遭遇世纪大暴雨",
        url: "https://www.bbc.com/zhongwen/simp/chinese-news-66749450"
      },
      {
        title: "华北暴雨，突显中国气候适应的正反面",
        url: "https://dialogue.earth/zh/3/112105/"
      },
      {
        title: "当极端暴雨越来越多，中小河流如何设防",
        url: "https://www.nhri.cn/kyjz/art/2025/art_b4d8eee1f3a14450b62d6b3266e21a67.html"
      }
    ],
    "高温": [
      {
        title: "高温来袭，以后夏天会越来越热吗？专家解读",
        url: "http://www.news.cn/20250718/0ec051d477a74f05bb34353a2cd8e873/c.html"
      },
      {
        title: "数据新闻丨南北高温“热”力足",
        url: "https://www.cma.gov.cn/2011xzt/20160518/202507/t20250716_7215351.html"
      },
      {
        title: "海洋高温和海平面上升给西南太平洋社区造成威胁",
        url: "hhttps://wmo.int/zh-hans/news/media-centre/haiyanggaowenhehaipingmianshangshenggeixinantaipingyangshequzaochengweixie"
      }
    ],
    "台风": [
      {
        title: "香港1964年後首度一年兩次十號風球　強烈颱風越來越頻密了嗎？",
        url: "https://www.bbc.com/zhongwen/articles/c4g2388rrljo/trad"
      },
      {
        title: "最强15级新台风生成！深圳未来天气",
        url: "https://www.nfnews.com/content/lyKmdja165.html"
      },
      {
        title: "台风“海鸥”生成，弱冷空气到访，对广东影响如何",
        url: "https://www.nfnews.com/content/KyllNAMZyD.html"
      }
    ],
    "寒潮": [
      {
        title: "新疆维吾尔自治区气象台发布寒潮蓝色预警 ",
        url: "https://weather.cma.cn/web/alarm/65000041600000_20251104104119.html"
      },
      {
        title: "中國多地遭強勁寒潮侵襲 北京提前23天迎來首雪",
        url: "https://www.bbc.com/zhongwen/trad/chinese-news-59203705"
      },
      {
        title: "大暴雪来了：寒潮暴雪开始进入新疆，台风海鸥等将靠近南方",
        url: "https://www.163.com/dy/article/KDICH0AJ0511ATND.html"
      }
    ],
    "强对流": [
      {
        title: "云南省大部将出现较强降水降温过程",
        url: "http://www.yn.xinhuanet.com/20251031/e5833c0ac2aa436a876ca940f2518843/c.html"
      },
      {
        title: "新一轮雨雪天气将自西向东影响我国 ",
        url: "https://m.voc.com.cn/xhn/news/202511/30823664.html"
      },
      {
        title: "新闻观察：今春强对流天气缘何多发？",
        url: "https://news.cctv.com/2024/04/21/ARTIuJ7oNqXby1rYpNluJqUQ240421.shtml"
      }
    ],
    "干旱": [
      {
        title: "新闻分析：干热风+干旱，对北方冬小麦影响几何 ",
        url: "http://www.news.cn/politics/20250510/5bde899b3b2844d4b43a95ecee784a5a/c.html"
      },
      {
        title: "专家解读丨春旱何故？影响多大？",
        url: "https://www.cma.gov.cn/wmhd/2011wzbft/2011wftzb/202505/t20250516_7072257.html"
      },
      {
        title: "本月江西有三次冷空气“光临”，全省降水偏少，月内发生干旱灾害的可能性大",
        url: "https://www.163.com/dy/article/KDIF915F05568W0A.html"
      }
    ],
    "沙尘暴": [
      {
        title: "全球沙尘暴挑战与防治之路 ",
        url: "http://www.news.cn/world/20250712/ca6e718465af480ca10fc12c1d3a994a/c.html"
      },
      {
        title: "北方地区有大风沙尘暴雪 南方地区有暴雨和强对流？",
        url: "https://www.cma.gov.cn/2011xwzx/2011xqxxw/2011xzytq/202504/t20250411_6991143.html"
      },
      {
        title: "影响18省份，北方沙尘为何一直吹到海南岛？",
        url: "http://www.news.cn/politics/20250413/2bef9dffe65341649f8190b4dee0cda8/c.html"
      }
    ]
  };


  // 标签点击逻辑
  tagItems.forEach(tag => {
    const tagBg = tag.getAttribute('data-bg');
    tag.style.backgroundImage = `url('${tagBg}')`;

    tag.addEventListener('click', function() {
      // 如果点击的是已激活的标签，关闭遮罩层
      if (this.classList.contains('active')) {
        closeMask();
        return;
      }

      // 重置所有标签状态
      closeMask();

      // 隐藏其他标签，当前标签激活并移动
      tagItems.forEach(item => {
        item.classList.add('hidden');
      });
      this.classList.remove('hidden');
      this.classList.add('active', 'moved');
      currentActiveTag = this;

      const weatherType = this.getAttribute('data-type');
      
      // 填充ul正文
      methodList.innerHTML = weatherMethods[weatherType].map(method => `<li>${method}</li>`).join('');

      // 显示遮罩层
      textMask.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // 详情链接跳转，开启对话框
  if (detailLink) {
    detailLink.addEventListener('click', function(e) {
      e.preventDefault();
      modal.style.display = 'block';
      disasterInput.focus();
    });
  }
  // 关闭对话框
  closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
    queryResults.innerHTML = '';
    disasterInput.value = '';
  });
  
  //输入查询
  submitQuery.addEventListener('click', async function() {
    const disasterType = disasterInput.value.trim();
    
    if (!disasterType) {
      alert('请输入灾害类型');
      return;
    }
    
    // 显示加载状态

    // 显示的链接
    displayLinks(disasterType);
    });

      
    // 显示相关链接
  function displayLinks(disasterType) {
    // 查找匹配的灾害类型
    let matchedType = null;
    for (const key in disasterLinks) {
      if (key.includes(disasterType) || disasterType.includes(key)) {
        matchedType = key;
        break;
      }
    }
    
    if (matchedType && disasterLinks[matchedType]) {
      const links = disasterLinks[matchedType];
      
      // 清空并显示链接容器
      linksContainer.innerHTML = '';
      
      // 添加标题
      const title = document.createElement('h3');
      title.textContent = `关于"${matchedType}"的相关信息`;
      linksContainer.appendChild(title);
      
      // 添加链接
      links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.target = "_blank";
        linkElement.className = "link-item";
        linkElement.textContent = link.title;
        linksContainer.appendChild(linkElement);
      });
      
      // 显示链接容器
      linksContainer.style.display = 'block';
    } else {
      // 如果没有匹配的链接
      linksContainer.innerHTML = '<p>暂无相关链接信息</p>';
      linksContainer.style.display = 'block';
    }
  }


});