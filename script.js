document.getElementById("runForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const date = document.getElementById("date").value || new Date().toISOString().split("T")[0];
  const distance = parseFloat(document.getElementById("distance").value);
  const time = parseFloat(document.getElementById("time").value);
  const memo = document.getElementById("memo").value;

  if (!distance || !time) {
    alert("距離と時間を入力してください。");
    return;
  }

  // 平均時速（km/h）
  const speed = (distance / (time / 60)).toFixed(2);

  // ペース（1kmあたりの分:秒）
  const paceMinutes = time / distance;
  const paceMin = Math.floor(paceMinutes);
  const paceSec = Math.round((paceMinutes - paceMin) * 60);
  const paceStr = `${paceMin}:${paceSec.toString().padStart(2, "0")}/km`;

  const record = { date, distance, time, speed, pace: paceStr, memo };

  let records = JSON.parse(localStorage.getItem("runRecords")) || [];
  records.unshift(record); // 新しい順に追加
  localStorage.setItem("runRecords", JSON.stringify(records));

  showRecords();
  this.reset();
});

function showRecords() {
  const records = JSON.parse(localStorage.getItem("runRecords")) || [];
  const list = document.getElementById("recordList");
  list.innerHTML = "";

  if (records.length === 0) {
    list.innerHTML = `<li class="list-group-item text-muted">まだ記録がありません🏃‍♂️</li>`;
    return;
  }

  records.forEach((r, i) => {
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <strong>${r.date}</strong><br>
          距離: ${r.distance} km / 時間: ${r.time} 分 /
          <span class="text-success">🏃‍♂️ ${r.speed} km/h</span>
          <span class="text-primary">⏱ ${r.pace}</span>
          <small class="text-muted">${r.memo || ""}</small>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteRecord(${i})">削除</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function deleteRecord(index) {
  let records = JSON.parse(localStorage.getItem("runRecords")) || [];
  records.splice(index, 1);
  localStorage.setItem("runRecords", JSON.stringify(records));
  showRecords();
}

showRecords();

function updateCharts() {
  const data = JSON.parse(localStorage.getItem('runs')) || [];
  
  // 月ごとの合計距離
  const monthly = {};
  data.forEach(run => {
    const month = run.date.slice(0, 7); // "2025-10"
    monthly[month] = (monthly[month] || 0) + parseFloat(run.distance);
  });

  const months = Object.keys(monthly);
  const distances = Object.values(monthly);

  // 平均ペース
  const paces = data.map(run => run.pace);

  // 距離グラフ
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

  // ペースグラフ
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

// ページ読み込み時・記録変更時に呼ぶ
updateCharts();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('SW registration failed', err));
}
