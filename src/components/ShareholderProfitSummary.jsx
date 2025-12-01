import { useState, useEffect, useMemo } from 'react';
import api from '../api/config';

export default function ShareholderProfitSummary({ month, year, branches, onClose }) {
  const [shareholderData, setShareholderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProfit, setTotalProfit] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    calculateShareholderProfits();
  }, [month, year, branches]);

  const calculateShareholderProfits = async () => {
    setLoading(true);
    const shareholderSummary = {};
    let companyTotalProfit = 0;

    for (const branch of branches) {
      try {
        // Fetch monthly savings for each branch
        const savingsResponse = await api.get(`/api/monthly-savings/${branch._id}/${month}/${year}`);
        const monthlySavings = savingsResponse.data.savings || [];
        const monthlySavingsTotal = monthlySavings.reduce((sum, saving) => sum + (saving.amount || 0), 0);

        // Calculate branch profit after zakath and savings
        const branchProfit = branch.totalEarnings || 0;
        const zakathAmount = (branchProfit * (branch.zakathPercentage || 0)) / 100;
        const profitAfterZakath = branchProfit - zakathAmount;
        const profitAfterSavings = profitAfterZakath - monthlySavingsTotal;

        companyTotalProfit += profitAfterSavings;

        // Calculate each shareholder's profit from this branch
        if (branch.shareholders && branch.shareholders.length > 0) {
          branch.shareholders.forEach(shareholder => {
            const shareholderProfit = (profitAfterSavings * shareholder.sharePercentage) / 100;
            
            if (!shareholderSummary[shareholder.name]) {
              shareholderSummary[shareholder.name] = {
                name: shareholder.name,
                quid: shareholder.quid,
                totalProfit: 0,
                branches: []
              };
            }

            shareholderSummary[shareholder.name].totalProfit += shareholderProfit;
            shareholderSummary[shareholder.name].branches.push({
              branchName: branch.name,
              sharePercentage: shareholder.sharePercentage,
              branchProfit: profitAfterSavings,
              shareholderProfit: shareholderProfit,
              zakathPercentage: shareholder.zakathPercentage || 0
            });
          });
        }
      } catch (error) {
        console.error(`Error calculating profits for branch ${branch.name}:`, error);
      }
    }

    setShareholderData(Object.values(shareholderSummary));
    setTotalProfit(companyTotalProfit);
    setLoading(false);
  };

  const formatCurrency = (amount) => `${amount.toFixed(0)} QR`;
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Filter and sort data
  const filteredData = useMemo(() => {
    return shareholderData.filter(shareholder =>
      shareholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shareholder.quid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shareholder.branches.some(branch => 
        branch.branchName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [shareholderData, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'totalProfit') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const downloadPDF = () => {
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', month: 'long', year: 'numeric' 
    });
    
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Shareholder Profit Distribution Report - ${monthNames[month]} ${year}</title>
    <style>
        @page { size: A4; margin: 20mm; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; padding: 0; color: #2c3e50; line-height: 1.4; font-size: 12px; 
        }
        .letterhead {
            text-align: center; padding: 20px 0; 
            border-bottom: 3px solid #34495e; margin-bottom: 25px;
        }
        .company-name { 
            font-size: 24px; font-weight: bold; color: #2c3e50; 
            margin-bottom: 5px; letter-spacing: 1px;
        }
        .report-title { 
            font-size: 18px; color: #7f8c8d; margin-bottom: 8px; 
        }
        .report-period { 
            font-size: 16px; font-weight: 600; color: #34495e; 
        }
        .meta-info { 
            text-align: right; font-size: 10px; color: #7f8c8d; 
            margin-bottom: 20px;
        }
        .executive-summary {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 20px; border-radius: 8px; margin-bottom: 25px;
            border: 1px solid #dee2e6;
        }
        .summary-grid {
            display: grid; grid-template-columns: repeat(3, 1fr); 
            gap: 15px; margin-top: 15px;
        }
        .summary-item {
            text-align: center; padding: 12px;
            background: white; border-radius: 6px; border: 1px solid #e9ecef;
        }
        .summary-label { 
            font-size: 11px; color: #6c757d; 
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        .summary-value { 
            font-size: 16px; font-weight: bold; 
            color: #2c3e50; margin-top: 4px;
        }
        .section-title {
            font-size: 16px; font-weight: 600; color: #2c3e50;
            margin: 25px 0 15px 0; padding-bottom: 8px;
            border-bottom: 2px solid #ecf0f1;
        }
        table { 
            border-collapse: collapse; width: 100%; 
            font-size: 11px; margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th { 
            background: linear-gradient(135deg, #34495e, #2c3e50); 
            color: white; font-weight: 600; padding: 12px 8px;
            text-align: center; font-size: 11px;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        td { 
            padding: 10px 8px; border: 1px solid #e9ecef; 
            text-align: center; vertical-align: middle;
        }
        tr:nth-child(even) { background-color: #f8f9fa; }
        tr:hover { background-color: #e3f2fd; }
        .total-row { 
            background: linear-gradient(135deg, #2c3e50, #34495e) !important; 
            color: white; font-weight: bold;
        }
        .branch-details {
            font-size: 10px; line-height: 1.3;
            text-align: left; padding-left: 12px;
        }
        .footer {
            margin-top: 30px; padding-top: 15px;
            border-top: 1px solid #dee2e6;
            font-size: 10px; color: #6c757d;
            text-align: center;
        }
        .confidential {
            color: #dc3545; font-weight: bold;
            text-transform: uppercase; letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="letterhead">
        <div class="company-name">STARZINKER</div>
        <div class="report-title">Shareholder Profit Distribution Report</div>
        <div class="report-period">${monthNames[month]} ${year}</div>
    </div>
    
    <div class="meta-info">
        Report Generated: ${currentDate} | Document ID: SPR-${year}${month.toString().padStart(2, '0')}
    </div>
    
    <div class="executive-summary">
        <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Executive Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Profit</div>
                <div class="summary-value">${formatCurrency(totalProfit)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Shareholders</div>
                <div class="summary-value">${shareholderData.length}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Active Branches</div>
                <div class="summary-value">${branches.length}</div>
            </div>
        </div>
    </div>

    <div class="section-title">Profit Distribution Details</div>
    <table>
        <thead>
            <tr>
                <th style="width: 25%;">Shareholder Name</th>
                <th style="width: 15%;">QID Number</th>
                <th style="width: 15%;">Total Profit (QR)</th>
                <th style="width: 45%;">Branch Allocation</th>
            </tr>
        </thead>
        <tbody>
            ${shareholderData.map(shareholder => `
                <tr>
                    <td style="font-weight: 600;">${shareholder.name}</td>
                    <td>${shareholder.quid}</td>
                    <td style="font-weight: 600; color: #27ae60;">${formatCurrency(shareholder.totalProfit)}</td>
                    <td class="branch-details">
                        ${shareholder.branches.map(branch => 
                            `<div style="margin-bottom: 3px;">• ${branch.branchName}: ${branch.sharePercentage}% → ${formatCurrency(branch.shareholderProfit)}</div>`
                        ).join('')}
                    </td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="2" style="text-align: center;"><strong>TOTAL DISTRIBUTED</strong></td>
                <td><strong>${formatCurrency(shareholderData.reduce((sum, s) => sum + s.totalProfit, 0))}</strong></td>
                <td style="text-align: center;"><strong>All Active Branches</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <div class="confidential">Confidential Document</div>
        <div style="margin-top: 5px;">
            This report contains sensitive financial information. Distribution is restricted to authorized personnel only.
        </div>
    </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Calculating profits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-purple-900">
            Shareholder Profit Summary - {monthNames[month]} {year}
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="text-purple-800 font-semibold">Total Company Profit</h4>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalProfit)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-blue-800 font-semibold">Total Shareholders</h4>
            <p className="text-2xl font-bold text-blue-600">{shareholderData.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-semibold">Active Branches</h4>
            <p className="text-2xl font-bold text-green-600">{branches.length}</p>
          </div>
        </div>

        {/* Shareholder Summary Table */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Shareholder Profit Summary</h4>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shareholders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase cursor-pointer hover:bg-purple-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Shareholder</span>
                      {sortConfig.key === 'name' && (
                        <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase cursor-pointer hover:bg-purple-100"
                    onClick={() => handleSort('quid')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>QID</span>
                      {sortConfig.key === 'quid' && (
                        <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase cursor-pointer hover:bg-purple-100"
                    onClick={() => handleSort('totalProfit')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Total Profit</span>
                      {sortConfig.key === 'totalProfit' && (
                        <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Branch Breakdown</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((shareholder, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{shareholder.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{shareholder.quid}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">{formatCurrency(shareholder.totalProfit)}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {shareholder.branches.map((branch, branchIndex) => (
                          <div key={branchIndex} className="text-sm">
                            <span className="font-medium text-gray-700">{branch.branchName}:</span>
                            <span className="text-gray-600"> {branch.sharePercentage}% = </span>
                            <span className="font-semibold text-green-600">{formatCurrency(branch.shareholderProfit)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No shareholders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === i + 1
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Summary Row */}
          <div className="mt-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-purple-800">TOTAL DISTRIBUTED:</span>
              <span className="font-bold text-purple-800 text-lg">{formatCurrency(filteredData.reduce((sum, s) => sum + s.totalProfit, 0))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}