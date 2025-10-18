const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,brl";
const INTERVALO_MS = 10000;

const priceUsdEl = document.getElementById('price-usd');
const priceEurEl = document.getElementById('price-eur');
const priceBrlEl = document.getElementById('price-brl');
const updateTimeEl = document.getElementById('last-update-time');
const errorEl = document.getElementById('error-message');

const btcInput = document.getElementById('btc-input');
const convertedUsd = document.getElementById('converted-usd');
const convertedEur = document.getElementById('converted-eur');
const convertedBrl = document.getElementById('converted-brl');

const arrowUsd = document.getElementById('arrow-usd');
const arrowEur = document.getElementById('arrow-eur');
const arrowBrl = document.getElementById('arrow-brl');

let previousPrice = { usd: 0, eur: 0, brl: 0 };
let priceHistory = [];

const ctx = document.getElementById('price-chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'USD', data: [], borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.2)', fill: true, tension: 0.4 },
            { label: 'EUR', data: [], borderColor: '#2196F3', backgroundColor: 'rgba(33,150,243,0.2)', fill: true, tension: 0.4 },
            { label: 'BRL', data: [], borderColor: '#FF9800', backgroundColor: 'rgba(255,152,0,0.2)', fill: true, tension: 0.4 },
        ]
    },
    options: {
        responsive: true,
        animation: { duration: 800 },
        plugins: { legend: { labels: { color: '#f0f6fc' } } },
        scales: { x: { ticks: { color: '#f0f6fc' } }, y: { ticks: { color: '#f0f6fc' } } }
    }
});

function formatarMoeda(valor, codigoMoeda, locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: codigoMoeda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

async function atualizarValores() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar o preço do Bitcoin.');
        const data = await response.json();
        const bitcoinPreco = data.bitcoin;

        const infos = [
            { el: priceUsdEl, arrow: arrowUsd, valor: bitcoinPreco.usd, prev: previousPrice.usd, code: 'USD', locale: 'en-US' },
            { el: priceEurEl, arrow: arrowEur, valor: bitcoinPreco.eur, prev: previousPrice.eur, code: 'EUR', locale: 'de-DE' },
            { el: priceBrlEl, arrow: arrowBrl, valor: bitcoinPreco.brl, prev: previousPrice.brl, code: 'BRL', locale: 'pt-BR' }
        ];

        infos.forEach(info => {
            info.el.textContent = formatarMoeda(info.valor, info.code, info.locale);
            const container = info.el.parentElement;
            container.classList.remove('up', 'down');
            info.arrow.textContent = '↔';
            if (info.valor > info.prev) { container.classList.add('up'); info.arrow.textContent = '↑'; }
            else if (info.valor < info.prev) { container.classList.add('down'); info.arrow.textContent = '↓'; }
        });

        previousPrice = { ...bitcoinPreco };
        updateTimeEl.textContent = `Última atualização: ${new Date().toLocaleTimeString()}`;
        errorEl.textContent = '';

        const now = new Date().toLocaleTimeString();
        priceHistory.push({ time: now, ...bitcoinPreco })
        if (priceHistory.length > 30) priceHistory.shift();
        // Atualiza o gráfico
        chart.data.labels = priceHistory.map(p => p.time);
        chart.data.datasets[0].data = priceHistory.map(p => p.usd);
        chart.data.datasets[1].data = priceHistory.map(p => p.eur);
        chart.data.datasets[2].data = priceHistory.map(p => p.brl);
        chart.update();

        // Atualiza conversões
        const btcValue = parseFloat(btcInput.value) || 0;
        convertedUsd.textContent = formatarMoeda(btcValue * bitcoinPreco.usd, 'USD', 'en-US');
        convertedEur.textContent = formatarMoeda(btcValue * bitcoinPreco.eur, 'EUR', 'de-DE');
        convertedBrl.textContent = formatarMoeda(btcValue * bitcoinPreco.brl, 'BRL', 'pt-BR');

    } catch (error) {
        console.error(error);
        errorEl.textContent = 'Erro ao atualizar os valores.';
    }
}

// Atualiza valores a cada INTERVALO_MS
atualizarValores();
setInterval(atualizarValores, INTERVALO_MS);

// Atualiza conversões ao digitar BTC
btcInput.addEventListener('input', atualizarValores);
