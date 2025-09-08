import { useState, useEffect } from 'react';
import WideModal from './WideModal';
import AddDailyExpenditure from './AddDailyExpenditure';
import ViewExpenditure from './ViewExpenditure';
import EditExpenditure from './EditExpenditure';

import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Create a persistent state outside component to prevent resets
let persistentState = {
  viewMode: 'overview',
  selectedBranchDetails: null
};

export default function AccountingManagement({ expenditures, onAddExpenditure, onEditExpenditure, onDeleteExpenditure, branches, users, tempEmployees }) {
  const [showAddExpenditure, setShowAddExpenditure] = useState(false);
  const [showViewExpenditure, setShowViewExpenditure] = useState(false);
  const [showEditExpenditure, setShowEditExpenditure] = useState(false);
  const [selectedExpenditure, setSelectedExpenditure] = useState(null);
  const [selectedBranchDetails, setSelectedBranchDetails] = useState(persistentState.selectedBranchDetails);
  const [viewMode, setViewMode] = useState(persistentState.viewMode);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  
  // Update persistent state when local state changes
  useEffect(() => {
    persistentState.viewMode = viewMode;
    persistentState.selectedBranchDetails = selectedBranchDetails;
  }, [viewMode, selectedBranchDetails]);

  // Filter data based on selected month/year
  const filteredExpenditures = (expenditures || []).filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() + 1 === parseInt(selectedMonth) && expDate.getFullYear() === parseInt(selectedYear);
  });

  const handleAddExpenditure = async (expenditureData) => {
    await onAddExpenditure(expenditureData);
    setShowAddExpenditure(false);
  };

  const handleViewExpenditure = (expenditure) => {
    console.log('handleViewExpenditure called with:', expenditure);
    setSelectedExpenditure(expenditure);
    setShowViewExpenditure(true);
  };

  const handleEditExpenditure = (expenditure) => {
    console.log('handleEditExpenditure called with:', expenditure);
    setSelectedExpenditure(expenditure);
    setShowEditExpenditure(true);
  };

  const handleUpdateExpenditure = async (expenditureData) => {
    await onEditExpenditure({ ...expenditureData, _id: selectedExpenditure._id });
    setShowEditExpenditure(false);
    setSelectedExpenditure(null);
  };

  const handleDeleteExpenditure = async (expenditureId) => {
    if (window.confirm('Are you sure you want to delete this expenditure record?')) {
      await onDeleteExpenditure(expenditureId);
    }
  };



  // Calculate branch-wise analytics
  const getBranchAnalytics = () => {
    const branchData = {};
    
    branches?.forEach(branch => {
      const branchExpenditures = filteredExpenditures.filter(exp => exp.branchId === branch._id);
      const totalIncome = branchExpenditures.reduce((sum, exp) => sum + exp.income, 0);
      const totalExpenses = branchExpenditures.reduce((sum, exp) => sum + exp.totalExpenses, 0);
      const totalEarnings = totalIncome - totalExpenses;
      
      // Expense breakdown
      const expenseBreakdown = {};
      branchExpenditures.forEach(exp => {
        exp.expenses.forEach(expense => {
          expenseBreakdown[expense.category] = (expenseBreakdown[expense.category] || 0) + expense.amount;
        });
      });

      branchData[branch._id] = {
        ...branch,
        totalIncome,
        totalExpenses,
        totalEarnings,
        recordCount: branchExpenditures.length,
        expenseBreakdown,
        expenditures: branchExpenditures
      };
    });
    
    return branchData;
  };

  const branchAnalytics = getBranchAnalytics();

  // Overall analytics
  const overallAnalytics = {
    totalIncome: filteredExpenditures.reduce((sum, exp) => sum + exp.income, 0),
    totalExpenses: filteredExpenditures.reduce((sum, exp) => sum + exp.totalExpenses, 0),
    totalEarnings: filteredExpenditures.reduce((sum, exp) => sum + exp.earnings, 0),
    recordCount: filteredExpenditures.length,
    activeBranches: Object.values(branchAnalytics).filter(branch => branch.recordCount > 0).length
  };

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const formatCurrency = (amount) => `${amount.toFixed(0)} QR`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // PDF Download Function
  const downloadBranchPDF = (branchData, month, year, returnContent = false) => {
    const monthName = months.find(m => m.value === parseInt(month))?.label;
    
    // Create simplified PDF content
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${branchData.name} - Monthly Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #dc2626; }
        .amount { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .label { font-size: 14px; color: #666; }
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px; }
        table { border-collapse: collapse; border: 1px solid black; }
        th, td { padding: 5px; border: 1px solid black; }
        th { background: #f0f0f0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${branchData.name}</h1>
        <h2>Monthly Financial Report - ${monthName} ${year}</h2>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="summary">
        <div class="card">
            <div class="amount positive">${formatCurrency(branchData.totalIncome)}</div>
            <div class="label">Total Income</div>
        </div>
        <div class="card">
            <div class="amount negative">${formatCurrency(branchData.totalExpenses)}</div>
            <div class="label">Total Expenses</div>
        </div>
        <div class="card">
            <div class="amount ${branchData.totalEarnings >= 0 ? 'positive' : 'negative'}">${formatCurrency(Math.abs(branchData.totalEarnings))}</div>
            <div class="label">Net ${branchData.totalEarnings >= 0 ? 'Profit' : 'Loss'}</div>
        </div>
    </div>
    
    <div class="section">
        <h3>📊 Delivery Income & Commission</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 2px solid #2563eb;">
                <h4 style="color: #1d4ed8; margin-bottom: 12px; font-size: 14px;">🚚 Online Delivery</h4>
                ${(() => {
                  const platforms = ['Talabat', 'Keeta', 'Snoonu'];
                  const deliveryData = {};
                  branchData.expenditures.forEach(exp => {
                    if (exp.onlineDeliveries) {
                      exp.onlineDeliveries.forEach(delivery => {
                        if (platforms.includes(delivery.platform)) {
                          deliveryData[delivery.platform] = (deliveryData[delivery.platform] || 0) + delivery.amount;
                        }
                      });
                    }
                  });
                  
                  let content = '';
                  let totalDelivery = 0;
                  
                  platforms.forEach(platform => {
                    const amount = deliveryData[platform] || 0;
                    totalDelivery += amount;
                    if (amount > 0) {
                      content += `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #374151; font-size: 13px;">${platform}</span>
                        <span style="color: #2563eb; font-weight: bold; font-size: 13px;">${formatCurrency(amount)}</span>
                      </div>`;
                    }
                  });
                  
                  content += `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #2563eb; margin-top: 8px;">
                    <span style="color: #1e40af; font-weight: bold; font-size: 14px;">TOTAL</span>
                    <span style="color: #1e40af; font-weight: bold; font-size: 16px;">${formatCurrency(totalDelivery)}</span>
                  </div>`;
                  
                  return content;
                })()}
            </div>
            
            <div style="background: #fff7ed; padding: 15px; border-radius: 8px; border: 2px solid #f97316;">
                <h4 style="color: #ea580c; margin-bottom: 12px; font-size: 14px;">🏧 ATM Services</h4>
                ${(() => {
                  let atmTotal = 0;
                  branchData.expenditures.forEach(exp => {
                    if (exp.onlineDeliveries) {
                      exp.onlineDeliveries.forEach(delivery => {
                        if (delivery.platform === 'ATM') {
                          atmTotal += delivery.amount;
                        }
                      });
                    }
                  });
                  
                  return `<div style="text-align: center; margin-bottom: 12px;">
                    <div style="font-size: 24px; font-weight: bold; color: #ea580c;">
                      ${formatCurrency(atmTotal)}
                    </div>
                    <div style="color: #c2410c; font-size: 12px;">Total ATM Revenue</div>
                  </div>`;
                })()}
            </div>
            
            <div style="background: #faf5ff; padding: 15px; border-radius: 8px; border: 2px solid #7c3aed;">
                <h4 style="color: #7c3aed; margin-bottom: 12px; font-size: 14px;">💎 Delivery Money</h4>
                <div style="text-align: center; margin-bottom: 12px;">
                    <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">
                        ${(() => {
                          const totalDeliveryMoney = branchData.expenditures.reduce((sum, exp) => sum + (exp.deliveryMoney || 0), 0);
                          return formatCurrency(totalDeliveryMoney);
                        })()}
                    </div>
                    <div style="color: #6d28d9; font-size: 12px;">Total Commission</div>
                </div>
                <div style="background: white; padding: 8px; border-radius: 6px; text-align: center;">
                    <div style="color: #6b7280; font-size: 11px;">Daily Average</div>
                    <div style="color: #7c3aed; font-weight: bold; font-size: 14px;">
                        ${(() => {
                          const totalDeliveryMoney = branchData.expenditures.reduce((sum, exp) => sum + (exp.deliveryMoney || 0), 0);
                          return formatCurrency(branchData.recordCount > 0 ? (totalDeliveryMoney / branchData.recordCount) : 0);
                        })()}
                    </div>
                </div>
            </div>
        </div>
    </div>
    

    

    
    <div style="display: flex; gap: 20px;">
        <div style="flex: 1;">
            <h3>Normal Expenses</h3>
            <table style="width: 100%;">
                <tr><th style="background: #f97316; color: white;">Category</th><th style="background: #f97316; color: white;">Amount</th></tr>
                ${(() => {
                  const normalExpenses = {};
                  let normalTotal = 0;
                  
                  branchData.expenditures.forEach(exp => {
                    exp.expenses.forEach(expense => {
                      if ((expense.type || 'NORMAL EXPENSE') === 'NORMAL EXPENSE') {
                        normalExpenses[expense.category] = (normalExpenses[expense.category] || 0) + expense.amount;
                        normalTotal += expense.amount;
                      }
                    });
                  });
                  
                  const sortedNormal = Object.entries(normalExpenses).sort(([,a], [,b]) => b - a);
                  
                  let content = '';
                  if (sortedNormal.length === 0) {
                    content = '<tr><td>No normal expenses</td><td>0 QR</td></tr>';
                  } else {
                    content = sortedNormal.map(([category, amount]) => 
                      `<tr><td>${category}</td><td>${formatCurrency(amount)}</td></tr>`
                    ).join('');
                  }
                  
                  content += `<tr style="background: #fff7ed;"><td><strong>TOTAL</strong></td><td><strong>${formatCurrency(normalTotal)}</strong></td></tr>`;
                  return content;
                })()}
            </table>
        </div>
        
        <div style="flex: 1;">
            <h3>General Expenses</h3>
            <table style="width: 100%;">
                <tr><th style="background: #ec4899; color: white;">Category</th><th style="background: #ec4899; color: white;">Amount</th></tr>
                ${(() => {
                  const generalExpenses = {};
                  let generalTotal = 0;
                  
                  branchData.expenditures.forEach(exp => {
                    exp.expenses.forEach(expense => {
                      if (expense.type === 'GENERAL EXPENSE') {
                        generalExpenses[expense.category] = (generalExpenses[expense.category] || 0) + expense.amount;
                        generalTotal += expense.amount;
                      }
                    });
                  });
                  
                  const sortedGeneral = Object.entries(generalExpenses).sort(([,a], [,b]) => b - a);
                  
                  let content = '';
                  if (sortedGeneral.length === 0) {
                    content = '<tr><td>No general expenses</td><td>0 QR</td></tr>';
                  } else {
                    content = sortedGeneral.map(([category, amount]) => 
                      `<tr><td>${category}</td><td>${formatCurrency(amount)}</td></tr>`
                    ).join('');
                  }
                  
                  content += `<tr style="background: #fdf2f8;"><td><strong>TOTAL</strong></td><td><strong>${formatCurrency(generalTotal)}</strong></td></tr>`;
                  return content;
                })()}
            </table>
        </div>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 30px; border-top: 3px solid #3b82f6;">
        <h3 style="color: #1e40af; margin-bottom: 15px;">📈 Key Performance Indicators</h3>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px;">
            <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 16px; font-weight: bold; color: #f97316;">${(() => {
                  let normalExpensesTotal = 0;
                  branchData.expenditures.forEach(exp => {
                    exp.expenses.forEach(expense => {
                      if ((expense.type || 'NORMAL EXPENSE') === 'NORMAL EXPENSE') {
                        normalExpensesTotal += expense.amount;
                      }
                    });
                  });
                  const normalExpensePercentage = branchData.totalIncome > 0 ? ((normalExpensesTotal / branchData.totalIncome) * 100).toFixed(1) : 0;
                  const normalProfitPercentage = branchData.totalIncome > 0 ? (100 - normalExpensePercentage).toFixed(1) : 0;
                  return `${normalProfitPercentage}%<br/>${formatCurrency(normalExpensesTotal)}`;
                })()}</div>
                <div style="color: #64748b; font-size: 12px;">Profit Margin (Normal Exp)</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 16px; font-weight: bold; color: #059669;">${(() => {
                  const allExpensePercentage = branchData.totalIncome > 0 ? ((branchData.totalExpenses / branchData.totalIncome) * 100).toFixed(1) : 0;
                  const allProfitPercentage = branchData.totalIncome > 0 ? (100 - allExpensePercentage).toFixed(1) : 0;
                  return `${allProfitPercentage}%<br/>${formatCurrency(branchData.totalExpenses)}`;
                })()}</div>
                <div style="color: #64748b; font-size: 12px;">Profit Margin (All Exp)</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${formatCurrency(branchData.recordCount > 0 ? (branchData.totalIncome / branchData.recordCount) : 0)}</div>
                <div style="color: #64748b; font-size: 12px;">Avg Daily Revenue</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${formatCurrency(branchData.recordCount > 0 ? (branchData.totalExpenses / branchData.recordCount) : 0)}</div>
                <div style="color: #64748b; font-size: 12px;">Avg Daily Expenses</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                <div style="font-size: 16px; font-weight: bold; color: #7c3aed;">${(() => {
                  const netIncomePercentage = branchData.totalIncome > 0 ? ((Math.abs(branchData.totalEarnings) / branchData.totalIncome) * 100).toFixed(1) : 0;
                  return `${netIncomePercentage}%<br/>${formatCurrency(Math.abs(branchData.totalEarnings))}`;
                })()}</div>
                <div style="color: #64748b; font-size: 12px;">Net Income Margin</div>
            </div>
        </div>
    </div>
    
    ${(() => {
      if (branchData.shareholders && branchData.shareholders.length > 0) {
        const totalProfit = branchData.totalEarnings;
        return `
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 30px; border-top: 3px solid #7c3aed;">
            <h3 style="color: #7c3aed; margin-bottom: 15px;">👥 Shareholder Profit Distribution</h3>
            <table style="width: 100%;">
                <tr><th style="background: #7c3aed; color: white;">Shareholder</th><th style="background: #7c3aed; color: white;">QUID</th><th style="background: #7c3aed; color: white;">Share %</th><th style="background: #7c3aed; color: white;">Profit Share</th></tr>
                ${branchData.shareholders.map(shareholder => {
                  const profitShare = (totalProfit * shareholder.sharePercentage) / 100;
                  return `<tr>
                    <td>${shareholder.name}</td>
                    <td>${shareholder.quid}</td>
                    <td>${shareholder.sharePercentage}%</td>
                    <td>${formatCurrency(profitShare)}</td>
                  </tr>`;
                }).join('')}
                <tr style="background: #faf5ff;"><td><strong>TOTAL</strong></td><td></td><td><strong>${branchData.shareholders.reduce((sum, s) => sum + s.sharePercentage, 0)}%</strong></td><td><strong>${formatCurrency(totalProfit)}</strong></td></tr>
            </table>
        </div>`;
      }
      return '';
    })()}
    
    <div class="footer">
        <p><strong>Report Summary:</strong> ${branchData.recordCount} daily entries analyzed for ${monthName} ${year}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p><strong>System:</strong> Qatar Branch Management System - Professional Financial Analytics</p>
    </div>
