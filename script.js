// Register the datalabels plugin globally
Chart.register(ChartDataLabels);

// Global Chart.js defaults for dark theme
Chart.defaults.color = 'white';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Inter", sans-serif';

// User-friendly chart configuration
const chartHelpers = {
    // Make tooltips more user-friendly
    createUserFriendlyTooltip: (chartType) => {
        const tooltips = {
            sentiment: {
                title: (context) => `Brand: ${context[0].label}`,
                label: (context) => `${context.dataset.label}: ${context.parsed.y}% of all comments`,
                afterBody: () => ['', '💡 Green = Good reputation, Red = Poor reputation']
            },
            engagement: {
                title: (context) => `Topic: ${context[0].label || context[0].raw.label}`,
                label: (context) => {
                    if (context.chart.data.datasets[0].type === 'bubble') {
                        return [
                            `Messages: ${context.raw.x}`,
                            `Engagement: ${context.raw.y.toFixed(1)}%`,
                            `Reach: ${(context.raw.r * 1000).toLocaleString()} people`
                        ];
                    }
                    return `${context.dataset.label}: ${context.parsed.y}`;
                },
                afterBody: () => ['', '💡 Bigger bubbles = more people reached']
            },
            satisfaction: {
                title: (context) => `Policy: ${context[0].label}`,
                label: (context) => `Satisfaction: ${context.parsed.y}%`,
                afterBody: () => ['', '💡 Higher percentages = happier citizens']
            }
        };
        return tooltips[chartType] || tooltips.sentiment;
    },
    
    // Add explanatory subtitles to charts
    addChartSubtitle: (text) => ({
        display: true,
        text: text,
        color: '#9CA3AF',
        font: { size: 12 },
        padding: { bottom: 20 }
    })
};

// Global variables
let enhancedData = null;
let chartsData = null;
let currentChart = null;
let secondaryChart = null;

