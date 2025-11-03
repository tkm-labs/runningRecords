function updateCharts() {
  const data = JSON.parse(localStorage.getItem('runRecords')) || [];
  
  // 月ごとの合計距離
  const monthly = {};
  data.forEach(run => {
    const month = run.date.slice(0, 7); // "2025-10"
    monthly[month] = (monthly[month] || 0) + parseFloat(run.distance);
  });

  const months = Object.keys(monthly);
  const distances = Object.values(monthly);

  // 平均ペース（分/km）を数値で取得
  const paces = data.map(run => {
    const [min, sec] = run.pace.split(":")[0].split("/");
    return parseFloat(min) + parseFloat(sec || 0) / 60;
  });

  // 距離グラフ
  if (document.getElementById('distanceChart')) {
    new Chart(document.getElementById('distanceChart'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: '走行距離 (km)',
          data: distances,
          borderWidth: 1
        }]
      }
    });
  }

  // ペースグラフ
  if (document.getElementById('paceChart')) {
    new Chart(document.getElementById('paceChart'), {
      type: 'line',
      data: {
        labels: data.map(r => r.date),
        datasets: [{
          label: 'ペース (分/km)',
          data: paces,
          borderColor: 'blue',
          tension: 0.3
        }]
      }
    });
  }
}
