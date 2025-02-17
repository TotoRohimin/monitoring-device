// Inisialisasi Supabase
const SUPABASE_URL = "http://202.159.35.232:8000"; // Ganti dengan URL Anda
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q"; // Ganti dengan API Key Anda

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Ambil data dari Supabase
const fetchData = async () => {
  const { data, error } = await supabaseClient
    .from("ESP32_001") // Ganti dengan nama tabel Anda
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  return data;
};

// Fungsi untuk render tabel dengan limit 15 row terakhir
const renderTable = (deviceData) => {
  const tableBody = document.getElementById("data-table");
  tableBody.innerHTML = "";

  // Ambil 15 data terakhir
  const limitedData = deviceData.slice(-15);

  limitedData.forEach((device) => {
    const row = `
      <tr>
        <td>${new Date(device.created_at).toLocaleString()}</td>
        <td>${parseFloat(device.ph).toFixed(2)}</td>
        <td>${parseFloat(device.temperature).toFixed(2)}</td>
        <td>${parseFloat(device.tds).toFixed(2)}</td>
      </tr>`;
    tableBody.innerHTML += row;
  });
};

// Fungsi untuk render grafik
const renderChart = (deviceData) => {
  const ctx = document.getElementById("deviceChart").getContext("2d");
  const recentData = deviceData.slice(-10); // Hanya ambil 10 data terakhir untuk grafik

  const phData = recentData.map((d) => parseFloat(d.ph));
  const temperatureData = recentData.map((d) => parseFloat(d.temperature));
  const tdsData = recentData.map((d) => parseFloat(d.tds));
  const labels = recentData.map((d) => new Date(d.created_at).toLocaleString());

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "pH",
          data: phData,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Temperature",
          data: temperatureData,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "TDS",
          data: tdsData,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

// Fungsi untuk memperbarui kartu (pH, Temperatur, TDS, Status)
const updateCards = (latestData) => {
  if (!latestData) return;

  const phCard = document.getElementById("ph-value");
  const tempCard = document.getElementById("temperature-value");
  const tdsCard = document.getElementById("tds-value");
  const statusCard = document.getElementById("water-status");

  phCard.textContent = parseFloat(latestData.ph).toFixed(2);
  tempCard.textContent = parseFloat(latestData.temperature).toFixed(2);
  tdsCard.textContent = parseFloat(latestData.tds).toFixed(2);

  const isCleanWater = parseFloat(latestData.ph) >= 6.5 && parseFloat(latestData.ph) <= 8.5 && parseFloat(latestData.tds) < 500;

  statusCard.textContent = isCleanWater ? "Air Bersih" : "Belum Bersih";
  statusCard.style.color = isCleanWater ? "green" : "red";
};

// Jalankan aplikasi
const initialize = async () => {
  const deviceData = await fetchData();
  if (!deviceData || deviceData.length === 0) return;

  renderTable(deviceData);
  renderChart(deviceData);

  const latestData = deviceData[deviceData.length - 1];
  updateCards(latestData);

  setInterval(async () => {
    const updatedData = await fetchData();
    if (updatedData && updatedData.length > 0) {
      const newLatestData = updatedData[updatedData.length - 1];
      updateCards(newLatestData);
      renderTable(updatedData); // Perbarui tabel dengan data terbaru
    }
  }, 5000);
};

initialize();
