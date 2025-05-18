const ctx = document.getElementById('depthChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
            label: 'Asks', // sell
            data: [],
            borderColor:"#E93543",
            backgroundColor: 'rgba(233, 53, 67, 0.5)',
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: true,
            stepped: true,
            tension: 0.3
            },
            {
            label: 'Bids', // buy
            data: [],
            borderColor:  "#1F9784",
            backgroundColor: 'rgba(31, 151, 132, 0.5)',
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: true,
            stepped: true,
            }
        ]
    },
    options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        animation: true,
        plugins: {
            legend: { position: 'top', display: false },
            tooltip: {
                callbacks: {
                    title: items => `Price: ${items[0].label}`,
                    label: item => `Qty: ${item.raw}`
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },

        scales: {
            x: {
                title: { display: false, text: 'Quantity (BTC)', color: '#fff' },
                reverse: true,  // Bar direction: right to left
                grid: {
                    display: false,
                    color: '#fff'
                },
                ticks:{
                    color: '#fff',
                    autoSkip: true,
                    maxTicksLimit: 6,
                    callback: function(value, index, ticks) {
                        if (index === 0 || index === ticks.length - 1) return '';
                        return this.getLabelForValue(value);
                    }
                }
            },
            y: {
                title: { display: false, text: 'Price (USDT)', color: '#fff' },
                position: 'right',
                reverse: false, // Asks on top
                ticks: {
                    mirror: true,
                    padding: -10,
                    align: 'start',
                    autoSkip: true,
                    maxTicksLimit: 7,
                    color: '#fff'
                },
                grid: {
                    display: false,
                }
            }
        }
    }
});

async function fetchCoinbaseOrderBook(){
    const MAX_LEVELS = 2500;

    try {
        const res = await fetch('https://api.exchange.coinbase.com/products/BTC-USD/book?level=2');
        const { bids, asks } = await res.json();

        // Limit data
        const topBids = bids.slice(0, MAX_LEVELS);
        const topAsks = asks.slice(0, MAX_LEVELS);
        //const topBids = bids;
        //const topAsks = asks;

        const process = (entries, isBid) => {
        // Parse and sort prices
        const sorted = entries.map(([price, size]) => [parseFloat(price), parseFloat(size)]);
        sorted.sort((a, b) => isBid ? b[0] - a[0] : a[0] - b[0]);

        // Accumulate quantities
        const prices = [];
        const cumQuantities = [];

        let total = 0;
        for (const [price, qty] of sorted) {
            total += qty;
            prices.push(price.toFixed(2));
            cumQuantities.push(total);
        }

        return { labels: prices, bins: cumQuantities };
        };

        const bid = process(topBids, true);
        const ask = process(topAsks, false);

        // Make sure both datasets are aligned
        const labels = [...ask.labels.reverse(), ...bid.labels]; // Reverse ask for left side
        const askData = [...ask.bins.reverse(), ...Array(bid.bins.length).fill(null)];
        const bidData = [...Array(ask.bins.length).fill(null), ...bid.bins];

        chart.data.labels = labels;
        chart.data.datasets[0].data = askData;
        chart.data.datasets[1].data = bidData;
        chart.update();
    } catch (err) {
        console.error('Error fetching Coinbase order book:', err);
    }
}


async function fetchBinanceOrderBook() {
    try {
        const res = await fetch('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5000');
        const { bids, asks } = await res.json();

        const process = (entries, isBid) => {
        // Parse and sort prices (descending for bids, ascending for asks)
        const sorted = entries.map(([p, q]) => [parseFloat(p), parseFloat(q)]);
        sorted.sort((a, b) => isBid ? b[0] - a[0] : a[0] - b[0]);

        // Aggregate quantities by exact price
        const priceMap = new Map();
        for (const [price, qty] of sorted) {
            priceMap.set(price, (priceMap.get(price) || 0) + qty);
        }

        // Extract sorted unique prices and quantities
        const prices = Array.from(priceMap.keys());
        const quantities = prices.map(p => priceMap.get(p));

        // For asks, reverse for cumulative sum calculation
        if (!isBid) {
            prices.reverse();
            quantities.reverse();
        }

        // Calculate cumulative quantities
        for (let i = 1; i < quantities.length; i++) {
            quantities[i] += quantities[i - 1];
        }

        // Reverse back asks after cumulative sum
        if (!isBid) {
            prices.reverse();
            quantities.reverse();
        }

        // Format labels as price strings with 2 decimals
        const labels = prices.map(p => p.toFixed(2));

        return { bins: quantities, labels };
        };

        const bid = process(bids, true);
        const ask = process(asks, false);

        // Combine ask labels on top, bid labels on bottom
        const labels = [...ask.labels, ...bid.labels];
        const askData = [...ask.bins, ...Array(bid.labels.length).fill(null)];
        const bidData = [...Array(ask.labels.length).fill(null), ...bid.bins];

        chart.data.labels = labels;
        chart.data.datasets[0].data = askData;
        chart.data.datasets[1].data = bidData;
        chart.update();
    } catch (err) {
        console.error('Error fetching order book:', err);
    }
}

//fetchBinanceOrderBook();
//setInterval(fetchBinanceOrderBook, 2000);
fetchCoinbaseOrderBook();
setInterval(fetchCoinbaseOrderBook, 5000)