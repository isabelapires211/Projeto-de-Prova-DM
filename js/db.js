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
    document.getElementById("btnBuscar").addEventListener("click", buscarUsuario);
    document.getElementById("btnRemover").addEventListener("click", removerUsuario);
    document.getElementById("btnAtualizar").addEventListener("click", atualizarUsuario);
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

async function buscarUsuario() {
    const nomeBuscar = document.getElementById('buscarNome').value;
    const nomeInput = document.getElementById('nome');
    const idadeInput = document.getElementById('idade');
    const btnAtualizar = document.getElementById('btnAtualizar');

    const tx = db.transaction('pessoas', 'readonly');
    const store = tx.objectStore('pessoas');

    try {
        const usuario = await store.get(nomeBuscar);

        if (usuario) {
            nomeInput.value = usuario.nome;
            idadeInput.value = usuario.idade;
            btnAtualizar.style.display = "block"; // Mostra o botão de atualização
            showResult(`Usuário ${nomeBuscar} encontrado.`);
        } else {
            showResult(`Usuário ${nomeBuscar} não encontrado.`);
            nomeInput.value = "";
            idadeInput.value = "";
            btnAtualizar.style.display = "none"; // Oculta o botão de atualização
        }
    } catch (error) {
        console.log(error.message);
    }
}

async function atualizarUsuario() {
    const nomeParaAtualizar = document.getElementById('nome').value;
    const novaIdade = document.getElementById('idade').value;
    const tx = db.transaction('pessoas', 'readwrite');
    const store = tx.objectStore('pessoas');
    try {
        let objetoExistente = await store.get(nomeParaAtualizar);
        if (objetoExistente) {
            objetoExistente.idade = novaIdade;
            await store.put(objetoExistente);
            showResult(`Registro para o nome ${nomeParaAtualizar} atualizado com a nova idade ${novaIdade}.`);
        } else {
            showResult(`Nenhum registro encontrado para o nome ${nomeParaAtualizar}.`);
        }
    } catch (error) {
        console.log(error.message);
        showResult("Erro ao atualizar o registro.");
    }
}

async function removerUsuario() {
    const nomeRemoverInput = document.querySelector('input[name="nome-remover"]');
    const nomeRemover = nomeRemoverInput.value;

    if (!nomeRemover) {
        showResult("Por favor, informe o nome do usuário a ser removido.");
        return;
    }

    const tx = await db.transaction('pessoas', 'readwrite');
    const store = tx.objectStore('pessoas');

    try {
        await store.delete(nomeRemover);
        await tx.done;
        showResult(`Usuário ${nomeRemover} removido com sucesso.`);
        nomeRemoverInput.value = "";
    } catch (error) {
        showResult(`Erro ao remover usuário: ${error.message}`);
    }
}
