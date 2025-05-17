/**
 * وظائف تحليلات النظام المحسنة
 * تعمل على تفعيل صفحة التحليلات بالكامل وعرض البيانات الحقيقية
 */

// تحميل صفحة التحليلات
function loadAnalytics() {
    console.log("تحميل صفحة التحليلات...");
    
    // تحميل البيانات الإحصائية العامة
    loadAnalyticsOverview();
    
    // تحميل التحليلات للتبويب النشط
    const activeTab = document.querySelector('#analytics .tab.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('onclick').match(/'([^']+)'/)[1];
        loadAnalyticsForTab(tabId);
    } else {
        // تحميل تبويب الاستثمارات افتراضيًا
        switchAnalyticsTab('investments');
    }
}

// تحميل البيانات الإحصائية العامة
function loadAnalyticsOverview() {
    // حساب إجمالي الاستثمارات النشطة
    const totalActiveInvestments = investments
        .filter(inv => inv.status === 'active')
        .reduce((sum, inv) => sum + inv.amount, 0);
    
    // حساب إجمالي عدد المستثمرين النشطين
    const activeInvestorsIds = [...new Set(
        investments
            .filter(inv => inv.status === 'active')
            .map(inv => inv.investorId)
    )];
    const activeInvestorsCount = activeInvestorsIds.length;
    
    // حساب إجمالي الأرباح
    const today = new Date();
    let totalProfits = 0;
    
    investments
        .filter(inv => inv.status === 'active')
        .forEach(inv => {
            const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
            totalProfits += profit;
        });
    
    // حساب إجمالي الأرباح المدفوعة
    const totalPaidProfits = operations
        .filter(op => op.type === 'profit' && op.status === 'active')
        .reduce((sum, op) => sum + op.amount, 0);
    
    // تحديث كروت البيانات العامة
    updateAnalyticsOverviewCards(totalActiveInvestments, activeInvestorsCount, totalProfits, totalPaidProfits);
}

// تحديث كروت البيانات العامة
function updateAnalyticsOverviewCards(totalInvestments, investorsCount, totalProfits, paidProfits) {
    // تحديث إجمالي الاستثمارات
    const totalInvestmentsElement = document.getElementById('analyticsTotalInvestments');
    if (totalInvestmentsElement) {
        totalInvestmentsElement.textContent = formatCurrency(totalInvestments);
    }
    
    // تحديث عدد المستثمرين
    const investorsCountElement = document.getElementById('analyticsInvestorsCount');
    if (investorsCountElement) {
        investorsCountElement.textContent = investorsCount;
    }
    
    // تحديث إجمالي الأرباح
    const totalProfitsElement = document.getElementById('analyticsTotalProfits');
    if (totalProfitsElement) {
        totalProfitsElement.textContent = formatCurrency(totalProfits.toFixed(2));
    }
    
    // تحديث الأرباح المستحقة
    const dueProfitsElement = document.getElementById('analyticsDueProfits');
    if (dueProfitsElement) {
        const dueProfits = Math.max(0, totalProfits - paidProfits);
        dueProfitsElement.textContent = formatCurrency(dueProfits.toFixed(2));
    }
}

// تحميل التحليلات للتبويب المحدد
function loadAnalyticsForTab(tabId) {
    console.log(`تحميل تحليلات التبويب: ${tabId}`);
    
    switch (tabId) {
        case 'investments':
            loadInvestmentsAnalytics();
            break;
        case 'investors':
            loadInvestorsAnalytics();
            break;
        case 'profits':
            loadProfitsAnalytics();
            break;
        case 'performance':
            loadPerformanceAnalytics();
            break;
        case 'forecast':
            loadForecastAnalytics();
            break;
        default:
            console.warn(`تبويب التحليلات غير معروف: ${tabId}`);
    }
}

// تحميل تحليلات الاستثمارات
function loadInvestmentsAnalytics() {
    // تحميل بيانات الاستثمارات
    const investmentsData = prepareInvestmentsData();
    
    // تحميل الرسم البياني للاستثمارات
    loadInvestmentsChart(investmentsData);
    
    // تحميل جدول الاستثمارات التحليلي
    loadInvestmentsAnalyticsTable(investmentsData);
    
    // تحميل مؤشرات أداء الاستثمارات
    loadInvestmentsPerformanceIndicators(investmentsData);
}

// إعداد بيانات الاستثمارات
function prepareInvestmentsData() {
    // إعداد بيانات المخطط الزمني
    const timelineData = generateChartData('monthly');
    
    // حساب توزيع الاستثمارات حسب الحالة
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    const closedInvestments = investments.filter(inv => inv.status === 'closed');
    
    // حساب إجمالي الاستثمارات النشطة
    const totalActiveAmount = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // حساب إجمالي الاستثمارات المغلقة
    const totalClosedAmount = closedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // حساب متوسط مبلغ الاستثمار
    const avgInvestmentAmount = activeInvestments.length > 0 ? 
        totalActiveAmount / activeInvestments.length : 0;
    
    // حساب متوسط مدة الاستثمار (بالأيام)
    const today = new Date();
    let totalDays = 0;
    
    activeInvestments.forEach(inv => {
        const investmentDate = new Date(inv.date);
        const diffTime = Math.abs(today - investmentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
    });
    
    const avgInvestmentDuration = activeInvestments.length > 0 ? 
        totalDays / activeInvestments.length : 0;
    
    // حساب معدل النمو الشهري
    const monthlyGrowthRate = calculateMonthlyGrowthRate(timelineData);
    
    // حساب توزيع الاستثمارات حسب المستثمرين
    const investmentsByInvestor = {};
    
    activeInvestments.forEach(inv => {
        if (!investmentsByInvestor[inv.investorId]) {
            investmentsByInvestor[inv.investorId] = 0;
        }
        
        investmentsByInvestor[inv.investorId] += inv.amount;
    });
    
    // ترتيب المستثمرين حسب حجم الاستثمار
    const topInvestors = Object.keys(investmentsByInvestor)
        .map(investorId => {
            const investor = investors.find(inv => inv.id === investorId);
            return {
                id: investorId,
                name: investor ? investor.name : 'مستثمر غير معروف',
                amount: investmentsByInvestor[investorId]
            };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    
    return {
        timelineData,
        activeInvestments,
        closedInvestments,
        totalActiveAmount,
        totalClosedAmount,
        avgInvestmentAmount,
        avgInvestmentDuration,
        monthlyGrowthRate,
        topInvestors
    };
}

// حساب معدل النمو الشهري
function calculateMonthlyGrowthRate(timelineData) {
    if (timelineData.length < 2) return 0;
    
    // حساب متوسط معدل النمو الشهري
    let growthRateSum = 0;
    let growthRateCount = 0;
    
    for (let i = 1; i < timelineData.length; i++) {
        const prevTotal = timelineData[i-1].investments;
        const currentTotal = timelineData[i].investments;
        
        if (prevTotal > 0) {
            const growthRate = ((currentTotal - prevTotal) / prevTotal) * 100;
            growthRateSum += growthRate;
            growthRateCount++;
        }
    }
    
    return growthRateCount > 0 ? growthRateSum / growthRateCount : 0;
}

// تحميل الرسم البياني للاستثمارات
function loadInvestmentsChart(investmentsData) {
    const chartContainer = document.getElementById('investmentsAnalyticsChart');
    
    if (!chartContainer) {
        console.warn('لم يتم العثور على عنصر الرسم البياني للاستثمارات');
        return;
    }
    
    // تحميل الرسم البياني للاستثمارات حسب الوقت
    const config = {
        type: 'line',
        datasets: [
            {
                label: 'الاستثمارات',
                data: investmentsData.timelineData.map(d => d.investments),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true
            },
            {
                label: 'الأرباح',
                data: investmentsData.timelineData.map(d => d.profits),
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                borderWidth: 2,
                fill: true
            }
        ]
    };
    
    // تحميل الرسم البياني
    loadChart('investmentsAnalyticsChart', investmentsData.timelineData, config);
    
    // تحميل مخطط دائري لتوزيع الاستثمارات
    loadInvestmentDistributionChart(investmentsData);
}

// تحميل مخطط دائري لتوزيع الاستثمارات
function loadInvestmentDistributionChart(investmentsData) {
    const pieChartContainer = document.getElementById('investmentsDistributionChart');
    
    if (!pieChartContainer) {
        console.warn('لم يتم العثور على عنصر مخطط توزيع الاستثمارات');
        return;
    }
    
    // إنشاء عنصر canvas جديد
    pieChartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    pieChartContainer.appendChild(canvas);
    
    // إعداد بيانات المخطط الدائري
    const topInvestorsData = investmentsData.topInvestors;
    
    // حساب نسبة المستثمرين الآخرين
    const totalTopInvestorsAmount = topInvestorsData.reduce((sum, inv) => sum + inv.amount, 0);
    const othersAmount = investmentsData.totalActiveAmount - totalTopInvestorsAmount;
    
    // إضافة المستثمرين الآخرين إذا كانت النسبة كبيرة
    if (othersAmount > 0) {
        topInvestorsData.push({
            name: 'آخرون',
            amount: othersAmount
        });
    }
    
    // ألوان للمخطط الدائري
    const colors = [
        'rgba(52, 152, 219, 0.8)',
        'rgba(46, 204, 113, 0.8)',
        'rgba(155, 89, 182, 0.8)',
        'rgba(241, 196, 15, 0.8)',
        'rgba(231, 76, 60, 0.8)',
        'rgba(26, 188, 156, 0.8)'
    ];
    
    // إنشاء المخطط الدائري
    new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: topInvestorsData.map(d => d.name),
            datasets: [{
                data: topInvestorsData.map(d => d.amount),
                backgroundColor: colors,
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = (value / investmentsData.totalActiveAmount * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            }
        }
    });
}

// تحميل جدول الاستثمارات التحليلي
function loadInvestmentsAnalyticsTable(investmentsData) {
    const tableBody = document.getElementById('investmentsAnalyticsTableBody');
    
    if (!tableBody) {
        console.warn('لم يتم العثور على عنصر جدول تحليلات الاستثمارات');
        return;
    }
    
    // إعداد بيانات الجدول
    tableBody.innerHTML = '';
    
    if (investmentsData.topInvestors.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">لا توجد بيانات للعرض</td>
            </tr>
        `;
        return;
    }
    
    // إضافة صفوف الجدول
    investmentsData.topInvestors.forEach((inv, index) => {
        const percentage = (inv.amount / investmentsData.totalActiveAmount * 100).toFixed(1);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${inv.name}</td>
            <td>${formatCurrency(inv.amount)}</td>
            <td>${percentage}%</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// تحميل مؤشرات أداء الاستثمارات
function loadInvestmentsPerformanceIndicators(investmentsData) {
    // تحديث متوسط مبلغ الاستثمار
    const avgInvestmentElement = document.getElementById('avgInvestmentAmount');
    if (avgInvestmentElement) {
        avgInvestmentElement.textContent = formatCurrency(investmentsData.avgInvestmentAmount.toFixed(0));
    }
    
    // تحديث متوسط مدة الاستثمار
    const avgDurationElement = document.getElementById('avgInvestmentDuration');
    if (avgDurationElement) {
        avgDurationElement.textContent = Math.round(investmentsData.avgInvestmentDuration) + ' يوم';
    }
    
    // تحديث معدل النمو الشهري
    const growthRateElement = document.getElementById('monthlyGrowthRate');
    if (growthRateElement) {
        growthRateElement.textContent = investmentsData.monthlyGrowthRate.toFixed(2) + '%';
    }
    
    // تحديث عدد الاستثمارات النشطة
    const activeCountElement = document.getElementById('activeInvestmentsCount');
    if (activeCountElement) {
        activeCountElement.textContent = investmentsData.activeInvestments.length;
    }
}

// تحميل تحليلات المستثمرين
function loadInvestorsAnalytics() {
    // تحضير بيانات المستثمرين
    const investorsData = prepareInvestorsData();
    
    // تحميل الرسم البياني للمستثمرين
    loadInvestorsChart(investorsData);
    
    // تحميل جدول المستثمرين التحليلي
    loadInvestorsAnalyticsTable(investorsData);
    
    // تحميل مؤشرات أداء المستثمرين
    loadInvestorsPerformanceIndicators(investorsData);
}

// إعداد بيانات المستثمرين
function prepareInvestorsData() {
    // إعداد بيانات المستثمرين
    const investorsWithInvestments = [];
    
    investors.forEach(investor => {
        // البحث عن استثمارات المستثمر النشطة
        const activeInvestments = investments.filter(inv => 
            inv.investorId === investor.id && inv.status === 'active'
        );
        
        // حساب إجمالي استثمارات المستثمر
        const totalInvestment = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        
        // حساب إجمالي أرباح المستثمر
        const today = new Date();
        let totalProfit = 0;
        
        activeInvestments.forEach(inv => {
            const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
            totalProfit += profit;
        });
        
        // حساب إجمالي الأرباح المدفوعة للمستثمر
        const paidProfits = operations
            .filter(op => op.investorId === investor.id && op.type === 'profit' && op.status === 'active')
            .reduce((sum, op) => sum + op.amount, 0);
        
        // حساب الأرباح المستحقة
        const dueProfit = Math.max(0, totalProfit - paidProfits);
        
        // حساب عدد الاستثمارات
        const investmentsCount = activeInvestments.length;
        
        // حساب تاريخ أول استثمار
        const firstInvestmentDate = activeInvestments.length > 0 ?
            new Date(Math.min(...activeInvestments.map(inv => new Date(inv.date).getTime()))) : null;
        
        // حساب المدة منذ أول استثمار (بالأيام)
        const daysSinceFirstInvestment = firstInvestmentDate ?
            Math.ceil((today - firstInvestmentDate) / (1000 * 60 * 60 * 24)) : 0;
        
        // إضافة بيانات المستثمر إذا كان لديه استثمارات نشطة
        if (activeInvestments.length > 0) {
            investorsWithInvestments.push({
                id: investor.id,
                name: investor.name,
                phone: investor.phone,
                totalInvestment,
                totalProfit,
                paidProfits,
                dueProfit,
                investmentsCount,
                firstInvestmentDate,
                daysSinceFirstInvestment
            });
        }
    });
    
    // ترتيب المستثمرين حسب إجمالي الاستثمار (الأعلى أولاً)
    investorsWithInvestments.sort((a, b) => b.totalInvestment - a.totalInvestment);
    
    // حساب إجمالي عدد المستثمرين النشطين
    const activeInvestorsCount = investorsWithInvestments.length;
    
    // حساب إجمالي الاستثمارات
    const totalInvestments = investorsWithInvestments.reduce((sum, inv) => sum + inv.totalInvestment, 0);
    
    // حساب متوسط استثمار المستثمر
    const avgInvestmentPerInvestor = activeInvestorsCount > 0 ? 
        totalInvestments / activeInvestorsCount : 0;
    
    // حساب إجمالي الأرباح
    const totalProfits = investorsWithInvestments.reduce((sum, inv) => sum + inv.totalProfit, 0);
    
    // حساب متوسط الربح للمستثمر
    const avgProfitPerInvestor = activeInvestorsCount > 0 ? 
        totalProfits / activeInvestorsCount : 0;
    
    // حساب توزيع المستثمرين حسب فئات الاستثمار
    const investmentCategories = {
        small: 0,  // أقل من 5 مليون
        medium: 0, // من 5 إلى 20 مليون
        large: 0,  // من 20 إلى 50 مليون
        vip: 0     // أكثر من 50 مليون
    };
    
    investorsWithInvestments.forEach(investor => {
        if (investor.totalInvestment < 5000000) {
            investmentCategories.small++;
        } else if (investor.totalInvestment < 20000000) {
            investmentCategories.medium++;
        } else if (investor.totalInvestment < 50000000) {
            investmentCategories.large++;
        } else {
            investmentCategories.vip++;
        }
    });
    
    // أخذ أعلى 5 مستثمرين
    const topInvestors = investorsWithInvestments.slice(0, 5);
    
    return {
        investorsWithInvestments,
        activeInvestorsCount,
        totalInvestments,
        avgInvestmentPerInvestor,
        totalProfits,
        avgProfitPerInvestor,
        investmentCategories,
        topInvestors
    };
}

// تحميل الرسم البياني للمستثمرين
function loadInvestorsChart(investorsData) {
    const chartContainer = document.getElementById('investorsAnalyticsChart');
    
    if (!chartContainer) {
        console.warn('لم يتم العثور على عنصر الرسم البياني للمستثمرين');
        return;
    }
    
    // إنشاء عنصر canvas جديد
    chartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // إعداد بيانات المخطط الشريطي
    const topInvestors = investorsData.topInvestors.map(investor => ({
        name: investor.name,
        investment: investor.totalInvestment,
        profit: investor.totalProfit
    }));
    
    // إنشاء المخطط الشريطي
    new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: topInvestors.map(investor => investor.name),
            datasets: [
                {
                    label: 'إجمالي الاستثمار',
                    data: topInvestors.map(investor => investor.investment),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: '#3498db',
                    borderWidth: 1
                },
                {
                    label: 'إجمالي الربح',
                    data: topInvestors.map(investor => investor.profit),
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: '#2ecc71',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
    
    // تحميل مخطط دائري لتوزيع المستثمرين حسب الفئات
    loadInvestorsCategoryChart(investorsData);
}

// تحميل مخطط دائري لتوزيع المستثمرين حسب الفئات
function loadInvestorsCategoryChart(investorsData) {
    const pieChartContainer = document.getElementById('investorsCategoryChart');
    
    if (!pieChartContainer) {
        console.warn('لم يتم العثور على عنصر مخطط فئات المستثمرين');
        return;
    }
    
    // إنشاء عنصر canvas جديد
    pieChartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    pieChartContainer.appendChild(canvas);
    
    // إعداد بيانات المخطط الدائري
    const categories = [
        { name: 'مستثمرون صغار', count: investorsData.investmentCategories.small, color: 'rgba(52, 152, 219, 0.8)' },
        { name: 'مستثمرون متوسطون', count: investorsData.investmentCategories.medium, color: 'rgba(46, 204, 113, 0.8)' },
        { name: 'مستثمرون كبار', count: investorsData.investmentCategories.large, color: 'rgba(155, 89, 182, 0.8)' },
        { name: 'مستثمرون VIP', count: investorsData.investmentCategories.vip, color: 'rgba(241, 196, 15, 0.8)' }
    ];
    
    // إنشاء المخطط الدائري
    new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: categories.map(c => c.name),
            datasets: [{
                data: categories.map(c => c.count),
                backgroundColor: categories.map(c => c.color),
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = (value / investorsData.activeInvestorsCount * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            }
        }
    });
}

// تحميل جدول المستثمرين التحليلي
function loadInvestorsAnalyticsTable(investorsData) {
    const tableBody = document.getElementById('investorsAnalyticsTableBody');
    
    if (!tableBody) {
        console.warn('لم يتم العثور على عنصر جدول تحليلات المستثمرين');
        return;
    }
    
    // إعداد بيانات الجدول
    tableBody.innerHTML = '';
    
    if (investorsData.investorsWithInvestments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">لا توجد بيانات للعرض</td>
            </tr>
        `;
        return;
    }
    
    // إضافة صفوف الجدول
    investorsData.investorsWithInvestments.forEach((investor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${investor.name}</td>
            <td>${formatCurrency(investor.totalInvestment)}</td>
            <td>${formatCurrency(investor.totalProfit.toFixed(2))}</td>
            <td>${investor.investmentsCount}</td>
            <td>${investor.daysSinceFirstInvestment} يوم</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// تحميل مؤشرات أداء المستثمرين
function loadInvestorsPerformanceIndicators(investorsData) {
    // تحديث عدد المستثمرين النشطين
    const activeInvestorsCountElement = document.getElementById('analyticsActiveInvestorsCount');
    if (activeInvestorsCountElement) {
        activeInvestorsCountElement.textContent = investorsData.activeInvestorsCount;
    }
    
    // تحديث متوسط استثمار المستثمر
    const avgInvestmentElement = document.getElementById('avgInvestmentPerInvestor');
    if (avgInvestmentElement) {
        avgInvestmentElement.textContent = formatCurrency(investorsData.avgInvestmentPerInvestor.toFixed(0));
    }
    
    // تحديث متوسط ربح المستثمر
    const avgProfitElement = document.getElementById('avgProfitPerInvestor');
    if (avgProfitElement) {
        avgProfitElement.textContent = formatCurrency(investorsData.avgProfitPerInvestor.toFixed(2));
    }
    
    // تحديث عدد المستثمرين الكبار
    const largeInvestorsElement = document.getElementById('largeInvestorsCount');
    if (largeInvestorsElement) {
        largeInvestorsElement.textContent = investorsData.investmentCategories.large + investorsData.investmentCategories.vip;
    }
}

// تحميل تحليلات الأرباح
function loadProfitsAnalytics() {
    // تحضير بيانات الأرباح
    const profitsData = prepareProfitsData();
    
    // تحميل الرسم البياني للأرباح
    loadProfitsChart(profitsData);
    
    // تحميل جدول الأرباح التحليلي
    loadProfitsAnalyticsTable(profitsData);
    
    // تحميل مؤشرات أداء الأرباح
    loadProfitsPerformanceIndicators(profitsData);
}

// إعداد بيانات الأرباح
function prepareProfitsData() {
    // إعداد بيانات المخطط الزمني
    const timelineData = generateChartData('monthly');
    
    // حساب إجمالي الأرباح
    const today = new Date();
    let totalProfits = 0;
    
    investments
        .filter(inv => inv.status === 'active')
        .forEach(inv => {
            const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
            totalProfits += profit;
        });
    
    // حساب إجمالي الأرباح المدفوعة
    const totalPaidProfits = operations
        .filter(op => op.type === 'profit' && op.status === 'active')
        .reduce((sum, op) => sum + op.amount, 0);
    
    // حساب الأرباح المستحقة
    const dueProfits = Math.max(0, totalProfits - totalPaidProfits);
    
    // حساب نسبة الأرباح المدفوعة
    const paidProfitsPercentage = totalProfits > 0 ? (totalPaidProfits / totalProfits * 100) : 0;
    
    // حساب متوسط الربح الشهري
    const monthlyProfitAverage = timelineData.reduce((sum, d) => sum + d.profits, 0) / timelineData.length;
    
    // حساب معدل نمو الأرباح
    const profitGrowthRate = calculateProfitGrowthRate(timelineData);
    
    // إعداد بيانات عمليات دفع الأرباح
    const profitOperations = operations
        .filter(op => op.type === 'profit' && op.status === 'active')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // حساب الأرباح لكل مستثمر
    const profitsByInvestor = {};
    
    investments
        .filter(inv => inv.status === 'active')
        .forEach(inv => {
            if (!profitsByInvestor[inv.investorId]) {
                profitsByInvestor[inv.investorId] = {
                    totalProfit: 0,
                    paidProfit: 0,
                    dueProfit: 0
                };
            }
            
            const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
            profitsByInvestor[inv.investorId].totalProfit += profit;
        });
    
    // إضافة الأرباح المدفوعة
    operations
        .filter(op => op.type === 'profit' && op.status === 'active')
        .forEach(op => {
            if (profitsByInvestor[op.investorId]) {
                profitsByInvestor[op.investorId].paidProfit += op.amount;
            }
        });
    
    // حساب الأرباح المستحقة لكل مستثمر
    Object.keys(profitsByInvestor).forEach(investorId => {
        profitsByInvestor[investorId].dueProfit = Math.max(0, 
            profitsByInvestor[investorId].totalProfit - profitsByInvestor[investorId].paidProfit
        );
    });
    
    // ترتيب المستثمرين حسب إجمالي الأرباح
    const topInvestors = Object.keys(profitsByInvestor)
        .map(investorId => {
            const investor = investors.find(inv => inv.id === investorId);
            return {
                id: investorId,
                name: investor ? investor.name : 'مستثمر غير معروف',
                totalProfit: profitsByInvestor[investorId].totalProfit,
                paidProfit: profitsByInvestor[investorId].paidProfit,
                dueProfit: profitsByInvestor[investorId].dueProfit
            };
        })
        .sort((a, b) => b.totalProfit - a.totalProfit)
        .slice(0, 5);
    
    return {
        timelineData,
        totalProfits,
        totalPaidProfits,
        dueProfits,
        paidProfitsPercentage,
        monthlyProfitAverage,
        profitGrowthRate,
        profitOperations,
        topInvestors
    };
}

// حساب معدل نمو الأرباح
function calculateProfitGrowthRate(timelineData) {
    if (timelineData.length < 2) return 0;
    
    // حساب متوسط معدل نمو الأرباح
    let growthRateSum = 0;
    let growthRateCount = 0;
    
    for (let i = 1; i < timelineData.length; i++) {
        const prevProfit = timelineData[i-1].profits;
        const currentProfit = timelineData[i].profits;
        
        if (prevProfit > 0) {
            const growthRate = ((currentProfit - prevProfit) / prevProfit) * 100;
            growthRateSum += growthRate;
            growthRateCount++;
        }
    }
    
    return growthRateCount > 0 ? growthRateSum / growthRateCount : 0;
}

// تحميل الرسم البياني للأرباح
function loadProfitsChart(profitsData) {
    const chartContainer = document.getElementById('profitsAnalyticsChart');
    
    if (!chartContainer) {
        console.warn('لم يتم العثور على عنصر الرسم البياني للأرباح');
        return;
    }
    
    // إنشاء عنصر canvas جديد
    chartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // إنشاء الرسم البياني للأرباح
    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: profitsData.timelineData.map(d => d.date),
            datasets: [
                {
                    label: 'الأرباح',
                    data: profitsData.timelineData.map(d => d.profits),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
    
    // تحميل مخطط دائري لتوزيع الأرباح
    loadProfitsDistributionChart(profitsData);
}

// تحميل مخطط دائري لتوزيع الأرباح
function loadProfitsDistributionChart(profitsData) {
    const pieChartContainer = document.getElementById('profitsDistributionChart');
    
    if (!pieChartContainer) {
        console.warn('لم يتم العثور على عنصر مخطط توزيع الأرباح');
        return;
    }
    
    // إنشاء عنصر canvas جديد
    pieChartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    pieChartContainer.appendChild(canvas);
    
    // إعداد بيانات توزيع الأرباح
    const profitsDistribution = [
        { label: 'الأرباح المدفوعة', value: profitsData.totalPaidProfits, color: 'rgba(46, 204, 113, 0.8)' },
        { label: 'الأرباح المستحقة', value: profitsData.dueProfits, color: 'rgba(241, 196, 15, 0.8)' }
    ];
    
    // إنشاء المخطط الدائري
    new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: profitsDistribution.map(d => d.label),
            datasets: [{
                data: profitsDistribution.map(d => d.value),
                backgroundColor: profitsDistribution.map(d => d.color),
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = (value / profitsData.totalProfits * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            }
        }
    });
}

// تحميل جدول الأرباح التحليلي
function loadProfitsAnalyticsTable(profitsData) {
    const tableBody = document.getElementById('profitsAnalyticsTableBody');
    
    if (!tableBody) {
        console.warn('لم يتم العثور على عنصر جدول تحليلات الأرباح');
        return;
    }
    
    // إعداد بيانات الجدول
    tableBody.innerHTML = '';
    
    if (profitsData.topInvestors.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">لا توجد بيانات للعرض</td>
            </tr>
        `;
        return;
    }
    
    // إضافة صفوف الجدول
    profitsData.topInvestors.forEach((investor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${investor.name}</td>
            <td>${formatCurrency(investor.totalProfit.toFixed(2))}</td>
            <td>${formatCurrency(investor.paidProfit.toFixed(2))}</td>
            <td>${formatCurrency(investor.dueProfit.toFixed(2))}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// تحميل مؤشرات أداء الأرباح
function loadProfitsPerformanceIndicators(profitsData) {
    // تحديث إجمالي الأرباح
    const totalProfitsElement = document.getElementById('analyticsTotalProfitsValue');
    if (totalProfitsElement) {
        totalProfitsElement.textContent = formatCurrency(profitsData.totalProfits.toFixed(2));
    }
    
    // تحديث الأرباح المدفوعة
    const paidProfitsElement = document.getElementById('analyticsPaidProfits');
    if (paidProfitsElement) {
        paidProfitsElement.textContent = formatCurrency(profitsData.totalPaidProfits.toFixed(2));
    }
    
    // تحديث نسبة الأرباح المدفوعة
    const paidProfitsPercentageElement = document.getElementById('analyticsPaidProfitsPercentage');
    if (paidProfitsPercentageElement) {
        paidProfitsPercentageElement.textContent = profitsData.paidProfitsPercentage.toFixed(2) + '%';
    }
    
    // تحديث متوسط الربح الشهري
    const monthlyProfitAverageElement = document.getElementById('analyticsMonthlyProfitAverage');
    if (monthlyProfitAverageElement) {
        monthlyProfitAverageElement.textContent = formatCurrency(profitsData.monthlyProfitAverage.toFixed(2));
    }
}

// تحميل تحليلات الأداء
function loadPerformanceAnalytics() {
    // تحضير بيانات الأداء
    const performanceData = preparePerformanceData();
    
    // تحميل الرسم البياني للأداء
    loadPerformanceChart(performanceData);
    
    // تحميل جدول الأداء التحليلي
    loadPerformanceAnalyticsTable(performanceData);
    
    // تحميل مؤشرات الأداء
    loadPerformanceIndicators(performanceData);
}

// إعداد بيانات الأداء
function preparePerformanceData() {
    // إعداد بيانات المخطط الزمني
    const timelineData = generateChartData('monthly');
    
    // حساب العائد على الاستثمار (ROI)
    const totalInvestments = investments
        .filter(inv => inv.status === 'active')
        .reduce((sum, inv) => sum + inv.amount, 0);
    
    const today = new Date();
    let totalProfits = 0;
    
    investments
        .filter(inv => inv.status === 'active')
        .forEach(inv => {
            const profit = calculateProfit(inv.amount, inv.date, today.toISOString());
            totalProfits += profit;
        });
    
    const roi = totalInvestments > 0 ? (totalProfits / totalInvestments * 100) : 0;
    
    // حساب معدل النمو
    const growthRate = calculateMonthlyGrowthRate(timelineData);
    
    // حساب معدل الاحتفاظ
    const totalInvestmentsEver = investments.length;
    const activeInvestmentsCount = investments.filter(inv => inv.status === 'active').length;
    const retentionRate = totalInvestmentsEver > 0 ? (activeInvestmentsCount / totalInvestmentsEver * 100) : 0;
    
    // حساب نسبة المستثمرين النشطين
    const totalInvestorsEver = [...new Set(investments.map(inv => inv.investorId))].length;
    const activeInvestorsIds = [...new Set(
        investments
            .filter(inv => inv.status === 'active')
            .map(inv => inv.investorId)
    )];
    const activeInvestorsCount = activeInvestorsIds.length;
    const activeInvestorsRate = totalInvestorsEver > 0 ? (activeInvestorsCount / totalInvestorsEver * 100) : 0;
    
    // حساب كفاءة استخدام رأس المال
    const capitalEfficiency = totalInvestments > 0 ? (totalProfits / totalInvestments) : 0;
    
    // حساب مؤشر القيمة المضافة للسوق
    const marketValueAdded = totalProfits - (totalInvestments * settings.monthlyProfitRate / 100);
    
    // بيانات الأداء الشهري
    const monthlyPerformance = timelineData.map((data, index) => {
        const prevData = index > 0 ? timelineData[index - 1] : { investments: 0, profits: 0 };
        
        const investmentGrowth = prevData.investments > 0 ? 
            ((data.investments - prevData.investments) / prevData.investments * 100) : 0;
        
        const profitGrowth = prevData.profits > 0 ? 
            ((data.profits - prevData.profits) / prevData.profits * 100) : 0;
        
        return {
            month: data.date,
            investments: data.investments,
            profits: data.profits,
            investmentGrowth,
            profitGrowth
        };
    });
    
    return {
        timelineData,
        totalInvestments,
        totalProfits,
        roi,
        growthRate,
        retentionRate,
        activeInvestorsRate,
        capitalEfficiency,
        marketValueAdded,
        monthlyPerformance
    };
}

// تحميل الرسم البياني للأداء
function loadPerformanceChart(performanceData) {
    const chartContainer = document.getElementById('performanceAnalyticsChart');
    
    if (!chartContainer) {
        console.warn('لم يتم العثور على عنصر الرسم البياني للأداء');
        return;
    }
    
    // إنشاء عنصر canvas جديد
    chartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // إعداد بيانات المخطط
    const performanceMetrics = performanceData.monthlyPerformance.map(perf => ({
        month: perf.month,
        investmentGrowth: perf.investmentGrowth,
        profitGrowth: perf.profitGrowth
    }));
    
    // إنشاء الرسم البياني للأداء
    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: performanceMetrics.map(p => p.month),
            datasets: [
                {
                    label: 'معدل نمو الاستثمارات',
                    data: performanceMetrics.map(p => p.investmentGrowth),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'معدل نمو الأرباح',
                    data: performanceMetrics.map(p => p.profitGrowth),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });
    
    // تحميل مخطط الأداء الآخر
    loadPerformanceRadarChart(performanceData);
}

// تحميل مخطط رادار للأداء
function loadPerformanceRadarChart(performanceData) {
    const radarChartContainer = document.getElementById('performanceRadarChart');
    
    if (!radarChartContainer) {
        console.warn('لم يتم العثور على عنصر مخطط رادار الأداء');
        return;
    }
    
    // إنشاء عنصر canvas جديد
    radarChartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    radarChartContainer.appendChild(canvas);
    
    // إعداد بيانات المخطط الراداري
    const metrics = [
        { label: 'العائد على الاستثمار', value: performanceData.roi / 100 * 5 },
        { label: 'معدل النمو', value: performanceData.growthRate / 10 * 5 },
        { label: 'معدل الاحتفاظ', value: performanceData.retentionRate / 100 * 5 },
        { label: 'نسبة المستثمرين النشطين', value: performanceData.activeInvestorsRate / 100 * 5 },
        { label: 'كفاءة رأس المال', value: performanceData.capitalEfficiency * 100 }
    ];
    
    // إنشاء المخطط الراداري
    new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: metrics.map(m => m.label),
            datasets: [
                {
                    label: 'مؤشرات الأداء',
                    data: metrics.map(m => m.value),
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: '#3498db',
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#3498db'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value.toFixed(2)} / 5`;
                        }
                    }
                }
            }
        }
    });
}

// تحميل جدول الأداء التحليلي
function loadPerformanceAnalyticsTable(performanceData) {
    const tableBody = document.getElementById('performanceAnalyticsTableBody');
    
    if (!tableBody) {
        console.warn('لم يتم العثور على عنصر جدول تحليلات الأداء');
        return;
    }
    
    // إعداد بيانات الجدول
    tableBody.innerHTML = '';
    
    // فلترة البيانات للأشهر الستة الأخيرة
    const recentMonths = performanceData.monthlyPerformance.slice(-6);
    
    if (recentMonths.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">لا توجد بيانات للعرض</td>
            </tr>
        `;
        return;
    }
    
    // إضافة صفوف الجدول
    recentMonths.forEach((month, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month.month}</td>
            <td>${formatCurrency(month.investments)}</td>
            <td>${formatCurrency(month.profits.toFixed(2))}</td>
            <td>${month.investmentGrowth.toFixed(2)}%</td>
            <td>${month.profitGrowth.toFixed(2)}%</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// تحميل مؤشرات الأداء
function loadPerformanceIndicators(performanceData) {
    // تحديث العائد على الاستثمار
    const roiElement = document.getElementById('analyticsROI');
    if (roiElement) {
        roiElement.textContent = performanceData.roi.toFixed(2) + '%';
    }
    
    // تحديث معدل النمو
    const growthRateElement = document.getElementById('analyticsGrowthRate');
    if (growthRateElement) {
        growthRateElement.textContent = performanceData.growthRate.toFixed(2) + '%';
    }
    
    // تحديث معدل الاحتفاظ
    const retentionRateElement = document.getElementById('analyticsRetentionRate');
    if (retentionRateElement) {
        retentionRateElement.textContent = performanceData.retentionRate.toFixed(2) + '%';
    }
    
    // تحديث نسبة المستثمرين النشطين
    const activeInvestorsRateElement = document.getElementById('analyticsActiveInvestorsRate');
    if (activeInvestorsRateElement) {
        activeInvestorsRateElement.textContent = performanceData.activeInvestorsRate.toFixed(2) + '%';
    }
}

// تحميل تحليلات التوقعات
function loadForecastAnalytics() {
    // تحضير بيانات التوقعات
    const forecastData = prepareForecastData();
    
    // تحميل الرسم البياني للتوقعات
    loadForecastChart(forecastData);
    
    // تحميل جدول التوقعات التحليلي
    loadForecastAnalyticsTable(forecastData);
    
    // تحميل مؤشرات التوقعات
    loadForecastIndicators(forecastData);
}

// إعداد بيانات التوقعات
function prepareForecastData() {
    // الحصول على البيانات التاريخية
    const historicalData = generateChartData('monthly');
    
    // عدد الأشهر للتنبؤ
    const forecastMonths = 6;
    
    // آخر شهر في البيانات التاريخية
    const lastMonth = historicalData.length > 0 ? 
        historicalData[historicalData.length - 1] : 
        { date: 'يناير', investments: 0, profits: 0 };
    
    // اسماء الأشهر
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // آخر شهر كتاريخ
    const lastMonthIndex = monthNames.indexOf(lastMonth.date);
    const lastDate = new Date();
    lastDate.setMonth(lastMonthIndex);
    
    // حساب متوسط معدل النمو الشهري للاستثمارات
    const investmentGrowthRates = [];
    
    for (let i = 1; i < historicalData.length; i++) {
        const prevInvestments = historicalData[i-1].investments;
        const currentInvestments = historicalData[i].investments;
        
        if (prevInvestments > 0) {
            const growthRate = (currentInvestments - prevInvestments) / prevInvestments;
            investmentGrowthRates.push(growthRate);
        }
    }
    
    const avgInvestmentGrowthRate = investmentGrowthRates.length > 0 ? 
        investmentGrowthRates.reduce((sum, rate) => sum + rate, 0) / investmentGrowthRates.length : 0.05;
    
    // حساب متوسط معدل النمو الشهري للأرباح
    const profitGrowthRates = [];
    
    for (let i = 1; i < historicalData.length; i++) {
        const prevProfits = historicalData[i-1].profits;
        const currentProfits = historicalData[i].profits;
        
        if (prevProfits > 0) {
            const growthRate = (currentProfits - prevProfits) / prevProfits;
            profitGrowthRates.push(growthRate);
        }
    }
    
    const avgProfitGrowthRate = profitGrowthRates.length > 0 ? 
        profitGrowthRates.reduce((sum, rate) => sum + rate, 0) / profitGrowthRates.length : 0.03;
    
    // إنشاء بيانات التوقعات
    const forecastedData = [];
    
    for (let i = 0; i < forecastMonths; i++) {
        const forecastDate = new Date(lastDate);
        forecastDate.setMonth(lastDate.getMonth() + i + 1);
        
        const monthName = monthNames[forecastDate.getMonth()];
        
        let forecastedInvestments, forecastedProfits;
        
        if (i === 0) {
            // الشهر الأول من التوقع
            forecastedInvestments = lastMonth.investments * (1 + avgInvestmentGrowthRate);
            forecastedProfits = lastMonth.profits * (1 + avgProfitGrowthRate);
        } else {
            // الأشهر اللاحقة
            forecastedInvestments = forecastedData[i-1].investments * (1 + avgInvestmentGrowthRate);
            forecastedProfits = forecastedData[i-1].profits * (1 + avgProfitGrowthRate);
        }
        
        forecastedData.push({
            date: monthName,
            investments: forecastedInvestments,
            profits: forecastedProfits
        });
    }
    
    // حساب إجمالي الزيادة المتوقعة
    const totalInvestmentGrowth = forecastedData.length > 0 ? 
        (forecastedData[forecastedData.length - 1].investments - lastMonth.investments) / lastMonth.investments * 100 : 0;
    
    const totalProfitGrowth = forecastedData.length > 0 ? 
        (forecastedData[forecastedData.length - 1].profits - lastMonth.profits) / lastMonth.profits * 100 : 0;
    
    return {
        historicalData,
        forecastedData,
        totalInvestmentGrowth,
        totalProfitGrowth,
        avgInvestmentGrowthRate: avgInvestmentGrowthRate * 100,
        avgProfitGrowthRate: avgProfitGrowthRate * 100
    };
}

// تحميل الرسم البياني للتوقعات
function loadForecastChart(forecastData) {
    const chartContainer = document.getElementById('forecastAnalyticsChart');
    
    if (!chartContainer) {
        console.warn('لم يتم العثور على عنصر الرسم البياني للتوقعات');
        return;
    }
    
    // إنشاء عنصر canvas جديد
    chartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // إعداد بيانات المخطط
    const historicalInvestments = forecastData.historicalData.map(d => d.investments);
    const historicalProfits = forecastData.historicalData.map(d => d.profits);
    const historicalLabels = forecastData.historicalData.map(d => d.date);
    
    const forecastedInvestments = forecastData.forecastedData.map(d => d.investments);
    const forecastedProfits = forecastData.forecastedData.map(d => d.profits);
    const forecastedLabels = forecastData.forecastedData.map(d => d.date);
    
    // الجمع بين البيانات التاريخية والمتوقعة
    const combinedLabels = [...historicalLabels.slice(-6), ...forecastedLabels];
    const combinedInvestments = [...historicalInvestments.slice(-6), ...forecastedInvestments];
    const combinedProfits = [...historicalProfits.slice(-6), ...forecastedProfits];
    
    // إنشاء الرسم البياني للتوقعات
    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: combinedLabels,
            datasets: [
                {
                    label: 'الاستثمارات (تاريخي)',
                    data: historicalInvestments.slice(-6),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'الاستثمارات (متوقع)',
                    data: Array(historicalInvestments.slice(-6).length).fill(null).concat(forecastedInvestments),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'الأرباح (تاريخي)',
                    data: historicalProfits.slice(-6),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'الأرباح (متوقع)',
                    data: Array(historicalProfits.slice(-6).length).fill(null).concat(forecastedProfits),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// تحميل جدول التوقعات التحليلي
function loadForecastAnalyticsTable(forecastData) {
    const tableBody = document.getElementById('forecastAnalyticsTableBody');
    
    if (!tableBody) {
        console.warn('لم يتم العثور على عنصر جدول تحليلات التوقعات');
        return;
    }
    
    // إعداد بيانات الجدول
    tableBody.innerHTML = '';
    
    if (forecastData.forecastedData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">لا توجد بيانات للعرض</td>
            </tr>
        `;
        return;
    }
    
    // إضافة صفوف الجدول
    forecastData.forecastedData.forEach((month, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month.date}</td>
            <td>${formatCurrency(month.investments.toFixed(0))}</td>
            <td>${formatCurrency(month.profits.toFixed(2))}</td>
            <td>${index > 0 ? 
                ((month.investments - forecastData.forecastedData[index-1].investments) / 
                    forecastData.forecastedData[index-1].investments * 100).toFixed(2) + '%' : 
                '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// تحميل مؤشرات التوقعات
function loadForecastIndicators(forecastData) {
    // تحديث إجمالي النمو المتوقع في الاستثمارات
    const totalInvestmentGrowthElement = document.getElementById('totalForecastedInvestmentGrowth');
    if (totalInvestmentGrowthElement) {
        totalInvestmentGrowthElement.textContent = forecastData.totalInvestmentGrowth.toFixed(2) + '%';
    }
    
    // تحديث إجمالي النمو المتوقع في الأرباح
    const totalProfitGrowthElement = document.getElementById('totalForecastedProfitGrowth');
    if (totalProfitGrowthElement) {
        totalProfitGrowthElement.textContent = forecastData.totalProfitGrowth.toFixed(2) + '%';
    }
    
    // تحديث متوسط معدل النمو الشهري المتوقع للاستثمارات
    const avgInvestmentGrowthRateElement = document.getElementById('avgMonthlyInvestmentGrowthRate');
    if (avgInvestmentGrowthRateElement) {
        avgInvestmentGrowthRateElement.textContent = forecastData.avgInvestmentGrowthRate.toFixed(2) + '%';
    }
    
    // تحديث متوسط معدل النمو الشهري المتوقع للأرباح
    const avgProfitGrowthRateElement = document.getElementById('avgMonthlyProfitGrowthRate');
    if (avgProfitGrowthRateElement) {
        avgProfitGrowthRateElement.textContent = forecastData.avgProfitGrowthRate.toFixed(2) + '%';
    }
}

// إضافة مستمع للتحميل
document.addEventListener('DOMContentLoaded', function() {
    // إضافة مستمع للتنقل بين الصفحات
    const analyticsMenuItem = document.querySelector('.menu-item[href="#analytics"]');
    if (analyticsMenuItem) {
        analyticsMenuItem.addEventListener('click', function() {
            // تأخير قصير لضمان تحميل الصفحة
            setTimeout(loadAnalytics, 100);
        });
    }
    
    // تحديث الكود في وظيفة showPage
    const originalShowPage = window.showPage;
    if (typeof originalShowPage === 'function') {
        window.showPage = function(pageId) {
            // استدعاء الوظيفة الأصلية
            originalShowPage(pageId);
            
            // إذا كانت صفحة التحليلات، قم بتحميلها
            if (pageId === 'analytics') {
                setTimeout(loadAnalytics, 100);
            }
        };
    }
});

// تحديث HTML صفحة التحليلات
function updateAnalyticsHTML() {
    const analyticsPage = document.getElementById('analytics');
    if (!analyticsPage) {
        console.warn('لم يتم العثور على صفحة التحليلات');
        return;
    }
    
    // إعادة إنشاء هيكل HTML للتحليلات
    analyticsPage.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">التحليلات والإحصاءات</h1>
            <div class="page-actions">
                <div class="page-filters">
                    <select id="analyticsDateRange" class="form-select">
                        <option value="all">كل الفترات</option>
                        <option value="month">الشهر الحالي</option>
                        <option value="quarter">الربع الحالي</option>
                        <option value="year">السنة الحالية</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="exportAnalyticsReport()">
                    <i class="fas fa-file-export"></i> تصدير التقرير
                </button>
                <button class="btn btn-light" onclick="printAnalytics()">
                    <i class="fas fa-print"></i> طباعة
                </button>
            </div>
        </div>
        
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">إجمالي الاستثمارات</div>
                        <div class="card-value" id="analyticsTotalInvestments">0</div>
                    </div>
                    <div class="card-icon primary">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">عدد المستثمرين</div>
                        <div class="card-value" id="analyticsInvestorsCount">0</div>
                    </div>
                    <div class="card-icon info">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">إجمالي الأرباح</div>
                        <div class="card-value" id="analyticsTotalProfits">0</div>
                    </div>
                    <div class="card-icon success">
                        <i class="fas fa-chart-line"></i>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">الأرباح المستحقة</div>
                        <div class="card-value" id="analyticsDueProfits">0</div>
                    </div>
                    <div class="card-icon warning">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="analytics-tabs">
            <div class="tabs">
                <button class="tab active" onclick="switchAnalyticsTab('investments')">الاستثمارات</button>
                <button class="tab" onclick="switchAnalyticsTab('investors')">المستثمرون</button>
                <button class="tab" onclick="switchAnalyticsTab('profits')">الأرباح</button>
                <button class="tab" onclick="switchAnalyticsTab('performance')">الأداء</button>
                <button class="tab" onclick="switchAnalyticsTab('forecast')">التوقعات</button>
            </div>
        </div>
        
        <div class="analytics-tab-content active" id="analyticsInvestments">
            <div class="analytics-section">
                <div class="section-header">
                    <h2 class="section-title">تحليل الاستثمارات</h2>
                </div>
                <div class="section-content">
                    <div class="section-cards">
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">متوسط الاستثمار</div>
                                    <div class="card-value" id="avgInvestmentAmount">0</div>
                                </div>
                                <div class="card-icon info">
                                    <i class="fas fa-calculator"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">متوسط المدة</div>
                                    <div class="card-value" id="avgInvestmentDuration">0 يوم</div>
                                </div>
                                <div class="card-icon success">
                                    <i class="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">معدل النمو الشهري</div>
                                    <div class="card-value" id="monthlyGrowthRate">0%</div>
                                </div>
                                <div class="card-icon warning">
                                    <i class="fas fa-chart-bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">الاستثمارات النشطة</div>
                                    <div class="card-value" id="activeInvestmentsCount">0</div>
                                </div>
                                <div class="card-icon primary">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section-charts">
                        <div class="chart-container">
                            <div class="chart-header">
                                <h3 class="chart-title">اتجاه الاستثمارات والأرباح</h3>
                                <div class="chart-actions">
                                    <button class="btn btn-sm btn-primary" onclick="switchChartPeriod('monthly')">شهري</button>
                                    <button class="btn btn-sm btn-light" onclick="switchChartPeriod('yearly')">سنوي</button>
                                </div>
                            </div>
                            <div class="chart" id="investmentsAnalyticsChart"></div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-header">
                                <h3 class="chart-title">توزيع الاستثمارات حسب المستثمر</h3>
                            </div>
                            <div class="chart" id="investmentsDistributionChart"></div>
                        </div>
                    </div>
                    
                    <div class="section-table">
                        <div class="table-header">
                            <h3 class="table-title">أعلى المستثمرين استثماراً</h3>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>المستثمر</th>
                                        <th>إجمالي الاستثمارات</th>
                                        <th>النسبة</th>
                                    </tr>
                                </thead>
                                <tbody id="investmentsAnalyticsTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="analytics-tab-content" id="analyticsInvestors">
            <div class="analytics-section">
                <div class="section-header">
                    <h2 class="section-title">تحليل المستثمرين</h2>
                </div>
                <div class="section-content">
                    <div class="section-cards">
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">عدد المستثمرين النشطين</div>
                                    <div class="card-value" id="analyticsActiveInvestorsCount">0</div>
                                </div>
                                <div class="card-icon primary">
                                    <i class="fas fa-user-check"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">متوسط الاستثمار للمستثمر</div>
                                    <div class="card-value" id="avgInvestmentPerInvestor">0</div>
                                </div>
                                <div class="card-icon info">
                                    <i class="fas fa-coins"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">متوسط الربح للمستثمر</div>
                                    <div class="card-value" id="avgProfitPerInvestor">0</div>
                                </div>
                                <div class="card-icon success">
                                    <i class="fas fa-funnel-dollar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">المستثمرون الكبار</div>
                                    <div class="card-value" id="largeInvestorsCount">0</div>
                                </div>
                                <div class="card-icon warning">
                                    <i class="fas fa-crown"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section-charts">
                        <div class="chart-container">
                            <div class="chart-header">
                                <h3 class="chart-title">أعلى المستثمرين من حيث الاستثمار والربح</h3>
                            </div>
                            <div class="chart" id="investorsAnalyticsChart"></div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-header">
                                <h3 class="chart-title">توزيع المستثمرين حسب فئات الاستثمار</h3>
                            </div>
                            <div class="chart" id="investorsCategoryChart"></div>
                        </div>
                    </div>
                    
                    <div class="section-table">
                        <div class="table-header">
                            <h3 class="table-title">بيانات المستثمرين</h3>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>المستثمر</th>
                                        <th>إجمالي الاستثمارات</th>
                                        <th>إجمالي الأرباح</th>
                                        <th>عدد الاستثمارات</th>
                                        <th>المدة</th>
                                    </tr>
                                </thead>
                                <tbody id="investorsAnalyticsTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="analytics-tab-content" id="analyticsProfits">
            <div class="analytics-section">
                <div class="section-header">
                    <h2 class="section-title">تحليل الأرباح</h2>
                </div>
                <div class="section-content">
                    <div class="section-cards">
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">إجمالي الأرباح</div>
                                    <div class="card-value" id="analyticsTotalProfitsValue">0</div>
                                </div>
                                <div class="card-icon success">
                                    <i class="fas fa-hand-holding-usd"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">الأرباح المدفوعة</div>
                                    <div class="card-value" id="analyticsPaidProfits">0</div>
                                </div>
                                <div class="card-icon primary">
                                    <i class="fas fa-money-bill-wave"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">نسبة الأرباح المدفوعة</div>
                                    <div class="card-value" id="analyticsPaidProfitsPercentage">0%</div>
                                </div>
                                <div class="card-icon info">
                                    <i class="fas fa-percentage"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">متوسط الربح الشهري</div>
                                    <div class="card-value" id="analyticsMonthlyProfitAverage">0</div>
                                </div>
                                <div class="card-icon warning">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section-charts">
                        <div class="chart-container">
                            <div class="chart-header">
                                <h3 class="chart-title">تطور الأرباح</h3>
                                <div class="chart-actions">
                                    <button class="btn btn-sm btn-primary" onclick="switchProfitsAnalysisChart('monthly')">شهري</button>
                                    <button class="btn btn-sm btn-light" onclick="switchProfitsAnalysisChart('yearly')">سنوي</button>
                                </div>
                            </div>
                            <div class="chart" id="profitsAnalyticsChart"></div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-header">
                                <h3 class="chart-title">توزيع الأرباح</h3>
                            </div>
                            <div class="chart" id="profitsDistributionChart"></div>
                        </div>
                    </div>
                    
                    <div class="section-table">
                        <div class="table-header">
                            <h3 class="table-title">أعلى المستثمرين من حيث الأرباح</h3>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>المستثمر</th>
                                        <th>إجمالي الأرباح</th>
                                        <th>الأرباح المدفوعة</th>
                                        <th>الأرباح المستحقة</th>
                                    </tr>
                                </thead>
                                <tbody id="profitsAnalyticsTableBody"></tbody>
                            </table>
                        </div>
                        </div>
                </div>
            </div>
        </div>
        
        <div class="analytics-tab-content" id="analyticsPerformance">
            <div class="analytics-section">
                <div class="section-header">
                    <h2 class="section-title">تحليل الأداء</h2>
                </div>
                <div class="section-content">
                    <div class="section-cards">
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">العائد على الاستثمار</div>
                                    <div class="card-value" id="analyticsROI">0%</div>
                                </div>
                                <div class="card-icon success">
                                    <i class="fas fa-chart-pie"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">معدل النمو</div>
                                    <div class="card-value" id="analyticsGrowthRate">0%</div>
                                </div>
                                <div class="card-icon primary">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">معدل الاحتفاظ</div>
                                    <div class="card-value" id="analyticsRetentionRate">0%</div>
                                </div>
                                <div class="card-icon info">
                                    <i class="fas fa-hand-holding"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">المستثمرون النشطون</div>
                                    <div class="card-value" id="analyticsActiveInvestorsRate">0%</div>
                                </div>
                                <div class="card-icon warning">
                                    <i class="fas fa-user-check"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section-charts">
                        <div class="chart-container">
                            <div class="chart-header">
                                <h3 class="chart-title">معدلات نمو الاستثمارات والأرباح</h3>
                            </div>
                            <div class="chart" id="performanceAnalyticsChart"></div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-header">
                                <h3 class="chart-title">مؤشرات الأداء</h3>
                            </div>
                            <div class="chart" id="performanceRadarChart"></div>
                        </div>
                    </div>
                    
                    <div class="section-table">
                        <div class="table-header">
                            <h3 class="table-title">أداء الأشهر الأخيرة</h3>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>الشهر</th>
                                        <th>إجمالي الاستثمارات</th>
                                        <th>إجمالي الأرباح</th>
                                        <th>نمو الاستثمارات</th>
                                        <th>نمو الأرباح</th>
                                    </tr>
                                </thead>
                                <tbody id="performanceAnalyticsTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="analytics-tab-content" id="analyticsForecast">
            <div class="analytics-section">
                <div class="section-header">
                    <h2 class="section-title">تحليل التوقعات المستقبلية</h2>
                </div>
                <div class="section-content">
                    <div class="section-cards">
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">نمو الاستثمارات المتوقع</div>
                                    <div class="card-value" id="totalForecastedInvestmentGrowth">0%</div>
                                </div>
                                <div class="card-icon primary">
                                    <i class="fas fa-arrow-trend-up"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">نمو الأرباح المتوقع</div>
                                    <div class="card-value" id="totalForecastedProfitGrowth">0%</div>
                                </div>
                                <div class="card-icon success">
                                    <i class="fas fa-sack-dollar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">معدل نمو الاستثمار الشهري</div>
                                    <div class="card-value" id="avgMonthlyInvestmentGrowthRate">0%</div>
                                </div>
                                <div class="card-icon info">
                                    <i class="fas fa-chart-simple"></i>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <div class="card-title">معدل نمو الأرباح الشهري</div>
                                    <div class="card-value" id="avgMonthlyProfitGrowthRate">0%</div>
                                </div>
                                <div class="card-icon warning">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section-charts">
                        <div class="chart-container full-width">
                            <div class="chart-header">
                                <h3 class="chart-title">التوقعات المستقبلية للاستثمارات والأرباح (6 أشهر)</h3>
                            </div>
                            <div class="chart" id="forecastAnalyticsChart"></div>
                        </div>
                    </div>
                    
                    <div class="section-table">
                        <div class="table-header">
                            <h3 class="table-title">بيانات التوقعات المستقبلية (6 أشهر)</h3>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>الشهر</th>
                                        <th>إجمالي الاستثمارات (متوقع)</th>
                                        <th>إجمالي الأرباح (متوقع)</th>
                                        <th>معدل النمو</th>
                                    </tr>
                                </thead>
                                <tbody id="forecastAnalyticsTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// تصدير تقرير التحليلات
function exportAnalyticsReport() {
    // إنشاء التقرير
    const report = createAnalyticsReport();
    
    // حفظ التقرير في قائمة التقارير
    reports.push(report);
    saveReports();
    
    // تنزيل التقرير كملف HTML
    const blob = new Blob([report.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_التحليلات_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // إظهار رسالة نجاح
    createNotification('نجاح', 'تم تصدير تقرير التحليلات بنجاح', 'success');
}

// إنشاء تقرير التحليلات
function createAnalyticsReport() {
    // الحصول على التبويب النشط
    const activeTab = document.querySelector('#analytics .tab.active');
    const tabId = activeTab ? activeTab.getAttribute('onclick').match(/'([^']+)'/)[1] : 'investments';
    
    // إنشاء عنوان التقرير
    let title = 'تقرير التحليلات';
    
    switch (tabId) {
        case 'investments':
            title = 'تقرير تحليل الاستثمارات';
            break;
        case 'investors':
            title = 'تقرير تحليل المستثمرين';
            break;
        case 'profits':
            title = 'تقرير تحليل الأرباح';
            break;
        case 'performance':
            title = 'تقرير تحليل الأداء';
            break;
        case 'forecast':
            title = 'تقرير التوقعات المستقبلية';
            break;
    }
    
    // إنشاء محتوى التقرير
    const content = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    direction: rtl;
                    padding: 20px;
                    color: #333;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                }
                .report-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .report-date {
                    font-size: 14px;
                    color: #777;
                }
                .report-company {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .section {
                    margin-bottom: 30px;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #eee;
                }
                .dashboard-cards {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .card {
                    flex: 1;
                    min-width: 200px;
                    background: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                .card-title {
                    font-size: 14px;
                    color: #777;
                    margin-bottom: 5px;
                }
                .card-value {
                    font-size: 20px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .image-placeholder {
                    width: 100%;
                    height: 300px;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    border-radius: 5px;
                    color: #777;
                    font-size: 14px;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <div class="report-company">${settings.companyName}</div>
                <div class="report-title">${title}</div>
                <div class="report-date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')} - الوقت: ${new Date().toLocaleTimeString('ar-IQ')}</div>
            </div>
            
            <div class="section">
                <h2 class="section-title">ملخص البيانات الإحصائية</h2>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-title">إجمالي الاستثمارات</div>
                        <div class="card-value">${document.getElementById('analyticsTotalInvestments').textContent}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">عدد المستثمرين</div>
                        <div class="card-value">${document.getElementById('analyticsInvestorsCount').textContent}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">إجمالي الأرباح</div>
                        <div class="card-value">${document.getElementById('analyticsTotalProfits').textContent}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">الأرباح المستحقة</div>
                        <div class="card-value">${document.getElementById('analyticsDueProfits').textContent}</div>
                    </div>
                </div>
            </div>
            
            ${getReportContentByTabId(tabId)}
            
            <div class="footer">
                تم إنشاء هذا التقرير بواسطة نظام إدارة الاستثمار - جميع الحقوق محفوظة &copy; ${new Date().getFullYear()}
            </div>
        </body>
        </html>
    `;
    
    // إنشاء التقرير
    return {
        id: generateId(),
        title: title,
        type: 'analytics',
        content: content,
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
    };
}

// الحصول على محتوى التقرير حسب التبويب
function getReportContentByTabId(tabId) {
    switch (tabId) {
        case 'investments':
            return getInvestmentsReportContent();
        case 'investors':
            return getInvestorsReportContent();
        case 'profits':
            return getProfitsReportContent();
        case 'performance':
            return getPerformanceReportContent();
        case 'forecast':
            return getForecastReportContent();
        default:
            return getInvestmentsReportContent();
    }
}

// الحصول على محتوى تقرير الاستثمارات
function getInvestmentsReportContent() {
    // نسخ محتوى جدول الاستثمارات
    const tableBody = document.getElementById('investmentsAnalyticsTableBody');
    const tableRows = tableBody ? tableBody.innerHTML : '';
    
    // نسخ محتوى بطاقات مؤشرات الاستثمارات
    const avgInvestmentAmount = document.getElementById('avgInvestmentAmount').textContent;
    const avgInvestmentDuration = document.getElementById('avgInvestmentDuration').textContent;
    const monthlyGrowthRate = document.getElementById('monthlyGrowthRate').textContent;
    const activeInvestmentsCount = document.getElementById('activeInvestmentsCount').textContent;
    
    return `
        <div class="section">
            <h2 class="section-title">مؤشرات الاستثمارات</h2>
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-title">متوسط الاستثمار</div>
                    <div class="card-value">${avgInvestmentAmount}</div>
                </div>
                <div class="card">
                    <div class="card-title">متوسط المدة</div>
                    <div class="card-value">${avgInvestmentDuration}</div>
                </div>
                <div class="card">
                    <div class="card-title">معدل النمو الشهري</div>
                    <div class="card-value">${monthlyGrowthRate}</div>
                </div>
                <div class="card">
                    <div class="card-title">الاستثمارات النشطة</div>
                    <div class="card-value">${activeInvestmentsCount}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">الرسوم البيانية للاستثمارات</h2>
            <div class="image-placeholder">
                [رسم بياني] اتجاه الاستثمارات والأرباح
            </div>
            <div class="image-placeholder">
                [رسم بياني] توزيع الاستثمارات حسب المستثمر
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">أعلى المستثمرين استثماراً</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>المستثمر</th>
                        <th>إجمالي الاستثمارات</th>
                        <th>النسبة</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// الحصول على محتوى تقرير المستثمرين
function getInvestorsReportContent() {
    // نسخ محتوى جدول المستثمرين
    const tableBody = document.getElementById('investorsAnalyticsTableBody');
    const tableRows = tableBody ? tableBody.innerHTML : '';
    
    // نسخ محتوى بطاقات مؤشرات المستثمرين
    const activeInvestorsCount = document.getElementById('analyticsActiveInvestorsCount').textContent;
    const avgInvestmentPerInvestor = document.getElementById('avgInvestmentPerInvestor').textContent;
    const avgProfitPerInvestor = document.getElementById('avgProfitPerInvestor').textContent;
    const largeInvestorsCount = document.getElementById('largeInvestorsCount').textContent;
    
    return `
        <div class="section">
            <h2 class="section-title">مؤشرات المستثمرين</h2>
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-title">عدد المستثمرين النشطين</div>
                    <div class="card-value">${activeInvestorsCount}</div>
                </div>
                <div class="card">
                    <div class="card-title">متوسط الاستثمار للمستثمر</div>
                    <div class="card-value">${avgInvestmentPerInvestor}</div>
                </div>
                <div class="card">
                    <div class="card-title">متوسط الربح للمستثمر</div>
                    <div class="card-value">${avgProfitPerInvestor}</div>
                </div>
                <div class="card">
                    <div class="card-title">المستثمرون الكبار</div>
                    <div class="card-value">${largeInvestorsCount}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">الرسوم البيانية للمستثمرين</h2>
            <div class="image-placeholder">
                [رسم بياني] أعلى المستثمرين من حيث الاستثمار والربح
            </div>
            <div class="image-placeholder">
                [رسم بياني] توزيع المستثمرين حسب فئات الاستثمار
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">بيانات المستثمرين</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>المستثمر</th>
                        <th>إجمالي الاستثمارات</th>
                        <th>إجمالي الأرباح</th>
                        <th>عدد الاستثمارات</th>
                        <th>المدة</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// الحصول على محتوى تقرير الأرباح
function getProfitsReportContent() {
    // نسخ محتوى جدول الأرباح
    const tableBody = document.getElementById('profitsAnalyticsTableBody');
    const tableRows = tableBody ? tableBody.innerHTML : '';
    
    // نسخ محتوى بطاقات مؤشرات الأرباح
    const totalProfits = document.getElementById('analyticsTotalProfitsValue').textContent;
    const paidProfits = document.getElementById('analyticsPaidProfits').textContent;
    const paidProfitsPercentage = document.getElementById('analyticsPaidProfitsPercentage').textContent;
    const monthlyProfitAverage = document.getElementById('analyticsMonthlyProfitAverage').textContent;
    
    return `
        <div class="section">
            <h2 class="section-title">مؤشرات الأرباح</h2>
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-title">إجمالي الأرباح</div>
                    <div class="card-value">${totalProfits}</div>
                </div>
                <div class="card">
                    <div class="card-title">الأرباح المدفوعة</div>
                    <div class="card-value">${paidProfits}</div>
                </div>
                <div class="card">
                    <div class="card-title">نسبة الأرباح المدفوعة</div>
                    <div class="card-value">${paidProfitsPercentage}</div>
                </div>
                <div class="card">
                    <div class="card-title">متوسط الربح الشهري</div>
                    <div class="card-value">${monthlyProfitAverage}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">الرسوم البيانية للأرباح</h2>
            <div class="image-placeholder">
                [رسم بياني] تطور الأرباح
            </div>
            <div class="image-placeholder">
                [رسم بياني] توزيع الأرباح
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">أعلى المستثمرين من حيث الأرباح</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>المستثمر</th>
                        <th>إجمالي الأرباح</th>
                        <th>الأرباح المدفوعة</th>
                        <th>الأرباح المستحقة</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// الحصول على محتوى تقرير الأداء
function getPerformanceReportContent() {
    // نسخ محتوى جدول الأداء
    const tableBody = document.getElementById('performanceAnalyticsTableBody');
    const tableRows = tableBody ? tableBody.innerHTML : '';
    
    // نسخ محتوى بطاقات مؤشرات الأداء
    const roi = document.getElementById('analyticsROI').textContent;
    const growthRate = document.getElementById('analyticsGrowthRate').textContent;
    const retentionRate = document.getElementById('analyticsRetentionRate').textContent;
    const activeInvestorsRate = document.getElementById('analyticsActiveInvestorsRate').textContent;
    
    return `
        <div class="section">
            <h2 class="section-title">مؤشرات الأداء</h2>
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-title">العائد على الاستثمار</div>
                    <div class="card-value">${roi}</div>
                </div>
                <div class="card">
                    <div class="card-title">معدل النمو</div>
                    <div class="card-value">${growthRate}</div>
                </div>
                <div class="card">
                    <div class="card-title">معدل الاحتفاظ</div>
                    <div class="card-value">${retentionRate}</div>
                </div>
                <div class="card">
                    <div class="card-title">المستثمرون النشطون</div>
                    <div class="card-value">${activeInvestorsRate}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">الرسوم البيانية للأداء</h2>
            <div class="image-placeholder">
                [رسم بياني] معدلات نمو الاستثمارات والأرباح
            </div>
            <div class="image-placeholder">
                [رسم بياني] مؤشرات الأداء
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">أداء الأشهر الأخيرة</h2>
            <table>
                <thead>
                    <tr>
                        <th>الشهر</th>
                        <th>إجمالي الاستثمارات</th>
                        <th>إجمالي الأرباح</th>
                        <th>نمو الاستثمارات</th>
                        <th>نمو الأرباح</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// الحصول على محتوى تقرير التوقعات
function getForecastReportContent() {
    // نسخ محتوى جدول التوقعات
    const tableBody = document.getElementById('forecastAnalyticsTableBody');
    const tableRows = tableBody ? tableBody.innerHTML : '';
    
    // نسخ محتوى بطاقات مؤشرات التوقعات
    const investmentGrowth = document.getElementById('totalForecastedInvestmentGrowth').textContent;
    const profitGrowth = document.getElementById('totalForecastedProfitGrowth').textContent;
    const investmentGrowthRate = document.getElementById('avgMonthlyInvestmentGrowthRate').textContent;
    const profitGrowthRate = document.getElementById('avgMonthlyProfitGrowthRate').textContent;
    
    return `
        <div class="section">
            <h2 class="section-title">مؤشرات التوقعات</h2>
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-title">نمو الاستثمارات المتوقع</div>
                    <div class="card-value">${investmentGrowth}</div>
                </div>
                <div class="card">
                    <div class="card-title">نمو الأرباح المتوقع</div>
                    <div class="card-value">${profitGrowth}</div>
                </div>
                <div class="card">
                    <div class="card-title">معدل نمو الاستثمار الشهري</div>
                    <div class="card-value">${investmentGrowthRate}</div>
                </div>
                <div class="card">
                    <div class="card-title">معدل نمو الأرباح الشهري</div>
                    <div class="card-value">${profitGrowthRate}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">الرسم البياني للتوقعات</h2>
            <div class="image-placeholder">
                [رسم بياني] التوقعات المستقبلية للاستثمارات والأرباح (6 أشهر)
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">بيانات التوقعات المستقبلية (6 أشهر)</h2>
            <table>
                <thead>
                    <tr>
                        <th>الشهر</th>
                        <th>إجمالي الاستثمارات (متوقع)</th>
                        <th>إجمالي الأرباح (متوقع)</th>
                        <th>معدل النمو</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// طباعة التحليلات
function printAnalytics() {
    // إنشاء المحتوى للطباعة
    const printWindow = window.open('', '_blank');
    
    // الحصول على التبويب النشط
    const activeTab = document.querySelector('#analytics .tab.active');
    const tabId = activeTab ? activeTab.getAttribute('onclick').match(/'([^']+)'/)[1] : 'investments';
    
    // إنشاء عنوان التقرير
    let title = 'تقرير التحليلات';
    
    switch (tabId) {
        case 'investments':
            title = 'تقرير تحليل الاستثمارات';
            break;
        case 'investors':
            title = 'تقرير تحليل المستثمرين';
            break;
        case 'profits':
            title = 'تقرير تحليل الأرباح';
            break;
        case 'performance':
            title = 'تقرير تحليل الأداء';
            break;
        case 'forecast':
            title = 'تقرير التوقعات المستقبلية';
            break;
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    direction: rtl;
                    padding: 20px;
                    color: #333;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                }
                .report-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .report-date {
                    font-size: 14px;
                    color: #777;
                }
                .report-company {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #eee;
                }
                .dashboard-cards {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .card {
                    flex: 1;
                    min-width: 200px;
                    background: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                .card-title {
                    font-size: 14px;
                    color: #777;
                    margin-bottom: 5px;
                }
                .card-value {
                    font-size: 20px;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .print-chart {
                    width: 100%;
                    height: 300px;
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f9f9f9;
                    border-radius: 5px;
                }
                .chart-placeholder {
                    font-size: 16px;
                    color: #777;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                }
                @media print {
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <div class="report-company">${settings.companyName}</div>
                <div class="report-title">${title}</div>
                <div class="report-date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')} - الوقت: ${new Date().toLocaleTimeString('ar-IQ')}</div>
            </div>
            
            <div class="section">
                <h2 class="section-title">ملخص البيانات الإحصائية</h2>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-title">إجمالي الاستثمارات</div>
                        <div class="card-value">${document.getElementById('analyticsTotalInvestments').textContent}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">عدد المستثمرين</div>
                        <div class="card-value">${document.getElementById('analyticsInvestorsCount').textContent}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">إجمالي الأرباح</div>
                        <div class="card-value">${document.getElementById('analyticsTotalProfits').textContent}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">الأرباح المستحقة</div>
                        <div class="card-value">${document.getElementById('analyticsDueProfits').textContent}</div>
                    </div>
                </div>
            </div>
            
            ${getReportContentByTabId(tabId)}
            
            <div class="footer">
                تم إنشاء هذا التقرير بواسطة نظام إدارة الاستثمار - جميع الحقوق محفوظة &copy; ${new Date().getFullYear()}
            </div>
            
            <div class="print-button" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print();" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-print"></i> طباعة
                </button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
}

// تغيير فترة الرسم البياني للتحليلات
function switchAnalyticsChartPeriod(tabId, period) {
    switch (tabId) {
        case 'investments':
            switchChartPeriod(period);
            break;
        case 'profits':
            switchProfitsAnalysisChart(period);
            break;
        case 'performance':
            // يمكن تنفيذ وظيفة مشابهة لتغيير فترة مخطط الأداء
            break;
    }
}

// تغيير نطاق التاريخ للتحليلات
function changeAnalyticsDateRange() {
    const dateRange = document.getElementById('analyticsDateRange').value;
    
    // حساب فترة التاريخ
    const today = new Date();
    let startDate, endDate;
    
    switch (dateRange) {
        case 'month':
            // الشهر الحالي
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
            break;
        case 'quarter':
            // الربع الحالي
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1);
            endDate = today;
            break;
        case 'year':
            // السنة الحالية
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = today;
            break;
        default:
            // جميع الفترات
            startDate = null;
            endDate = null;
    }
    
    // تحديث التحليلات بناءً على نطاق التاريخ
    loadAnalyticsWithDateRange(startDate, endDate);
}

// تحميل التحليلات بناءً على نطاق التاريخ
function loadAnalyticsWithDateRange(startDate, endDate) {
    // تحديث المؤشرات العامة
    updateAnalyticsOverviewWithDateRange(startDate, endDate);
    
    // تحديث التبويب النشط
    const activeTab = document.querySelector('#analytics .tab.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('onclick').match(/'([^']+)'/)[1];
        loadAnalyticsTabWithDateRange(tabId, startDate, endDate);
    }
}

// تحديث المؤشرات العامة بناءً على نطاق التاريخ
function updateAnalyticsOverviewWithDateRange(startDate, endDate) {
    // تنفيذ منطق لتصفية البيانات حسب نطاق التاريخ
    // وتحديث المؤشرات العامة
    // هذه الوظيفة ستكون مشابهة لـ loadAnalyticsOverview ولكن مع تصفية البيانات
}

// تحميل تبويب التحليلات مع نطاق تاريخ محدد
function loadAnalyticsTabWithDateRange(tabId, startDate, endDate) {
    // تنفيذ منطق لتحميل التبويب المحدد مع تصفية البيانات حسب نطاق التاريخ
    // هذه الوظيفة ستكون مشابهة لـ loadAnalyticsForTab ولكن مع تصفية البيانات
}

// وظيفة مساعدة لتصفية الاستثمارات حسب نطاق التاريخ
function filterInvestmentsByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
        return investments;
    }
    
    return investments.filter(inv => {
        const investmentDate = new Date(inv.date);
        return investmentDate >= startDate && investmentDate <= endDate;
    });
}

// وظيفة مساعدة لتصفية العمليات حسب نطاق التاريخ
function filterOperationsByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
        return operations;
    }
    
    return operations.filter(op => {
        const operationDate = new Date(op.date);
        return operationDate >= startDate && operationDate <= endDate;
    });
}

// تحديث قائمة أطراف الواجهة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة مستمع لتغيير نطاق التاريخ
    const dateRangeSelect = document.getElementById('analyticsDateRange');
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', changeAnalyticsDateRange);
    }
    
    // تحديث HTML صفحة التحليلات إذا لزم الأمر
    updateAnalyticsHTML();
    
    // تحميل التحليلات عند فتح الصفحة
    if (window.location.hash === '#analytics') {
        setTimeout(loadAnalytics, 100);
    }
});

// تصدير الدوال للاستخدام العام
window.loadAnalytics = loadAnalytics;
window.switchAnalyticsTab = switchAnalyticsTab;
window.exportAnalyticsReport = exportAnalyticsReport;
window.printAnalytics = printAnalytics;
window.switchAnalyticsChartPeriod = switchAnalyticsChartPeriod;