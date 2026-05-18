document.addEventListener('DOMContentLoaded', () => {
    const inputsGrid = document.getElementById('inputsGrid');
    const defaultData = [120, 135, 150, 145, 160, 180, 175, 190, 210, 220, 215, 230];
    
    // Generate 12 inputs
    for (let i = 0; i < 12; i++) {
        const group = document.createElement('div');
        group.className = 'input-group';
        group.innerHTML = `
            <label for="month${i+1}">${i+1}-Oy</label>
            <input type="number" id="month${i+1}" value="${defaultData[i]}" required>
        `;
        inputsGrid.appendChild(group);
    }

    const form = document.getElementById('salesForm');
    let chartInstance = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Hisoblanmoqda...';
        submitBtn.disabled = true;

        const sales = [];
        for (let i = 1; i <= 12; i++) {
            sales.push(parseFloat(document.getElementById(`month${i}`).value));
        }

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sales })
            });
            
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('resultSection').style.display = 'block';
                document.getElementById('predictionValue').textContent = data.prediction.toLocaleString();
                document.getElementById('equationText').textContent = 'Trend: ' + data.equation;
                
                renderChart(data);
                
                // Scroll to results
                setTimeout(() => {
                    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Serverga ulanishda xatolik yuz berdi. Iltimos, backend ishlayotganini tekshiring.");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    function renderChart(data) {
        const ctx = document.getElementById('salesChart').getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Add 13th month label
        const labels = [...data.labels, "Prognoz (13-oy)"];
        
        // Prepare data arrays
        const actualData = [...data.actuals, null];
        const trendData = [...data.trend, null];
        const predictionData = Array(12).fill(null);
        predictionData.push(data.prediction);

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Haqiqiy Sotuvlar',
                        data: actualData,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderWidth: 3,
                        pointBackgroundColor: '#6366f1',
                        pointRadius: 6,
                        tension: 0.4
                    },
                    {
                        label: 'Trend Chizig\'i (Regressiya)',
                        data: trendData,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        tension: 0
                    },
                    {
                        label: 'Kutilayotgan Prognoz',
                        data: predictionData,
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 10,
                        pointStyle: 'star'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 13 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }
});
