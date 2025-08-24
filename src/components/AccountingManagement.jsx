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
  const downloadBranchPDF = (branchData, month, year) => {
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
        .expense-list { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .expense-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
        .expense-item:last-child { border-bottom: none; }
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
            <div class="label">Total Revenue</div>
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
        <h3>Key Performance</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px;">
                <strong>Profit Margin:</strong> ${branchData.totalIncome > 0 ? Math.abs((branchData.totalEarnings / branchData.totalIncome) * 100).toFixed(1) : 0}%
            </div>
            <div style="background: #fef3f2; padding: 15px; border-radius: 8px;">
                <strong>Daily Average Revenue:</strong> ${formatCurrency(branchData.recordCount > 0 ? (branchData.totalIncome / branchData.recordCount) : 0)}
            </div>
        </div>
    </div>
    
    <div class="section">
        <h3>Income Breakdown</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #22c55e;">
                <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${formatCurrency(branchData.totalIncome)}</div>
                <div style="color: #666; font-size: 12px;">Total Income (100%)</div>
            </div>
            <div style="background: #fef3f2; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #dc2626;">
                <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${(() => {
                  const generalCategories = ['RENT', 'ELECTRICITY', 'KAFEEL', 'SALARY', 'QIB COMMITION'];
                  const consolidatedExpenses = {};
                  Object.entries(branchData.expenseBreakdown).forEach(([category, amount]) => {
                    const normalizedCategory = category.trim().toLowerCase();
                    const existingKey = Object.keys(consolidatedExpenses).find(key => 
                      key.toLowerCase() === normalizedCategory
                    );
                    if (existingKey) {
                      consolidatedExpenses[existingKey] += amount;
                    } else {
                      consolidatedExpenses[category] = amount;
                    }
                  });
                  const totalGeneral = Object.entries(consolidatedExpenses)
                    .filter(([category]) => generalCategories.some(gen => category.toLowerCase().includes(gen.toLowerCase())))
                    .reduce((sum, [,amount]) => sum + amount, 0);
                  return formatCurrency(totalGeneral);
                })()}</div>
                <div style="color: #666; font-size: 12px;">General Expenses (${(() => {
                  const generalCategories = ['RENT', 'ELECTRICITY', 'KAFEEL', 'SALARY', 'QIB COMMITION'];
                  const consolidatedExpenses = {};
                  Object.entries(branchData.expenseBreakdown).forEach(([category, amount]) => {
                    const normalizedCategory = category.trim().toLowerCase();
                    const existingKey = Object.keys(consolidatedExpenses).find(key => 
                      key.toLowerCase() === normalizedCategory
                    );
                    if (existingKey) {
                      consolidatedExpenses[existingKey] += amount;
                    } else {
                      consolidatedExpenses[category] = amount;
                    }
                  });
                  const totalGeneral = Object.entries(consolidatedExpenses)
                    .filter(([category]) => generalCategories.some(gen => category.toLowerCase().includes(gen.toLowerCase())))
                    .reduce((sum, [,amount]) => sum + amount, 0);
                  return branchData.totalIncome > 0 ? ((totalGeneral / branchData.totalIncome) * 100).toFixed(1) : 0;
                })()}%)</div>
            </div>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #2563eb;">
                <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${(() => {
                  const generalCategories = ['RENT', 'ELECTRICITY', 'KAFEEL', 'SALARY', 'QIB COMMITION'];
                  const consolidatedExpenses = {};
                  Object.entries(branchData.expenseBreakdown).forEach(([category, amount]) => {
                    const normalizedCategory = category.trim().toLowerCase();
                    const existingKey = Object.keys(consolidatedExpenses).find(key => 
                      key.toLowerCase() === normalizedCategory
                    );
                    if (existingKey) {
                      consolidatedExpenses[existingKey] += amount;
                    } else {
                      consolidatedExpenses[category] = amount;
                    }
                  });
                  const totalPurchase = Object.entries(consolidatedExpenses)
                    .filter(([category]) => !generalCategories.some(gen => category.toLowerCase().includes(gen.toLowerCase())))
                    .reduce((sum, [,amount]) => sum + amount, 0);
                  return formatCurrency(totalPurchase);
                })()}</div>
                <div style="color: #666; font-size: 12px;">Purchase Expenses (${(() => {
                  const generalCategories = ['RENT', 'ELECTRICITY', 'KAFEEL', 'SALARY', 'QIB COMMITION'];
                  const consolidatedExpenses = {};
                  Object.entries(branchData.expenseBreakdown).forEach(([category, amount]) => {
                    const normalizedCategory = category.trim().toLowerCase();
                    const existingKey = Object.keys(consolidatedExpenses).find(key => 
                      key.toLowerCase() === normalizedCategory
                    );
                    if (existingKey) {
                      consolidatedExpenses[existingKey] += amount;
                    } else {
                      consolidatedExpenses[category] = amount;
                    }
                  });
                  const totalPurchase = Object.entries(consolidatedExpenses)
                    .filter(([category]) => !generalCategories.some(gen => category.toLowerCase().includes(gen.toLowerCase())))
                    .reduce((sum, [,amount]) => sum + amount, 0);
                  return branchData.totalIncome > 0 ? ((totalPurchase / branchData.totalIncome) * 100).toFixed(1) : 0;
                })()}%)</div>
            </div>
        </div>
        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
            <strong>Profit: ${formatCurrency(Math.abs(branchData.totalEarnings))} (${branchData.totalIncome > 0 ? Math.abs((branchData.totalEarnings / branchData.totalIncome) * 100).toFixed(1) : 0}% of Income)</strong>
        </div>
    </div>
    
    <div class="section">
        <h3>General Expenses</h3>
        <div class="expense-list">
            ${(() => {
              const generalCategories = ['RENT', 'ELECTRICITY', 'KAFEEL', 'SALARY', 'QIB COMMITION'];
              const consolidatedExpenses = {};
              Object.entries(branchData.expenseBreakdown).forEach(([category, amount]) => {
                const normalizedCategory = category.trim().toLowerCase();
                const existingKey = Object.keys(consolidatedExpenses).find(key => 
                  key.toLowerCase() === normalizedCategory
                );
                if (existingKey) {
                  consolidatedExpenses[existingKey] += amount;
                } else {
                  consolidatedExpenses[category] = amount;
                }
              });
              
              const generalExpenses = Object.entries(consolidatedExpenses)
                .filter(([category]) => generalCategories.some(gen => category.toLowerCase().includes(gen.toLowerCase())))
                .sort(([,a], [,b]) => b - a);
              
              const totalGeneral = generalExpenses.reduce((sum, [,amount]) => sum + amount, 0);
              
              return generalExpenses.map(([category, amount]) => {
                const percentage = totalGeneral > 0 ? ((amount / totalGeneral) * 100).toFixed(1) : 0;
                return `<div class="expense-item"><span><strong>${category}</strong></span><span>${formatCurrency(amount)} (${percentage}%)</span></div>`;
              }).join('') + 
              `<div class="expense-item" style="border-top: 2px solid #dc2626; font-weight: bold; background: #fef3f2;"><span>TOTAL GENERAL</span><span>${formatCurrency(totalGeneral)}</span></div>`;
            })()}
        </div>
    </div>
    
    <div class="section">
        <h3>Purchase Expenses</h3>
        <div class="expense-list">
            ${(() => {
              const generalCategories = ['RENT', 'ELECTRICITY', 'KAFEEL', 'SALARY', 'QIB COMMITION'];
              const consolidatedExpenses = {};
              Object.entries(branchData.expenseBreakdown).forEach(([category, amount]) => {
                const normalizedCategory = category.trim().toLowerCase();
                const existingKey = Object.keys(consolidatedExpenses).find(key => 
                  key.toLowerCase() === normalizedCategory
                );
                if (existingKey) {
                  consolidatedExpenses[existingKey] += amount;
                } else {
                  consolidatedExpenses[category] = amount;
                }
              });
              
              const purchaseExpenses = Object.entries(consolidatedExpenses)
                .filter(([category]) => !generalCategories.some(gen => category.toLowerCase().includes(gen.toLowerCase())))
                .sort(([,a], [,b]) => b - a);
              
              const totalPurchase = purchaseExpenses.reduce((sum, [,amount]) => sum + amount, 0);
              
              return purchaseExpenses.map(([category, amount]) => {
                const percentage = totalPurchase > 0 ? ((amount / totalPurchase) * 100).toFixed(1) : 0;
                return `<div class="expense-item"><span><strong>${category}</strong></span><span>${formatCurrency(amount)} (${percentage}%)</span></div>`;
              }).join('') + 
              `<div class="expense-item" style="border-top: 2px solid #2563eb; font-weight: bold; background: #f0f9ff;"><span>TOTAL PURCHASE</span><span>${formatCurrency(totalPurchase)}</span></div>`;
            })()}
        </div>
    </div>
    
    <div class="footer">
        <p>This report contains ${branchData.recordCount} daily entries for ${monthName} ${year}</p>
        <p>Report generated automatically by the Branch Management System</p>
    </div>
</body>
</html>
    `;
    
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

        {/* Branch Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{formatCurrency(branchData.totalIncome)}</div>
                <div className="text-green-100 text-sm mt-1">Total Income</div>
              </div>
              <div className="text-4xl opacity-80">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{formatCurrency(branchData.totalExpenses)}</div>
                <div className="text-red-100 text-sm mt-1">Total Expenses</div>
                <div className="text-red-100 text-xs mt-1">{branchData.totalIncome > 0 ? ((branchData.totalExpenses / branchData.totalIncome) * 100).toFixed(1) : 0}% of Income</div>
              </div>
              <div className="text-4xl opacity-80">💸</div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${branchData.totalEarnings >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} p-6 rounded-xl shadow-lg text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{formatCurrency(branchData.totalEarnings)}</div>
                <div className="text-blue-100 text-sm mt-1">Net {branchData.totalEarnings >= 0 ? 'Profit' : 'Loss'}</div>
                <div className="text-blue-100 text-xs mt-1">{branchData.totalIncome > 0 ? ((branchData.totalEarnings / branchData.totalIncome) * 100).toFixed(1) : 0}% Margin</div>
              </div>
              <div className="text-4xl opacity-80">{branchData.totalEarnings >= 0 ? '📈' : '📉'}</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{branchData.recordCount > 0 ? (branchData.totalIncome / branchData.recordCount).toFixed(0) : 0}</div>
                <div className="text-indigo-100 text-sm mt-1">Avg Daily Income</div>
                <div className="text-indigo-100 text-xs mt-1">{formatCurrency(branchData.recordCount > 0 ? (branchData.totalExpenses / branchData.recordCount) : 0)} Avg Expense</div>
              </div>
              <div className="text-4xl opacity-80">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{branchData.recordCount}</div>
                <div className="text-purple-100 text-sm mt-1">Daily Entries</div>
                <div className="text-purple-100 text-xs mt-1">{Object.keys(branchData.expenseBreakdown).length} Categories</div>
              </div>
              <div className="text-4xl opacity-80">📋</div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Expense Profile */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Expense Categories</h3>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {(() => {
                // Consolidate duplicate categories
                const consolidatedExpenses = {};
                Object.entries(branchData.expenseBreakdown).forEach(([category, amount]) => {
                  const normalizedCategory = category.trim().toLowerCase();
                  const existingKey = Object.keys(consolidatedExpenses).find(key => 
                    key.toLowerCase() === normalizedCategory
                  );
                  
                  if (existingKey) {
                    consolidatedExpenses[existingKey] += amount;
                  } else {
                    consolidatedExpenses[category] = amount;
                  }
                });
                
                return Object.entries(consolidatedExpenses)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount], index) => {
                    const percentage = branchData.totalExpenses > 0 ? ((amount / branchData.totalExpenses) * 100).toFixed(1) : 0;
                    const isTop5 = index < 5;
                    return (
                      <div key={category} className={`p-3 rounded-lg border ${isTop5 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            {isTop5 && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full mr-2">#{index + 1}</span>}
                            <span className="text-sm font-medium text-gray-800">{category}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</div>
                            <div className="text-xs text-gray-600">{percentage}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${isTop5 ? 'bg-blue-600' : 'bg-gray-400'}`}
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 text-center">
              <div className="text-sm text-gray-600">
                Total: {formatCurrency(branchData.totalExpenses)} across {Object.keys(branchData.expenseBreakdown).length} categories
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Profit Margin</span>
                <span className={`text-lg font-bold ${branchData.totalEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {branchData.totalIncome > 0 ? ((branchData.totalEarnings / branchData.totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Expense Ratio</span>
                <span className="text-lg font-bold text-orange-600">
                  {branchData.totalIncome > 0 ? ((branchData.totalExpenses / branchData.totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Revenue per Day</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(branchData.recordCount > 0 ? (branchData.totalIncome / branchData.recordCount) : 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Cost per Day</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(branchData.recordCount > 0 ? (branchData.totalExpenses / branchData.recordCount) : 0)}
                </span>
              </div>
            </div>
          </div>

          {/* General Expenses */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">General Expenses</h3>
            <div className="space-y-3">
              {(() => {
                const generalCategories = ['RENT', 'ELECTRICITY', 'KAFEEL', 'SALARY', 'QIB COMMITION'];
                
                // Consolidate duplicates first
                const consolidatedExpenses = {};
                Object.entries(branchData.expenseBreakdown).forEach(([category, amount]) => {
                  const normalizedCategory = category.trim().toLowerCase();
                  const existingKey = Object.keys(consolidatedExpenses).find(key => 
                    key.toLowerCase() === normalizedCategory
                  );
                  
                  if (existingKey) {
                    consolidatedExpenses[existingKey] += amount;
                  } else {
                    consolidatedExpenses[category] = amount;
                  }
                });
                
                const generalExpenses = Object.entries(consolidatedExpenses)
                  .filter(([category]) => generalCategories.some(gen => category.toLowerCase().includes(gen.toLowerCase())))
                  .sort(([,a], [,b]) => b - a);
                
                const purchaseExpenses = Object.entries(consolidatedExpenses)
                  .filter(([category]) => !generalCategories.some(gen => category.toLowerCase().includes(gen.toLowerCase())))
                  .sort(([,a], [,b]) => b - a);
                
                const totalGeneral = generalExpenses.reduce((sum, [,amount]) => sum + amount, 0);
                const totalPurchase = purchaseExpenses.reduce((sum, [,amount]) => sum + amount, 0);
                
                return (
                  <>
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">{formatCurrency(totalGeneral)}</div>
                        <div className="text-sm text-purple-700">General Expenses</div>
                        <div className="text-xs text-purple-600">{branchData.totalExpenses > 0 ? ((totalGeneral / branchData.totalExpenses) * 100).toFixed(1) : 0}% of Total</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{formatCurrency(totalPurchase)}</div>
                        <div className="text-sm text-blue-700">Purchase Expenses</div>
                        <div className="text-xs text-blue-600">{branchData.totalExpenses > 0 ? ((totalPurchase / branchData.totalExpenses) * 100).toFixed(1) : 0}% of Total</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-semibold text-gray-600 uppercase">General:</div>
                      {generalExpenses.slice(0, 3).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{category}</span>
                          <span className="font-semibold text-gray-800">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* PDF Download Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Export Analytics Report</h3>
              <p className="text-sm text-gray-600 mt-1">Download detailed financial analysis for {branchData.name} - {months.find(m => m.value === parseInt(selectedMonth))?.label} {selectedYear}</p>
            </div>
            <button
              onClick={() => downloadBranchPDF(branchData, selectedMonth, selectedYear)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* Income Breakdown Visualization */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Income Distribution Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Breakdown */}
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Income</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(branchData.totalIncome)} (100%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div 
                    className="bg-red-500 h-8 absolute left-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${branchData.totalIncome > 0 ? (branchData.totalExpenses / branchData.totalIncome) * 100 : 0}%` }}
                  >
                    {branchData.totalIncome > 0 ? ((branchData.totalExpenses / branchData.totalIncome) * 100).toFixed(1) : 0}%
                  </div>
                  <div 
                    className={`${branchData.totalEarnings >= 0 ? 'bg-green-500' : 'bg-orange-500'} h-8 absolute flex items-center justify-center text-white text-xs font-bold`}
                    style={{ 
                      left: `${branchData.totalIncome > 0 ? (branchData.totalExpenses / branchData.totalIncome) * 100 : 0}%`,
                      width: `${branchData.totalIncome > 0 ? Math.abs(branchData.totalEarnings / branchData.totalIncome) * 100 : 0}%` 
                    }}
                  >
                    {branchData.totalIncome > 0 ? Math.abs((branchData.totalEarnings / branchData.totalIncome) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-red-600 font-medium">Expenses</span>
                  <span className={`font-medium ${branchData.totalEarnings >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    Net {branchData.totalEarnings >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* User-Friendly Summary Cards */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(branchData.totalIncome)}</div>
                  <div className="text-sm font-medium text-blue-800">Total Revenue</div>
                  <div className="text-xs text-blue-600 mt-1">100% of Income</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(branchData.totalExpenses)}</div>
                  <div className="text-sm font-medium text-red-800">Total Costs</div>
                  <div className="text-xs text-red-600 mt-1">
                    {branchData.totalIncome > 0 ? ((branchData.totalExpenses / branchData.totalIncome) * 100).toFixed(1) : 0}% of Revenue
                  </div>
                </div>
              </div>
              
              <div className={`bg-gradient-to-r ${branchData.totalEarnings >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-orange-50 to-orange-100 border-orange-200'} p-4 rounded-lg border`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${branchData.totalEarnings >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(Math.abs(branchData.totalEarnings))}
                  </div>
                  <div className={`text-sm font-medium ${branchData.totalEarnings >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
                    Net {branchData.totalEarnings >= 0 ? 'Profit' : 'Loss'}
                  </div>
                  <div className={`text-xs mt-1 ${branchData.totalEarnings >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {branchData.totalIncome > 0 ? Math.abs((branchData.totalEarnings / branchData.totalIncome) * 100).toFixed(1) : 0}% Profit Margin
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Expense Breakdown */}
          {Object.keys(branchData.expenseBreakdown).length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
              <div className="h-80">
                <Doughnut {...getExpenseBreakdownChart(branchData.expenseBreakdown)} />
              </div>
            </div>
          )}

          {/* Income vs Expenses */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Income vs Expenses</h3>
            <div className="h-80">
              <Doughnut {...getIncomeVsExpensesChart(branchData)} />
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Expense Bar Chart */}
          {Object.keys(branchData.expenseBreakdown).length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Categories (Bar Chart)</h3>
              <div className="h-80">
                <Bar {...getExpenseBarChart(branchData.expenseBreakdown)} />
              </div>
            </div>
          )}

          {/* Daily Performance Trend */}
          {branchData.expenditures.length > 1 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Performance Trend</h3>
              <div className="h-80">
                <Line {...getBranchDailyTrendChart(branchData.expenditures)} />
              </div>
            </div>
          )}
        </div>

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
        <button
          onClick={() => setShowAddExpenditure(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-lg hover:from-red-900 hover:to-red-800 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          + Add Daily Expenditure
        </button>
      </div>

      {/* Overall Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{formatCurrency(overallAnalytics.totalIncome)}</div>
              <div className="text-green-100 text-sm mt-1">Total Income</div>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{formatCurrency(overallAnalytics.totalExpenses)}</div>
              <div className="text-red-100 text-sm mt-1">Total Expenses</div>
            </div>
            <div className="text-4xl opacity-80">💸</div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${overallAnalytics.totalEarnings >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{formatCurrency(overallAnalytics.totalEarnings)}</div>
              <div className="text-blue-100 text-sm mt-1">Net {overallAnalytics.totalEarnings >= 0 ? 'Profit' : 'Loss'}</div>
            </div>
            <div className="text-4xl opacity-80">{overallAnalytics.totalEarnings >= 0 ? '📈' : '📉'}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{overallAnalytics.activeBranches}</div>
              <div className="text-purple-100 text-sm mt-1">Active Branches</div>
            </div>
            <div className="text-4xl opacity-80">🏢</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{overallAnalytics.recordCount}</div>
              <div className="text-gray-100 text-sm mt-1">Total Records</div>
            </div>
            <div className="text-4xl opacity-80">📊</div>
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

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Overall Expense Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Expense Breakdown</h3>
          <div className="h-96">
            {Object.keys(getOverallExpenseBreakdown()).length > 0 ? (
              <Doughnut {...getExpenseBreakdownChart(getOverallExpenseBreakdown())} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Branch Performance Comparison */}
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

        {/* Daily Trends */}
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

        {/* Profit Margin Analysis */}
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

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {overallAnalytics.totalIncome > 0 ? ((overallAnalytics.totalEarnings / overallAnalytics.totalIncome) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-indigo-100 text-sm mt-1">Profit Margin</div>
            </div>
            <div className="text-4xl opacity-80">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {overallAnalytics.recordCount > 0 ? (overallAnalytics.totalIncome / overallAnalytics.recordCount).toFixed(0) : 0}
              </div>
              <div className="text-teal-100 text-sm mt-1">Avg Daily Income</div>
            </div>
            <div className="text-4xl opacity-80">💹</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {Object.values(branchAnalytics).filter(b => b.totalEarnings > 0).length}
              </div>
              <div className="text-amber-100 text-sm mt-1">Profitable Branches</div>
            </div>
            <div className="text-4xl opacity-80">🏆</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {overallAnalytics.recordCount > 0 ? (overallAnalytics.totalExpenses / overallAnalytics.recordCount).toFixed(0) : 0}
              </div>
              <div className="text-rose-100 text-sm mt-1">Avg Daily Expenses</div>
            </div>
            <div className="text-4xl opacity-80">💸</div>
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
    </div>
  );
}
