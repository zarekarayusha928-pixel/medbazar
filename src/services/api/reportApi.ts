import { Report } from '@/types';
import { apiClient, isMockMode, mockDelay } from './client';

export const reportApi = {
  async getAdminReports(period: '30d' | '90d' | 'ytd' = '30d'): Promise<Report> {
    if (!isMockMode()) {
      return apiClient.get<Report>('/reports/admin', { params: { period } });
    }

    await mockDelay(200);

    const multiplier = period === 'ytd' ? 12 : period === '90d' ? 3 : 1;

    return {
      id: `rep_${period}`,
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        period,
        totalGmv: 1845000 * multiplier,
        totalOrders: 342 * multiplier,
        totalRevenue: 276750 * multiplier,
        platformCommissions: 276750 * multiplier,
        netPayouts: 1568250 * multiplier,
      },
      salesTrend: [
        { month: 'May 2026', gmv: 920000, orders: 180 },
        { month: 'Jun 2026', gmv: 1140000, orders: 215 },
        { month: 'Jul 2026', gmv: 1380000, orders: 260 },
        { month: 'Aug 2026', gmv: 1510000, orders: 290 },
        { month: 'Sep 2026', gmv: 1720000, orders: 320 },
        { month: 'Oct 2026', gmv: 1845000, orders: 342 },
      ],
      pharmacyPerformance: [
        {
          id: 'pharm_1',
          pharmacyName: 'Apothecary Healthcare',
          branchCount: 3,
          totalOrders: 198 * multiplier,
          gmv: 968000 * multiplier,
          platformCommission: 145200 * multiplier,
          netPayout: 822800 * multiplier,
        },
        {
          id: 'pharm_2',
          pharmacyName: 'MediCure Pharmacy',
          branchCount: 2,
          totalOrders: 88 * multiplier,
          gmv: 485000 * multiplier,
          platformCommission: 72750 * multiplier,
          netPayout: 412250 * multiplier,
        },
        {
          id: 'pharm_3',
          pharmacyName: 'Wellness Chemist Network',
          branchCount: 2,
          totalOrders: 56 * multiplier,
          gmv: 392000 * multiplier,
          platformCommission: 58800 * multiplier,
          netPayout: 333200 * multiplier,
        },
      ],
      medicineDemand: [
        { id: 'med_1', name: 'Paracetamol 650mg (Dolo)', unitsSold: 480 * multiplier, revenue: 15600 * multiplier },
        { id: 'med_2', name: 'Azithromycin 500mg', unitsSold: 210 * multiplier, revenue: 25200 * multiplier },
        { id: 'med_3', name: 'Amoxicillin + Clavulanic Acid', unitsSold: 165 * multiplier, revenue: 33000 * multiplier },
        { id: 'med_4', name: 'Metformin 500mg ER', unitsSold: 390 * multiplier, revenue: 17550 * multiplier },
        { id: 'med_5', name: 'Atorvastatin 10mg', unitsSold: 240 * multiplier, revenue: 21600 * multiplier },
      ],
    };
  },

  async getPharmacyReports(params?: { organizationId?: string; branchId?: string; period?: string }): Promise<any> {
    if (!isMockMode()) {
      return apiClient.get('/reports/pharmacy', { params: params as any });
    }

    await mockDelay(150);
    return {
      totalSales: 482500,
      totalOrders: 236,
      averageOrderValue: 2044,
      topMedicines: [
        { name: 'Paracetamol 650mg (Dolo)', units: 142, revenue: 4615 },
        { name: 'Metformin 500mg ER', units: 98, revenue: 4410 },
        { name: 'Azithromycin 500mg', units: 64, revenue: 7680 },
      ],
    };
  },

  async getDashboardTelemetry(params?: { organizationId?: string; branchId?: string; period?: string }): Promise<any> {
    if (!isMockMode()) {
      return apiClient.get('/reports/dashboard', { params: params as any });
    }

    await mockDelay(150);
    return {
      activeBranchId: params?.branchId || 'br_1',
      timeRange: params?.period || 'today',
      sales: {
        todayTotal: 18450,
        todayOnline: 5820,
        todayOffline: 12630,
        totalOrders: 24,
      },
      pendingPrescriptionsCount: 2,
      lowStockCount: 4,
      expiringBatchesCount: 3,
      topMedicines: [],
    };
  },

  async exportReportData(period: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    if (!isMockMode()) {
      return apiClient.get<string>(`/reports/export?period=${period}&format=${format}`);
    }

    await mockDelay(200);
    return `Period,Metric,Value\n${period},Total GMV,1845000\n${period},Orders,342\n${period},Commissions,276750\n`;
  },
};
