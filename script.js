const CORONA_TRAFFIC_URL = 'https://knudmoeller.github.io/berlin_corona_cases/data/target/berlin_corona_traffic_light.json';

const COLORS = {
    green: [0, 128, 0],
    yellow: [255, 255, 0],
    red: [255, 0, 0]
}

function getRGBA(color, alpha = 1) {
    return `rgba(${color.join(',')},${alpha})`;
}

const INDICATORS = [
    {
        key: 'basic_reproduction_number',
        canvas: 'chart-reproduction',
        thresholds: [1.1, 1.2],
        title: 'Reproduktionsrate R',
        stepSize: 0.5
    },
    {
        key: 'incidence_new_infections',
        canvas: 'chart-infections',
        thresholds: [20, 30],
        title: 'Neuinfektionen',
        subtitle: 'je 100.000 Einwohner*innen',
        stepSize: 5
    },
    {
        key: 'icu_occupancy_rate',
        canvas: 'chart-icu',
        thresholds: [15, 25],
        title: 'Krankenhausbetten',
        subtitle: 'Anteil Covid Patienten in %',
        stepSize: 5
    }
]

function getMinDate(rawData) {
    const urlParams = new URLSearchParams(window.location.search);
    let minDate = new Date(urlParams.get('min')).getTime();
    if (isNaN(minDate)) {
        minDate = new Date(rawData[0]['pr_date']).getTime();
    }
    return minDate;
}

function getMaxDate(rawData) {
    const urlParams = new URLSearchParams(window.location.search);
    let maxDate = new Date(urlParams.get('max')).getTime();
    if (isNaN(maxDate)) {
        maxDate = new Date(rawData[-1]['pr_date']).getTime();
    }
    return maxDate;
}

function render(key, rawData, dateBounds) {
    const config = INDICATORS.find(e => e.key === key);
    const dataset = getDataset(rawData, key);

    var ctx = document.getElementById(config.canvas).getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [dataset]
        },
        options: {
            responsive: true,
            legend: {
                display: false
            },
            title: {
                text: config.title,
                display: true,
                padding: 18
            },
            scales: {
                xAxes: [{
                    id: 'x-axis-0',
                    type: 'time',
                    display: true,
                    time: {
                        stepSize: 7
                    },
                    ticks: {
                        min: dateBounds['min'],
                        max: dateBounds['max']
                    }
                }],
                yAxes: [{
                    id: 'y-axis-0',
                    display: true,
                    ticks: {
                        stepSize: config.stepSize,
                        suggestedMin: 0,
                        suggestedMax: config.thresholds[1] * 1.15
                    }
                }]
            },
            annotation: {
                drawTime: 'beforeDatasetsDraw',
                annotations: [{
                    type: 'box',
                    xScaleID: 'x-axis-0',
                    yScaleID: 'y-axis-0',
                    xMin: dataset.data[0].x,
                    yMax: config.thresholds[0],
                    backgroundColor: getRGBA(COLORS.green, 0.2),
                    borderWidth: 0,
                }, {
                    type: 'box',
                    xScaleID: 'x-axis-0',
                    yScaleID: 'y-axis-0',
                    xMin: dataset.data[0].x,
                    yMin: config.thresholds[0],
                    yMax: config.thresholds[1],
                    backgroundColor: getRGBA(COLORS.yellow, 0.2),
                    borderWidth: 0,
                }, {
                    type: 'box',
                    xScaleID: 'x-axis-0',
                    yScaleID: 'y-axis-0',
                    xMin: dataset.data[0].x,
                    yMin: config.thresholds[1],
                    backgroundColor: getRGBA(COLORS.red, 0.2),
                    borderWidth: 0,
                }]
            },
            plugins: {
                chartJsPluginSubtitle: {
                    display: !!config.subtitle,
                    text: config.subtitle
                }
            }
        }
    });
}

async function getData() {
    return (await fetch(CORONA_TRAFFIC_URL)).json();
}

function rawToChartJSElement(rawElement, key) {
    return {
        x: moment(rawElement.pr_date),
        y: rawElement.indicators[key].value
    };
}

function getDataset(data, key) {
    return {
        data: data.map(e => rawToChartJSElement(e, key)),
        pointBackgroundColor: data.map(e => e.indicators[key].color),
    }
}

async function renderDocument(snippets) {
    const rawData = await getData();
    rawData.reverse();

    const dateBounds = {
        min: getMinDate(rawData),
        max: getMaxDate(rawData)
    }

    console.log("minDate: " + dateBounds['min']);
    console.log("maxDate: " + dateBounds['max']);

    snippets.forEach(function (snippet) {
        render(snippet['data_key'], rawData, dateBounds);
    });
}
