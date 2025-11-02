/* * * --- INÍCIO DO NOSSO SCRIPT 'gerador.js' ---
 * */

// ********** LÓGICA DE CRÉDITOS E STATUS DO USUÁRIO (AGORA 100% BACKEND) **********

// 1. Pega os elementos do HUD
const statusTextoEl = document.getElementById('statusTexto');
const creditosContadorEl = document.getElementById('creditosContador');

// 2. Lê os dados LOCAIS (só para saber QUEM é o usuário)
let usuarioEmail = localStorage.getItem('usuario_email');
let creditosUsuario = 0; // Começa com 0 até o Backend nos dizer
let isUsuarioPremium = false; 

// 3. ATUALIZA O HUD (função visual)
function atualizarStatusHUD() {
    if (!usuarioEmail) {
        // Se não houver e-mail, chuta de volta para o login
        window.location.href = 'index.html';
        return;
    }
    isUsuarioPremium = creditosUsuario >= 999999; 

    if (isUsuarioPremium) {
        statusTextoEl.textContent = 'Mestre Forjador';
        creditosContadorEl.textContent = 'Ilimitado';
    } else {
        statusTextoEl.textContent = 'Iniciado';
        creditosContadorEl.textContent = creditosUsuario;
    }
}

// 4. FUNÇÃO "GASTAR CRÉDITO" (chama o Robô 2)
async function gastarCredito() {
    if (isUsuarioPremium) {
        return true; // Ilimitado, sempre pode gastar
    }
    if (creditosUsuario <= 0) {
        return false; // Não tem créditos, nem tenta
    }

    // Tenta gastar o crédito no Backend
    try {
        const response = await fetch('/.netlify/functions/gastar-credito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuarioEmail })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro);
        }

        // SUCESSO! O Backend gastou o crédito.
        creditosUsuario = data.creditos; // Atualiza o contador local
        localStorage.setItem('usuario_creditos', creditosUsuario); // Salva localmente
        atualizarStatusHUD();
        return true;

    } catch (error) {
        console.error('Falha ao gastar crédito:', error.message);
        alert("Falha ao verificar seus créditos. Tente novamente.");
        return false;
    }
}

// 5. FUNÇÃO "CARREGAR CRÉDITOS" (chama o Robô 3)
//    Esta é a função MAIS IMPORTANTE desta página.
async function carregarCreditosDoBackend() {
    if (!usuarioEmail) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/get-creditos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuarioEmail })
        });
        
        const data = await response.json();
        
        if (!response.ok) { throw new Error(data.erro); }

        // SUCESSO! Atualiza tudo
        creditosUsuario = data.creditos;
        localStorage.setItem('usuario_creditos', creditosUsuario);
        atualizarStatusHUD();

    } catch (error) {
        console.error("Erro ao carregar créditos do Supabase:", error.message);
        // Se falhar, usa o que estava salvo no localStorage
        creditosUsuario = parseInt(localStorage.getItem('usuario_creditos')) || 0;
        atualizarStatusHUD();
    }
}

// 6. RODA A FUNÇÃO DE CARREGAR CRÉDITOS ASSIM QUE A PÁGINA ABRE
document.addEventListener('DOMContentLoaded', () => {
    carregarCreditosDoBackend();
});

// ***************************************


/* * PASSO 1: MAPEAMENTO LETRAS -> NÚMEROS
 */
const mapaLetras = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
};

/*
 * PASSO 2: PONTOS DE DESENHO
 */

const PONTOS_SIGILO_RODA = {};
const PONTOS_NUMERO_RODA_VISUAL = {};
const ORDEM_NUMEROS_RODA = [4, 7, 3, 5, 8, 2, 6, 9, 1];
const centro = 150;
const raioSigilo = 75; 
const raioNumeros = 112; 
const anguloPorFatia = 40; 

