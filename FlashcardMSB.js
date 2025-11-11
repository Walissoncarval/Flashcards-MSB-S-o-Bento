// Dados iniciais dos Flashcards - Armazenados no Local Storage se disponíveis
let flashcardsData = JSON.parse(localStorage.getItem('flashcardsData')) || [
    {
        materia: 'Ciências',
        assunto: 'Ecologia',
        afirmacao: 'Os produtores são a base da cadeia alimentar.',
        dica: 'Lembre-se: eles produzem seu próprio alimento por fotossíntese.',
        resposta: 'CERTO',
        justificativa: 'Os produtores (autótrofos) são fundamentais na base da cadeia alimentar.',
        esquema: '🌿 Fotossíntese → Energia Solar → Glicose',
        correctCount: 0,
        totalAttempts: 0
    },
    {
        materia: 'História',
        assunto: 'Idade Média',
        afirmacao: 'O feudalismo foi um sistema exclusivo da Europa Ocidental.',
        dica: 'Pense em outras regiões do mundo com estruturas parecidas.',
        resposta: 'ERRADO',
        justificativa: 'Embora o feudalismo "clássico" seja da Europa, estruturas sociais e econômicas semelhantes (como o Japão feudal) existiram em outros lugares.',
        esquema: 'Europa (Suserano/Vassalo); Japão (Daimyō/Samurai)',
        correctCount: 0,
        totalAttempts: 0
    },
    // Adicione mais flashcards aqui...
];

// Variáveis de estado
let currentCardIndex = 0;
let isFlipped = false;

// Elementos DOM
const flashcard = document.getElementById('flashcard');
const correctBtn = document.getElementById('correctBtn');
const incorrectBtn = document.getElementById('incorrectBtn');
const nextBtn = document.getElementById('nextBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const faseDisplay = document.getElementById('faseDisplay');
const cardCreator = document.getElementById('cardCreator');
const openCreatorBtn = document.getElementById('openCreatorBtn');
const closeCreatorBtn = document.getElementById('closeCreatorBtn');
const addCardBtn = document.getElementById('addCardBtn');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');


// Salva os dados no armazenamento local
function saveFlashcards() {
    localStorage.setItem('flashcardsData', JSON.stringify(flashcardsData));
}

// Inicializa o baralho (exibe o primeiro card ou uma mensagem)
function initializeDeck() {
    if (flashcardsData.length > 0) {
        currentCardIndex = 0;
        updateCardContent(flashcardsData[currentCardIndex]);
        nextBtn.disabled = true; // Desabilita o Próximo card no início
        correctBtn.disabled = true; 
        incorrectBtn.disabled = true; 
    } else {
        // Mensagem se não houver cards
        document.getElementById('materia').textContent = 'Sem Cards';
        document.getElementById('assunto').textContent = 'Crie um novo card!';
        document.getElementById('afirmacao').textContent = 'Use o botão "Criar Novo Card" abaixo.';
        document.getElementById('dica').textContent = '';
        flashcard.classList.remove('flipped');
        nextBtn.disabled = true;
        isFlipped = false;
    }
    updateGlobalScore();
}

// Função para atualizar o conteúdo do cartão
function updateCardContent(card) {
    document.getElementById('materia').textContent = `Matéria: ${card.materia}`;
    document.getElementById('assunto').textContent = `Assunto: ${card.assunto}`;
    document.getElementById('afirmacao').textContent = card.afirmacao;
    document.getElementById('dica').textContent = card.dica;
    document.getElementById('resposta').textContent = card.resposta;
    document.getElementById('justificativa').textContent = card.justificativa;
    document.getElementById('esquema').textContent = card.esquema;

    updateCardFase(card);
}

// Função para calcular e exibir a Fase de Aprendizagem
function updateCardFase(card) {
    let fase = '';
    let faseClass = '';
    let R = (card.totalAttempts > 0) ? (card.correctCount / card.totalAttempts) * 100 : 0;

    // FASE 1 (10% ≤ R < 60%), FASE 2 (60% ≤ R < 80%), FASE 3 (80% ≤ R)
    if (R >= 80) {
        fase = '3 (Dominado)';
        faseClass = 'fase-3';
    } else if (R >= 60) {
        fase = '2 (Consolidação)';
        faseClass = 'fase-2';
    } else if (R >= 10) {
        fase = '1 (Revisão)';
        faseClass = 'fase-1';
    } else {
        fase = '0 (Novo)';
        faseClass = 'fase-0';
    }

    faseDisplay.textContent = `Fase: ${fase} (${R.toFixed(0)}% Acerto)`;
    faseDisplay.className = `fase ${faseClass}`;
}

// Função para atualizar o placar geral
function updateGlobalScore() {
    let totalCorrect = flashcardsData.reduce((sum, card) => sum + card.correctCount, 0);
    let totalAttempts = flashcardsData.reduce((sum, card) => sum + card.totalAttempts, 0);
    
    scoreDisplay.textContent = `Acertos: ${totalCorrect} / Total de Tentativas: ${totalAttempts}`;
}


// --- Listeners de Eventos do Estudo ---

// 1. Virar o Card (Click)
flashcard.addEventListener('click', () => {
    if (flashcardsData.length === 0 || isFlipped) return;

    flashcard.classList.add('flipped');
    isFlipped = true;
    
    correctBtn.disabled = false;
    incorrectBtn.disabled = false;
    nextBtn.disabled = true;
});

// 2. Botão Acertei
correctBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const currentCard = flashcardsData[currentCardIndex];
    
    currentCard.correctCount++;
    currentCard.totalAttempts++;

    correctBtn.disabled = true;
    incorrectBtn.disabled = true;
    nextBtn.disabled = false;

    updateGlobalScore();
    updateCardFase(currentCard);
    saveFlashcards(); // Salva o estado
});

