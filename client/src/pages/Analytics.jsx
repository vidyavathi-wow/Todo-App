import React, { useEffect, useState, useContext } from 'react';
import { PieChartBox } from '../components/analytics/wrappers/PieChartBox';
import { BarChartBox } from '../components/analytics/wrappers/BarChartBox';
import AnalyticsCard from '../components/analytics/wrappers/AnalyticsCard';
import AppContext from '../context/AppContext';
import Loader from '../components/common/Loader';
import { ANALYTICS_COLORS } from '../utils/Constants.jsx';
import EmptyState from '../components/common/EmptyState';
import { getAnalytics } from '../services/analytics.js';

export default function Analytics() {
  const { fetchTodos, todos } = useContext(AppContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const data = await getAnalytics();
        if (data.success) {
          fetchTodos();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Analytics fetch error:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, [todos]);

  if (loading) return <Loader />;
  if (!analytics) return <EmptyState message="No Analytics Data" />;

  const totalTodos = analytics.totalTodos || 0;
  const inProgress = analytics.statusCounts?.inProgress || 0;
  const highPriority = analytics.priorityCounts?.High || 0;

  return (
    <div className="flex-1 bg-gray-dark text-secondary h-full overflow-y-auto p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
        Todo Analytics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <AnalyticsCard
          title="Total Todos"
          value={totalTodos}
          color={ANALYTICS_COLORS.cards.total}
        />
        <AnalyticsCard
          title="In Progress"
          value={inProgress}
          color={ANALYTICS_COLORS.cards.inProgress}
        />
        <AnalyticsCard
          title="High Priority"
          value={highPriority}
          color={ANALYTICS_COLORS.cards.highPriority}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[minmax(320px,auto)]">
        <PieChartBox
          title="Status Distribution"
          data={Object.entries(analytics.statusCounts).map(([name, value]) => ({
            name,
            value,
          }))}
          colors={ANALYTICS_COLORS.status}
        />

        <BarChartBox
          title="Priority Overview"
          data={Object.entries(analytics.priorityCounts).map(
            ([name, value]) => ({
              name,
              value,
            })
          )}
          barColor={ANALYTICS_COLORS.priority[2]}
        />

        <PieChartBox
          title="Category Breakdown"
          data={Object.entries(analytics.categoryCounts).map(
            ([name, value]) => ({
              name,
              value,
            })
          )}
          colors={ANALYTICS_COLORS.category}
        />
      </div>
    </div>
  );
}
