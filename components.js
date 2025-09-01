// HTML Component Generator for Specula Dashboard
// This file generates HTML elements dynamically to reduce hardcoding

// Navigation components
const NavigationComponents = {
    // Generate sidebar navigation with active state management
    generateSidebar: () => {
        return `
            <!-- Sidebar Navigation -->
            <div class="w-64 sidebar-gradient border-r border-gray-800 flex flex-col">
                <!-- Logo Section -->
                <div class="p-6 border-b border-gray-800">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-.38.24-1.07.7-.17.12-.39.18-.67.18-.3 0-.59-.09-.87-.26a3.27 3.27 0 01-.35-.24c-.41-.3-.64-.47-.69-.52-.07-.07-.08-.15-.02-.24.05-.07.15-.1.26-.1h.03c.8-.03 1.62-.1 2.44-.2.34-.04.66-.1.95-.17.42-.1.8-.24 1.13-.41.45-.24.85-.56 1.18-.94.18-.21.32-.44.42-.68.07-.17.1-.35.09-.53-.01-.15-.05-.29-.12-.42z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-white">Specula</h1>
                            <p class="text-xs text-gray-400">Opinion Analyzer</p>
                        </div>
                    </div>
                </div>

                <!-- Navigation Menu -->
                <nav class="flex-1 px-4 py-6 space-y-2" id="sidebarNav">
                    ${this.generateNavItems()}
                </nav>

                <!-- Status Indicator -->
                <div class="p-4 border-t border-gray-800">
                    <div class="flex items-center space-x-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                        <div class="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
                        <div class="text-sm">
                            <div class="text-green-300 font-medium">System Active</div>
                            <div class="text-green-400/70 text-xs">127 channels monitored</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Generate navigation items with icons and active states
    generateNavItems: () => {
        const navItems = [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"/>`,
                active: true
            },
            {
                type: 'separator',
                label: 'Analytics'
            },
            {
                id: 'business',
                label: 'Business Intelligence',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>`
            },
            {
                id: 'media',
                label: 'Media Analytics',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>`
            },
            {
                id: 'research',
                label: 'Research Hub',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>`
            },
            {
                id: 'government',
                label: 'Government Insights',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>`
            },
            {
                type: 'separator',
                label: 'Tools'
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`
            },
            {
                id: 'export',
                label: 'Export Data',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`
            }
        ];

        return navItems.map(item => {
            if (item.type === 'separator') {
                return `<div class="px-4 py-2"><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">${item.label}</h3></div>`;
            }

            const activeClass = item.active ? 'sidebar-active text-emerald-400' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white';
            
            return `
                <a href="#${item.id}" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg ${activeClass} transition-all duration-200" data-section="${item.id}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${item.icon}
                    </svg>
                    <span class="font-medium">${item.label}</span>
                </a>
            `;
        }).join('');
    },

    // Generate top header with controls
    generateHeader: () => {
        return `
            <!-- Top Header Bar -->
            <header class="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-white" id="pageTitle">Analytics Dashboard</h2>
                        <p class="text-gray-400 text-sm" id="pageSubtitle">Real-time Telegram opinion analysis</p>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <!-- Field & Topic Selectors -->
                        <div class="flex items-center space-x-3">
                            <select id="fieldSelector" class="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                                <option value="">Select Field...</option>
                                <option value="business">💼 Business</option>
                                <option value="media">📺 Media</option>
                                <option value="research">🔬 Research</option>
                                <option value="government">🏛️ Government</option>
                            </select>
                            
                            <select id="topicSelector" class="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                <option value="">Select Topic...</option>
                                <option value="technology">💻 Technology</option>
                                <option value="healthcare">🏥 Healthcare</option>
                                <option value="environment">🌍 Environment</option>
                                <option value="education">📚 Education</option>
                            </select>
                            
                            <button id="generateInsights" class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 text-sm" disabled>
                                Generate Insights
                            </button>
                        </div>
                        
                        <!-- Live Status -->
                        <div class="flex items-center space-x-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div class="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
                            <span class="text-green-300 text-sm font-medium">Live</span>
                            <span class="text-gray-400 text-sm">15.2K msg/h</span>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }
};

// Dashboard components
const DashboardComponents = {
    // Generate KPI metric cards
    generateMetricCards: () => {
        const metrics = [
            {
                title: 'Total Messages',
                value: '127.5K',
                change: '+12.5% vs yesterday',
                changeType: 'positive',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>`,
                color: 'emerald'
            },
            {
                title: 'Active Channels',
                value: '127',
                change: '+3 new channels',
                changeType: 'positive',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16"/>`,
                color: 'cyan'
            },
            {
                title: 'Sentiment Score',
                value: '72%',
                change: 'Positive trend',
                changeType: 'positive',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
                color: 'emerald'
            },
            {
                title: 'Engagement Rate',
                value: '8.4%',
                change: 'Above average',
                changeType: 'positive',
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>`,
                color: 'cyan'
            }
        ];

        return `
            <!-- Key Metrics Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${metrics.map(metric => `
                    <div class="stat-card rounded-xl p-6 transition-all duration-200 hover:scale-105">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm font-medium">${metric.title}</p>
                                <p class="text-3xl font-bold text-white mt-1">${metric.value}</p>
                                <p class="text-${metric.color}-400 text-sm mt-1">${metric.change}</p>
                            </div>
                            <div class="w-12 h-12 bg-${metric.color}-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-${metric.color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    ${metric.icon}
                                </svg>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Generate sample charts grid
    generateSampleCharts: () => {
        const charts = [
            {
                id: 'businessChart',
                title: '📈 Business Analytics',
                status: 'green',
                description: 'Brand sentiment and market analysis'
            },
            {
                id: 'mediaChart',
                title: '🌐 Media Trends',
                status: 'blue',
                description: 'Viral content and engagement metrics'
            },
            {
                id: 'researcherChart',
                title: '🔬 Research Data',
                status: 'purple',
                description: 'Statistical analysis and correlations'
            },
            {
                id: 'governmentChart',
                title: '🏛 Government Insights',
                status: 'orange',
                description: 'Public policy sentiment tracking'
            }
        ];

        const statusColors = {
            green: 'bg-green-400',
            blue: 'bg-blue-400',
            purple: 'bg-purple-400',
            orange: 'bg-orange-400'
        };

        return `
            <!-- Sample Charts Grid -->
            <div class="grid md:grid-cols-2 gap-8">
                ${charts.map(chart => `
                    <div class="chart-container rounded-xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-bold text-white">${chart.title}</h3>
                                <p class="text-gray-400 text-sm">${chart.description}</p>
                            </div>
                            <div class="w-2 h-2 ${statusColors[chart.status]} rounded-full"></div>
                        </div>
                        <div class="relative h-64">
                            <canvas id="${chart.id}"></canvas>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// Navigation functionality
const NavigationManager = {
    currentSection: 'dashboard',
    
    // Initialize navigation event listeners
    init: () => {
        document.addEventListener('DOMContentLoaded', () => {
            NavigationManager.setupEventListeners();
            NavigationManager.showSection('dashboard');
        });
    },
    
    // Setup click handlers for navigation
    setupEventListeners: () => {
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const section = navItem.dataset.section;
                NavigationManager.showSection(section);
            }
        });
    },
    
    // Show specific section and update UI
    showSection: (sectionId) => {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('sidebar-active', 'text-emerald-400');
            item.classList.add('text-gray-300', 'hover:bg-gray-800/50', 'hover:text-white');
        });
        
        const activeItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeItem) {
            activeItem.classList.add('sidebar-active', 'text-emerald-400');
            activeItem.classList.remove('text-gray-300', 'hover:bg-gray-800/50', 'hover:text-white');
        }
        
        // Update page title and content
        NavigationManager.updatePageContent(sectionId);
        NavigationManager.currentSection = sectionId;
    },
    
    // Update page content based on section
    updatePageContent: (sectionId) => {
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        const mainContent = document.getElementById('mainContent');
        
        const sectionConfig = {
            dashboard: {
                title: 'Analytics Dashboard',
                subtitle: 'Real-time Telegram opinion analysis',
                showMetrics: true,
                showCharts: true
            },
            business: {
                title: 'Business Intelligence',
                subtitle: 'Market analysis and competitor insights',
                showMetrics: true,
                showCharts: false
            },
            media: {
                title: 'Media Analytics',
                subtitle: 'Content performance and viral trends',
                showMetrics: true,
                showCharts: false
            },
            research: {
                title: 'Research Hub',
                subtitle: 'Statistical analysis and data correlations',
                showMetrics: true,
                showCharts: false
            },
            government: {
                title: 'Government Insights',
                subtitle: 'Public policy sentiment and feedback',
                showMetrics: true,
                showCharts: false
            },
            settings: {
                title: 'Settings',
                subtitle: 'Configure your dashboard preferences',
                showMetrics: false,
                showCharts: false
            },
            export: {
                title: 'Export Data',
                subtitle: 'Download reports and analytics',
                showMetrics: false,
                showCharts: false
            }
        };
        
        const config = sectionConfig[sectionId] || sectionConfig.dashboard;
        
        if (pageTitle) pageTitle.textContent = config.title;
        if (pageSubtitle) pageSubtitle.textContent = config.subtitle;
        
        // Show/hide sections based on configuration
        const metricsSection = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
        const chartsSection = document.getElementById('defaultCharts');
        
        if (metricsSection) {
            metricsSection.style.display = config.showMetrics ? 'grid' : 'none';
        }
        
        if (chartsSection) {
            chartsSection.style.display = config.showCharts ? 'block' : 'none';
        }
        
        // Show section-specific content
        NavigationManager.showSectionSpecificContent(sectionId);
    },
    
    // Show content specific to each section
    showSectionSpecificContent: (sectionId) => {
        // Remove existing section content
        const existingSectionContent = document.getElementById('sectionSpecificContent');
        if (existingSectionContent) {
            existingSectionContent.remove();
        }
        
        // Add section-specific content
        const mainContent = document.querySelector('main');
        let sectionContent = '';
        
        switch (sectionId) {
            case 'settings':
                sectionContent = NavigationManager.generateSettingsContent();
                break;
            case 'export':
                sectionContent = NavigationManager.generateExportContent();
                break;
            case 'business':
            case 'media':
            case 'research':
            case 'government':
                sectionContent = NavigationManager.generateAnalyticsContent(sectionId);
                break;
        }
        
        if (sectionContent) {
            const sectionDiv = document.createElement('div');
            sectionDiv.id = 'sectionSpecificContent';
            sectionDiv.innerHTML = sectionContent;
            mainContent.appendChild(sectionDiv);
        }
    },
    
    // Generate settings page content
    generateSettingsContent: () => {
        return `
            <div class="grid md:grid-cols-2 gap-8">
                <div class="chart-container rounded-xl p-8">
                    <h3 class="text-xl font-bold text-white mb-6">Dashboard Preferences</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Default View</label>
                            <select class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                                <option>Analytics Overview</option>
                                <option>Business Intelligence</option>
                                <option>Media Analytics</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Refresh Rate</label>
                            <select class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                                <option>Real-time</option>
                                <option>Every 5 minutes</option>
                                <option>Every 15 minutes</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="chart-container rounded-xl p-8">
                    <h3 class="text-xl font-bold text-white mb-6">Data Sources</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">Telegram Channels</span>
                            <span class="text-emerald-400">127 active</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">API Endpoints</span>
                            <span class="text-cyan-400">5 connected</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">Processing Rate</span>
                            <span class="text-green-400">15.2K msg/h</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate export page content
    generateExportContent: () => {
        return `
            <div class="grid md:grid-cols-3 gap-8">
                <div class="chart-container rounded-xl p-8">
                    <h3 class="text-xl font-bold text-white mb-6">📊 Analytics Reports</h3>
                    <div class="space-y-4">
                        <button class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                            Export Dashboard Data
                        </button>
                        <button class="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                            Download Charts
                        </button>
                        <button class="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                            Generate PDF Report
                        </button>
                    </div>
                </div>
                
                <div class="chart-container rounded-xl p-8">
                    <h3 class="text-xl font-bold text-white mb-6">🔗 API Access</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                            <input type="text" value="sk-••••••••••••••••" class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" readonly>
                        </div>
                        <button class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                            Generate New Key
                        </button>
                    </div>
                </div>
                
                <div class="chart-container rounded-xl p-8">
                    <h3 class="text-xl font-bold text-white mb-6">📅 Scheduled Exports</h3>
                    <div class="space-y-4">
                        <div class="text-sm text-gray-400">
                            <p>Daily Report: 09:00 UTC</p>
                            <p>Weekly Summary: Mondays</p>
                            <p>Monthly Analysis: 1st of month</p>
                        </div>
                        <button class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Configure Schedule
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate analytics section content
    generateAnalyticsContent: (section) => {
        const sectionTitles = {
            business: 'Business Intelligence Tools',
            media: 'Media Analytics Dashboard',
            research: 'Research Analysis Hub',
            government: 'Government Insights Panel'
        };
        
        return `
            <div class="chart-container rounded-xl p-8 mb-8">
                <h3 class="text-xl font-bold text-white mb-6">${sectionTitles[section]}</h3>
                <p class="text-gray-400 mb-6">Use the field and topic selectors above to generate specific insights for this analytics area.</p>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="stat-card rounded-xl p-6">
                        <h4 class="text-lg font-semibold text-white mb-3">Quick Actions</h4>
                        <div class="space-y-3">
                            <button class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
                                Generate ${section.charAt(0).toUpperCase() + section.slice(1)} Report
                            </button>
                            <button class="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm">
                                View Historical Data
                            </button>
                            <button class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm">
                                Export Analysis
                            </button>
                        </div>
                    </div>
                    
                    <div class="stat-card rounded-xl p-6">
                        <h4 class="text-lg font-semibold text-white mb-3">Recent Activity</h4>
                        <div class="space-y-2 text-sm text-gray-400">
                            <p>• Last update: 2 minutes ago</p>
                            <p>• New data points: 1,247</p>
                            <p>• Active monitoring: ON</p>
                            <p>• Data quality: 98.5%</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Initialize navigation when DOM is loaded
NavigationManager.init();
