import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerService } from '../api/services/customerService';
import { jobService } from '../api/services/jobService';
import { billingService } from '../api/services/billingService';
import { pettyCashService } from '../api/services/pettyCashService';
import { accountingService } from '../api/services/accountingService';

function Dashboard() {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalJobs: 0,
    openJobs: 0,
    inTransitJobs: 0,
    closedJobs: 0,
    totalBills: 0,
    unpaidBills: 0,
    paidBills: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    pettyCashBalance: 0,
    userPettyCash: 0,
    mainAccountBalance: 0,
    pettyCashIssued: 0,
    uncollectedCash: 0,
    conversionRate: 0
  });
  const [accountingData, setAccountingData] = useState(null);

  const getDateRange = useCallback(() => {
    const now = new Date();
    // End of today (inclusive)
    const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);
    switch (timePeriod) {
      case 'today': {
        const s = new Date(now); s.setHours(0, 0, 0, 0);
        return { startDate: s, endDate: dayEnd };
      }
      // Last 7 days (including today)
      case 'week': {
        const s = new Date(now); s.setDate(now.getDate() - 6); s.setHours(0, 0, 0, 0);
        return { startDate: s, endDate: dayEnd };
      }
      // Last 30 days (including today)
      case 'month': {
        const s = new Date(now); s.setDate(now.getDate() - 29); s.setHours(0, 0, 0, 0);
        return { startDate: s, endDate: dayEnd };
      }
      // Last 12 months (approx - include today)
      case 'year': {
        const s = new Date(now); s.setFullYear(now.getFullYear() - 1); s.setHours(0, 0, 0, 0);
        return { startDate: s, endDate: dayEnd };
      }
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          return {
            startDate: new Date(new Date(customDateRange.startDate).setHours(0, 0, 0, 0)),
            endDate: new Date(customDateRange.endDate + 'T23:59:59')
          };
        }
        return null;
      default:
        return null;
    }
  }, [timePeriod, customDateRange]);

  const filterByDate = useCallback((items, primaryField, fallbackFields = []) => {
    const range = getDateRange();
    if (!range || !items) return items;
    
    console.log('🔍 filterByDate called:', { 
      primaryField,
      itemCount: items.length, 
      startDate: range.startDate.toISOString(), 
      endDate: range.endDate.toISOString() 
    });
    
    const filtered = items.filter(item => {
      if (!item) return false;
      
      // Try primary field first, then fallbacks
      let dateValue = item[primaryField];
      if (!dateValue) {
        for (const fallback of fallbackFields) {
          if (item[fallback]) {
            dateValue = item[fallback];
            break;
          }
        }
      }
      
      if (!dateValue) {
        console.log('⚠️ No date field found for item:', { 
          itemId: item.jobId || item.billId || item.customerId, 
          tried: [primaryField, ...fallbackFields]
        });
        return false;
      }
      
      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) {
        console.log('❌ Invalid date:', dateValue);
        return false;
      }
      
      const isInRange = d >= range.startDate && d <= range.endDate;
      if (!isInRange) {
        console.log(`❌ Out of range: ${d.toISOString()} (field: ${primaryField})`);
      }
      
      return isInRange;
    });
    
    console.log(`✅ Filtered ${filtered.length} of ${items.length} items`);
    return filtered;
  }, [getDateRange]);

  const fetchStats = useCallback(async () => {
    try {
      let pettyCashData = { balance: 0 };
      if (['Super Admin', 'Admin', 'Manager', 'Office Executive'].includes(user?.role)) {
        pettyCashData = await pettyCashService.getBalance();
      } else if (user?.role === 'Waff Clerk') {
        pettyCashData = await pettyCashService.getUserAssignedBalance();
      }

      const [customers, jobs, bills] = await Promise.all([
        user?.role !== 'Waff Clerk' ? customerService.getAll() : Promise.resolve([]),
        jobService.getAll(),
        user?.role !== 'Waff Clerk' ? billingService.getBills() : Promise.resolve([])
      ]);

      console.log('📊 fetchStats - timePeriod:', timePeriod);
      console.log('📊 Raw data counts:', { customers: customers.length, jobs: jobs.length, bills: bills.length });
      
      // Filter data by date - use openDate for jobs (when job started), billDate for bills, registrationDate for customers
      const fCustomers = timePeriod === 'all' ? customers : filterByDate(customers, 'registrationDate', ['createdDate']);
      const fJobs      = timePeriod === 'all' ? jobs      : filterByDate(jobs, 'openDate', ['createdDate']);
      const fBills     = timePeriod === 'all' ? bills     : filterByDate(bills, 'billDate', ['invoiceDate', 'createdDate']);
      
      console.log('📊 Filtered data counts:', { customers: fCustomers.length, jobs: fJobs.length, bills: fBills.length });

      const paidBills    = fBills.filter(b => b.paymentStatus === 'Paid' || b.paymentStatus === 'Partially Paid');
      const unpaidBills  = fBills.filter(b => b.paymentStatus === 'Unpaid' || b.paymentStatus === 'Partially Paid');

      const totalRevenue   = paidBills.reduce((s, b) => s + (parseFloat(b.paidAmount) || parseFloat(b.netTotal) || parseFloat(b.total) || parseFloat(b.billingAmount) || 0), 0);
      const pendingRevenue = unpaidBills.reduce((s, b) => s + (parseFloat(b.remainingAmount) || parseFloat(b.netTotal) || parseFloat(b.total) || parseFloat(b.billingAmount) || 0), 0);
      const conversionRate = fBills.length > 0 ? Math.round((paidBills.length / fBills.length) * 100) : 0;

      // Note: Petty cash issued calculation requires petty cash assignments data
      // For now, when filtering by date, we cannot accurately calculate this without additional API support
      // TODO: Add API endpoint to get petty cash assignments filtered by date
      const pettyCashIssuedFiltered = 0; // Placeholder - requires petty cash assignments API

      setStats({
        totalCustomers:   fCustomers.length,
        totalJobs:        fJobs.length,
        openJobs:         fJobs.filter(j => j.status === 'Open').length,
        inTransitJobs:    fJobs.filter(j => j.status === 'In Transit').length,
        closedJobs:       fJobs.filter(j => j.status === 'Completed').length,
        totalBills:       fBills.length,
        unpaidBills:      unpaidBills.length,
        paidBills:        paidBills.length,
        totalRevenue,
        pendingRevenue,
        pettyCashBalance: pettyCashData.balance,
        userPettyCash:    pettyCashData.balance,
        mainAccountBalance: 0,
        pettyCashIssued:  pettyCashIssuedFiltered,
        uncollectedCash:  pendingRevenue,
        conversionRate
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [user, timePeriod, filterByDate]);

  const fetchAccountingData = useCallback(async () => {
    try {
      const data = await accountingService.getDashboard();
      setAccountingData(data);
    } catch (err) {
      console.error('Error fetching accounting data:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    if (user?.role === 'Super Admin' || user?.role === 'Admin') fetchAccountingData();
  }, [fetchStats, fetchAccountingData, user]);

  const fmt = (amount) =>
    'LKR ' + parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtShort = (amount) => {
    const n = parseFloat(amount || 0);
    if (n >= 1000000) return 'LKR ' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return 'LKR ' + (n / 1000).toFixed(1) + 'K';
    return 'LKR ' + n.toFixed(2);
  };

  const periods = [
    { key: 'all',    label: 'All Time' },
    { key: 'today',  label: 'Today' },
    { key: 'week',   label: 'Last 7 Days' },
    { key: 'month',  label: 'Last 30 Days' },
    { key: 'year',   label: 'Last 12 Months' },
    { key: 'custom', label: 'Custom' },
  ];

  const handlePeriodChange = (key) => {
    setTimePeriod(key);
    if (key !== 'custom') setCustomDateRange({ startDate: '', endDate: '' });
  };

  // Use accounting data ONLY when "All Time" is selected (it's always all-time data)
  // When a period filter is active, always use the date-filtered `stats`
  const useAccounting = accountingData && timePeriod === 'all';

  const totalRevenue    = useAccounting ? accountingData.summary.totalBillingAmount  : (stats.totalRevenue + stats.pendingRevenue);
  const collectedRev    = useAccounting ? accountingData.summary.totalPaid           : stats.totalRevenue;
  const outstandingRev  = useAccounting ? accountingData.summary.totalOutstanding    : stats.pendingRevenue;
  const overdueRev      = useAccounting ? accountingData.summary.totalOverdue        : 0;
  const netProfit       = useAccounting ? accountingData.summary.totalProfit         : stats.totalRevenue;
  const profitMargin    = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const totalJobsAcc    = useAccounting ? accountingData.summary.totalJobs           : stats.totalJobs;
  const paidJobsCount   = useAccounting ? accountingData.summary.paidJobsCount       : stats.paidBills;
  const unpaidJobsCount = useAccounting ? accountingData.summary.unpaidJobsCount     : stats.unpaidBills;
  const overdueCount    = useAccounting ? accountingData.summary.overdueJobsCount    : 0;
  // Petty cash issued: use filtered stats value (calculated from jobs in period)
  const pettyCashIssued = useAccounting ? accountingData.summary.totalPettyCashIssued : stats.pettyCashIssued;

  /* ── SUPER ADMIN / ADMIN ── */
  if (user?.role === 'Super Admin' || user?.role === 'Admin') {
    return (
      <div className="p-6 md:p-8 max-w-full min-h-screen bg-gray-100">

        {/* ── Page Header ── */}
        <div className="flex justify-between items-baseline mb-5 pb-4 border-b-2 border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <span className="text-sm text-gray-500">Welcome back, {user?.fullName} — Super Shine Cargo Service</span>
        </div>

        {/* ── Period Filter ── */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-wrap items-center gap-5 mb-5">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Filter by Period</span>
          <div className="flex flex-wrap gap-1">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => handlePeriodChange(p.key)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  timePeriod === p.key
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {timePeriod === 'custom' && (
            <div className="w-full flex gap-4 items-end flex-wrap pt-3 border-t border-gray-200 mt-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Start Date</label>
                <input 
                  type="date" 
                  value={customDateRange.startDate}
                  onChange={e => setCustomDateRange(p => ({ ...p, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">End Date</label>
                <input 
                  type="date" 
                  value={customDateRange.endDate}
                  onChange={e => setCustomDateRange(p => ({ ...p, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Main Two-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* ── LEFT: Revenue Performance ── */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-5 pb-3 border-b-2 border-gray-200">
              Revenue Performance
              {timePeriod !== 'all' && (
                <span className="text-xs font-medium text-gray-500 ml-3 normal-case tracking-normal">
                  — {periods.find(p => p.key === timePeriod)?.label}
                </span>
              )}
            </h2>

            {/* Top 3 revenue tiles */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">LKR</span>
                  <span className="text-xs text-gray-600 font-medium leading-tight">Total Revenue ({timePeriod === 'all' ? 'All-Time' : periods.find(p => p.key === timePeriod)?.label})</span>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{fmtShort(totalRevenue)}</div>
                <div className="text-xs text-gray-400">{totalJobsAcc} jobs</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">PAID</span>
                  <span className="text-xs text-gray-600 font-medium leading-tight">Collected Revenue</span>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{fmtShort(collectedRev)}</div>
                <div className="text-xs text-gray-400">{paidJobsCount} jobs paid</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">LATE</span>
                  <span className="text-xs text-gray-600 font-medium leading-tight">Pending Collected Revenue</span>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{fmtShort(outstandingRev + overdueRev)}</div>
                <div className="text-xs text-gray-400">Sum of Unpaid & Overdue</div>
              </div>
            </div>

            {/* Revenue Contribution summary */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
              <div className="text-xs text-gray-600 font-medium mb-1">Revenue Contribution (Overall)</div>
              <div className="text-xl font-bold text-gray-900 mb-3">{fmtShort(totalRevenue)} (Total)</div>
              <div className="space-y-2">
                <div className="mb-2">
                  <span className="text-xs text-gray-600 block mb-1">Total Jobs: {totalJobsAcc}</span>
                  <div className="h-2.5 bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-xs text-gray-600 block mb-1">Avg. Value per Job</span>
                  <div className="h-2.5 bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: totalJobsAcc > 0 ? `${Math.min((collectedRev / totalRevenue) * 100, 100)}%` : '0%' }}></div>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-xs text-gray-600 block mb-1">Collected</span>
                  <div className="h-2.5 bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: totalRevenue > 0 ? `${Math.min((collectedRev / totalRevenue) * 100, 100)}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Revenue Source: Billing Data — approx. {fmtShort(totalJobsAcc > 0 ? totalRevenue / totalJobsAcc : 0)} avg/job
              </div>
            </div>

            {/* Bottom 3 tiles */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">DUE</span>
                  <span className="text-xs text-gray-600 font-medium leading-tight">Total Outstanding (Unpaid)</span>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{fmtShort(outstandingRev)}</div>
                <div className="text-xs text-gray-400">{unpaidJobsCount} unpaid</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">LATE</span>
                  <span className="text-xs text-gray-600 font-medium leading-tight">Total Overdue (Late)</span>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{fmtShort(overdueRev)}</div>
                <div className="text-xs text-gray-400">{overdueCount} overdue</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex items-center gap-1 mb-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">NET</span>
                  <span className="text-xs text-gray-600 font-medium leading-tight">Total Net Profit</span>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{fmtShort(netProfit)}</div>
                <div className="text-xs text-gray-400">{profitMargin}% margin</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Operational Overview ── */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-5 pb-3 border-b-2 border-gray-200">
              Operational Overview
            </h2>

            {/* Total workload */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-3">
              <div className="text-xs text-gray-600 font-medium mb-1">Total Operational Workload</div>
              <div className="text-3xl font-bold text-gray-900 leading-tight">{stats.totalJobs} jobs</div>
              <div className="text-xs text-gray-500 mt-1">Total under processing</div>
            </div>

            {/* Job status row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                <div className="text-xs text-gray-600 font-semibold mb-2">Open Jobs</div>
                <div className="text-3xl font-bold text-amber-500">{stats.openJobs}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                <div className="text-xs text-gray-600 font-semibold mb-2">In Transit</div>
                <div className="text-3xl font-bold text-blue-500">{stats.inTransitJobs}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                <div className="text-xs text-gray-600 font-semibold mb-2">Completed Jobs</div>
                <div className="text-3xl font-bold text-green-500">{stats.closedJobs}</div>
              </div>
            </div>

            {/* Invoices row */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="text-xs text-gray-600 font-semibold mb-2 leading-tight">Total Invoices (Generated)</div>
                <div className="text-3xl font-bold text-gray-900 leading-tight">{stats.totalBills}</div>
                <div className="text-xs text-gray-400 mt-1">Total invoices across all jobs</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="text-xs text-gray-600 font-semibold mb-2 leading-tight">Invoice Status Breakdown</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-14 h-14">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.5"/>
                      {stats.totalBills > 0 && (
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27ae60" strokeWidth="3.5"
                          strokeDasharray={`${(stats.paidBills / stats.totalBills) * 100} ${100 - (stats.paidBills / stats.totalBills) * 100}`}
                          strokeDashoffset="25" strokeLinecap="round"/>
                      )}
                      {stats.totalBills > 0 && stats.unpaidBills > 0 && (
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e74c3c" strokeWidth="3.5"
                          strokeDasharray={`${(stats.unpaidBills / stats.totalBills) * 100} ${100 - (stats.unpaidBills / stats.totalBills) * 100}`}
                          strokeDashoffset={`${25 - (stats.paidBills / stats.totalBills) * 100}`} strokeLinecap="round"/>
                      )}
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>Paid ({stats.paidBills})
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>Unpaid ({stats.unpaidBills})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customers + Conversion */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="text-xs text-gray-600 font-semibold mb-2">Total Customers</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</div>
              </div>
              <div className="bg-gray-50 border-l-4 border-l-green-500 border border-gray-200 rounded p-3">
                <div className="text-xs text-gray-600 font-semibold mb-2">Revenue Conversion Rate</div>
                <div className="text-2xl font-bold text-green-500 my-1">{stats.conversionRate}% Paid</div>
                <div className="text-xs text-gray-400">Paid Invoices / Total Invoices</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Cash Flow Tracking ── */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-5 pb-3 border-b-2 border-gray-200">
            Cash Flow Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-l-4 border-l-blue-500 bg-gray-50 border border-gray-200 rounded p-4">
              <div className="text-xs text-gray-600 font-semibold mb-2">Main Account Balance</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{fmt(stats.mainAccountBalance)}</div>
              <div className="text-xs text-gray-400">Total funds in main account</div>
            </div>
            <div className="border-l-4 border-l-teal-500 bg-gray-50 border border-gray-200 rounded p-4">
              <div className="text-xs text-gray-600 font-semibold mb-2">Petty Cash Balance</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{fmt(stats.pettyCashBalance)}</div>
              <div className="text-xs text-gray-400">Available petty cash</div>
            </div>
            <div className="border-l-4 border-l-purple-500 bg-gray-50 border border-gray-200 rounded p-4">
              <div className="text-xs text-gray-600 font-semibold mb-2">Petty Cash Issued {timePeriod !== 'all' ? '(Period)' : '(To Date)'}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700">CASH</span>
                <div className="text-xl font-bold text-gray-900">{fmt(pettyCashIssued)}</div>
              </div>
              <div className="text-xs text-gray-400">{timePeriod !== 'all' ? 'Issued in selected period' : 'Total issued to date'}</div>
            </div>
            <div className="border-l-4 border-l-red-500 bg-gray-50 border border-gray-200 rounded p-4">
              <div className="text-xs text-gray-600 font-semibold mb-2">Uncollected Cash Due {timePeriod !== 'all' ? '(Period)' : ''}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{fmtShort(stats.uncollectedCash)}</div>
              <div className="text-xs text-gray-400">— sum of unpaid invoices</div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  /* ── WAFF CLERK ── */
  if (user?.role === 'Waff Clerk') {
    return (
      <div className="p-6 md:p-8 max-w-full min-h-screen bg-gray-100">
        <div className="flex justify-between items-baseline mb-5 pb-4 border-b-2 border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <span className="text-sm text-gray-500">Welcome back, {user?.fullName} — Super Shine Cargo Service</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-l-4 border-l-amber-400 border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Open Jobs</h3>
            <div className="text-3xl font-bold text-amber-400 mb-1">{stats.openJobs}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white border-l-4 border-l-green-600 border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Completed Jobs</h3>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.closedJobs}</div>
            <div className="text-sm text-gray-500">Finished</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Paid Invoices</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.paidBills}</div>
            <div className="text-sm text-gray-500">Total Paid</div>
          </div>
          <div className="bg-white border-l-4 border-l-teal-600 border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Petty Cash</h3>
            <div className="text-2xl font-bold text-teal-600 mb-1">{fmt(stats.userPettyCash)}</div>
            <div className="text-sm text-gray-500">Assigned to you</div>
          </div>
        </div>
      </div>
    );
  }

  /* ── REGULAR USER ── */
  return (
    <div className="p-6 md:p-8 max-w-full min-h-screen bg-gray-100">
      <div className="flex justify-between items-baseline mb-5 pb-4 border-b-2 border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">Welcome back, {user?.fullName} — Super Shine Cargo Service</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2">Total Jobs</h3>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalJobs}</div>
          <div className="text-sm text-gray-500">Assigned to you</div>
        </div>
        <div className="bg-white border-l-4 border-l-amber-400 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2">Open Jobs</h3>
          <div className="text-3xl font-bold text-amber-400 mb-1">{stats.openJobs}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white border-l-4 border-l-green-600 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2">Completed Jobs</h3>
          <div className="text-3xl font-bold text-green-600 mb-1">{stats.closedJobs}</div>
          <div className="text-sm text-gray-500">Finished</div>
        </div>
        <div className="bg-white border-l-4 border-l-teal-600 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2">Petty Cash</h3>
          <div className="text-2xl font-bold text-teal-600 mb-1">{fmt(stats.pettyCashBalance)}</div>
          <div className="text-sm text-gray-500">Current Balance</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
