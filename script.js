document.addEventListener('DOMContentLoaded', () => {
    const bankForm = document.getElementById('bank-form');
    const debtForm = document.getElementById('debt-form');
    const debtList = document.getElementById('debt-list');
    const debtBankSelect = document.getElementById('debt-bank');
    const totalDebtsElement = document.getElementById('total-debts');

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
            renderDebts();
        }
    }

    function saveBanks() {
        localStorage.setItem('banks', JSON.stringify(banks));
        updateBankSelect(); // Atualiza o seletor sempre que um banco é salvo
    }

    function saveDebts() {
        localStorage.setItem('debts', JSON.stringify(debts));
        renderDebts();
    }

    // --- Funções de Renderização e Lógica ---

    function updateBankSelect() {
        debtBankSelect.innerHTML = ''; // Limpa opções antigas

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

            // Formata a data (DD/MM/AAAA)
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

    // --- Eventos ---

    // 1. Cadastrar Novo Banco
    bankForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('bank-name').value.trim();
        const color = document.getElementById('bank-color').value;

        if (!name) return;

        const newBank = {
            id: Date.now().toString(), // ID único baseado no tempo
            name: name,
            color: color
        };

        banks.push(newBank);
        saveBanks();
        bankForm.reset();
    });

    // 2. Registrar Nova Dívida
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

    // 3. Excluir Dívida
    debtList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const indexToDelete = parseInt(e.target.dataset.index);
            debts.splice(indexToDelete, 1);
            saveDebts();
        }
    });

    // Carregar dados na inicialização
    loadData();
});
