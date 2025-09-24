// ======== VERIFICA LOGIN ========
async function verificarLogin() {
    try {
        const res = await fetch('http://localhost:3000/ocorrencias', { method: 'GET', credentials: 'include' });
        if (!res.ok) {
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error(err);
        window.location.href = 'login.html';
    }
}
verificarLogin();

// ======== VARIÁVEL DE CONTROLE ========
let contadorProtocolo = 1;

// ======== ABRIR FORMULÁRIOS ========
function abrirSelecaoTipo() {
    document.getElementById('selecao-tipo').style.display = 'block';
    document.getElementById('formulario-ocorrencia').style.display = 'none';
}

function abrirFormulario(tipo) {
    const formDiv = document.getElementById('formulario-ocorrencia');
    formDiv.style.display = 'block';
    document.getElementById('selecao-tipo').style.display = 'none';
    formDiv.innerHTML = '';

    if(tipo === 'ATRASOS DE PARTIDA') {
        formDiv.innerHTML = `
            <h2>${tipo}</h2>
            <form onsubmit="adicionarOcorrencia(event)">
                <div class="form-group">
                    <label>Empresa:</label>
                    <select class="form-control" id="empresa" required>
                        <option value="FERVIMA">FERVIMA</option>
                        <option value="PIRAJUCARA">PIRAJUCARA</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Data de Início:</label>
                    <input type="date" class="form-control" id="data_inicio">
                </div>
                <div class="form-group">
                    <label>Hora de Início:</label>
                    <input type="time" class="form-control" id="hora_inicio">
                </div>
                <div class="form-group">
                    <label>Locais:</label>
                    <input type="text" class="form-control" id="locais" placeholder="Digite os locais">
                </div>
                <button type="submit" class="btn btn-success">Adicionar</button>
                <button type="button" class="btn btn-secondary ml-2" onclick="abrirSelecaoTipo()">Cancelar</button>
            </form>
        `;
    } else if(tipo === 'CANCELAMENTOS DE PARTIDAS') {
        formDiv.innerHTML = `
            <h2>${tipo}</h2>
            <form onsubmit="adicionarOcorrencia(event)">
                <div class="form-group">
                    <label>Empresa:</label>
                    <select class="form-control" id="empresa" required>
                        <option value="FERVIMA">FERVIMA</option>
                        <option value="PIRAJUCARA">PIRAJUCARA</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Data:</label>
                    <input type="date" class="form-control" id="data_inicio">
                </div>
                <div class="form-group">
                    <label>Hora:</label>
                    <input type="time" class="form-control" id="hora_inicio">
                </div>
                <div class="form-group">
                    <label>Motivo:</label>
                    <input type="text" class="form-control" id="motivo" placeholder="Digite o motivo">
                </div>
                <button type="submit" class="btn btn-success">Adicionar</button>
                <button type="button" class="btn btn-secondary ml-2" onclick="abrirSelecaoTipo()">Cancelar</button>
            </form>
        `;
    }
}

// ======== CARREGA TABELA ========
function carregarTabela(ocorrencias) {
    const tabela = document.getElementById('ocorrencias-list');
    tabela.innerHTML = '';
    ocorrencias.forEach(o => {
        const linha = tabela.insertRow();
        const cellProtocolo = linha.insertCell(0);
        const btn = document.createElement('button');
        btn.textContent = o.protocolo;
        btn.className = 'btn btn-link p-0';
        btn.onclick = () => abrirEdicao(o.protocolo);
        cellProtocolo.appendChild(btn);

        linha.insertCell(1).textContent = o.data_inicio + ' ' + (o.hora_inicio || '');
        linha.insertCell(2).textContent = o.ocorrencia;
        linha.insertCell(3).textContent = o.prefixo || '';
        linha.insertCell(4).textContent = o.situacao || '';
        linha.insertCell(5).textContent = o.empresa;
    });
}

// ======== ADICIONA OCORRÊNCIA ========
async function adicionarOcorrencia(event) {
    event.preventDefault();
    const dados = {
        protocolo: String(contadorProtocolo).padStart(5,'0') + '/' + new Date().getFullYear(),
        empresa: document.getElementById('empresa').value,
        data_inicio: document.getElementById('data_inicio')?.value || '',
        hora_inicio: document.getElementById('hora_inicio')?.value || '',
        locais: document.getElementById('locais')?.value || '',
        motivo: document.getElementById('motivo')?.value || '',
        ocorrencia: document.querySelector('h2').textContent
    };

    try {
        const res = await fetch('http://localhost:3000/ocorrencias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error('Erro ao criar ocorrência');
        const nova = await res.json();
        contadorProtocolo++;
        const tabela = document.getElementById('ocorrencias-list');
        const linha = tabela.insertRow();
        const cellProtocolo = linha.insertCell(0);
        const btn = document.createElement('button');
        btn.textContent = nova.protocolo;
        btn.className = 'btn btn-link p-0';
        btn.onclick = () => abrirEdicao(nova.protocolo);
        cellProtocolo.appendChild(btn);

        linha.insertCell(1).textContent = nova.data_inicio;
        linha.insertCell(2).textContent = nova.ocorrencia;
        linha.insertCell(3).textContent = nova.prefixo || '';
        linha.insertCell(4).textContent = nova.situacao || '';
        linha.insertCell(5).textContent = nova.empresa;

        document.getElementById('formulario-ocorrencia').style.display = 'none';
        abrirSelecaoTipo();
    } catch (err) {
        alert(err.message);
        console.error(err);
    }
}

// ======== ABRIR EDIÇÃO ========
async function abrirEdicao(protocolo) {
    try {
        const res = await fetch(`http://localhost:3000/ocorrencias/${protocolo}`);
        const o = await res.json();
        const formDiv = document.getElementById('formulario-ocorrencia');
        formDiv.style.display = 'block';
        document.getElementById('selecao-tipo').style.display = 'none';
        formDiv.innerHTML = `
            <h2>Editar Ocorrência</h2>
            <form onsubmit="salvarEdicao(event, '${o.protocolo}')">
                <div class="form-group">
                    <label>Empresa:</label>
                    <input type="text" class="form-control" id="empresa_edit" value="${o.empresa}">
                </div>
                <div class="form-group">
                    <label>Data:</label>
                    <input type="date" class="form-control" id="data_inicio_edit" value="${o.data_inicio}">
                </div>
                <div class="form-group">
                    <label>Hora:</label>
                    <input type="time" class="form-control" id="hora_inicio_edit" value="${o.hora_inicio}">
                </div>
                <div class="form-group">
                    <label>Locais:</label>
                    <input type="text" class="form-control" id="locais_edit" value="${o.locais}">
                </div>
                <div style="margin-top:15px;">
                    <button type="submit" class="btn btn-success">Salvar</button>
                    <button type="button" class="btn btn-secondary ml-2" onclick="abrirSelecaoTipo()">Cancelar</button>
                </div>
            </form>
        `;
    } catch(err) {
        console.error(err);
    }
}

// ======== SALVAR EDIÇÃO ========
async function salvarEdicao(event, protocolo) {
    event.preventDefault();
    const dados = {
        empresa: document.getElementById('empresa_edit').value,
        data_inicio: document.getElementById('data_inicio_edit').value,
        hora_inicio: document.getElementById('hora_inicio_edit').value,
        locais: document.getElementById('locais_edit').value
    };
    try {
        await fetch(`http://localhost:3000/ocorrencias/${protocolo}`, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            credentials: 'include',
            body: JSON.stringify(dados)
        });
        document.getElementById('formulario-ocorrencia').style.display='none';
        carregarOcorrencias();
    } catch(err) {
        console.error(err);
    }
}

// ======== CARREGA OCORRÊNCIAS ========
async function carregarOcorrencias() {
    try {
        const res = await fetch('http://localhost:3000/ocorrencias', { credentials: 'include' });
        if (!res.ok) throw new Error('Erro ao carregar ocorrências');
        const ocorrencias = await res.json();
        carregarTabela(ocorrencias);
    } catch (err) {
        console.error(err);
    }
}

window.onload = carregarOcorrencias;
