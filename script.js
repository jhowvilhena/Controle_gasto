document.addEventListener('DOMContentLoaded', () => {
    const bankForm = document.getElementById('bank-form');
    const debtForm = document.getElementById('debt-form');
    const debtList = document.getElementById('debt-list');
    const debtBankSelect = document.getElementById('debt-bank');
    const totalDebtsElement = document.getElementById('total-debts');
    const bankBlocksContainer = document.getElementById('bank-blocks-container');
    const noBanksMessage = document.getElementById('no-banks-message');

    let banks = [];
    let debts = [];

    // --- Funções de Carregamento e Salvamento ---

    function loadData() {
        const storedBanks = localStorage.getItem('banks');
        const storedDebts = localStorage.getItem('debts');

        if (storedBanks) {
            banks = JSON.parse(storedBanks);
            updateBankSelect();
        }
        if (storedDebts) {
            debts = JSON.parse(storedDebts);
        }
        renderAll(); // Chamada única para renderizar tudo
    }

    function saveBanks() {
        localStorage.setItem('banks', JSON.stringify(banks));
        updateBankSelect();
        renderBankBlocks(); // Atualiza a visualização dos blocos
    }

    function saveDebts() {
        localStorage.setItem('debts', JSON.stringify(debts));
        renderAll();
    }

    function renderAll() {
        renderDebts();
        renderBankBlocks();
    }

    // --- Funções de Renderização dos Bancos (NOVA LÓGICA) ---

    function renderBankBlocks() {
        bankBlocksContainer.innerHTML = '';
        calculateTotal(); // Garante que o total geral seja atualizado

        if (banks.length === 0) {
            noBanksMessage.style.display = 'block';
            return;
        }

        noBanksMessage.style.display = 'none';

        banks.forEach(bank => {
            // Calcula o total de dívidas para este banco específico
            const bankTotal = debts
                .filter(debt => debt.bankId === bank.id)
                .reduce((sum, debt) => sum + debt.amount, 0);

            const block = document.createElement('div');
            block.classList.add('bank-block');
            block.style.backgroundColor = bank.color;

            block.innerHTML = `
                <div class="bank-name">${bank.name}</div>
                <div class="bank-total">R$ ${bankTotal.toFixed(2).replace('.', ',')}</div>
            `;
            bankBlocksContainer.appendChild(block);
        });
    }

    // --- Funções de Renderização e Lógica (EXISTENTES) ---

    function updateBankSelect() {
        debtBankSelect.innerHTML = '';
        
        if (banks.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Nenhum banco cadastrado';
            debtBankSelect.appendChild(option);
            debtBankSelect.disabled = true;
            return;
        }

        debtBankSelect.disabled = false;
        banks.forEach(bank => {
            const option = document.createElement('option');
            option.value = bank.id;
            option.textContent = bank.name;
            debtBankSelect.appendChild(option);
        });
    }

    function calculateTotal() {
        const total = debts.reduce((sum, debt) => sum + debt.amount, 0);
        totalDebtsElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    function renderDebts() {
        debtList.innerHTML = '';
        debts.forEach((debt, index) => {
            const listItem = document.createElement('li');
            const bank = banks.find(b => b.id === debt.bankId);
            const bankName = bank ? bank.name : 'Banco Removido';
            const bankColor = bank ? bank.color : '#999999';

            const date = new Date(debt.date + 'T00:00:00');
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            listItem.innerHTML = `
                <div class="debt-info">
                    <strong>R$ ${debt.amount.toFixed(2).replace('.', ',')}</strong>
                    <div class="debt-details">
                        <span class="bank-tag" style="background-color: ${bankColor};">${bankName}</span>
                        <span>${debt.description}</span>
                        <br>
                        <span>Vencimento: ${formattedDate}</span>
                    </div>
                </div>
                <button class="delete-btn" data-index="${index}">X</button>
            `;
            debtList.appendChild(listItem);
        });
        calculateTotal();
    }

    // --- Eventos (Inalterados, mas precisam dos novos elementos) ---

    bankForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('bank-name').value.trim();
        const color = document.getElementById('bank-color').value;

        if (!name) return;

        const newBank = {
            id: Date.now().toString(),
            name: name,
            color: color
        };

        banks.push(newBank);
        saveBanks();
        bankForm.reset();
    });

    debtForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const bankId = document.getElementById('debt-bank').value;
        const description = document.getElementById('debt-description').value.trim();
        const amount = parseFloat(document.getElementById('debt-amount').value);
        const date = document.getElementById('debt-date').value;

        if (!bankId || isNaN(amount) || amount <= 0 || !date || !description) {
            alert('Por favor, preencha todos os campos da dívida corretamente.');
            return;
        }

        const newDebt = {
            bankId: bankId,
            description: description,
            amount: amount,
            date: date
        };

        debts.push(newDebt);
        saveDebts();
        debtForm.reset();
    });

    debtList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const indexToDelete = parseInt(e.target.dataset.index);
            debts.splice(indexToDelete, 1);
            saveDebts();
        }
    });

    loadData();
});
