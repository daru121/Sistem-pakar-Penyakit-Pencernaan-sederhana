// nilai fungsi massa untuk setiap gejala
const massValues = {
    G1: {
        D1: 0.6,
        D2: 0.3,
        'D1,D2': 0.05,
        'θ': 0.05
    },
    G2: {
        D2: 0.7,
        D3: 0.1,
        'D2,D3': 0.1,
        'θ': 0.1
    },
    G3: {
        D1: 0.2,
        D3: 0.6,
        'D1,D2': 0.1,
        'θ': 0.1
    },
    G4: {
        D3: 0.8,
        'θ': 0.2
    },
    G5: {
        D1: 0.1,
        D2: 0.1,
        D3: 0.4,
        'θ': 0.4
    }
};

// nama penyakit
const diseases = {
    D1: "Gastritis",
    D2: "Gastritis Kronis",
    D3: "Infeksi Usus"
};

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', function() {
    populateMassFunctionTable();
    document.getElementById('diagnose').addEventListener('click', performDiagnosis);
    document.getElementById('reset').addEventListener('click', resetForm);
    
    // Menambahkan event listener untuk modal
    document.getElementById('showCalculations').addEventListener('click', showCalculationModal);
    document.getElementById('closeModal').addEventListener('click', hideCalculationModal);
    document.getElementById('calculationModal').addEventListener('click', function(e) {
        if (e.target === this) hideCalculationModal();
    });

    // Menambahkan event listener untuk modal peringatan
    document.getElementById('closeAlert').addEventListener('click', hideAlertModal);
    document.getElementById('alertModal').addEventListener('click', function(e) {
        if (e.target === this) hideAlertModal();
    });
});