// Load both data sources
Promise.all([
  fetch('charts.json').then(response => response.json()),
  fetch('enhanced-data.json').then(response => response.json())
])
  .then(([charts, enhanced]) => {
    chartsData = charts;
    enhancedData = enhanced;
    
    // Initialize default charts
    renderDefaultCharts();
    
    // Setup event listeners
    setupEventListeners();
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

function setupEventListeners() {
  const fieldSelector = document.getElementById('fieldSelector');
  const topicSelector = document.getElementById('topicSelector');
  const generateButton = document.getElementById('generateInsights');

  // Enable/disable generate button based on selections
  function updateButtonState() {
    const fieldSelected = fieldSelector.value !== '';
    const topicSelected = topicSelector.value !== '';
    generateButton.disabled = !(fieldSelected && topicSelected);
  }

  fieldSelector.addEventListener('change', updateButtonState);
  topicSelector.addEventListener('change', updateButtonState);

  generateButton.addEventListener('click', () => {
    const field = fieldSelector.value;
    const topic = topicSelector.value;
    
    if (field && topic) {
      generatePersonalizedInsights(field, topic);
    }
  });
}

function generatePersonalizedInsights(field, topic) {
  const topicData = enhancedData.topics[topic];
  const fieldData = topicData[`${field}_insights`];
  
  // Show insights container and hide default charts
  document.getElementById('insightsContainer').classList.remove('hidden');
  document.getElementById('defaultCharts').classList.add('hidden');
  
  // Update titles
  document.getElementById('mainChartTitle').textContent = 
    `${getFieldIcon(field)} ${getFieldName(field)}: ${topicData.name} Analysis`;
  
  // Generate visualizations based on field
  switch (field) {
    case 'business':
      renderBusinessInsights(fieldData, topicData.name);
      break;
    case 'media':
      renderMediaInsights(fieldData, topicData.name);
      break;
    case 'research':
      renderResearchInsights(fieldData, topicData.name);
      break;
    case 'government':
      renderGovernmentInsights(fieldData, topicData.name);
      break;
  }
  
  // Generate key metrics
  generateKeyMetrics(field, fieldData);
  
  // Generate insights summary
  generateInsightsSummary(field, fieldData, topicData.name);
}

function renderBusinessInsights(data, topicName) {
  // Main chart: Market Share
  const ctx = document.getElementById('mainChart').getContext('2d');
  if (currentChart) currentChart.destroy();
  
  currentChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.market_share.map(item => item.company),
      datasets: [{
        data: data.market_share.map(item => item.share),
        backgroundColor: [
          '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Market Share Analysis - ${topicName}`,
          color: 'white',
          font: { size: 18 }
        },
        legend: {
          labels: { color: 'white' }
        },
        datalabels: {
          color: 'white',
          formatter: (value) => value + '%',
          font: { weight: 'bold' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });

  // Secondary chart: Growth rates
  const ctx2 = document.getElementById('secondaryChart').getContext('2d');
  if (secondaryChart) secondaryChart.destroy();
  
  document.getElementById('secondaryChartTitle').textContent = 'Growth Rate Comparison';
  
  secondaryChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: data.market_share.map(item => item.company),
      datasets: [{
        label: 'Growth Rate (%)',
        data: data.market_share.map(item => item.growth),
        backgroundColor: data.market_share.map(item => 
          item.growth > 0 ? '#4CAF50' : '#F44336'
        )
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: 'white' } },
        datalabels: {
          color: 'white',
          formatter: (value) => value + '%',
          font: { weight: 'bold' }
        }
      },
      scales: {
        x: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function renderMediaInsights(data, topicName) {
  // Main chart: Content Performance
  const ctx = document.getElementById('mainChart').getContext('2d');
  if (currentChart) currentChart.destroy();
  
  currentChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: Object.keys(data.content_performance),
      datasets: [{
        label: 'Performance Score',
        data: Object.values(data.content_performance),
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Content Performance Analysis - ${topicName}`,
          color: 'white',
          font: { size: 18 }
        },
        legend: { labels: { color: 'white' } }
      },
      scales: {
        r: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: 'white' }
        }
      }
    }
  });

  // Secondary chart: Audience Demographics
  const ctx2 = document.getElementById('secondaryChart').getContext('2d');
  if (secondaryChart) secondaryChart.destroy();
  
  document.getElementById('secondaryChartTitle').textContent = 'Audience Demographics';
  
  secondaryChart = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: Object.keys(data.audience_demographics),
      datasets: [{
        data: Object.values(data.audience_demographics),
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: 'white' } },
        datalabels: {
          color: 'white',
          formatter: (value) => value + '%',
          font: { weight: 'bold' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function renderResearchInsights(data, topicName) {
  // Main chart: Correlation Factors
  const ctx = document.getElementById('mainChart').getContext('2d');
  if (currentChart) currentChart.destroy();
  
  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.correlation_factors.map(item => item.factor),
      datasets: [{
        label: 'Correlation Coefficient',
        data: data.correlation_factors.map(item => item.correlation),
        backgroundColor: data.correlation_factors.map(item => 
          item.correlation > 0.7 ? '#4CAF50' : 
          item.correlation > 0.5 ? '#FF9800' : '#F44336'
        )
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Correlation Analysis - ${topicName}`,
          color: 'white',
          font: { size: 18 }
        },
        legend: { labels: { color: 'white' } },
        datalabels: {
          color: 'white',
          formatter: (value) => value.toFixed(2),
          font: { weight: 'bold' }
        }
      },
      scales: {
        x: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { 
          ticks: { color: 'white' }, 
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          min: -1,
          max: 1
        }
      }
    },
    plugins: [ChartDataLabels]
  });

  // Secondary chart: Geographic Distribution
  const ctx2 = document.getElementById('secondaryChart').getContext('2d');
  if (secondaryChart) secondaryChart.destroy();
  
  document.getElementById('secondaryChartTitle').textContent = 'Geographic Distribution';
  
  secondaryChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: Object.keys(data.geographic_distribution),
      datasets: [{
        data: Object.values(data.geographic_distribution),
        backgroundColor: ['#8E44AD', '#3498DB', '#E74C3C', '#F39C12']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: 'white' } },
        datalabels: {
          color: 'white',
          formatter: (value) => value + '%',
          font: { weight: 'bold' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function renderGovernmentInsights(data, topicName) {
  // Main chart: Economic Impact
  const ctx = document.getElementById('mainChart').getContext('2d');
  if (currentChart) currentChart.destroy();
  
  const economicMetrics = Object.keys(data.economic_effect);
  const economicValues = Object.values(data.economic_effect);
  
  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: economicMetrics.map(metric => 
        metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      ),
      datasets: [{
        label: 'Economic Impact',
        data: economicValues,
        backgroundColor: '#2E7D32'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Economic Impact Analysis - ${topicName}`,
          color: 'white',
          font: { size: 18 }
        },
        legend: { labels: { color: 'white' } },
        datalabels: {
          color: 'white',
          font: { weight: 'bold' }
        }
      },
      scales: {
        x: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
      }
    },
    plugins: [ChartDataLabels]
  });

  // Secondary chart: Regional Differences
  const ctx2 = document.getElementById('secondaryChart').getContext('2d');
  if (secondaryChart) secondaryChart.destroy();
  
  document.getElementById('secondaryChartTitle').textContent = 'Regional Support';
  
  secondaryChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Object.keys(data.regional_differences),
      datasets: [{
        label: 'Support Level (%)',
        data: Object.values(data.regional_differences),
        backgroundColor: ['#1E88E5', '#43A047', '#FB8C00']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: 'white' } },
        datalabels: {
          color: 'white',
          formatter: (value) => value + '%',
          font: { weight: 'bold' }
        }
      },
      scales: {
        x: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function generateKeyMetrics(field, data) {
  const metricsContainer = document.getElementById('keyMetrics');
  metricsContainer.innerHTML = '';

  let metrics = [];
  
  switch (field) {
    case 'business':
      metrics = [
        { label: 'Brand Mentions', value: data.brand_mentions?.toLocaleString() || '12.5K', icon: '�', color: 'from-emerald-500 to-teal-600' },
        { label: 'Sentiment Score', value: (data.sentiment_score || 72) + '%', icon: '�', color: 'from-cyan-500 to-blue-600' },
        { label: 'Revenue Impact', value: '+' + data.revenue_impact + '%', icon: '💰', color: 'from-emerald-400 to-cyan-500' },
        { label: 'Market Growth', value: '+' + (data.market_share?.find(item => item.company.includes('Our'))?.growth || 8.5) + '%', icon: '📈', color: 'from-teal-500 to-cyan-600' }
      ];
      break;
    case 'media':
      metrics = [
        { label: 'Viral Potential', value: data.viral_potential + '/10', icon: '🚀', color: 'from-emerald-500 to-cyan-600' },
        { label: 'Engagement Growth', value: '+' + (data.engagement_growth || 45) + '%', icon: '📈', color: 'from-cyan-500 to-teal-600' },
        { label: 'Share Rate', value: (data.share_rate || 23) + '%', icon: '�', color: 'from-teal-500 to-emerald-600' },
        { label: 'Influencer Reach', value: (data.influencer_reach / 1000000).toFixed(1) + 'M', icon: '�', color: 'from-cyan-400 to-blue-500' }
      ];
      break;
    case 'research':
      metrics = [
        { label: 'Sample Size', value: data.sample_size.toLocaleString(), icon: '�', color: 'from-emerald-500 to-teal-600' },
        { label: 'Confidence Level', value: data.confidence_interval, icon: '✅', color: 'from-cyan-500 to-blue-600' },
        { label: 'Adoption Rate', value: data.adoption_rate + '%', icon: '📊', color: 'from-teal-500 to-cyan-600' },
        { label: 'Significance', value: 'p < ' + data.statistical_significance, icon: '🎯', color: 'from-emerald-400 to-cyan-500' }
      ];
      break;
    case 'government':
      metrics = [
        { label: 'Public Support', value: data.public_support + '%', icon: '👍', color: 'from-emerald-500 to-cyan-600' },
        { label: 'Job Creation', value: (data.economic_effect.job_creation / 1000).toFixed(1) + 'K', icon: '�', color: 'from-cyan-500 to-teal-600' },
        { label: 'Tax Revenue', value: '$' + (data.economic_effect.tax_revenue / 1000000).toFixed(0) + 'M', icon: '💰', color: 'from-teal-500 to-emerald-600' },
        { label: 'Priority Level', value: data.priority_level, icon: '⭐', color: 'from-cyan-400 to-blue-500' }
      ];
      break;
  }

  metrics.forEach(metric => {
    const metricCard = document.createElement('div');
    metricCard.className = 'metric-card rounded-2xl p-6 text-center hover-lift';
    metricCard.innerHTML = `
      <div class="text-3xl mb-4">${metric.icon}</div>
      <div class="text-2xl font-bold text-white mb-2">${metric.value}</div>
      <div class="text-sm text-gray-300 font-medium">${metric.label}</div>
      <div class="w-full h-1 bg-gradient-to-r ${metric.color} rounded-full mt-4"></div>
    `;
    metricsContainer.appendChild(metricCard);
  });
}

function generateInsightsSummary(field, data, topicName) {
  const insightsList = document.getElementById('insightsList');
  insightsList.innerHTML = '';

  let insights = [];
  
  switch (field) {
    case 'business':
      insights = [
        { text: `🎯 Your brand has ${data.competitive_advantage || 'AI Integration'} as key differentiator in ${topicName}`, type: 'success' },
        { text: `📈 Market sentiment is ${data.sentiment_score || 72}% positive with ${(data.brand_mentions || 12500).toLocaleString()} mentions`, type: 'success' },
        { text: `💡 Opportunity: ${data.growth_opportunity || 'Enterprise AI solutions'} showing high demand`, type: 'info' },
        { text: `⚠️ Watch out: Competitor weakness in ${data.competitor_weakness || 'customer support'} creates opening`, type: 'warning' },
        { text: `🚀 Revenue potential: +${data.revenue_impact}% growth projected from market positioning`, type: 'success' }
      ];
      break;
    case 'media':
      insights = [
        { text: `🔥 ${topicName} has ${data.viral_potential}/10 viral potential - prime for content creation`, type: 'success' },
        { text: `⏰ Peak engagement window: ${data.peak_engagement_time} - schedule content accordingly`, type: 'info' },
        { text: `📺 Video content performs ${data.content_performance?.video || 85}% better than text in this topic`, type: 'success' },
        { text: `🌊 Trending momentum: ${data.audience_sentiment || 'Optimistic'} public sentiment with ${data.engagement_growth || 45}% growth`, type: 'info' },
        { text: `📱 Breaking news potential: ${data.breaking_news_potential || 'High'} - monitor for developing stories`, type: 'warning' }
      ];
      break;
    case 'research':
      insights = [
        { text: `📊 Strong statistical foundation: ${data.sample_size.toLocaleString()} samples with ${data.confidence_interval} confidence`, type: 'success' },
        { text: `🎓 Key demographic: ${data.demographic_insights?.early_adopters || '25-34 urban professionals'} lead adoption`, type: 'info' },
        { text: `🚫 Resistance found in: ${data.demographic_insights?.resistance_groups || '45+ rural populations'}`, type: 'warning' },
        { text: `🔍 Primary barriers: ${data.demographic_insights?.key_barriers || 'Privacy concerns, complexity'}`, type: 'info' },
        { text: `🌍 Geographic hotspots: North America (${data.geographic_distribution['North America']}%) and Europe (${data.geographic_distribution.Europe}%)`, type: 'success' }
      ];
      break;
    case 'government':
      insights = [
        { text: `👥 Strong public mandate: ${data.public_support}% support with ${data.policy_impact.toLowerCase()} policy impact`, type: 'success' },
        { text: `💼 Economic benefits: ${(data.economic_effect.job_creation / 1000).toFixed(1)}K jobs, $${(data.economic_effect.tax_revenue / 1000000).toFixed(0)}M tax revenue`, type: 'success' },
        { text: `🏛️ Policy priority: ${data.priority_level} level - immediate action recommended`, type: 'warning' },
        { text: `⚠️ Address concerns: ${data.public_concerns?.join(', ') || 'Job displacement, Privacy, Security'}`, type: 'info' },
        { text: `📋 Next steps: ${data.policy_recommendations?.[0] || 'Increase R&D tax incentives'} for maximum impact`, type: 'info' }
      ];
      break;
  }

  insights.forEach(insight => {
    const insightItem = document.createElement('div');
    const colorMap = {
      success: 'border-emerald-500/30 bg-emerald-900/20',
      info: 'border-cyan-500/30 bg-cyan-900/20',
      warning: 'border-yellow-500/30 bg-yellow-900/20'
    };
    
    insightItem.className = `insight-item rounded-xl p-4 border ${colorMap[insight.type]}`;
    insightItem.innerHTML = `
      <div class="text-sm text-gray-200 leading-relaxed">${insight.text}</div>
    `;
    insightsList.appendChild(insightItem);
  });

  // Update timestamp
  document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
}

function getFieldIcon(field) {
  const icons = {
    business: '💼',
    media: '📺',
    research: '🔬',
    government: '🏛️'
  };
  return icons[field] || '📊';
}

function getFieldName(field) {
  const names = {
    business: 'Business Analysis',
    media: 'Media Insights',
    research: 'Research Findings',
    government: 'Government Analysis'
  };
  return names[field] || 'Analysis';
}

function renderDefaultCharts() {
  if (chartsData) {
    renderBusinessChart(chartsData.business_insights);
    renderMediaChart(chartsData.media_insights);
    renderResearcherChart(chartsData.researcher_insights);
    renderGovernmentChart(chartsData.government_insights);
  }
}


// --- Original Chart Functions (for default view) ---

// --- 1. Business Chart: Stacked Bar Chart for Brand Sentiment ---
function renderBusinessChart(jsonData) {
    const brands = jsonData.data.map(item => item.brand);
    const positiveData = jsonData.data.map(item => item.positive);
    const neutralData = jsonData.data.map(item => item.neutral);
    const negativeData = jsonData.data.map(item => item.negative);

    const ctx = document.getElementById('businessChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: brands,
            datasets: [{
                label: 'Positive',
                data: positiveData,
                backgroundColor: '#4CAF50', // Green
            }, {
                label: 'Neutral',
                data: neutralData,
                backgroundColor: '#FF9800', // Orange
            }, {
                label: 'Negative',
                data: negativeData,
                backgroundColor: '#F44336', // Red
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: jsonData.report_title,
                    color: 'white',
                    font: { size: 18 }
                },
                legend: {
                    labels: { color: 'white' }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value) => value + '%',
                    font: { weight: 'bold' }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: 'Brands', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    stacked: true,
                    title: { display: true, text: 'Sentiment (%)', color: 'white' },
                    ticks: { color: 'white', callback: (value) => value + '%' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    min: 0,
                    max: 100
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// --- 2. Media Chart: Bubble Chart for Emerging Topics & Virality ---
function renderMediaChart(jsonData) {
    const dataPoints = jsonData.data.map(item => ({
        x: item.messages,        // X-axis: Message Volume
        y: item.engagement_rate * 100, // Y-axis: Engagement Rate (%)
        r: Math.sqrt(item.reach / 1000) * 0.7, // Radius: based on reach, scaled for visibility
        label: item.topic       // Label for datalabels
    }));

    const ctx = document.getElementById('mediaChart').getContext('2d');
    new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Topics',
                data: dataPoints,
                backgroundColor: 'rgba(33, 150, 243, 0.6)', // Blue
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: jsonData.report_title,
                    color: 'white',
                    font: { size: 18 }
                },
                legend: {
                    display: false // No need for legend in a single-dataset bubble chart
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const item = context.raw;
                            return [
                                `Topic: ${item.label}`,
                                `Messages: ${item.x}`,
                                `Reach: ${Math.round(item.r * item.r * 1000 / 0.7 / 0.7)}`, // Reverse engineer reach
                                `Engagement: ${item.y}%`
                            ];
                        }
                    }
                },
                datalabels: {
                    formatter: function(value, context) {
                        return context.chart.data.datasets[0].data[context.dataIndex].label;
                    },
                    color: 'white',
                    font: { weight: 'bold', size: 10 },
                    align: 'center',
                    anchor: 'center'
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Message Volume', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Engagement Rate (%)', color: 'white' },
                    ticks: { color: 'white', callback: (value) => value + '%' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// --- 3. Researcher Chart: Horizontal Bar Chart (simulating Treemap concepts) ---
function renderResearcherChart(jsonData) {
    // For Chart.js, we'll represent the treemap concept with a stacked horizontal bar chart
    // showing major topics and their sub-topics by value/sentiment
    const mainTopics = jsonData.data.children.map(main => main.name);
    const labels = [];
    const positiveValues = [];
    const negativeValues = [];
    const neutralValues = [];
    const backgroundColors = [];

    jsonData.data.children.forEach(mainTopic => {
        mainTopic.children.forEach(subTopic => {
            labels.push(`${mainTopic.name}: ${subTopic.name}`);
            positiveValues.push(subTopic.sentiment === 'positive' ? subTopic.value : 0);
            negativeValues.push(subTopic.sentiment === 'negative' ? subTopic.value : 0);
            neutralValues.push(subTopic.sentiment === 'neutral' ? subTopic.value : 0);
        });
    });

    const ctx = document.getElementById('researcherChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Positive Value',
                    data: positiveValues,
                    backgroundColor: '#4CAF50', // Green
                    stack: 'Stack 0'
                },
                {
                    label: 'Neutral Value',
                    data: neutralValues,
                    backgroundColor: '#FF9800', // Orange
                    stack: 'Stack 0'
                },
                {
                    label: 'Negative Value',
                    data: negativeValues,
                    backgroundColor: '#F44336', // Red
                    stack: 'Stack 0'
                }
            ]
        },
        options: {
            indexAxis: 'y', // Makes it a horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: jsonData.report_title + ' (by Topic Volume & Sentiment)',
                    color: 'white',
                    font: { size: 18 }
                },
                legend: {
                    labels: { color: 'white' }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value) => value > 0 ? value : '', // Only show label for positive values
                    font: { weight: 'bold', size: 10 }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: 'Topic Volume', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    stacked: true,
                    title: { display: false, text: 'Sub-Topics', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


// --- 4. Government Chart: Doughnut Chart (simulating Gauge) ---
function renderGovernmentChart(jsonData) {
    const policyData = jsonData.data;
    const labels = Object.keys(policyData);
    const datasets = [];

    // Creating separate "gauge" like datasets for each policy
    labels.forEach((policyKey, index) => {
        const score = policyData[policyKey].satisfaction_score;
        const remaining = 100 - score;
        
        datasets.push({
            label: policyKey,
            data: [score, remaining],
            backgroundColor: [
                score >= 70 ? '#4CAF50' : (score >= 40 ? '#FF9800' : '#F44336'), // Green, Orange, Red based on score
                'rgba(255, 255, 255, 0.2)' // Background for the "empty" part of the gauge
            ],
            borderColor: 'rgba(255, 255, 255, 0.05)',
            borderWidth: 5,
            circumference: 180, // Half circle
            rotation: -90,      // Start from the bottom
            cutout: '60%',      // Make it a thick ring
            spacing: 10,        // Space between multiple gauges
            datalabels: {
                color: 'white',
                formatter: (value, context) => context.dataIndex === 0 ? `${value}%` : '',
                font: { weight: 'bold', size: 16 }
            }
        });
    });

    const ctx = document.getElementById('governmentChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels, // For legend
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: jsonData.report_title,
                    color: 'white',
                    font: { size: 18 }
                },
                legend: {
                    position: 'bottom',
                    labels: { color: 'white' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataIndex === 0) { // Only show score for the filled part
                                const policyKey = labels[context.datasetIndex];
                                const score = context.raw;
                                const details = policyData[policyKey].details;
                                return [`${policyKey}: ${score}% Satisfaction`, details];
                            }
                            return null;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


// --- 1. Business Chart: Stacked Bar Chart for Brand Sentiment ---
function renderBusinessChart(jsonData) {
    const brands = jsonData.data.map(item => item.brand);
    const positiveData = jsonData.data.map(item => item.positive);
    const neutralData = jsonData.data.map(item => item.neutral);
    const negativeData = jsonData.data.map(item => item.negative);

    const ctx = document.getElementById('businessChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: brands,
            datasets: [{
                label: 'Positive',
                data: positiveData,
                backgroundColor: '#4CAF50', // Green
            }, {
                label: 'Neutral',
                data: neutralData,
                backgroundColor: '#FF9800', // Orange
            }, {
                label: 'Negative',
                data: negativeData,
                backgroundColor: '#F44336', // Red
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: jsonData.report_title,
                    color: 'white',
                    font: { size: 18 }
                },
                legend: {
                    labels: { color: 'white' }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value) => value + '%',
                    font: { weight: 'bold' }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: 'Brands', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    stacked: true,
                    title: { display: true, text: 'Sentiment (%)', color: 'white' },
                    ticks: { color: 'white', callback: (value) => value + '%' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    min: 0,
                    max: 100
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// --- 2. Media Chart: Bubble Chart for Emerging Topics & Virality ---
function renderMediaChart(jsonData) {
    const dataPoints = jsonData.data.map(item => ({
        x: item.messages,        // X-axis: Message Volume
        y: item.engagement_rate * 100, // Y-axis: Engagement Rate (%)
        r: Math.sqrt(item.reach / 1000) * 0.7, // Radius: based on reach, scaled for visibility
        label: item.topic       // Label for datalabels
    }));

    const ctx = document.getElementById('mediaChart').getContext('2d');
    new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Topics',
                data: dataPoints,
                backgroundColor: 'rgba(33, 150, 243, 0.6)', // Blue
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: jsonData.report_title,
                    color: 'white',
                    font: { size: 18 }
                },
                legend: {
                    display: false // No need for legend in a single-dataset bubble chart
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const item = context.raw;
                            return [
                                `Topic: ${item.label}`,
                                `Messages: ${item.x}`,
                                `Reach: ${Math.round(item.r * item.r * 1000 / 0.7 / 0.7)}`, // Reverse engineer reach
                                `Engagement: ${item.y}%`
                            ];
                        }
                    }
                },
                datalabels: {
                    formatter: function(value, context) {
                        return context.chart.data.datasets[0].data[context.dataIndex].label;
                    },
                    color: 'white',
                    font: { weight: 'bold', size: 10 },
                    align: 'center',
                    anchor: 'center'
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Message Volume', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Engagement Rate (%)', color: 'white' },
                    ticks: { color: 'white', callback: (value) => value + '%' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// --- 3. Researcher Chart: Horizontal Bar Chart (simulating Treemap concepts) ---
function renderResearcherChart(jsonData) {
    // For Chart.js, we'll represent the treemap concept with a stacked horizontal bar chart
    // showing major topics and their sub-topics by value/sentiment
    const mainTopics = jsonData.data.children.map(main => main.name);
    const labels = [];
    const positiveValues = [];
    const negativeValues = [];
    const neutralValues = [];
    const backgroundColors = [];

    jsonData.data.children.forEach(mainTopic => {
        mainTopic.children.forEach(subTopic => {
            labels.push(`${mainTopic.name}: ${subTopic.name}`);
            positiveValues.push(subTopic.sentiment === 'positive' ? subTopic.value : 0);
            negativeValues.push(subTopic.sentiment === 'negative' ? subTopic.value : 0);
            neutralValues.push(subTopic.sentiment === 'neutral' ? subTopic.value : 0);
        });
    });

    const ctx = document.getElementById('researcherChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Positive Value',
                    data: positiveValues,
                    backgroundColor: '#4CAF50', // Green
                    stack: 'Stack 0'
                },
                {
                    label: 'Neutral Value',
                    data: neutralValues,
                    backgroundColor: '#FF9800', // Orange
                    stack: 'Stack 0'
                },
                {
                    label: 'Negative Value',
                    data: negativeValues,
                    backgroundColor: '#F44336', // Red
                    stack: 'Stack 0'
                }
            ]
        },
        options: {
            indexAxis: 'y', // Makes it a horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: jsonData.report_title + ' (by Topic Volume & Sentiment)',
                    color: 'white',
                    font: { size: 18 }
                },
                legend: {
                    labels: { color: 'white' }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value) => value > 0 ? value : '', // Only show label for positive values
                    font: { weight: 'bold', size: 10 }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: 'Topic Volume', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    stacked: true,
                    title: { display: false, text: 'Sub-Topics', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


// --- 4. Government Chart: Doughnut Chart (simulating Gauge) ---
function renderGovernmentChart(jsonData) {
    const policyData = jsonData.data;
    const labels = Object.keys(policyData);
    const datasets = [];

    // Creating separate "gauge" like datasets for each policy
    labels.forEach((policyKey, index) => {
        const score = policyData[policyKey].satisfaction_score;
        const remaining = 100 - score;
        
        datasets.push({
            label: policyKey,
            data: [score, remaining],
            backgroundColor: [
                score >= 70 ? '#4CAF50' : (score >= 40 ? '#FF9800' : '#F44336'), // Green, Orange, Red based on score
                'rgba(255, 255, 255, 0.2)' // Background for the "empty" part of the gauge
            ],
            borderColor: 'rgba(255, 255, 255, 0.05)',
            borderWidth: 5,
            circumference: 180, // Half circle
            rotation: -90,      // Start from the bottom
            cutout: '60%',      // Make it a thick ring
            spacing: 10,        // Space between multiple gauges
            datalabels: {
                color: 'white',
                formatter: (value, context) => context.dataIndex === 0 ? `${value}%` : '',
                font: { weight: 'bold', size: 16 }
            }
        });
    });

    const ctx = document.getElementById('governmentChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels, // For legend
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: jsonData.report_title,
                    color: 'white',
                    font: { size: 18 }
                },
                legend: {
                    position: 'bottom',
                    labels: { color: 'white' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataIndex === 0) { // Only show score for the filled part
                                const policyKey = labels[context.datasetIndex];
                                const score = context.raw;
                                const details = policyData[policyKey].details;
                                return [`${policyKey}: ${score}% Satisfaction`, details];
                            }
                            return null;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}