</body>
</html>
    `;
    
    if (returnContent) {
      return pdfContent;
    }
    
    // Create and download PDF
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${branchData.name}_Financial_Report_${monthName}_${year}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Advanced Analytics for Main Dashboard
  const getOverallExpenseBreakdown = () => {
    const breakdown = {};
    filteredExpenditures.forEach(exp => {
      exp.expenses.forEach(expense => {
        breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
      });
    });
    return breakdown;
  };

  const getBranchPerformanceChart = () => {
    const branchNames = Object.values(branchAnalytics).map(b => b.name);
    const branchIncomes = Object.values(branchAnalytics).map(b => b.totalIncome);
    const branchExpenses = Object.values(branchAnalytics).map(b => b.totalExpenses);
    const branchEarnings = Object.values(branchAnalytics).map(b => b.totalEarnings);

    return {
      data: {
        labels: branchNames,
        datasets: [
          {
            label: 'Income',
            data: branchIncomes,
            backgroundColor: '#22c55e',
            borderColor: '#16a34a',
            borderWidth: 2
          },
          {
            label: 'Expenses',
            data: branchExpenses,
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 2
          },
          {
            label: 'Earnings',
            data: branchEarnings,
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Branch Performance Comparison'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' QR';
              }
            }
          }
        }
      }
    };
  };

  const getDailyTrendChart = () => {
    const dailyData = {};
    filteredExpenditures.forEach(exp => {
      const day = new Date(exp.date).getDate();
      if (!dailyData[day]) {
        dailyData[day] = { income: 0, expenses: 0, earnings: 0 };
      }
      dailyData[day].income += exp.income;
      dailyData[day].expenses += exp.totalExpenses;
      dailyData[day].earnings += exp.earnings;
    });

    const days = Object.keys(dailyData).sort((a, b) => a - b);
    const incomes = days.map(day => dailyData[day].income);
    const expenses = days.map(day => dailyData[day].expenses);
    const earnings = days.map(day => dailyData[day].earnings);

    return {
      data: {
        labels: days.map(day => `Day ${day}`),
        datasets: [
          {
            label: 'Income',
            data: incomes,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expenses',
            data: expenses,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Earnings',
            data: earnings,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Daily Financial Trends'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' QR';
              }
            }
          }
        }
      }
    };
  };



  const getProfitMarginChart = () => {
    const branchNames = Object.values(branchAnalytics).map(b => b.name);
    const profitMargins = Object.values(branchAnalytics).map(b => {
      return b.totalIncome > 0 ? ((b.totalEarnings / b.totalIncome) * 100) : 0;
    });

    return {
      data: {
        labels: branchNames,
        datasets: [{
          data: profitMargins,
          backgroundColor: profitMargins.map(margin => 
            margin >= 20 ? '#22c55e' : margin >= 10 ? '#eab308' : '#ef4444'
          ),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Profit Margin by Branch (%)'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed.toFixed(1) + '%';
              }
            }
          }
        }
      }
    };
  };

  // Chart configurations
  const getExpenseBreakdownChart = (expenseBreakdown) => {
    const categories = Object.keys(expenseBreakdown);
    const amounts = Object.values(expenseBreakdown);
    
    return {
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: [
            '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', 
            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f59e0b',
            '#f43f5e', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { 
              fontSize: 10,
              padding: 15,
              usePointStyle: true,
              boxWidth: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value.toFixed(0)} QR (${percentage}%)`;
              }
            }
          }
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        }
      }
    };
  };

  const getIncomeVsExpensesChart = (branchData) => {
    return {
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [branchData.totalIncome, branchData.totalExpenses],
          backgroundColor: ['#22c55e', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed.toFixed(0)} QR`;
              }
            }
          }
        }
      }
    };
  };

  const getExpenseBarChart = (expenseBreakdown) => {
    const categories = Object.keys(expenseBreakdown);
    const amounts = Object.values(expenseBreakdown);
    
    return {
      data: {
        labels: categories,
        datasets: [{
          label: 'Amount (QR)',
          data: amounts,
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed.y.toFixed(0)} QR`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' QR';
              }
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    };
  };

  const getBranchDailyTrendChart = (expenditures) => {
    const dailyData = {};
    expenditures.forEach(exp => {
      const day = new Date(exp.date).getDate();
      if (!dailyData[day]) {
        dailyData[day] = { income: 0, expenses: 0, earnings: 0 };
      }
      dailyData[day].income += exp.income;
      dailyData[day].expenses += exp.totalExpenses;
      dailyData[day].earnings += exp.earnings;
    });

    const days = Object.keys(dailyData).sort((a, b) => a - b);
    const incomes = days.map(day => dailyData[day].income);
    const expenses = days.map(day => dailyData[day].expenses);
    const earnings = days.map(day => dailyData[day].earnings);

    return {
      data: {
        labels: days.map(day => `Day ${day}`),
        datasets: [
          {
            label: 'Income',
            data: incomes,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: expenses,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          },
          {
            label: 'Earnings',
            data: earnings,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' QR';
              }
            }
          }
        }
      }
    };
  };

  if (viewMode === 'branch-details' && selectedBranchDetails) {
    const branchData = branchAnalytics[selectedBranchDetails._id];
    
    return (
      <div className="responsive-container">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                setViewMode('overview');
                setSelectedBranchDetails(null);
              }}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{branchData.name} - {months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear}</h1>
          </div>
          <div className="text-sm text-gray-500">
            {months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear} • {branchData.recordCount} Records
          </div>
        </div>

        {/* Month/Year Filter for Branch Details */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedMonth(new Date().getMonth() + 1);
                  setSelectedYear(new Date().getFullYear());
                }}
                className="px-4 py-2 text-sm text-red-800 hover:text-red-900"
              >
                Reset to Current Month
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Button */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Financial Analysis</h3>
            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Detailed Analytics
            </button>
          </div>
        </div>

        {/* Branch Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-emerald-400 to-green-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h4 className="font-bold text-lg">Regular Income</h4>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-bold text-lg text-gray-900">{formatCurrency(branchData.totalIncome)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">🚚</div>
                  <div>
                    <h4 className="font-bold text-lg">Online</h4>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (() => {
                    const platforms = ['Talabat', 'Keeta', 'Snoonu'];
                    let total = 0;
                    branchData.expenditures.forEach(exp => {
                      if (exp.onlineDeliveries) {
                        exp.onlineDeliveries.forEach(delivery => {
                          if (platforms.includes(delivery.platform)) {
                            total += delivery.amount;
                          }
                        });
                      }
                    });
                    return total > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                  })()
                }`}>
                  {(() => {
                    const platforms = ['Talabat', 'Keeta', 'Snoonu'];
                    let total = 0;
                    branchData.expenditures.forEach(exp => {
                      if (exp.onlineDeliveries) {
                        exp.onlineDeliveries.forEach(delivery => {
                          if (platforms.includes(delivery.platform)) {
                            total += delivery.amount;
                          }
                        });
                      }
                    });
                    return total > 0 ? 'Active' : 'No Data';
                  })()}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-bold text-lg text-gray-900">
                    {(() => {
                      const platforms = ['Talabat', 'Keeta', 'Snoonu'];
                      let total = 0;
                      branchData.expenditures.forEach(exp => {
                        if (exp.onlineDeliveries) {
                          exp.onlineDeliveries.forEach(delivery => {
                            if (platforms.includes(delivery.platform)) {
                              total += delivery.amount;
                            }
                          });
                        }
                      });
                      return formatCurrency(total);
                    })()}
                  </span>
                </div>
                
                {/* Service Breakdown */}
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {(() => {
                    const services = {
                      Talabat: { icon: '🍔', income: 0 },
                      Snoonu: { icon: '🛵', income: 0 },
                      Keeta: { icon: '🥘', income: 0 }
                    };
                    
                    branchData.expenditures.forEach(exp => {
                      if (exp.onlineDeliveries) {
                        exp.onlineDeliveries.forEach(delivery => {
                          if (services[delivery.platform]) {
                            services[delivery.platform].income += delivery.amount;
                          }
                        });
                      }
                    });
                    
                    return Object.entries(services).map(([name, service]) => (
                      <div key={name} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-md border">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm">{service.icon}</span>
                          <div>
                            <div className="text-xs font-medium text-gray-900">{name}</div>
                            <div className={`text-xs ${service.income > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {service.income > 0 ? 'Active' : 'No Data'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-900">{formatCurrency(service.income)}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">🏧</div>
                  <div>
                    <h4 className="font-bold text-lg">ATM</h4>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (() => {
                    let atmTotal = 0;
                    branchData.expenditures.forEach(exp => {
                      if (exp.atmIncome) {
                        atmTotal += exp.atmIncome;
                      }
                      if (exp.onlineDeliveries) {
                        exp.onlineDeliveries.forEach(delivery => {
                          if (delivery.platform === 'ATM') {
                            atmTotal += delivery.amount;
                          }
                        });
                      }
                    });
                    return atmTotal > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                  })()
                }`}>
                  {(() => {
                    let atmTotal = 0;
                    branchData.expenditures.forEach(exp => {
                      if (exp.atmIncome) {
                        atmTotal += exp.atmIncome;
                      }
                      if (exp.onlineDeliveries) {
                        exp.onlineDeliveries.forEach(delivery => {
                          if (delivery.platform === 'ATM') {
                            atmTotal += delivery.amount;
                          }
                        });
                      }
                    });
                    return atmTotal > 0 ? 'Active' : 'No Data';
                  })()}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-bold text-lg text-gray-900">
                    {(() => {
                      let atmTotal = 0;
                      branchData.expenditures.forEach(exp => {
                        if (exp.atmIncome) {
                          atmTotal += exp.atmIncome;
                        }
                        if (exp.onlineDeliveries) {
                          exp.onlineDeliveries.forEach(delivery => {
                            if (delivery.platform === 'ATM') {
                              atmTotal += delivery.amount;
                            }
                          });
                        }
                      });
                      return formatCurrency(atmTotal);
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-purple-400 to-violet-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">💎</div>
                  <div>
                    <h4 className="font-bold text-lg">Delivery</h4>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  branchData.expenditures.reduce((sum, exp) => sum + (exp.deliveryMoney || 0), 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {branchData.expenditures.reduce((sum, exp) => sum + (exp.deliveryMoney || 0), 0) > 0 ? 'Active' : 'No Data'}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-bold text-lg text-gray-900">{formatCurrency(branchData.expenditures.reduce((sum, exp) => sum + (exp.deliveryMoney || 0), 0))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-red-400 to-rose-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">💸</div>
                  <div>
                    <h4 className="font-bold text-lg">Total Expenses</h4>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Active
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-bold text-lg text-gray-900">{formatCurrency(branchData.totalExpenses)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className={`bg-gradient-to-r ${branchData.totalEarnings >= 0 ? 'from-teal-400 to-emerald-500' : 'from-orange-400 to-red-500'} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{branchData.totalEarnings >= 0 ? '📈' : '📉'}</div>
                  <div>
                    <h4 className="font-bold text-lg">Net {branchData.totalEarnings >= 0 ? 'Profit' : 'Loss'}</h4>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${branchData.totalEarnings >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {branchData.totalEarnings >= 0 ? 'Profit' : 'Loss'}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-bold text-lg text-gray-900">{formatCurrency(Math.abs(branchData.totalEarnings))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Report Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex justify-end items-center">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const monthName = months.find(m => m.value === parseInt(selectedMonth))?.label;
                  const fullPdfContent = downloadBranchPDF(branchData, selectedMonth, selectedYear, true);
                  const blob = new Blob([fullPdfContent], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View Report</span>
              </button>
              <button
                onClick={() => downloadBranchPDF(branchData, selectedMonth, selectedYear)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
        {/* Analytics Modal */}
        <WideModal isOpen={showAnalyticsModal} onClose={() => setShowAnalyticsModal(false)}>
          <div className="max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
              <h2 className="text-2xl font-bold text-white">Detailed Analytics - {branchData.name}</h2>
              <p className="text-indigo-100">{months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear}</p>
            </div>
            
            <div className="p-6">
              {/* Online Delivery & Delivery Money Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Online Delivery Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🚚</span>
                    Online Delivery Breakdown
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      const platforms = ['Talabat', 'Keeta', 'Snoonu', 'ATM'];
                      const deliveryData = {};
                      branchData.expenditures.forEach(exp => {
                        if (exp.onlineDeliveries) {
                          exp.onlineDeliveries.forEach(delivery => {
                            deliveryData[delivery.platform] = (deliveryData[delivery.platform] || 0) + delivery.amount;
                          });
                        }
                      });
                      
                      const totalDelivery = Object.values(deliveryData).reduce((sum, amount) => sum + amount, 0);
                      
                      return platforms.map(platform => {
                        const amount = deliveryData[platform] || 0;
                        const percentage = totalDelivery > 0 ? ((amount / totalDelivery) * 100).toFixed(1) : 0;
                        
                        if (amount === 0) return null;
                        
                        return (
                          <div key={platform} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div>
                              <div className="font-medium text-gray-900">{platform}</div>
                              <div className="text-sm text-blue-600">{percentage}% of delivery income</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">{formatCurrency(amount)}</div>
                            </div>
                          </div>
                        );
                      }).filter(Boolean);
                    })()}
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg">
                        <span className="font-bold text-blue-800">Total Online Delivery</span>
                        <span className="text-xl font-bold text-blue-800">
                          {formatCurrency(branchData.expenditures.reduce((sum, exp) => sum + (exp.totalOnlineDelivery || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Money Analytics */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">💎</span>
                    Delivery Money Analytics
                  </h3>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 mb-4">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {formatCurrency(branchData.expenditures.reduce((sum, exp) => sum + (exp.deliveryMoney || 0), 0))}
                    </div>
                    <div className="text-sm text-purple-700">Total Commission Earned</div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {Object.keys(branchData.expenseBreakdown).length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
                    <div className="h-80">
                      <Doughnut {...getExpenseBreakdownChart(branchData.expenseBreakdown)} />
                    </div>
                  </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Income vs Expenses</h3>
                  <div className="h-80">
                    <Doughnut {...getIncomeVsExpensesChart(branchData)} />
                  </div>
                </div>

                {Object.keys(branchData.expenseBreakdown).length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Categories (Bar Chart)</h3>
                    <div className="h-80">
                      <Bar {...getExpenseBarChart(branchData.expenseBreakdown)} />
                    </div>
                  </div>
                )}

                {branchData.expenditures.length > 1 && (
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Performance Trend</h3>
                    <div className="h-80">
                      <Line {...getBranchDailyTrendChart(branchData.expenditures)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </WideModal>

        {/* Detailed Records */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear} Detailed Records</h3>
          </div>
          
          {branchData.expenditures.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-gray-200">
                {branchData.expenditures.map((exp, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(exp.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(exp.createdAt || exp.date).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">By: {exp.submittedBy}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(exp.income)}</div>
                        <div className="text-xs text-gray-500">Income</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{formatCurrency(exp.totalExpenses)}</div>
                        <div className="text-xs text-gray-500">Expenses</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${exp.earnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(exp.earnings)}
                        </div>
                        <div className="text-xs text-gray-500">Earnings</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewExpenditure(exp)}
                        className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditExpenditure(exp)}
                        className="flex-1 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExpenditure(exp._id)}
                        className="flex-1 px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Income</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branchData.expenditures.map((exp, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{new Date(exp.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(exp.createdAt || exp.date).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">{formatCurrency(exp.income)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-red-600">{formatCurrency(exp.totalExpenses)}</span>
                        <div className="text-xs text-gray-500">{exp.expenses.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${exp.earnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(exp.earnings)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exp.submittedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('View clicked:', exp);
                              handleViewExpenditure(exp);
                            }}
                            className="text-green-600 hover:text-green-900 px-2 py-1 rounded"
                          >
                            View
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Edit clicked:', exp);
                              handleEditExpenditure(exp);
                            }}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Delete clicked:', exp._id);
                              handleDeleteExpenditure(exp._id);
                            }}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No records found for {months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear}
            </div>
          )}
        </div>

        {/* View Modal */}
        <WideModal isOpen={showViewExpenditure} onClose={() => setShowViewExpenditure(false)}>
          <ViewExpenditure 
            expenditure={selectedExpenditure}
            onClose={() => setShowViewExpenditure(false)}
          />
        </WideModal>

        {/* Edit Modal */}
        <WideModal isOpen={showEditExpenditure} onClose={() => setShowEditExpenditure(false)}>
          <EditExpenditure 
            expenditure={selectedExpenditure}
            onClose={() => setShowEditExpenditure(false)}
            onUpdateExpenditure={handleUpdateExpenditure}
            branches={branches}
          />
        </WideModal>
      </div>
    );
  }

  return (
    <div className="responsive-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounting Dashboard</h1>
          <p className="text-gray-600 mt-1">{months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear} Financial Overview</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Detailed Analytics
          </button>
          <button
            onClick={() => setShowAddExpenditure(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-lg hover:from-red-900 hover:to-red-800 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            + Add Daily Expenditure
          </button>
        </div>
      </div>

      {/* Enhanced Overall Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 border border-emerald-300">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-emerald-100 uppercase tracking-wide">Total</div>
              <div className="text-xs text-emerald-200">Income</div>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{formatCurrency(overallAnalytics.totalIncome)}</div>
          <div className="flex items-center text-emerald-100 text-xs">
            <div className="w-2 h-2 bg-emerald-200 rounded-full mr-2"></div>
            All Branches
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-400 via-rose-500 to-red-600 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 border border-red-300">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
              <div className="text-2xl">💸</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-red-100 uppercase tracking-wide">Total</div>
              <div className="text-xs text-red-200">Expenses</div>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{formatCurrency(overallAnalytics.totalExpenses)}</div>
          <div className="flex items-center text-red-100 text-xs">
            <div className="w-2 h-2 bg-red-200 rounded-full mr-2"></div>
            Operating Costs
          </div>
        </div>

        <div className={`bg-gradient-to-br ${overallAnalytics.totalEarnings >= 0 ? 'from-blue-400 via-cyan-500 to-blue-600 border-blue-300' : 'from-orange-400 via-red-500 to-red-600 border-orange-300'} p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 border`}>
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
              <div className="text-2xl">{overallAnalytics.totalEarnings >= 0 ? '📈' : '📉'}</div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-medium ${overallAnalytics.totalEarnings >= 0 ? 'text-blue-100' : 'text-orange-100'} uppercase tracking-wide`}>Net</div>
              <div className={`text-xs ${overallAnalytics.totalEarnings >= 0 ? 'text-blue-200' : 'text-orange-200'}`}>{overallAnalytics.totalEarnings >= 0 ? 'Profit' : 'Loss'}</div>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{formatCurrency(Math.abs(overallAnalytics.totalEarnings))}</div>
          <div className={`flex items-center ${overallAnalytics.totalEarnings >= 0 ? 'text-blue-100' : 'text-orange-100'} text-xs`}>
            <div className={`w-2 h-2 ${overallAnalytics.totalEarnings >= 0 ? 'bg-blue-200' : 'bg-orange-200'} rounded-full mr-2`}></div>
            Company Wide
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 border border-purple-300">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
              <div className="text-2xl">🏢</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-purple-100 uppercase tracking-wide">Active</div>
              <div className="text-xs text-purple-200">Branches</div>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{overallAnalytics.activeBranches}</div>
          <div className="flex items-center text-purple-100 text-xs">
            <div className="w-2 h-2 bg-purple-200 rounded-full mr-2"></div>
            Operational
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-400 via-gray-500 to-slate-600 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 border border-slate-300">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-xl">
              <div className="text-2xl">📊</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-slate-100 uppercase tracking-wide">Total</div>
              <div className="text-xs text-slate-200">Records</div>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{overallAnalytics.recordCount}</div>
          <div className="flex items-center text-slate-100 text-xs">
            <div className="w-2 h-2 bg-slate-200 rounded-full mr-2"></div>
            Data Entries
          </div>
        </div>
      </div>

      {/* Month/Year Filter for Overview */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedMonth(new Date().getMonth() + 1);
                setSelectedYear(new Date().getFullYear());
              }}
              className="px-4 py-2 text-sm text-red-800 hover:text-red-900"
            >
              Reset to Current Month
            </button>
          </div>
        </div>
      </div>




      {/* Branch Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Branch Performance - {months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(branchAnalytics).map((branch, index) => (
            <div 
              key={branch._id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100"
              onClick={() => {
                setSelectedBranchDetails(branch);
                setViewMode('branch-details');
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{branch.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    branch.recordCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {branch.recordCount > 0 ? 'Active' : 'No Data'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Income</span>
                    <span className="font-semibold text-green-600">{formatCurrency(branch.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expenses</span>
                    <span className="font-semibold text-red-600">{formatCurrency(branch.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium text-gray-700">Net Earnings</span>
                    <span className={`font-bold ${branch.totalEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(branch.totalEarnings)}
                    </span>
                  </div>
                </div>

                {branch.recordCount > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{branch.recordCount} entries in {months.find(m => m.value === parseInt(selectedMonth))?.label}</span>
                      <span className="text-blue-600 hover:text-blue-800">View Details →</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      <WideModal isOpen={showAddExpenditure} onClose={() => setShowAddExpenditure(false)}>
        <AddDailyExpenditure 
          onClose={() => setShowAddExpenditure(false)} 
          onAddExpenditure={handleAddExpenditure}
          branches={branches}
        />
      </WideModal>

      {/* View Modal */}
      <WideModal isOpen={showViewExpenditure} onClose={() => setShowViewExpenditure(false)}>
        <ViewExpenditure 
          expenditure={selectedExpenditure}
          onClose={() => setShowViewExpenditure(false)}
        />
      </WideModal>

      {/* Edit Modal */}
      <WideModal isOpen={showEditExpenditure} onClose={() => setShowEditExpenditure(false)}>
        <EditExpenditure 
          expenditure={selectedExpenditure}
          onClose={() => setShowEditExpenditure(false)}
          onUpdateExpenditure={handleUpdateExpenditure}
          branches={branches}
        />
      </WideModal>

      {/* Overview Analytics Modal */}
      <WideModal isOpen={showAnalyticsModal} onClose={() => setShowAnalyticsModal(false)}>
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
            <h2 className="text-2xl font-bold text-white">Overall Analytics Dashboard</h2>
            <p className="text-indigo-100">{months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear} - All Branches</p>
          </div>
          
          <div className="p-6">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Expense Breakdown</h3>
                <div className="h-80">
                  {Object.keys(getOverallExpenseBreakdown()).length > 0 ? (
                    <Doughnut {...getExpenseBreakdownChart(getOverallExpenseBreakdown())} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No expense data available
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Performance Comparison</h3>
                <div className="h-80">
                  {Object.values(branchAnalytics).length > 0 ? (
                    <Bar {...getBranchPerformanceChart()} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No branch data available
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Financial Trends</h3>
                <div className="h-80">
                  {filteredExpenditures.length > 0 ? (
                    <Line {...getDailyTrendChart()} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No daily data available
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Profit Margin by Branch</h3>
                <div className="h-80">
                  {Object.values(branchAnalytics).length > 0 ? (
                    <Doughnut {...getProfitMarginChart()} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No branch data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </WideModal>
    </div>
  );
}