function showCalculationModal() {
    const modal = document.getElementById('calculationModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function hideCalculationModal() {
    const modal = document.getElementById('calculationModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Menampilkan modal peringatan
function showAlertModal() {
    const modal = document.getElementById('alertModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Menyembunyikan modal peringatan
function hideAlertModal() {
    const modal = document.getElementById('alertModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Mengisi tabel fungsi massa
function populateMassFunctionTable() {
    const tbody = document.getElementById('mass-function-table');
    
    // Membersihkan konten yang ada
    tbody.innerHTML = '';
    
    // Menambahkan baris data
    for (const symptom in massValues) {
        const row = document.createElement('tr');
        
        // Sel nama gejala
        const symptomCell = document.createElement('td');
        symptomCell.textContent = getSymptomName(symptom);
        symptomCell.className = 'text-left px-4 py-2 border';
        row.appendChild(symptomCell);
        
        const columns = ['D1', 'D2', 'D3', 'D1,D2', 'D1,D3', 'D2,D3', 'θ'];
        columns.forEach(key => {
            const cell = document.createElement('td');
            cell.className = 'px-4 py-2 border text-center';
            const value = massValues[symptom][key] || 0;
            cell.textContent = value.toFixed(2);
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    }
}

function getSymptomName(code) {
    const symptoms = {
        G1: "Nyeri perut bagian atas",
        G2: "Mual dan muntah",
        G3: "Perut kembung",
        G4: "Diare",
        G5: "Penurunan berat badan"
    };
    return `${code} - ${symptoms[code]}`;
}

// Tambahkan fungsi ini di tingkat atas
function showLoading() {
    const loadingContainer = document.querySelector('.loading-container');
    const loadingBar = document.querySelector('.loading-bar');
    loadingContainer.style.display = 'flex';
    
    // Reset progress
    loadingBar.style.width = '0%';
    
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        loadingBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 20);
}

function hideLoading() {
    const loadingContainer = document.querySelector('.loading-container');
    loadingContainer.style.display = 'none';
}

// Update fungsi performDiagnosis
function performDiagnosis() {
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom-checkbox:checked'))
        .map(checkbox => checkbox.id);
    
    if (selectedSymptoms.length === 0) {
        showAlertModal();
        return;
    }

    // Sembunyikan hasil sebelumnya
    document.getElementById('result').classList.add('hidden');
    
    // Tampilkan loading
    showLoading();

    // Simulasi waktu proses untuk UX yang lebih baik
    setTimeout(() => {
        let result = null;
        let calculationSteps = [];

        // Lakukan perhitungan dengan nomor fungsi massa yang benar
        selectedSymptoms.forEach((symptom, index) => {
            if (index === 0) {
                result = { ...massValues[symptom] };
                calculationSteps.push({
                    step: 1,
                    description: `Inisialisasi dengan gejala ${symptom}`,
                    values: { ...result }
                });
            } else {
                const prevResult = { ...result };
                result = combineEvidence(prevResult, massValues[symptom]);
                
                // Hitung nomor langkah yang benar berdasarkan pola
                let stepNumber;
                if (selectedSymptoms.length <= 2) {
                    stepNumber = index + 1;
                } else {
                    // Untuk 3+ gejala: langkah akan menjadi 3, 5, 7, 9
                    stepNumber = index * 2 + 1;
                }

                calculationSteps.push({
                    step: stepNumber,
                    description: `Kombinasi dengan gejala ${symptom}`,
                    values: { ...result },
                    prevValues: prevResult,
                    currentValues: massValues[symptom]
                });
            }
        });

        // Sembunyikan loading dan tampilkan hasil
        hideLoading();
        displayResults(result, calculationSteps);
        
        // Tampilkan hasil dengan animasi
        const resultSection = document.getElementById('result');
        resultSection.classList.remove('hidden');
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        
        // Trigger reflow
        resultSection.offsetHeight;
        
        // Tambahkan animasi
        resultSection.style.transition = 'all 0.6s ease-out';
        resultSection.style.opacity = '1';
        resultSection.style.transform = 'translateY(0)';
    }, 2000);
}

function combineEvidence(mass1, mass2) {
    const result = {};
    let conflictSum = 0;

    // Hitung irisan dan konflik
    for (const key1 in mass1) {
        for (const key2 in mass2) {
            const intersection = getIntersection(key1, key2);
            const product = mass1[key1] * mass2[key2];

            if (intersection === null) {
                conflictSum += product;
            } else {
                result[intersection] = (result[intersection] || 0) + product;
            }
        }
    }

    // Normalisasi hasil
    if (conflictSum !== 1) {  // Tambahkan pengecekan untuk menghindari pembagian dengan nol
        const normalizationFactor = 1 / (1 - conflictSum);
        for (const key in result) {
            result[key] *= normalizationFactor;
        }
    }

    return result;
}

function getIntersection(set1, set2) {
    // Jika salah satu adalah theta (θ), kembalikan set lainnya
    if (set1 === 'θ') return set2;
    if (set2 === 'θ') return set1;

    // Ubah string menjadi array set
    const set1Array = set1.split(',');
    const set2Array = set2.split(',');

    // Dapatkan irisan
    const intersection = set1Array.filter(x => set2Array.includes(x));

    // Jika tidak ada irisan, kembalikan null (akan dihitung sebagai konflik)
    if (intersection.length === 0) return null;

    // Urutkan hasil irisan untuk konsistensi
    return intersection.sort().join(',');
}

function displayResults(finalResult, calculationSteps) {
    // Tampilkan hasil diagnosis
    const diagnosisResult = document.getElementById('diagnosis-result');
    const beliefValues = document.getElementById('belief-values');
    const detailedCalculations = document.getElementById('detailed-calculations');

    // Membersihkan hasil sebelumnya
    diagnosisResult.innerHTML = '';
    beliefValues.innerHTML = '';
    detailedCalculations.innerHTML = '';

    // Dapatkan gejala yang dipilih
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom-checkbox:checked'))
        .map(checkbox => checkbox.id);

    // Tambahkan informasi gejala yang dipilih sebagai Langkah 1
    const symptomsInfo = document.createElement('div');
    symptomsInfo.className = 'calculation-step bg-gray-50 rounded-xl p-6 space-y-4 mb-8';
    symptomsInfo.innerHTML = `
        <div class="step-header text-lg font-semibold text-purple-700 mb-4">
            <i class="fas fa-calculator mr-2"></i>Langkah 1: Inisialisasi dengan Gejala yang Dipilih
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="text-gray-800 mb-4">
                <h4 class="font-medium mb-2">Penjelasan Mass Function:</h4>
                <p class="text-sm text-gray-600 mb-2">Mass function (m) adalah tingkat kepercayaan dari suatu gejala terhadap suatu penyakit, dengan nilai antara 0 sampai 1.</p>
                <ul class="list-disc pl-5 text-sm text-gray-600">
                    <li>m(X) = 0 berarti tidak ada kepercayaan</li>
                    <li>m(X) = 1 berarti kepercayaan penuh</li>
                    <li>m(θ) adalah nilai ketidakpastian</li>
                </ul>
            </div>
            <div class="space-y-4">
                ${selectedSymptoms.map((symptom, index) => {
                    // Tentukan notasi fungsi massa yang benar berdasarkan total gejala
                    let massNotation;
                    if (selectedSymptoms.length <= 2) {
                        // Untuk 2 gejala: m1, m2
                        massNotation = `m${index + 1}`;
                    } else {
                        // Untuk 3+ gejala: m1, m2, m4, m6, m8
                        switch(index) {
                            case 0: massNotation = 'm1'; break;
                            case 1: massNotation = 'm2'; break;
                            case 2: massNotation = 'm4'; break;
                            case 3: massNotation = 'm6'; break;
                            case 4: massNotation = 'm8'; break;
                            default: massNotation = `m${index + 1}`;
                        }
                    }

                    return `
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                    <span class="text-indigo-600 font-semibold">${index + 1}</span>
                                </div>
                                <h4 class="font-medium text-gray-800">${getSymptomName(symptom)}</h4>
                            </div>
                            <div class="pl-11">
                                <div class="text-sm text-gray-600 mb-2">Mass Function:</div>
                                <div class="grid grid-cols-2 gap-4">
                                    ${Object.entries(massValues[symptom]).map(([key, value]) => `
                                        <div class="flex justify-between items-center">
                                            <span class="font-mono">${massNotation}({${key === 'θ' ? 'θ' : key}})</span>
                                            <span class="text-indigo-600">${value.toFixed(4)} (${(value * 100).toFixed(2)}%)</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    detailedCalculations.appendChild(symptomsInfo);

    // Hitung nilai belief dan plausibility
    const beliefs = calculateBeliefs(finalResult);
    const plausibilities = calculatePlausibilities(finalResult);

    // Dapatkan penyakit dengan nilai belief tertinggi
    const [highestBeliefDisease, highestBeliefValue] = Object.entries(beliefs)
        .reduce((max, [disease, belief]) => belief > max[1] ? [disease, belief] : max, ['', 0]);

    // Buat hasil diagnosis dengan gaya yang diperbaiki
    diagnosisResult.innerHTML = `
        <div class="diagnosis-card">
            <div class="diagnosis-header">
                <div class="diagnosis-icon">
                    <i class="fas fa-stethoscope"></i>
                </div>
                <div class="diagnosis-title">
                    <p class="text-gray-600">Berdasarkan analisis gejala menggunakan metode Dempster-Shafer</p>
                </div>
            </div>
            
            <div class="diagnosis-result-value">
                <div class="diagnosis-disease">${diseases[highestBeliefDisease]}</div>
                <div class="diagnosis-confidence">
                    <i class="fas fa-chart-pie"></i>
                    Tingkat Keyakinan: ${(highestBeliefValue * 100).toFixed(2)}%
                </div>
            </div>

            <div class="text-sm text-gray-600 mb-4">
                <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                Hasil ini merupakan diagnosis awal berdasarkan gejala yang dipilih
            </div>
        </div>
    `;

    // Buat nilai belief dan plausibility dengan gaya yang diperbaiki
    beliefValues.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-chart-pie text-indigo-600"></i>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-800">Nilai Belief</h4>
                </div>
                <div class="space-y-4">
                    ${Object.entries(beliefs).map(([disease, value]) => `
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-gray-600">${diseases[disease]}</span>
                                <span class="font-semibold ${disease === highestBeliefDisease ? 'text-indigo-600' : 'text-gray-800'}">${(value * 100).toFixed(2)}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div class="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                                     style="width: ${(value * 100).toFixed(2)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-chart-line text-purple-600"></i>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-800">Nilai Plausibility</h4>
                </div>
                <div class="space-y-4">
                    ${Object.entries(plausibilities).map(([disease, value]) => `
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-gray-600">${diseases[disease]}</span>
                                <span class="font-semibold text-purple-600">${(value * 100).toFixed(2)}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div class="bg-purple-600 h-full rounded-full transition-all duration-500" 
                                     style="width: ${(value * 100).toFixed(2)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Tampilkan langkah perhitungan mulai dari Langkah 2 (kombinasi)
    calculationSteps.forEach((step, index) => {
        if (index > 0) {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'calculation-step bg-gray-50 rounded-xl p-6 space-y-4 mb-8';

            const currentGejala = step.description.split(' ').pop();
            const stepNumber = index + 1;

            // Hitung kombinasi dan konflik untuk langkah saat ini
            let combinations = [];
            let conflicts = [];
            let totalConflict = 0;

            for (const key1 in step.prevValues) {
                for (const key2 in step.currentValues) {
                    const intersection = getIntersection(key1, key2);
                    const product = step.prevValues[key1] * step.currentValues[key2];
                    
                    if (intersection === null) {
                        conflicts.push({
                            m1: key1,
                            m2: key2,
                            value: product
                        });
                        totalConflict += product;
                    } else {
                        combinations.push({
                            m1: key1,
                            m2: key2,
                            intersection: intersection,
                            value: product
                        });
                    }
                }
            }

            const normalizationFactor = 1 / (1 - totalConflict);

            stepDiv.innerHTML = `
                <div class="step-header text-lg font-semibold text-purple-700 mb-4">
                    <i class="fas fa-calculator mr-2"></i>Langkah ${stepNumber}: Kombinasi Mass Function
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-table text-purple-600 mr-2"></i>
                        ${getTableTitle(stepNumber, selectedSymptoms.length)}
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full border-collapse">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2 border bg-gray-50">
                                        ${getMassNotation(stepNumber, selectedSymptoms.length)}
                                    </th>
                                    ${Object.entries(step.currentValues).map(([key, value]) => 
                                        `<th class="px-4 py-2 border bg-gray-50">
                                            ${getCurrentMassNotation(stepNumber, selectedSymptoms.length)}({${key === 'θ' ? 'θ' : key}}) = ${value.toFixed(4)}
                                        </th>`
                                    ).join('')}
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                ${Object.entries(step.prevValues).map(([key1, value1]) => `
                                    <tr>
                                        <td class="px-4 py-2 border font-medium bg-gray-50">
                                            ${getPreviousMassNotation(stepNumber, selectedSymptoms.length)}({${key1 === 'θ' ? 'θ' : key1}}) = ${value1.toFixed(4)}
                                        </td>
                                        ${Object.entries(step.currentValues).map(([key2, value2]) => {
                                            const intersection = getIntersection(key1, key2);
                                            const product = value1 * value2;
                                            return `
                                                <td class="px-4 py-2 border">
                                                    <div>
                                                        <div class="font-medium">{${intersection ? intersection : '∅'}}</div>
                                                        <div class="text-gray-600">${product.toFixed(4)}</div>
                                                    </div>
                                                </td>
                                            `;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                        2. Menghitung Nilai Konflik (K):
                    </div>
                    <div class="pl-4 border-l-4 border-red-200">
                        <p class="mb-2 text-sm text-gray-600">K adalah jumlah dari hasil perkalian elemen yang beririsan kosong (∅):</p>
                        <div class="bg-red-50 p-4 rounded-lg">
                            <div class="font-mono">
                                K = ${conflicts.map(c => `${c.value.toFixed(4)}`).join(' + ')} = ${totalConflict.toFixed(4)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-calculator text-blue-600 mr-2"></i>
                        3. Menghitung Faktor Normalisasi:
                    </div>
                    <div class="pl-4 border-l-4 border-blue-200">
                        <div class="bg-blue-50 p-4 rounded-lg space-y-2">
                            <div class="font-mono">
                                1/(1-K) = 1/(1-${totalConflict.toFixed(4)})
                            </div>
                            <div class="font-mono">
                                = 1/${(1-totalConflict).toFixed(4)}
                            </div>
                            <div class="font-mono font-semibold">
                                = ${normalizationFactor.toFixed(4)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-calculator text-green-600 mr-2"></i>
                        4. Menghitung Mass Function Baru
                    </div>
                    <div class="pl-4 border-l-4 border-blue-200 mb-4">
                        <p class="text-gray-600 mb-2">Menghitung mass function baru dengan cara:</p>
                        <ol class="list-decimal pl-4 text-gray-600 space-y-2">
                            <li>Mengkombinasikan nilai mass function dari hasil perhitungan tabel untuk mendapatkan ${getNextMassNotation(stepNumber, selectedSymptoms.length)}</li>
                            <li>Hasil kombinasi tersebut dikalikan dengan nilai Faktor Normalisasi</li>
                        </ol>
                    </div>
                    <div class="space-y-4">
                        ${Object.entries(step.values).map(([key, value]) => {
                            let combinations = [];
                            for (const [k1, v1] of Object.entries(step.prevValues)) {
                                for (const [k2, v2] of Object.entries(step.currentValues)) {
                                    const intersection = getIntersection(k1, k2);
                                    if (intersection === key) {
                                        combinations.push({
                                            value: v1 * v2
                                        });
                                    }
                                }
                            }
                            
                            return `
                                <div class="bg-green-50 p-4 rounded-lg">
                                    <div class="font-mono">
                                        ${getNextMassNotation(stepNumber, selectedSymptoms.length)}({${key === 'θ' ? 'θ' : key}}) = ${combinations.length > 1 ? '(' : ''}${combinations.map(c => c.value.toFixed(4)).join(' + ')}${combinations.length > 1 ? ')' : ''} × ${normalizationFactor.toFixed(4)} = ${value.toFixed(4)}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="mt-6 bg-indigo-50 p-4 rounded-lg">
                        <div class="font-medium text-gray-800 mb-2">
                            <i class="fas fa-check-circle text-indigo-600 mr-2"></i>
                            Verifikasi Total Mass Function ${getNextMassNotation(stepNumber, selectedSymptoms.length)}
                        </div>
                        <div class="text-gray-600 mb-2">
                            Jumlah seluruh mass function ${getNextMassNotation(stepNumber, selectedSymptoms.length)} harus sama dengan 1 (100%):
                        </div>
                        <div class="pl-4 font-mono text-gray-800">
                            ${Object.values(step.values).map(v => (v * 100).toFixed(2) + '%').join(' + ')} = 100%
                        </div>
                    </div>
                </div>
            `;

            detailedCalculations.appendChild(stepDiv);
        }
    });

    // Tambahkan langkah akhir dalam perhitungan detail menggunakan nilai belief dan plausibility yang sama
    const finalStep = document.createElement('div');
    finalStep.className = 'calculation-step bg-gray-50 rounded-xl p-6 space-y-4';
    
    finalStep.innerHTML = `
        <div class="step-header text-lg font-semibold text-purple-700 mb-4">
            <i class="fas fa-check-circle mr-2"></i>Hasil Akhir
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div class="text-lg font-semibold text-gray-800 mb-4">Perhitungan Nilai Belief:</div>
            <div class="pl-4 border-l-4 border-blue-200">
                <p class="mb-2 text-sm text-gray-600">Belief adalah jumlah dari seluruh mass function yang hanya mengarah ke satu penyakit tertentu:</p>
                ${Object.entries(beliefs).map(([disease, value]) => {
                    // Dapatkan notasi fungsi massa yang benar berdasarkan jumlah gejala
                    const massNotation = getFinalMassNotation(selectedSymptoms.length);
                    return `
                        <div class="mb-4">
                            <div class="font-medium mb-2">Bel(${disease}):</div>
                            <div class="pl-4 font-mono">
                                ${massNotation}(${disease}) = ${value.toFixed(4)} = ${(value * 100).toFixed(2)}%
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div class="text-lg font-semibold text-gray-800 mb-4">Perhitungan Nilai Plausibility:</div>
            <div class="pl-4 border-l-4 border-blue-200">
                <p class="mb-2 text-sm text-gray-600">Plausibility adalah jumlah dari seluruh mass function yang memungkinkan mengarah ke penyakit tertentu:</p>
                ${Object.entries(plausibilities).map(([disease, value]) => {
                    const massNotation = getFinalMassNotation(selectedSymptoms.length);
                    // Dapatkan semua fungsi massa yang relevan untuk penyakit ini
                    const relevantMasses = [];
                    const relevantValues = [];
                    
                    // Tambahkan fungsi massa penyakit tunggal
                    if (finalResult[disease]) {
                        relevantMasses.push(`${massNotation}(${disease})`);
                        relevantValues.push(finalResult[disease].toFixed(4));
                    }
                    
                    // Tambahkan fungsi massa kombinasi
                    for (const [key, mass] of Object.entries(finalResult)) {
                        if (key !== disease && key !== 'θ' && key.split(',').includes(disease)) {
                            relevantMasses.push(`${massNotation}(${key})`);
                            relevantValues.push(mass.toFixed(4));
                        }
                    }
                    
                    // Tambahkan fungsi massa θ
                    if (finalResult['θ']) {
                        relevantMasses.push(`${massNotation}(θ)`);
                        relevantValues.push(finalResult['θ'].toFixed(4));
                    }
                    
                    return `
                        <div class="mb-4">
                            <div class="font-medium mb-2">Pl(${disease}):</div>
                            <div class="pl-4 space-y-2 font-mono">
                                <div>= ${relevantMasses.join(' + ')}</div>
                                <div>= ${relevantValues.join(' + ')} = ${value.toFixed(4)}</div>
                                <div>= ${(value * 100).toFixed(2)}%</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    document.getElementById('detailed-calculations').appendChild(finalStep);
}

function calculateBeliefs(masses) {
    const beliefs = { D1: 0, D2: 0, D3: 0 };
    
    for (const key in masses) {
        const mass = masses[key];
        const sets = key.split(',');
        
        if (sets.length === 1 && sets[0] !== 'θ') {
            beliefs[sets[0]] += mass;
        }
    }
    
    return beliefs;
}

function calculatePlausibilities(masses) {
    const plausibilities = { D1: 0, D2: 0, D3: 0 };
    
    for (const disease in plausibilities) {
        for (const key in masses) {
            if (key === 'θ' || key.split(',').includes(disease)) {
                plausibilities[disease] += masses[key];
            }
        }
    }
    
    return plausibilities;
}

// Reset fungsi
function resetForm() {
    // Reset semua checkbox
    document.querySelectorAll('.symptom-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Sembunyikan hasil bagian
    document.getElementById('result').classList.add('hidden');

    // Membersihkan konten hasil
    document.getElementById('diagnosis-result').innerHTML = '';
    document.getElementById('belief-values').innerHTML = '';
    document.getElementById('detailed-calculations').innerHTML = '';
}

// Tambahkan fungsi helper untuk notasi fungsi massa
function getTableTitle(stepNumber, totalSymptoms) {
    const nextMass = getNextMassNotation(stepNumber, totalSymptoms);
    const prevMass = getPreviousMassNotation(stepNumber, totalSymptoms);
    const currentMass = getCurrentMassNotation(stepNumber, totalSymptoms);
    return `1. Membuat Tabel ${nextMass} dari Kombinasi ${prevMass} × ${currentMass}:`;
}

function getMassNotation(stepNumber, totalSymptoms) {
    const prevMass = getPreviousMassNotation(stepNumber, totalSymptoms);
    const currentMass = getCurrentMassNotation(stepNumber, totalSymptoms);
    return `${prevMass} × ${currentMass}`;
}

function getPreviousMassNotation(stepNumber, totalSymptoms) {
    if (totalSymptoms <= 2) {
        return `m${stepNumber-1}`;
    }
    // Untuk 3+ gejala: m1→m3→m5→m7
    return `m${stepNumber * 2 - 3}`;
}

function getCurrentMassNotation(stepNumber, totalSymptoms) {
    if (totalSymptoms <= 2) {
        return `m${stepNumber}`;
    }
    // Untuk 3+ gejala: m2→m4→m6→m8
    switch(stepNumber) {
        case 2: return 'm2';
        case 3: return 'm4';
        case 4: return 'm6';
        case 5: return 'm8';
        default: return `m${stepNumber}`;
    }
}

function getNextMassNotation(stepNumber, totalSymptoms) {
    if (totalSymptoms <= 2) {
        return `m${stepNumber+1}`;
    }
    // Untuk 3+ gejala: m3→m5→m7→m9
    return `m${stepNumber * 2 - 1}`;
}

// Tambahkan fungsi helper untuk mendapatkan notasi fungsi massa akhir
function getFinalMassNotation(totalSymptoms) {
    switch(totalSymptoms) {
        case 2: return 'm3';
        case 3: return 'm5';
        case 4: return 'm7';
        case 5: return 'm9';
        default: return 'm3';
    }
}


