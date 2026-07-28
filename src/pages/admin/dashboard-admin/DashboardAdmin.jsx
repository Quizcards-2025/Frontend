import React, {forwardRef, useMemo, useState, useEffect} from 'react';
import {Box, Paper, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, Stack, Select, MenuItem, FormControl, InputLabel} from "@mui/material";
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {BarChart, LineChart} from "echarts/charts";
import {AxisPointerComponent, GridComponent, TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import * as echarts from 'echarts/core';
import IconifyIcon from "../../../components/base/IconifyIcon.jsx";
import RefreshIcon from '@mui/icons-material/Refresh';
import api from "src/apis/api.js";


echarts.use([BarChart, LineChart, TooltipComponent, GridComponent, AxisPointerComponent, CanvasRenderer]);

const ReactEchart = forwardRef((props, ref) => {
    const { option, ...rest } = props;

    return (
        <Box
            component={ReactEChartsCore}
            ref={ref}
            option={{
                ...option,
                tooltip: {
                    ...option.tooltip,
                    confine: true,
                },
            }}
            {...rest}
        />
    );
});

const TotalSpentChart = ({ data, ...rest }) => {
    const theme = useTheme();

    const option = useMemo(() => ({
        tooltip: {
            trigger: 'axis',
            formatter: 'Spent: ${c}',
            axisPointer: {
                type: 'line',
                axis: 'y',
                label: {
                    show: true,
                    formatter: (params) => {
                        return `$${params.value}`;
                    },
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    fontSize: theme.typography.caption.fontSize,
                    backgroundColor: theme.palette.info.light,
                    padding: [4, 4, 0, 4],
                },
                lineStyle: {
                    type: 'dashed',
                    color: theme.palette.primary.main,
                    width: 1,
                },
            },
        },
        grid: {
            top: '10%',
            left: '0%',
            right: '0%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category',
                data: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ],
                axisTick: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    margin: 15,
                    fontWeight: 500,
                    color: theme.palette.text.disabled,
                    fontSize: theme.typography.caption.fontSize,
                    fontFamily: theme.typography.fontFamily,
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                min: 100,
                minInterval: 1,
                axisLabel: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
            },
        ],
        series: [
            {
                name: 'Spent',
                type: 'bar',
                barWidth: '60%',
                data,
                itemStyle: {
                    color: theme.palette.info.dark,
                    borderRadius: [10, 10, 10, 10],
                },
                emphasis: {
                    itemStyle: {
                        color: theme.palette.primary.main,
                    },
                },
            },
        ],
    }), [theme, data]);

    return <ReactEchart echarts={echarts} option={option} {...rest} />;
};

const RevenueChart = ({ data, ...rest }) => {
    const theme = useTheme();
    const months = Array.from({length: 12}, (_, i) => i + 1);
    const year = data && data.length > 0 ? data[0].year : new Date().getFullYear();
    const chartData = months.map(month => {
        const found = data.find(item => item.month === month && item.year === year);
        return found ? Number(found.totalRevenue) : 0;
    });
    const xLabels = months.map(month => `${month}/${year}`);

    const option = useMemo(() => ({
        tooltip: {
            trigger: 'axis',
            formatter: params => {
                const p = params[0];
                return `${p.axisValue}<br/>Revenue: $${p.data.toLocaleString()}`;
            },
            axisPointer: {
                type: 'line',
                axis: 'y',
                label: {
                    show: true,
                    formatter: (params) => {
                        return `$${params.value}`;
                    },
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    fontSize: theme.typography.caption.fontSize,
                    backgroundColor: theme.palette.info.light,
                    padding: [4, 4, 0, 4],
                },
                lineStyle: {
                    type: 'dashed',
                    color: theme.palette.primary.main,
                    width: 1,
                },
            },
        },
        grid: {
            top: '10%',
            left: '0%',
            right: '0%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category',
                data: xLabels,
                axisTick: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    margin: 15,
                    fontWeight: 500,
                    color: theme.palette.text.disabled,
                    fontSize: theme.typography.caption.fontSize,
                    fontFamily: theme.typography.fontFamily,
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                min: 0,
                minInterval: 1,
                axisLabel: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
            },
        ],
        series: [
            {
                name: 'Revenue',
                type: 'line',
                data: chartData,
                itemStyle: {
                    color: theme.palette.success.dark,
                    borderRadius: [10, 10, 10, 10],
                },
                emphasis: {
                    itemStyle: {
                        color: theme.palette.primary.main,
                    },
                },
            },
        ],
    }), [theme, chartData, xLabels]);

    return <ReactEchart echarts={echarts} option={option} {...rest} />;
};

