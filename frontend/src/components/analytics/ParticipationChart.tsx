import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ElectionAnalytics } from '../../contexts/AnalyticsContext';

interface ParticipationChartProps {
  electionAnalytics: ElectionAnalytics[];
}

const ParticipationChart: React.FC<ParticipationChartProps> = ({ electionAnalytics }) => {
  // Prepare data for the chart
  const chartData = electionAnalytics.map((analytics, index) => {
    const totalVotes = analytics.voteCounts.reduce((sum, count) => sum + count, 0);
    return {
      id: `Election ${analytics.election.id}`,
      shortId: `E${analytics.election.id}`,
      totalVotes,
      participationRate: analytics.participationRate,
      status: analytics.isActive ? 'Active' : analytics.isEnded ? 'Ended' : 'Upcoming',
      votingType: analytics.election.votingType,
      question: analytics.election.question.length > 30 
        ? analytics.election.question.substring(0, 30) + '...' 
        : analytics.election.question
    };
  }).sort((a, b) => parseInt(a.shortId.substring(1)) - parseInt(b.shortId.substring(1)));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.id}</p>
          <p className="text-sm text-gray-600 mb-2">{data.question}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Total Votes:</span> {data.totalVotes}
            </p>
            <p className="text-sm">
              <span className="font-medium">Participation:</span> {data.participationRate.toFixed(1)}%
            </p>
            <p className="text-sm">
              <span className="font-medium">Type:</span> {data.votingType}
            </p>
            <p className="text-sm">
              <span className="font-medium">Status:</span> 
              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                data.status === 'Active' ? 'bg-green-100 text-green-800' :
                data.status === 'Ended' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {data.status}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Participation Overview</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600">No election data available for participation analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Participation Overview</h3>
          <p className="text-sm text-gray-600">Vote counts and participation rates by election</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Total Votes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Participation %</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="shortId" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="votes"
              orientation="left"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="participation"
              orientation="right"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="votes"
              dataKey="totalVotes" 
              fill="#3b82f6" 
              name="Total Votes"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="participation"
              dataKey="participationRate" 
              fill="#10b981" 
              name="Participation Rate (%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {chartData.reduce((sum, item) => sum + item.totalVotes, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Votes Cast</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {chartData.length > 0 
                ? (chartData.reduce((sum, item) => sum + item.participationRate, 0) / chartData.length).toFixed(1)
                : 0}%
            </p>
            <p className="text-sm text-gray-600">Average Participation</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {chartData.filter(item => item.status === 'Active').length}
            </p>
            <p className="text-sm text-gray-600">Active Elections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipationChart;
