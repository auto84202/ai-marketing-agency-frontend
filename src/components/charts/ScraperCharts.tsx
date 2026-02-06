'use client';

import { useEffect, useRef } from 'react';

interface ChartData {
    labels: string[];
    values: number[];
}

interface PlatformChartProps {
    data: Record<string, number>;
    title?: string;
}

export function PlatformDistributionChart({ data, title = 'Platform Distribution' }: PlatformChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Colors for different platforms - Premium Palette
        const colors: Record<string, string> = {
            'FACEBOOK': '#1877f2',
            'LINKEDIN': '#0a66c2',
            'REDDIT': '#ff4500',
            'TWITTER': '#00acee',
            'INSTAGRAM': '#E4405F',
            'TIKTOK': '#000000',
        };

        // Calculate total and percentages
        const platforms = Object.keys(data);
        const values = Object.values(data);
        const total = values.reduce((sum, val) => sum + val, 0);

        if (total === 0) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Draw pie chart
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        let currentAngle = -Math.PI / 2;

        platforms.forEach((platform, index) => {
            const value = values[index];
            const percentage = value / total;
            const sliceAngle = percentage * 2 * Math.PI;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();

            ctx.fillStyle = colors[platform] || '#666';
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(percentage * 100)}%`, labelX, labelY);

            currentAngle += sliceAngle;
        });

        // Draw legend
        let legendY = 20;
        platforms.forEach((platform, index) => {
            const color = colors[platform] || '#666';
            const count = values[index];

            // Color box
            ctx.fillStyle = color;
            ctx.fillRect(10, legendY, 15, 15);

            // Text
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${platform}: ${count}`, 30, legendY + 12);

            legendY += 25;
        });

    }, [data]);

    return (
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">{title}</h3>
            <canvas ref={canvasRef} width={400} height={300} className="mx-auto" />
        </div>
    );
}

interface TimeSeriesChartProps {
    data: { timestamp: string; count: number }[];
    title?: string;
}

export function TimeSeriesChart({ data, title = 'Comments Over Time' }: TimeSeriesChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.count));

        if (maxValue === 0) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Draw axes
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Draw line chart
        ctx.strokeStyle = '#667eea';
        ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        ctx.lineWidth = 3;

        const stepX = chartWidth / (data.length - 1 || 1);

        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);

        data.forEach((point, index) => {
            const x = padding + index * stepX;
            const y = canvas.height - padding - (point.count / maxValue) * chartHeight;

            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Draw point
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Close path for fill
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.closePath();
        ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
        ctx.fill();

        // Draw the line again on top
        ctx.beginPath();
        data.forEach((point, index) => {
            const x = padding + index * stepX;
            const y = canvas.height - padding - (point.count / maxValue) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';

        // X-axis labels (time)
        data.forEach((point, index) => {
            if (index % Math.ceil(data.length / 6) === 0) {
                const x = padding + index * stepX;
                const time = new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                ctx.fillText(time, x, canvas.height - padding + 20);
            }
        });

        // Y-axis labels (count)
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = Math.round((maxValue / 5) * i);
            const y = canvas.height - padding - (value / maxValue) * chartHeight;
            ctx.fillText(value.toString(), padding - 10, y + 4);
        }

    }, [data]);

    return (
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">{title}</h3>
            <canvas ref={canvasRef} width={500} height={300} className="mx-auto" />
        </div>
    );
}

export function TimeDistributionChart({ data, title = 'Engagement by Time' }: { data: Record<string, number>, title?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const labels = Object.keys(data);
        const values = Object.values(data);
        const maxVal = Math.max(...values, 1);

        const padding = 50;
        const chartW = canvas.width - padding * 2;
        const chartH = canvas.height - padding * 2;
        const barW = chartW / labels.length - 20;

        // Draw Bars
        labels.forEach((label, i) => {
            const h = (values[i] / maxVal) * chartH;
            const x = padding + i * (chartW / labels.length) + 10;
            const y = canvas.height - padding - h;

            // Gradient per bar
            const grad = ctx.createLinearGradient(x, y, x, y + h);
            grad.addColorStop(0, '#8e2de2');
            grad.addColorStop(1, '#4a00e0');

            ctx.fillStyle = grad;
            if (ctx.roundRect) {
                ctx.roundRect(x, y, barW, h, [8, 8, 0, 0]);
                ctx.fill();
            } else {
                ctx.fillRect(x, y, barW, h);
            }

            // Labels
            ctx.fillStyle = '#4b5563';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + barW / 2, canvas.height - padding + 20);

            // Values
            ctx.fillStyle = '#1f2937';
            ctx.fillText(values[i].toString(), x + barW / 2, y - 10);
        });

        // X-Axis
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

    }, [data]);

    return (
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-6">{title}</h3>
            <canvas ref={canvasRef} width={500} height={300} className="mx-auto" />
        </div>
    );
}
