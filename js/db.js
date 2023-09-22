import { openDB } from "idb";

let db;

async function createDB() {
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                switch (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('pessoas', {
                            keyPath: 'nome'
                        });
                        store.createIndex('id', 'id');
                        showResult("Banco de dados criado!");
                }
            }
        });
        showResult("Banco de dados aberto.");
    } catch (e) {
        showError("Erro ao criar o banco de dados: " + e.message);
    }
}

window.addEventListener("DOMContentLoaded", async event => {
    createDB();
    document.getElementById("btnSalvar").addEventListener("click", addData);
    document.getElementById("btnListar").addEventListener("click", getData);
    document.getElementById("buscarNome").addEventListener("click", buscar);
});

async function getData() {
    if (!db) {
        showError("O banco de dados está fechado");
        return;
    }

    const tx = await db.transaction('pessoas', 'readonly');
    const store = tx.objectStore('pessoas');
    try {
        const value = await store.getAll();
        if (value.length > 0) {
            showResult("Dados do banco: " + JSON.stringify(value));
        } else {
            showResult("Não há nenhum dado no banco!");
        }
    } catch (error) {
        showError("Erro ao buscar dados: " + error.message);
    }
}

async function addData() {
    const nomeInput = document.querySelector('input[name="nome"]');
    const idadeInput = document.querySelector('input[name="idade"]');
    const nome = nomeInput.value.trim(); // Remova espaços em branco
    const idade = idadeInput.value.trim(); // Remova espaços em branco

    if (!nome || !idade) {
        showError("Por favor, preencha os campos Nome e Idade.");
        return;
    }

    const tx = await db.transaction('pessoas', 'readwrite');
    const store = tx.objectStore('pessoas');
    try {
        await store.add({ nome, idade });
        showResult(`Dados salvos: Nome - ${nome}, Idade - ${idade}`);
        nomeInput.value = "";
        idadeInput.value = "";
    } catch (error) {
        showError("Erro ao salvar dados: " + error.message);
    }
}

function showResult(text) {
    document.querySelector("output").innerHTML = text;
}

function showError(text) {
    console.error(text);
    showResult(text);
}

async function buscar() {
    const nomeBuscando = document.getElementById('buscar').value.trim(); // Remova espaços em branco
    if (!db) {
        showError("O banco de dados está fechado");
        return;
    }

    const tx = db.transaction('pessoas', 'readonly');
    const store = tx.objectStore('pessoas');
    try {
        let objetoBuscado = await store.get(nomeBuscando);
        if (objetoBuscado) {
            const nomeElement = document.getElementById('nome');
            const idadeElement = document.getElementById('idade');
            if (nomeElement && idadeElement) {
                nomeElement.value = objetoBuscado.nome;
                idadeElement.value = objetoBuscado.idade;
            }
        } else {
            showResult(`Nenhum registro encontrado para o nome ${nomeBuscando}.`);
        }
    } catch (error) {
        showError("Erro ao buscar dados: " + error.message);
    }
}
