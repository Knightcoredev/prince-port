import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, ShowChart } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Holding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  purchasePrice: number;
  value: number;
  change24h: number;
  changePercent24h: number;
}

interface PortfolioStats {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  topGainer: Holding;
  topLoser: Holding;
}

const Portfolio: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [holdingsRes, chartRes] = await Promise.all([
        fetch('/api/portfolio/holdings'),
        fetch('/api/portfolio/chart?period=7d')
      ]);

      const holdingsData = await holdingsRes.json();
      const chartDataRes = await chartRes.json();

      setHoldings(holdingsData.holdings || []);
      setStats(holdingsData.stats || null);
      setChartData(chartDataRes.chartData || null);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Portfolio Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccountBalance color="primary" />
                <Typography variant="h6" ml={1}>
                  Total Value
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(stats?.totalValue || 0)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {(stats?.totalChangePercent || 0) >= 0 ? (
                  <TrendingUp color="success" />
                ) : (
                  <TrendingDown color="error" />
                )}
                <Typography
                  variant="body2"
                  color={(stats?.totalChangePercent || 0) >= 0 ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {formatPercent(stats?.totalChangePercent || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                24h Change
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={(stats?.totalChange || 0) >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(stats?.totalChange || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Gainer
              </Typography>
              {stats?.topGainer && (
                <>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.topGainer.symbol}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {formatPercent(stats.topGainer.changePercent24h)}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Loser
              </Typography>
              {stats?.topLoser && (
                <>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.topLoser.symbol}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    {formatPercent(stats.topLoser.changePercent24h)}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Chart */}
      {chartData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Portfolio Performance (7 Days)
            </Typography>
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value as number);
                      },
                    },
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Holdings List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Holdings
          </Typography>
          <Grid container spacing={2}>
            {holdings.map((holding) => (
              <Grid item xs={12} key={holding.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {holding.symbol}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {holding.name}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {holding.amount.toFixed(8)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Price
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(holding.currentPrice)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Value
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(holding.value)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          24h Change
                        </Typography>
                        <Box display="flex" alignItems="center">
                          {holding.changePercent24h >= 0 ? (
                            <TrendingUp color="success" fontSize="small" />
                          ) : (
                            <TrendingDown color="error" fontSize="small" />
                          )}
                          <Typography
                            variant="body2"
                            color={holding.changePercent24h >= 0 ? 'success.main' : 'error.main'}
                            ml={0.5}
                          >
                            {formatPercent(holding.changePercent24h)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={1}>
                        <Chip
                          label={holding.value > holding.amount * holding.purchasePrice ? 'Profit' : 'Loss'}
                          color={holding.value > holding.amount * holding.purchasePrice ? 'success' : 'error'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Portfolio;