for (let i = 0; i < 9; i++) {
    const angulo = (i * anguloPorFatia - 90) * (Math.PI / 180); 
    const numero = ORDEM_NUMEROS_RODA[i];
    PONTOS_SIGILO_RODA[numero] = {
        x: centro + raioSigilo * Math.cos(angulo),
        y: centro + raioSigilo * Math.sin(angulo)
    };
    PONTOS_NUMERO_RODA_VISUAL[numero] = {
        x: centro + raioNumeros * Math.cos(angulo),
        y: centro + raioNumeros * Math.sin(angulo)
    };
}

const PONTOS_SIGILO_TABELA = {
    1: { x: 150, y: 250 }, 2: { x: 250, y: 50  }, 3: { x: 50,  y: 150 },
    4: { x: 50,  y: 50  }, 5: { x: 150, y: 150 }, 6: { x: 250, y: 250 },
    7: { x: 250, y: 150 }, 8: { x: 50,  y: 250 }, 9: { x: 150, y: 50  }
};

/*
 * PASSO 3: CONFIGURAR OS ELEMENTOS DO HTML
 */
const btnGerar = document.getElementById('btnGerar');
const inputIntencao = document.getElementById('intencao');
const tela = document.getElementById('telaSigilo');
const debugLetrasEl = document.getElementById('debugLetras');
const debugNumerosEl = document.getElementById('debugNumeros');

const btnDownloadPNG = document.getElementById('btnDownloadPNG'); 
const btnDownloadSVG = document.getElementById('btnDownloadSVG'); 
const optTabela = document.getElementById('labelTabela'); // O label da Tabela

// Elementos do Modal de "Upgrade"
const premiumModal = document.getElementById('premiumModal');
const overlay = document.getElementById('overlay');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnVerPlanos = document.querySelector('.btn-modal-primario'); // Botão no pop-up

// Pincel do canvas
tela.width = 300;
tela.height = 300;
const ctxReal = tela.getContext('2d'); 


/*
 * PASSO 4: FUNÇÃO DE GERAÇÃO PRINCIPAL
 */

// Ação do Botão Gerar
btnGerar.addEventListener('click', async () => { 
    const sequenciaNumeros = processarTexto();
    const metodoSelecionado = document.querySelector('input[name="metodo"]:checked').value;
    
    if (metodoSelecionado === 'tabela') {
        const temCredito = await gastarCredito(); 
        
        if (temCredito) {
            _desenhar(sequenciaNumeros, 'tabela');
        } else {
            document.getElementById('optRoda').checked = true; 
            abrirModalPremium(); 
            _desenhar(sequenciaNumeros, 'roda'); 
        }
    } else {
        _desenhar(sequenciaNumeros, 'roda');
    }
});

// Função interna de desenho
function _desenhar(sequenciaNumeros, metodo) {
    btnDownloadPNG.style.display = 'none'; 
    btnDownloadSVG.style.display = 'none';
    if (btnDownloadSVG.href.startsWith('blob:')) {
        URL.revokeObjectURL(btnDownloadSVG.href);
    }
    
    ctxReal.clearRect(0, 0, tela.width, tela.height);
    
    desenharFundo(ctxReal, metodo); 
    desenharSigiloNaTela(ctxReal, metodo, sequenciaNumeros, false); 

    const dataURL = tela.toDataURL('image/png'); 
    btnDownloadPNG.href = dataURL;
    
    const ctxFalso = new C2S(300, 300);
    desenharFundo(ctxFalso, metodo); 
    desenharSigiloNaTela(ctxFalso, metodo, sequenciaNumeros, true); 
    const svgData = ctxFalso.getSerializedSvg();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    btnDownloadSVG.href = url;

    btnDownloadPNG.style.display = 'block'; 
    btnDownloadSVG.style.display = 'block';
}


