async function fetchAndPlotFNG(day_length = 7) {
    try {
        const response = await fetch(`https://api.alternative.me/fng/?limit=${day_length}`);
        const data = await response.json();

        const values = data.data.map(entry => parseInt(entry.value));
        const labels = data.data.map(entry =>
            new Date(parseInt(entry.timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        );

        plotChart(labels.reverse(), values.reverse());
    } catch (error) {
        console.error("Error fetching Fear & Greed Index:", error);
    }
}

let chartInstance = null;

function plotChart(labels, values) {
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const ctx = document.getElementById("fngChart").getContext("2d");

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
            label: "Fear & Greed Index",
            data: values,
            borderColor: "#BCFF2F",
            backgroundColor: "rgba(188, 255, 47, 0.1)",
            pointRadius: 0,         // 🔹 hides data point circles
            pointHoverRadius: 0,     // 🔹 hides hover effect on points
            fill: true,
            tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                    maxTicksLimit: 7,
                    autoSkip: true,
                    color: '#fff'
                    },
                    title: {
                        display: false,
                        text: 'Date',
                        color: '#fff'
                    },
                    grid: {
                        display: false,
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: false,
                        text: 'Fear & Greed Index',
                        color: '#fff'
                    },
                    ticks: {
                        color: '#fff'
                    },
                    position : 'right',
                    grid: {
                        display: false,
                    }
                },
            },
            maintainAspectRatio : false,
            plugins: {
                legend: {
                    display: false,
                },
                annotation: {
                    annotations: {
                    line80: {
                        type: 'line',
                        yMin: 80,
                        yMax: 80,
                        borderColor: 'rgba(255,255,255,0.5)',
                        borderWidth: 1,
                        label: {
                        content: 'Extreme Greed',
                        enabled: true,
                        position: 'start',
                        yAdjust: -10,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'rgba(255,255,255,0.8)'
                        }
                    },
                    line20: {
                        type: 'line',
                        yMin: 20,
                        yMax: 20,
                        borderColor: 'rgba(255,255,255,0.5)',
                        borderWidth: 1,
                        label: {
                        content: 'Extreme Fear',
                        enabled: true,
                        position: 'start',
                        yAdjust: -10,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'rgba(255,255,255,0.8)'
                        }
                    }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
                                
        }
    });
}



// Call the async function
fetchAndPlotFNG(7);