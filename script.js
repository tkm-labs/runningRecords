document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("runForm");
  const recordList = document.getElementById("recordList");
  const resetBtn = document.getElementById("resetBtn");

  // 🟦 保存処理
  form.addEventListener("submit", e => {
    e.preventDefault(); // ページリロード防止

    const date = document.getElementById("date").value;
    const distance = parseFloat(document.getElementById("distance").value);
    const time = parseFloat(document.getElementById("time").value);
    const memo = document.getElementById("memo").value;

    if (!date || !distance || !time) {
      alert("日付・距離・時間を入力してください。");
      return;
    }

    const pace = (time / distance).toFixed(2); // 分/km

    const record = { date, distance, time, pace, memo };
    const records = JSON.parse(localStorage.getItem("runRecords")) || [];
    records.push(record);
    localStorage.setItem("runRecords", JSON.stringify(records));

    alert("保存しました！");
    form.reset();
    loadRecords();
    updateCharts();
  });

  // 🟨 リセット処理
  resetBtn.addEventListener("click", () => {
    if (confirm("すべての記録を削除しますか？")) {
      localStorage.removeItem("runRecords");
      alert("全データを削除しました。");
      loadRecords();
      updateCharts();
    }
  });

  // 📋 記録一覧の表示
  function loadRecords() {
    const records = JSON.parse(localStorage.getItem("runRecords")) || [];
    recordList.innerHTML = "";

    records.slice().reverse().forEach(r => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <strong>${r.date}</strong> - ${r.distance}km / ${r.time}分 
        <br><small>ペース: ${r.pace}分/km ${r.memo ? "｜" + r.memo : ""}</small>
      `;
      recordList.appendChild(li);
    });
  }

  // 📊 グラフの更新
  function updateCharts() {
    const records = JSON.parse(localStorage.getItem("runRecords")) || [];
    if (records.length === 0) {
      const distCanvas = document.getElementById("distanceChart");
      const paceCanvas = document.getElementById("paceChart");
      distCanvas.replaceWith(distCanvas.cloneNode());
      paceCanvas.replaceWith(paceCanvas.cloneNode());
      return;
    }

    // 月ごとの合計距離
    const monthly = {};
    records.forEach(r => {
      const month = r.date.slice(0, 7);
      monthly[month] = (monthly[month] || 0) + r.distance;
    });

    const months = Object.keys(monthly);
    const distances = Object.values(monthly);

    // ペース推移
    const paces = records.map(r => parseFloat(r.pace));
    const dates = records.map(r => r.date);

    // グラフをリセット
    const distCanvas = document.getElementById("distanceChart");
    const paceCanvas = document.getElementById("paceChart");
    distCanvas.replaceWith(distCanvas.cloneNode());
    paceCanvas.replaceWith(paceCanvas.cloneNode());

    // 距離グラフ
    new Chart(document.getElementById("distanceChart"), {
      type: "bar",
      data: {
        labels: months,
        datasets: [{
          label: "月ごとの走行距離 (km)",
          data: distances,
          backgroundColor: "rgba(13,110,253,0.5)",
          borderColor: "rgba(13,110,253,1)",
          borderWidth: 1
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });

    // ペースグラフ
    new Chart(document.getElementById("paceChart"), {
      type: "line",
      data: {
        labels: dates,
        datasets: [{
          label: "ペース (分/km)",
          data: paces,
          borderColor: "rgba(40,167,69,1)",
          backgroundColor: "rgba(40,167,69,0.2)",
          tension: 0.3
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  }

  // 初期表示
  loadRecords();
  updateCharts();
});
