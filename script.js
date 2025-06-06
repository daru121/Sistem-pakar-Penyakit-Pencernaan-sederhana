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
    const table = document.getElementById('mass-function-table');
    
    for (const symptom in massValues) {
        const row = document.createElement('tr');
        const values = massValues[symptom];
        
        // Symptom name cell
        const symptomCell = document.createElement('td');
        symptomCell.textContent = getSymptomName(symptom);
        symptomCell.className = 'text-left';
        row.appendChild(symptomCell);
        
        // Mass function values
        row.appendChild(createCell(values.D1 || 0));
        row.appendChild(createCell(values.D2 || 0));
        row.appendChild(createCell(values.D3 || 0));
        row.appendChild(createCell(values['D1,D2'] || 0));
        row.appendChild(createCell(values['D1,D3'] || 0));
        row.appendChild(createCell(values['D2,D3'] || 0));
        row.appendChild(createCell(values['θ']));
        
        table.appendChild(row);
    }
}

function createCell(value) {
    const cell = document.createElement('td');
    cell.textContent = Number(value).toFixed(2);
    return cell;
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

    // Display calculation steps in modal
    calculationSteps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'calculation-step bg-gray-50 rounded-xl p-6 space-y-4 mb-8';

        if (index === 0) {
            // First step - show initial values with detailed explanation
            stepDiv.innerHTML = `
                <div class="step-header text-lg font-semibold text-purple-700 mb-4">
                    <i class="fas fa-calculator mr-2"></i>Langkah ${step.step}: ${step.description}
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <div class="text-gray-800 mb-4">
                        <h4 class="font-medium mb-2">Penjelasan Mass Function:</h4>
                        <p class="text-sm text-gray-600 mb-2">Mass function (m) adalah tingkat kepercayaan dari suatu gejala terhadap suatu penyakit, dengan nilai antara 0 sampai 1.</p>
                        <ul class="list-disc pl-5 text-sm text-gray-600">
                            <li>m(X) = 0 berarti tidak ada kepercayaan</li>
                            <li>m(X) = 1 berarti kepercayaan penuh</li>
                            <li>m(θ) adalah nilai ketidakpastian</li>
                        </ul>
                    </div>
                    <div class="text-sm text-gray-600 mb-3">Nilai mass function awal untuk gejala ${step.description.split(' ').pop()}:</div>
                    ${Object.entries(step.values).map(([key, value]) => `
                        <div class="grid grid-cols-2 gap-4 mb-2">
                            <div class="font-medium">m(${key === 'θ' ? 'θ' : key})</div>
                            <div class="text-right">${value.toFixed(4)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
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

            // Create detailed HTML with step-by-step explanation
            let html = `
                <div class="step-header text-lg font-semibold text-purple-700 mb-4">
                    <i class="fas fa-calculator mr-2"></i>Langkah ${step.step}: Kombinasi Mass Function
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <div class="text-gray-800 mb-3">
                        <h4 class="font-medium mb-2">Proses Kombinasi:</h4>
                        <p class="text-sm text-gray-600 mb-2">Pada langkah ini, kita akan mengkombinasikan dua mass function menggunakan aturan kombinasi Dempster-Shafer:</p>
                        <ul class="list-disc pl-5 text-sm text-gray-600 mb-4">
                            <li>m${index} = Mass function dari hasil perhitungan gejala ${prevGejala}</li>
                            <li>m${index+1} = Mass function dari gejala baru (${currentGejala})</li>
                        </ul>
                        <p class="text-sm text-gray-600 font-mono">m1⊕m2(Z) = Σ(X∩Y=Z) m1(X)·m2(Y) / (1-K)</p>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div class="text-sm text-gray-600 mb-3">Tabel Kombinasi m1⊕m2:</div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full border-collapse">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2 border bg-gray-50">m1⊕m2</th>
                                    ${Object.entries(currentMass).map(([key, value]) => 
                                        `<th class="px-4 py-2 border bg-gray-50">m2(${key === 'θ' ? 'θ' : '{'+key+'}'}) = ${value.toFixed(4)}</th>`
                                    ).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(prevMass).map(([key1, value1]) => `
                                    <tr>
                                        <td class="px-4 py-2 border font-medium bg-gray-50">m1(${key1 === 'θ' ? 'θ' : '{'+key1+'}'}) = ${value1.toFixed(4)}</td>
                                        ${Object.entries(currentMass).map(([key2, value2]) => {
                                            const intersection = getIntersection(key1, key2);
                                            const product = value1 * value2;
                                            return `
                                                <td class="px-4 py-2 border">
                                                    ${intersection ? '{'+intersection+'}' : '∅'} = ${product.toFixed(4)}
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
                    <div class="text-sm text-gray-600 mb-3">Perhitungan Konflik (K):</div>
                    <div class="pl-4 border-l-4 border-red-200">
                        <p class="mb-2 text-sm text-gray-600">K adalah jumlah dari hasil perkalian elemen yang beririsian kosong (∅):</p>
                        ${conflicts.map(c => `
                            <div class="mb-1">m1({${c.m1}}) × m2({${c.m2}}) = ${c.value.toFixed(4)}</div>
                        `).join('')}
                        <div class="mt-2 font-medium">K = ${totalConflict.toFixed(4)}</div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div class="text-sm text-gray-600 mb-3">Faktor Normalisasi:</div>
                    <div class="pl-4 border-l-4 border-blue-200">
                        <p class="mb-2 text-sm text-gray-600">Faktor normalisasi digunakan untuk menghitung mass function yang baru:</p>
                        <div class="mb-1">1/(1-K) = 1/(1-${totalConflict.toFixed(4)})</div>
                        <div class="font-medium">Faktor Normalisasi = ${normalizationFactor.toFixed(4)}</div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="text-sm text-gray-600 mb-3">Hasil Kombinasi Setelah Normalisasi:</div>
                    <div class="pl-4 border-l-4 border-green-200">
                        <p class="mb-2 text-sm text-gray-600">Mass function baru dihitung dengan mengalikan setiap nilai dengan faktor normalisasi:</p>
                        ${Object.entries(step.values).map(([key, value]) => `
                            <div class="grid grid-cols-2 gap-4 mb-2">
                                <div class="font-medium">m({${key === 'θ' ? 'θ' : key}}) =</div>
                                <div class="text-right">${value.toFixed(4)} = ${(value * 100).toFixed(2)}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            stepDiv.innerHTML = html;
        }

        document.getElementById('detailed-calculations').appendChild(stepDiv);
    });

    // Add final step in detailed calculations using the same beliefs and plausibilities
    const finalStep = document.createElement('div');
    finalStep.className = 'calculation-step bg-gray-50 rounded-xl p-6 space-y-4';
    
    finalStep.innerHTML = `
        <div class="step-header text-lg font-semibold text-purple-700 mb-4">
            <i class="fas fa-check-circle mr-2"></i>Hasil Akhir
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div class="text-sm text-gray-600 mb-3">Nilai Belief:</div>
            ${Object.entries(beliefs).map(([disease, value]) => `
                <div class="grid grid-cols-2 gap-4 mb-2">
                    <div class="font-medium">Bel(${disease})</div>
                    <div class="text-right">${(value * 100).toFixed(2)}%</div>
                </div>
            `).join('')}
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="text-sm text-gray-600 mb-3">Nilai Plausibility:</div>
            ${Object.entries(plausibilities).map(([disease, value]) => `
                <div class="grid grid-cols-2 gap-4 mb-2">
                    <div class="font-medium">Pl(${disease})</div>
                    <div class="text-right">${(value * 100).toFixed(2)}%</div>
                </div>
            `).join('')}
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