// 3. Botão Errei
incorrectBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const currentCard = flashcardsData[currentCardIndex];
    
    currentCard.totalAttempts++; 

    correctBtn.disabled = true;
    incorrectBtn.disabled = true;
    nextBtn.disabled = false;

    updateGlobalScore();
    updateCardFase(currentCard);
    saveFlashcards(); // Salva o estado
});

// 4. Botão Próximo Card
nextBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (flashcardsData.length === 0) return;

    flashcard.classList.remove('flipped');
    isFlipped = false;

    currentCardIndex = (currentCardIndex + 1) % flashcardsData.length;
    
    updateCardContent(flashcardsData[currentCardIndex]);
    correctBtn.disabled = true;
    incorrectBtn.disabled = true;
    nextBtn.disabled = true;
    
    // Adiciona um pequeno atraso para a transição do flip
    setTimeout(() => {
        if (!isFlipped) {
            correctBtn.disabled = true;
            incorrectBtn.disabled = true;
        }
    }, 500);
});


// --- Funções de Criação, Importação e Exportação ---

// Exibe o formulário de criação
openCreatorBtn.addEventListener('click', () => {
    cardCreator.style.display = 'block';
});

// Oculta o formulário de criação
closeCreatorBtn.addEventListener('click', () => {
    cardCreator.style.display = 'none';
});

// Adiciona novo card
addCardBtn.addEventListener('click', () => {
    const newCard = {
        materia: document.getElementById('newMateria').value || 'Geral',
        assunto: document.getElementById('newAssunto').value || 'Sem Assunto',
        afirmacao: document.getElementById('newAfirmacao').value,
        dica: document.getElementById('newDica').value || '',
        resposta: document.getElementById('newResposta').value,
        justificativa: document.getElementById('newJustificativa').value || '',
        esquema: document.getElementById('newEsquema').value || '',
        correctCount: 0,
        totalAttempts: 0
    };

    if (newCard.afirmacao && newCard.resposta) {
        flashcardsData.push(newCard);
        saveFlashcards();
        alert('Card adicionado com sucesso!');
        
        // Limpa o formulário e fecha
        document.getElementById('newMateria').value = '';
        document.getElementById('newAssunto').value = '';
        document.getElementById('newAfirmacao').value = '';
        document.getElementById('newDica').value = '';
        document.getElementById('newResposta').value = '';
        document.getElementById('newJustificativa').value = '';
        document.getElementById('newEsquema').value = '';
        cardCreator.style.display = 'none';
        
        // Se for o primeiro card, inicializa o deck
        if (flashcardsData.length === 1) {
             initializeDeck();
        }
    } else {
        alert('Por favor, preencha a Afirmação e a Resposta.');
    }
});

// Exportação (JSON)
exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(flashcardsData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards_msb_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Importação (JSON)
importFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validação básica do formato
            if (Array.isArray(importedData) && importedData.every(c => c.afirmacao && c.resposta)) {
                // Adiciona cards importados aos existentes
                flashcardsData = flashcardsData.concat(importedData);
                saveFlashcards();
                alert(`Sucesso! ${importedData.length} cards importados.`);
                initializeDeck();
            } else {
                alert('Erro: O arquivo JSON não está no formato de baralho esperado.');
            }
        } catch (error) {
            alert('Erro ao ler ou processar o arquivo JSON. Verifique o formato.');
            console.error(error);
        }
    };
    reader.readAsText(file);
});


// Inicializa o baralho quando a página carrega
initializeDeck();