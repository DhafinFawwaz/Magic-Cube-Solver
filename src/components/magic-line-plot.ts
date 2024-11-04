import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from 'chart.js'

Chart.register(LineController, LineElement, LinearScale, CategoryScale, PointElement);

export class MagicLinePlot extends Chart {

    public setX(data: number[]) {
        this.data.labels = data;
    }

    public setY(data: number[]) {
        this.data.datasets[0].data = data;
    }

    public constructor(canvas: HTMLCanvasElement) {
        super(
            canvas, {
            type: 'line',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: 'My First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                }]
            },
            options: {
                scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                    color: "white"
                    }
                },
                x: {
                    grid: {
                    color: "white"
                    }
                }
                },
                color: "white",
            }
        })
    }
}