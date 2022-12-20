<script>
    import { onMount } from 'svelte';
    import { Line } from 'svelte-chartjs';
  
    export let data = []

    import {
      Chart as ChartJS,
      Title,
      Tooltip,
      LineElement,
      LinearScale,
      PointElement,
      CategoryScale,
      Filler,
    } from 'chart.js';
  
    ChartJS.register(
      Title,
      Tooltip,
      Filler,
      LineElement,
      LinearScale,
      PointElement,
      CategoryScale
    );

    const CHART_COLORS = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    $: chartData = getChartData(data)

    const getChartData = (arr) => {
        let labels = []
        let dataset = {
            label: 'Rewards',
            fill: true,
            borderColor: CHART_COLORS.purple,
            backgroundColor: "rgba(153, 102, 255, 0.4)",
            data: [],
        }
        for (let i=0; i < arr.length; i++) {
            labels.push(arr[i].date)
            dataset.data.push(arr[i].amount)
        } 
        return {
            labels,
            datasets: [dataset],
        }
    }

  </script>
  
  <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  }}} />