function processarTexto() {
    let texto = inputIntencao.value;
    let textoNormalizado = texto.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let soLetras = textoNormalizado.replace(/[^A-Z]/g, '');

    let semVogais = soLetras.replace(/[AEIOU]/g, '');
    let letrasUnicas = "";
    for (let i = 0; i < semVogais.length; i++) {
        let letra = semVogais[i];
        if (letrasUnicas.indexOf(letra) === -1) { 
            letrasUnicas += letra;
        }
    }
    
    let sequenciaNumeros = [];
    for (let i = 0; i < letrasUnicas.length; i++) {
        let letra = letrasUnicas[i];
        if (mapaLetras[letra]) {
            sequenciaNumeros.push(mapaLetras[letra]);
        }
    }
    
    debugLetrasEl.textContent = letrasUnicas;
    debugNumerosEl.textContent = sequenciaNumeros.join(' - ');
    return sequenciaNumeros;
}


/*
 * PASSO 5: FUNÇÕES DE DESENHO
 * (Sem alterações, 100% corretas)
 */
function desenharFundo(pincel, metodo) {
    if (metodo === 'tabela') {
        tela.className = 'metodo-tabela'; 
        desenharTabelaAssistente(pincel);    
        desenharNumerosTabela(pincel);         
    } else {
        tela.className = 'metodo-roda'; 
        desenharRodaNumerica(pincel);
    }
}
function desenharRodaNumerica(pincel) {
    const raioInterno = 90; 
    const raioExterno = 135; 
    pincel.strokeStyle = '#D4AF37';
    pincel.lineWidth = 2;
    pincel.beginPath();
    pincel.arc(centro, centro, raioInterno, 0, 2 * Math.PI); 
    pincel.stroke();
    pincel.beginPath(); 
    pincel.arc(centro, centro, raioExterno, 0, 2 * Math.PI); 
    pincel.stroke();
    pincel.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
        const anguloRaio = (i * anguloPorFatia - 90 - (anguloPorFatia / 2)) * Math.PI / 180; 
        const startX = centro + raioInterno * Math.cos(anguloRaio);
        const startY = centro + raioInterno * Math.sin(anguloRaio);
        const endX = centro + raioExterno * Math.cos(anguloRaio);
        const endY = centro + raioExterno * Math.sin(anguloRaio);
        pincel.beginPath();
        pincel.moveTo(startX, startY);
        pincel.lineTo(endX, endY);
        pincel.stroke();
    }
    pincel.fillStyle = '#D4AF37'; 
    pincel.font = 'bold 24px Arial';
    pincel.textAlign = 'center';
    pincel.textBaseline = 'middle';
    for (let i = 1; i <= 9; i++) {
        if (PONTOS_NUMERO_RODA_VISUAL[i]) {
            const pos = PONTOS_NUMERO_RODA_VISUAL[i]; 
            pincel.fillText(i.toString(), pos.x, pos.y);
        }
    }
}
function desenharNumerosTabela(pincel) {
    pincel.fillStyle = '#D4AF37'; 
    pincel.font = 'bold 20px Arial';
    pincel.textAlign = 'center';
    pincel.textBaseline = 'middle';
    for (let i = 1; i <= 9; i++) {
        let pos = PONTOS_SIGILO_TABELA[i]; 
        pincel.fillText(i.toString(), pos.x, pos.y);
    }
}
function desenharTabelaAssistente(pincel) {
    pincel.strokeStyle = '#333';
    pincel.lineWidth = 1;
    pincel.beginPath();
    pincel.moveTo(100, 0); pincel.lineTo(100, 300);
    pincel.moveTo(200, 0); pincel.lineTo(200, 300);
    pincel.stroke();
    pincel.beginPath(); 
    pincel.moveTo(0, 100); pincel.lineTo(300, 100);
    pincel.moveTo(0, 200); pincel.lineTo(300, 200);
    pincel.stroke(); 
}
function desenharCaminhoDoSigilo(pincel, numeros, posicoes) {
    let primeiroNumero = numeros[0];
    if (!posicoes[primeiroNumero]) { return; }
    let posInicial = posicoes[primeiroNumero];
    pincel.moveTo(posInicial.x, posInicial.y);
    pincel.arc(posInicial.x, posInicial.y, 5, 0, 2 * Math.PI); 
    for (let i = 1; i < numeros.length; i++) {
        let numeroAnterior = numeros[i-1];
        let numeroAtual = numeros[i];
        if (posicoes[numeroAnterior] && posicoes[numeroAtual]) {
            let posAnterior = posicoes[numeroAnterior]; 
            let posAtual = posicoes[numeroAtual];
            pincel.moveTo(posAnterior.x, posAnterior.y); 
            pincel.lineTo(posAtual.x, posAtual.y);
        }
    }
    let ultimoNumero = numeros[numeros.length - 1];
    if (posicoes[ultimoNumero]) {
        let posFinal = posicoes[ultimoNumero];
        pincel.moveTo(posFinal.x, posFinal.y);
        pincel.lineTo(posFinal.x + 8, posFinal.y + 8); 
    }
}
function desenharSigiloNaTela(pincel, metodo, numeros, isSvg = false) {
    const posicoes = (metodo === 'tabela') ? PONTOS_SIGILO_TABELA : PONTOS_SIGILO_RODA;
    if (numeros.length < 1) { return; }
    if (isSvg) {
        // --- MÉTODO PARA SVG (Brilho Falso, 2 Passadas) ---
        pincel.beginPath(); 
        pincel.strokeStyle = 'rgba(212, 175, 55, 0.3)'; 
        pincel.lineWidth = 7; 
        pincel.lineCap = 'round';       
        pincel.lineJoin = 'round';      
        pincel.shadowColor = 'transparent'; 
        pincel.shadowBlur = 0;
        desenharCaminhoDoSigilo(pincel, numeros, posicoes); 
        pincel.stroke();
        pincel.beginPath(); 
        pincel.strokeStyle = '#D4AF37'; 
        pincel.lineWidth = 3; 
        desenharCaminhoDoSigilo(pincel, numeros, posicoes); 
        pincel.stroke();
    } else {
        // --- MÉTODO PARA PNG (Brilho Real, 1 Passada) ---
        pincel.beginPath(); 
        pincel.strokeStyle = '#D4AF37'; 
        pincel.lineWidth = 3;           
        pincel.lineCap = 'round';       
        pincel.lineJoin = 'round';      
        pincel.shadowColor = 'rgba(212, 175, 55, 0.7)'; 
        pincel.shadowBlur = 5; 
        desenharCaminhoDoSigilo(pincel, numeros, posicoes); 
        pincel.stroke();
        pincel.shadowColor = 'transparent';
        pincel.shadowBlur = 0;
    }
}

