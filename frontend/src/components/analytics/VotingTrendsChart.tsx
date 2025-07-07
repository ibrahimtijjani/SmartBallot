import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ElectionAnalytics } from '../../contexts/AnalyticsContext';

interface VotingTrendsChartProps {
  electionAnalytics: ElectionAnalytics[];
}

const VotingTrendsChart: React.FC<VotingTrendsChartProps> = ({ electionAnalytics }) => {
  // Prepare data for voting types distribution
  const votingTypeData = electionAnalytics.reduce((acc, analytics) => {
    const type = analytics.election.votingType;
    const totalVotes = analytics.voteCounts.reduce((sum, count) => sum + count, 0);
    
    const existing = acc.find(item => item.type === type);
    if (existing) {
      existing.count += 1;
      existing.totalVotes += totalVotes;
    } else {
      acc.push({
        type,
        count: 1,
        totalVotes,
        name: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
      });
    }
    return acc;
  }, [] as Array<{ type: string; count: number; totalVotes: number; name: string }>);

  // Prepare data for election status distribution
  const statusData = electionAnalytics.reduce((acc, analytics) => {
    let status: string;
    if (analytics.isActive) status = 'Active';
    else if (analytics.isEnded) status = 'Ended';
    else status = 'Upcoming';

    const existing = acc.find(item => item.status === status);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ status, count: 1 });
    }
    return acc;
  }, [] as Array<{ status: string; count: number }>);

  const VOTING_TYPE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const STATUS_COLORS = ['#10b981', '#6b7280', '#3b82f6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name || data.status}</p>
          <p className="text-sm text-gray-600">
            Elections: {data.count}
          </p>
          {data.totalVotes !== undefined && (
            <p className="text-sm text-gray-600">
              Total Votes: {data.totalVotes}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (electionAnalytics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Trends</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-gray-600">No election data available for trend analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Voting Trends</h3>
        <p className="text-sm text-gray-600">Distribution of voting types and election status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voting Types Distribution */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Voting Types</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={votingTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {votingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={VOTING_TYPE_COLORS[index % VOTING_TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Voting Types Legend */}
          <div className="mt-4 space-y-2">
            {votingTypeData.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: VOTING_TYPE_COLORS[index % VOTING_TYPE_COLORS.length] }}
                  ></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">{item.count}</span>
                  <span className="text-gray-500 ml-1">elections</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Election Status Distribution */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Election Status</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Status Legend */}
          <div className="mt-4 space-y-2">
            {statusData.map((item, index) => (
              <div key={item.status} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                  ></div>
                  <span className="text-gray-700">{item.status}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">{item.count}</span>
                  <span className="text-gray-500 ml-1">elections</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-3">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="font-medium text-blue-900">Most Popular Voting Type</p>
            <p className="text-blue-700">
              {votingTypeData.length > 0 
                ? votingTypeData.reduce((max, current) => current.count > max.count ? current : max).name
                : 'N/A'
              }
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="font-medium text-green-900">Platform Activity</p>
            <p className="text-green-700">
              {statusData.find(s => s.status === 'Active')?.count || 0} active elections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingTrendsChart;
