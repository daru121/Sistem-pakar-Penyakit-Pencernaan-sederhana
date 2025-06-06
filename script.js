// Mass function values for each symptom
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

// Disease names mapping
const diseases = {
    D1: "Gastritis",
    D2: "Gastritis Kronis",
    D3: "Infeksi Usus"
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    populateMassFunctionTable();
    document.getElementById('diagnose').addEventListener('click', performDiagnosis);
    document.getElementById('reset').addEventListener('click', resetForm);
    
    // Add modal event listeners
    document.getElementById('showCalculations').addEventListener('click', showCalculationModal);
    document.getElementById('closeModal').addEventListener('click', hideCalculationModal);
    document.getElementById('calculationModal').addEventListener('click', function(e) {
        if (e.target === this) hideCalculationModal();
    });

    // Add alert modal event listeners
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

// Show alert modal
function showAlertModal() {
    const modal = document.getElementById('alertModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Hide alert modal
function hideAlertModal() {
    const modal = document.getElementById('alertModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Populate mass function table
function populateMassFunctionTable() {
    const tbody = document.getElementById('mass-function-table');
    
    // Clear any existing content
    tbody.innerHTML = '';
    
    // Add data rows
    for (const symptom in massValues) {
        const row = document.createElement('tr');
        
        // Symptom name cell
        const symptomCell = document.createElement('td');
        symptomCell.textContent = getSymptomName(symptom);
        symptomCell.className = 'text-left px-4 py-2 border';
        row.appendChild(symptomCell);
        
        // Mass function values for each disease
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

// Add these functions at the top level
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

// Update the performDiagnosis function
function performDiagnosis() {
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom-checkbox:checked'))
        .map(checkbox => checkbox.id);
    
    if (selectedSymptoms.length === 0) {
        showAlertModal();
        return;
    }

    // Hide previous results
    document.getElementById('result').classList.add('hidden');
    
    // Show loading
    showLoading();

    // Simulate processing time for better UX
    setTimeout(() => {
        let result = null;
        let calculationSteps = [];

        // Perform calculations
        selectedSymptoms.forEach((symptom, index) => {
            if (index === 0) {
                result = { ...massValues[symptom] };
                calculationSteps.push({
                    step: 1,
                    description: `Inisialisasi dengan gejala ${symptom}`,
                    values: { ...result }
                });
            } else {
                result = combineEvidence(result, massValues[symptom]);
                calculationSteps.push({
                    step: index + 1,
                    description: `Kombinasi dengan gejala ${symptom}`,
                    values: { ...result }
                });
            }
        });

        // Hide loading and show results
        hideLoading();
        displayResults(result, calculationSteps);
        
        // Show results with animation
        const resultSection = document.getElementById('result');
        resultSection.classList.remove('hidden');
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        
        // Trigger reflow
        resultSection.offsetHeight;
        
        // Add animation
        resultSection.style.transition = 'all 0.6s ease-out';
        resultSection.style.opacity = '1';
        resultSection.style.transform = 'translateY(0)';
    }, 2000); // 2 second delay for demonstration
}

function combineEvidence(mass1, mass2) {
    const result = {};
    let conflictSum = 0;

    // Calculate intersections and conflicts
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

    // Normalize results
    const normalizationFactor = 1 / (1 - conflictSum);
    for (const key in result) {
        result[key] *= normalizationFactor;
    }

    return result;
}

function getIntersection(set1, set2) {
    if (set1 === 'θ' || set2 === 'θ') {
        return set1 === 'θ' ? set2 : set1;
    }

    if (set1 === set2) {
        return set1;
    }

    // Handle combined sets (e.g., "D1,D2")
    const sets1 = set1.split(',');
    const sets2 = set2.split(',');
    const intersection = sets1.filter(x => sets2.includes(x));

    return intersection.length ? intersection.join(',') : null;
}

function displayResults(finalResult, calculationSteps) {
    // Display diagnosis result
    const diagnosisResult = document.getElementById('diagnosis-result');
    const beliefValues = document.getElementById('belief-values');
    const detailedCalculations = document.getElementById('detailed-calculations');

    // Clear previous results
    diagnosisResult.innerHTML = '';
    beliefValues.innerHTML = '';
    detailedCalculations.innerHTML = '';

    // Get selected symptoms
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom-checkbox:checked'))
        .map(checkbox => checkbox.id);

    // Add selected symptoms information as Step 1
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
                ${selectedSymptoms.map((symptom, index) => `
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
                                        <span class="font-mono">m(${key === 'θ' ? 'θ' : '{'+key+'}'})</span>
                                        <span class="text-indigo-600">${value.toFixed(4)} (${(value * 100).toFixed(2)}%)</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    detailedCalculations.appendChild(symptomsInfo);

    // Calculate beliefs and plausibilities
    const beliefs = calculateBeliefs(finalResult);
    const plausibilities = calculatePlausibilities(finalResult);

    // Find the disease with highest belief
    const [highestBeliefDisease, highestBeliefValue] = Object.entries(beliefs)
        .reduce((max, [disease, belief]) => belief > max[1] ? [disease, belief] : max, ['', 0]);

    // Create diagnosis result HTML with enhanced styling
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

    // Create belief and plausibility values HTML with enhanced styling
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

    // Display calculation steps starting from step 2 (combinations)
    calculationSteps.forEach((step, index) => {
        if (index > 0) { // Skip the first step since it's now part of symptomsInfo
            const stepDiv = document.createElement('div');
            stepDiv.className = 'calculation-step bg-gray-50 rounded-xl p-6 space-y-4 mb-8';

            // Combination steps with detailed explanation
            const prevStep = calculationSteps[index - 1];
            const currentGejala = step.description.split(' ').pop();
            const prevGejala = prevStep.description.split(' ').pop();
            const currentMass = massValues[currentGejala];
            const prevMass = prevStep.values;

            // Calculate combinations and conflicts
            let combinations = [];
            let conflicts = [];
            let totalConflict = 0;

            for (const key1 in prevMass) {
                for (const key2 in currentMass) {
                    const intersection = getIntersection(key1, key2);
                    const product = prevMass[key1] * currentMass[key2];
                    
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
            const stepNumber = index + 1;

            stepDiv.innerHTML = `
                <div class="step-header text-lg font-semibold text-purple-700 mb-4">
                    <i class="fas fa-calculator mr-2"></i>Langkah ${stepNumber}: Kombinasi Mass Function
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div class="text-sm font-medium text-gray-700 mb-3">1. Membuat Tabel Kombinasi m${stepNumber-1} × m${stepNumber}:</div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full border-collapse">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2 border bg-gray-50">m${stepNumber-1} × m${stepNumber}</th>
                                    ${Object.entries(currentMass).map(([key, value]) => 
                                        `<th class="px-4 py-2 border bg-gray-50">
                                            m${stepNumber}({${key === 'θ' ? 'θ' : key}}) = ${value.toFixed(4)}
                                        </th>`
                                    ).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(prevMass).map(([key1, value1]) => `
                                    <tr>
                                        <td class="px-4 py-2 border font-medium bg-gray-50">
                                            m${stepNumber-1}({${key1 === 'θ' ? 'θ' : key1}}) = ${value1.toFixed(4)}
                                        </td>
                                        ${Object.entries(currentMass).map(([key2, value2]) => {
                                            const intersection = getIntersection(key1, key2);
                                            const product = value1 * value2;
                                            return `
                                                <td class="px-4 py-2 border">
                                                    <div class="text-sm">
                                                        <div class="font-medium">{${intersection ? intersection : '∅'}}</div>
                                                        <div class="text-gray-600">${value1.toFixed(4)} × ${value2.toFixed(4)} = ${product.toFixed(4)}</div>
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
                    <div class="text-sm font-medium text-gray-700 mb-3">2. Menghitung Nilai Konflik (K):</div>
                    <div class="pl-4 border-l-4 border-red-200">
                        <p class="mb-2 text-sm text-gray-600">K adalah jumlah dari hasil perkalian elemen yang beririsan kosong (∅):</p>
                        <div class="bg-red-50 p-3 rounded-lg">
                            ${conflicts.map(c => 
                                `<div class="mb-1">m${stepNumber-1}({${c.m1}}) × m${stepNumber}({${c.m2}}) = ${c.value.toFixed(4)}</div>`
                            ).join(' + ')}
                            <div class="mt-2 font-medium border-t border-red-200 pt-2">
                                K = ${conflicts.map(c => c.value.toFixed(4)).join(' + ')} = ${totalConflict.toFixed(4)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div class="text-sm font-medium text-gray-700 mb-3">3. Menghitung Faktor Normalisasi:</div>
                    <div class="pl-4 border-l-4 border-blue-200">
                        <div class="bg-blue-50 p-3 rounded-lg">
                            <div class="mb-2">Faktor normalisasi = 1 / (1 - K)</div>
                            <div class="mb-2">= 1 / (1 - ${totalConflict.toFixed(4)})</div>
                            <div class="font-medium">= ${normalizationFactor.toFixed(4)}</div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="text-sm font-medium text-gray-700 mb-3">4. Menghitung Mass Function Baru:</div>
                    <div class="pl-4 border-l-4 border-green-200">
                        ${Object.entries(step.values).map(([key, value]) => {
                            const preNormalizedValue = value / normalizationFactor;
                            
                            // Get all combinations that result in this key
                            let combinations = [];
                            for (const [k1, v1] of Object.entries(prevMass)) {
                                for (const [k2, v2] of Object.entries(currentMass)) {
                                    const intersection = getIntersection(k1, k2);
                                    if (intersection === key) {
                                        combinations.push({
                                            m1: k1,
                                            m2: k2,
                                            value: v1 * v2
                                        });
                                    }
                                }
                            }
                            
                            return `
                                <div class="mb-6 bg-green-50 p-3 rounded-lg">
                                    <div class="font-medium mb-2">m${stepNumber}({${key === 'θ' ? 'θ' : key}}):</div>
                                    <div class="space-y-2">
                                        <div class="ml-4">
                                            <div class="mb-1">Penjumlahan irisan yang menghasilkan {${key === 'θ' ? 'θ' : key}}:</div>
                                            ${combinations.map((c, idx) => 
                                                `<div class="text-gray-600">
                                                    ${idx > 0 ? ' + ' : ''}(m${stepNumber-1}({${c.m1}}) × m${stepNumber}({${c.m2}})) = ${c.value.toFixed(4)}
                                                </div>`
                                            ).join('')}
                                            <div class="mt-2 font-medium">Total = ${preNormalizedValue.toFixed(4)}</div>
                                        </div>
                                        <div class="ml-4 pt-2 border-t border-green-200">
                                            <div class="mb-1">Normalisasi:</div>
                                            <div class="text-gray-600">${preNormalizedValue.toFixed(4)} × ${normalizationFactor.toFixed(4)} = ${value.toFixed(4)}</div>
                                            <div class="text-indigo-600 font-medium mt-1">Hasil akhir = ${(value * 100).toFixed(2)}%</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <div class="font-medium">Verifikasi Total = 100%:</div>
                            <div class="pl-4 mt-2 text-gray-600">
                                ${Object.values(step.values).map(v => (v * 100).toFixed(2) + '%').join(' + ')} = 100%
                            </div>
                        </div>
                    </div>
                </div>
            `;

            detailedCalculations.appendChild(stepDiv);
        }
    });

    // Add final step in detailed calculations using the same beliefs and plausibilities
    const finalStep = document.createElement('div');
    finalStep.className = 'calculation-step bg-gray-50 rounded-xl p-6 space-y-4';
    
    finalStep.innerHTML = `
        <div class="step-header text-lg font-semibold text-purple-700 mb-4">
            <i class="fas fa-check-circle mr-2"></i>Hasil Akhir
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div class="text-sm text-gray-600 mb-3">Perhitungan Nilai Belief:</div>
            <div class="pl-4 border-l-4 border-blue-200">
                <p class="mb-2 text-sm text-gray-600">Belief adalah jumlah dari seluruh mass function yang hanya mengarah ke satu penyakit tertentu:</p>
                ${Object.entries(beliefs).map(([disease, value]) => {
                    const relevantMasses = [];
                    for (const [key, mass] of Object.entries(finalResult)) {
                        if (key.split(',').length === 1 && key !== 'θ' && key === disease) {
                            relevantMasses.push(`m${calculationSteps.length}(${key}) = ${mass.toFixed(4)}`);
                        }
                    }
                    return `
                        <div class="mb-4">
                            <div class="font-medium mb-2">Bel(${disease}):</div>
                            <div class="pl-4">
                                ${relevantMasses.join(' + ')} = ${value.toFixed(4)} = ${(value * 100).toFixed(2)}%
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div class="text-sm text-gray-600 mb-3">Perhitungan Nilai Plausibility:</div>
            <div class="pl-4 border-l-4 border-green-200">
                <p class="mb-2 text-sm text-gray-600">Plausibility adalah jumlah dari seluruh mass function yang memungkinkan mengarah ke penyakit tertentu:</p>
                ${Object.entries(plausibilities).map(([disease, value]) => {
                    const relevantMasses = [];
                    for (const [key, mass] of Object.entries(finalResult)) {
                        if (key === 'θ' || key.split(',').includes(disease)) {
                            relevantMasses.push(`m${calculationSteps.length}(${key === 'θ' ? 'θ' : '{'+key+'}'}) = ${mass.toFixed(4)}`);
                        }
                    }
                    return `
                        <div class="mb-4">
                            <div class="font-medium mb-2">Pl(${disease}):</div>
                            <div class="pl-4">
                                ${relevantMasses.join(' + ')} = ${value.toFixed(4)} = ${(value * 100).toFixed(2)}%
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm mt-6">
            <div class="text-sm text-gray-600 mb-3">Kesimpulan:</div>
            <div class="text-gray-800">
                Berdasarkan perhitungan di atas, pasien kemungkinan besar menderita penyakit 
                <span class="font-semibold text-indigo-600">${diseases[highestBeliefDisease]}</span> dengan:
                <ul class="list-disc pl-5 mt-2">
                    <li>Nilai Belief: ${(highestBeliefValue * 100).toFixed(2)}%</li>
                    <li>Nilai Plausibility: ${(plausibilities[highestBeliefDisease] * 100).toFixed(2)}%</li>
                </ul>
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
            const sets = key.split(',');
            if (sets.includes(disease) || key === 'θ') {
                plausibilities[disease] += masses[key];
            }
        }
    }
    
    return plausibilities;
}

// Reset function
function resetForm() {
    // Reset all checkboxes
    document.querySelectorAll('.symptom-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Hide results sections
    document.getElementById('result').classList.add('hidden');

    // Clear results content
    document.getElementById('diagnosis-result').innerHTML = '';
    document.getElementById('belief-values').innerHTML = '';
    document.getElementById('detailed-calculations').innerHTML = '';
}