/* ************ LÓGICA DO MODAL DE UPGRADE ************ */
function abrirModalPremium() {
    overlay.style.display = 'block';
    premiumModal.style.display = 'block';
}
function fecharModalPremium() {
    overlay.style.display = 'none';
    premiumModal.style.display = 'none';
}
btnCloseModal.addEventListener('click', fecharModalPremium);
overlay.addEventListener('click', fecharModalPremium);

// "Ouvinte" para o botão "Ver Planos" no pop-up
btnVerPlanos.addEventListener('click', () => {
    window.location.href = 'pagamento.html';
});

// "Ouvinte" (Tranca) para o botão de Tabela Quadrada
optTabela.addEventListener('click', (event) => {
    // Agora verifica os créditos REAIS
    if (creditosUsuario <= 0 && !isUsuarioPremium) {
        event.preventDefault(); 
        document.getElementById('optRoda').checked = true;
        abrirModalPremium();
    }
});
// "Ouvinte" (Tranca) para o botão de Download SVG
btnDownloadSVG.addEventListener('click', async (event) => { 
    event.preventDefault(); 
    
    if (isUsuarioPremium) {
        window.location.href = btnDownloadSVG.href;
        return;
    }
    
    if (creditosUsuario <= 0) {
        abrirModalPremium();
    } else {
        if (confirm("Você gostaria de gastar 1 crédito Premium para baixar este sigilo em SVG?")) {
            const sucesso = await gastarCredito(); 
            if (sucesso) {
                window.location.href = btnDownloadSVG.href;
            } else {
                alert("Houve um erro ao processar seu crédito. Tente novamente.");
            }
        }
    }
});