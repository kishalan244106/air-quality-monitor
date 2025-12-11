/* -----------------------
   Firebase Configuration
------------------------*/
const firebaseConfig = {
  apiKey: "AIzaSyC6pyBexwauJDUu2WkmhvlTXQlV5SU__Ww",
  databaseURL: "https://kisha-86b74-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const device = "device01";

/* ELEMENTS */
const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");
const pressEl = document.getElementById("press");
const co2El = document.getElementById("co2");

/* LATEST VALUES */
db.ref(`/sensors/${device}/latest`).on("value", snap => {
  let d = snap.val();

  tempEl.innerHTML = d.aht10.temperature.toFixed(2);
  humEl.innerHTML = d.aht10.humidity.toFixed(2);
  pressEl.innerHTML = d.bmp280.pressure.toFixed(2);
  co2El.innerHTML = d.mhz19c.co2;
});

/* CHART CREATION FUNCTION (Gradient Support) */
function createChart(canvasId, label, color1, color2) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  let gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: label,
        data: [],
        borderColor: color1,
        backgroundColor: gradient,
        borderWidth: 3,
    tension: 0.35,
        fill: true
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "white" } }
      },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });
}

/* CREATE ALL 5 GRAPHS */
const co2Chart  = createChart("co2Chart",  "CO₂ ppm",        "#ff66ff", "#660066");
const tempChart = createChart("tempChart", "Temperature °C", "#ffcc00", "#663d00");
const humChart  = createChart("humChart",  "Humidity %",     "#00e6e6", "#004d4d");
const pressChart= createChart("pressChart","Pressure hPa",   "#c28cff", "#4b0082");
const vocChart  = createChart("vocChart",  "VOC Index",      "#ff884d", "#662200");

/* HISTORY UPDATES */
db.ref(`/sensors/${device}/history`).limitToLast(30).on("child_added", s => {
  let v = s.val();
  let time = new Date(v.timestamp).toLocaleTimeString();

  if (v.mhz19c) {
    co2Chart.data.labels.push(time);
    co2Chart.data.datasets[0].data.push(v.mhz19c.co2);
    co2Chart.update();
  }

  if (v.aht10) {
    tempChart.data.labels.push(time);
    tempChart.data.datasets[0].data.push(v.aht10.temperature);
    tempChart.update();

    humChart.data.labels.push(time);
    humChart.data.datasets[0].data.push(v.aht10.humidity);
    humChart.update();
  }

  if (v.bmp280) {
    pressChart.data.labels.push(time);
    pressChart.data.datasets[0].data.push(v.bmp280.pressure);
    pressChart.update();
  }

  if (v.voc) {
    vocChart.data.labels.push(time);
    vocChart.data.datasets[0].data.push(v.voc);
    vocChart.update();
  }
});

/* DARK MODE TOGGLE */
document.getElementById("modeBtn").onclick = () => {
  document.body.classList.toggle("dark");
};
