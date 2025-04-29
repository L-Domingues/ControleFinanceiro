

//Buscando os elementos do HTML
const form = document.getElementById("form");
const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const tipoInput = document.getElementById("tipo");
const mesFiltro = document.getElementById("mes-filtro");

const listaRegistros = document.getElementById("lista-registros");
const totalRendaEl = document.getElementById("total-renda");
const totalFixoEl = document.getElementById("total-fixo");
const totalVariavelEl = document.getElementById("total-variavel");
const saldoEl = document.getElementById("saldo");

//Armazena os registros daquele mês
let registros = [];
let mesSelecionado = mesFiltro.value; //valor do mês escolhido
const anoAtual = new Date().getFullYear(); //pega o ano atual do sistema


// cria uma chave para armazenar no localStorage
function getChaveMes() {
  return `registros_${anoAtual}_${mesSelecionado}`;
}

//Carrega os registros salvos no localStorage
function carregarRegistrosDoMes() {
  const chave = getChaveMes();
  registros = JSON.parse(localStorage.getItem(chave)) || [];
  atualizarInterface();
  atualizarGrafico();
}

//Envia o formulário
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Pega os valores digitados
  const descricao = descricaoInput.value.trim();
  const valor = parseFloat(valorInput.value);
  const tipo = tipoInput.value;
  const mes = mesFiltro.value;

  // Validação simples
  if (!descricao || isNaN(valor)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  // Cria novo registro
  const novoRegistro = {
    id: Date.now(),
    descricao,
    valor,
    tipo
  };

  // Pega os registros do mês e adiciona o novo
  const chave = getChaveMes();
  const registrosMes = JSON.parse(localStorage.getItem(chave)) || [];
  registrosMes.push(novoRegistro);
  localStorage.setItem(chave, JSON.stringify(registrosMes));

  // Se O mês atual é o mesmo do filtro, atualiza a tela
  if (mes === mesSelecionado) {
    carregarRegistrosDoMes();
  }

  form.reset(); // limpa os campos
});


// Quando o usuário mudar o mês no filtro
mesFiltro.addEventListener("change", () => {
  mesSelecionado = mesFiltro.value;
  carregarRegistrosDoMes(); // carrega novo mes
});


// Atualizar os valores na tela (renda, fixo, variável, saldo)
function atualizarInterface() {
  listaRegistros.innerHTML = "";

  let totalRenda = 0;
  let totalFixo = 0;
  let totalVariavel = 0;

  registros.forEach((item) => {
    if (item.tipo === "renda") totalRenda += item.valor;
    if (item.tipo === "fixo") totalFixo += item.valor;
    if (item.tipo === "variavel") totalVariavel += item.valor;

    const li = document.createElement("li");
    li.classList.add(item.tipo);

    li.innerHTML = `
      <span>${item.descricao} - R$ ${item.valor.toFixed(2)}</span>
      <button onclick="removerRegistro(${item.id})">🗑️</button>
    `;

    listaRegistros.appendChild(li);
  });

  totalRendaEl.textContent = totalRenda.toFixed(2);
  totalFixoEl.textContent = totalFixo.toFixed(2);
  totalVariavelEl.textContent = totalVariavel.toFixed(2);
  saldoEl.textContent = (totalRenda - totalFixo - totalVariavel).toFixed(2);
}

//Declara a variável do gráfico globalmente
let grafico;

// atualiza o gráfico de barra com os dados
function atualizarGrafico() {
  const ctx = document.getElementById("grafico-resumo").getContext("2d");

  //soma os valores por categoria
  let totalRenda = 0;
  let totalFixo = 0;
  let totalVariavel = 0;

  registros.forEach((item) => {
    if (item.tipo === "renda") totalRenda += item.valor;
    if (item.tipo === "fixo") totalFixo += item.valor;
    if (item.tipo === "variavel") totalVariavel += item.valor;
  });


  //Se ja tiver gráfico, destrói para criar outro(evita sobreposição)
  if (grafico) {
    grafico.destroy(); 
  }

  grafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Renda", "Custo Fixo", "Custo Variável"],
      datasets: [{
        label: "Valores (R$)",
        data: [totalRenda, totalFixo, totalVariavel],
        backgroundColor: [
          "#00c853",   
          "#ffab00",   
          "#c80000"    
        ],
        borderRadius: 6
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Função para remover um registro pelo ID
function removerRegistro(id) {
  registros = registros.filter(item => item.id !== id); // remove o item com esse id
  localStorage.setItem(getChaveMes(), JSON.stringify(registros)); // salva a nova lista
  atualizarInterface();// atualiza a tela
}
carregarRegistrosDoMes();