const DashboardAdmin = () => {
    const [topCreators, setTopCreators] = useState([]);
    const [topSets, setTopSets] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Lấy danh sách các năm có trong dữ liệu revenue
    const years = Array.from(new Set(revenueData.map(item => item.year)));
    useEffect(() => {
        if (years.length > 0 && !years.includes(selectedYear)) {
            setSelectedYear(years[0]);
        }
    }, [revenueData]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const creatorsResponse = await api.get('/v1/admin/top-creators');
            if (creatorsResponse.data.success) {
                setTopCreators(creatorsResponse.data.data);
            }
            const setsResponse = await api.get('/v1/admin/top-sets');
            if (setsResponse.data.success) {
                setTopSets(setsResponse.data.data);
            }
            const revenueResponse = await api.get('/v1/admin/revenue/statistics');
            if (revenueResponse.data.success) {
                setRevenueData(Array.isArray(revenueResponse.data.data) ? revenueResponse.data.data : []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Lọc dữ liệu theo năm được chọn
    const filteredRevenueData = revenueData.filter(item => item.year === selectedYear);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Dashboard Admin</Typography>
                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={fetchData}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            <Paper sx={{ height: 355, mb: 3, p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box>
                        <Typography variant="caption" color="text.disabled" fontWeight={500}>
                            Revenue Statistics
                        </Typography>
                        <Typography variant="h2" color="text.primary" mt={0.25}>
                            ${filteredRevenueData.reduce((sum, item) => sum + Number(item.totalRevenue), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </Typography>
                    </Box>
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        height={42}
                        width={42}
                        bgcolor="success.main"
                        borderRadius={1.75}
                    >
                        <IconifyIcon icon="ic:round-line-chart" color="primary.main" fontSize="h3.fontSize" />
                    </Stack>
                    {/* Dropdown chọn năm */}
                    <FormControl size="small" sx={{ minWidth: 100, ml: 2 }}>
                        <InputLabel id="select-year-label">Year</InputLabel>
                        <Select
                            labelId="select-year-label"
                            value={selectedYear}
                            label="Year"
                            onChange={e => setSelectedYear(Number(e.target.value))}
                        >
                            {years.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
                <RevenueChart
                    data={filteredRevenueData}
                    sx={{ height: '230px !important' }}
                />
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper sx={{ p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>Top Creators</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>User ID</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Username</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Avatar</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Set Count</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topCreators.map((creator) => (
                                        <TableRow 
                                            key={creator.userId}
                                            sx={{ 
                                                '&:hover': { 
                                                    backgroundColor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{creator.userId}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{creator.userName}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                                                <img src={creator.avatar} alt={creator.userName} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{creator.setCount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                    <Paper sx={{ p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>Top Sets</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Set ID</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Anonymous</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>User ID</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Avatar</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Username</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Total Cards</TableCell>
                                        <TableCell sx={{ fontWeight: 500, backgroundColor: 'background.paper', borderBottom: '2px solid #e0e0e0' }}>Interaction Count</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topSets.map((set) => (
                                        <TableRow 
                                            key={set.setId}
                                            sx={{ 
                                                '&:hover': { 
                                                    backgroundColor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{set.setId}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{set.title}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{set.isAnonymous ? 'Yes' : 'No'}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{set.userId}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                                                <img src={set.avatar} alt={set.userName} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{set.userName}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{set.totalCard}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{set.userInteractionCount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default DashboardAdmin;