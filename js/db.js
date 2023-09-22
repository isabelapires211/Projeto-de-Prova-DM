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
        showResult("Erro ao criar o banco de dados: " + e.message)
    }
}

window.addEventListener("DOMContentLoaded", async event => {
    createDB();
    document.getElementById("btnSalvar").addEventListener("click", addData);
    document.getElementById("btnListar").addEventListener("click", getData);
    document.getElementById("btnBuscar").addEventListener("click", buscar);
});

async function getData() {
    if (db == undefined) {
        showResult("O banco de dados está fechado");
        return;
    }

    const tx = await db.transaction('pessoas', 'readonly')
    const store = tx.objectStore('pessoas');
    const value = await store.getAll();
    if (value) {
        showResult("Dados do banco: " + JSON.stringify(value))
    } else {
        showResult("Não há nenhum dado no banco!")
    }
}

async function addData() {
    const nomeInput = document.querySelector('input[name="nome"]');
    const idadeInput = document.querySelector('input[name="idade"]');
    const nome = nomeInput.value;
    const idade = idadeInput.value; 

    if (!nome || !idade) {
        showResult("Por favor, preencha os campos Nome e Idade.");
        return;
    }

    const tx = await db.transaction('pessoas', 'readwrite');
    const store = tx.objectStore('pessoas');
    store.add({ nome, idade });

    await tx.done;
    showResult(`Dados salvos: Nome - ${nome}, Idade - ${idade}`);
    nomeInput.value="";
    idadeInput.value="";
}

function showResult(text) {
    document.querySelector("output").innerHTML = text;
}

async function buscar(){
    const nomeBuscando = document.getElementById('buscarNome').value;
    const tx = db.transaction('pessoas', 'readonly');
    const store = tx.objectStore ('pessoas');
     try{
        let objetoBuscado = await store.get(nomeBuscando);
        document.getElementById('nome').value =
        objetoBuscado.nome
        document.getElementById('idade').value =
        objetoBuscado.idade


        await tx.done;
        showResult(`Nome Buscado: Nome - ${objetoBuscado.nome}, Idade - ${objetoBuscado.idade}`);
        document.getElementById('nome').value=""
        document.getElementById('idade').value=""

     } catch(error){
        console.log(error.message);
     }
}