import { registerUser, loginUser, updateBalance } from './firebase.js';

// --- Configurações iniciais ---
let currentUser = null;
let gridSize = 5; // Tamanho padrão da grade (5x5)
let board = Array(gridSize * gridSize).fill("diamond");
let revealed = Array(gridSize * gridSize).fill(false);
let bombs = 0;
let bet = 0;
let multiplier = 1;
let balance = 100;
let gameOver = true;
let boardTopMargin = 50; // distância da grade do topo

// Sons
const soundDiamond = new Audio('diamond.mp3'); // caminho do som do diamante
const soundBomb = new Audio('bomb.mp3');       // caminho do som da bomba

console.log("🟢 Sistema iniciado: Configurações iniciais carregadas");

// --- Tela inicial visível ---
document.getElementById('tela1').style.display = 'flex';
document.getElementById('tela2').style.display = 'none';
console.log("📄 Tela inicial ativa: Tela de login/registro visível");

// --- Sistema de registro de usuário ---
window.register = async function() {
  console.log("🔑 Sistema de registro ativado");
  document.getElementById("loginMsg").innerText = "🔑 Registrando usuário...";
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const user = await registerUser(username, password);
  if(!user){
    document.getElementById('loginMsg').innerText = "⚠️ Usuário já existe!";
    console.log("⚠️ Registro falhou: usuário já existe");
    return;
  }
  currentUser = user;
  balance = user.moedas;
  console.log(`✅ Usuário registrado: ${username}, saldo inicial: ${balance}`);
  document.getElementById("loginMsg").innerText = "✅ Registro bem-sucedido!";
  showGameScreen();
}

// --- Sistema de login ---
window.login = async function() {
  console.log("🔐 Sistema de login ativado");
  document.getElementById("loginMsg").innerText = "🔐 Fazendo login...";
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const user = await loginUser(username, password);
  if(!user){
    document.getElementById('loginMsg').innerText = "❌ Usuário ou senha incorretos!";
    console.log("❌ Login falhou: usuário ou senha incorretos");
    return;
  }
  currentUser = user;
  balance = user.moedas;
  console.log(`✅ Login bem-sucedido: ${username}, saldo: ${balance}`);
  document.getElementById("loginMsg").innerText = "✅ Login bem-sucedido!";
  showGameScreen();
}

// --- Sistema de logout ---
window.logout = function() {
  console.log("🚪 Logout realizado");
  document.getElementById('tela2').style.display = 'none';
  document.getElementById('tela1').style.display = 'flex';
  currentUser = null;
  balance = 100;
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('loginMsg').innerText = '';
}

// --- Mostrar tela do jogo ---
function showGameScreen(){
  console.log("🎮 Exibindo tela do jogo");
  document.getElementById('tela1').style.display = 'none';
  document.getElementById('tela2').style.display = 'flex';
  document.getElementById('balance').innerText = "Saldo: " + balance;
  renderBoard();
}

// --- Configuração da grade ---
function configureBoard(size, topMargin){
  console.log(`⚙️ Configurando grade: ${size}x${size}, distância do topo: ${topMargin}px`);
  gridSize = size;
  boardTopMargin = topMargin;
  board = Array(gridSize * gridSize).fill("diamond");
  revealed = Array(gridSize * gridSize).fill(false);
  renderBoard();
}

// --- Sistema de iniciar jogo ---
window.startGame = function() {
  console.log("🎲 Sistema de início de jogo ativado");
  bombs = parseInt(document.getElementById("bombsInput").value);
  bet = parseInt(document.getElementById("betInput").value);

  if (bombs > 24) {
    document.getElementById("customAlert").style.display = "flex";
    document.getElementById("bombsInput").value = 24;
    console.log("⚠️ Número de bombas ajustado para 24 (máximo permitido)");
    return;
  }
  if (bombs < 1) bombs = 1;
  document.getElementById("bombsInput").value = bombs;

  if (bet > balance) {
    document.getElementById("status").innerText = "⚠️ Saldo insuficiente!";
    console.log("⚠️ Aposta maior que o saldo");
    return;
  }

  balance -= bet;
  multiplier = 1;
  gameOver = false;
  document.getElementById("status").innerText = "🎮 Jogo iniciado! Boa sorte!";
  document.getElementById("balance").innerText = "Saldo: " + balance;

  board = Array(gridSize * gridSize).fill("diamond");
  revealed = Array(gridSize * gridSize).fill(false);

  let bombCount = 0;
  while (bombCount < bombs) {
    let pos = Math.floor(Math.random() * gridSize * gridSize);
    if (board[pos] === "diamond") {
      board[pos] = "bomb";
      bombCount++;
    }
  }

  console.log(`💣 Jogo configurado: ${bombs} bombas, aposta: ${bet}`);
  renderBoard();
}

// --- Sistema de renderização da grade ---
function renderBoard() {
  const container = document.getElementById("board");
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`;
  container.style.marginTop = boardTopMargin + "px";

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    if (revealed[i]) {
      cell.classList.add(board[i]);
      cell.classList.add("revealed");
      cell.innerText = board[i] === "diamond" ? "💎" : "💣";
    }

    cell.addEventListener("click", () => reveal(i));
    container.appendChild(cell);
  }
  console.log("🖼️ Grade renderizada");
}

// --- Sistema de revelar célula ---
function reveal(i) {
  if (gameOver || revealed[i]) return;
  if (board[i] === "bomb") {
    soundBomb.play(); //som da bomba
    for (let j = 0; j < board.length; j++) revealed[j] = true;
    gameOver = true;
    renderBoard();
    document.getElementById("board").children[i].style.border = "3px solid yellow";
    document.getElementById("status").innerText = "💥 Você perdeu!";
    console.log("💥 Bomba revelada: jogo perdido");
  } else {
    revealed[i] = true;
    soundDiamond.play(); //som do diamante
    multiplier += 0.3 + (bombs * 0.05);
    document.getElementById("status").innerText = "💎 Achou um diamante! Multiplicador: x" + multiplier.toFixed(2);
    renderBoard();
    console.log("💎 Diamante revelado, multiplicador atualizado: x" + multiplier.toFixed(2));
  }
}

// --- Sistema de saque (cash out) ---
window.cashOut = async function() {
  console.log("💰 Sistema de saque ativado");
  if (gameOver || multiplier === 1) {
    document.getElementById("status").innerText = "⚠️ Não há diamantes para sacar!";
    console.log("⚠️ Saque inválido");
    return;
  }

  let win = Math.floor(bet * multiplier);
  balance += win;
  document.getElementById("balance").innerText = "Saldo: " + balance;

  if(currentUser){
    await updateBalance(currentUser.id, balance);
    currentUser.moedas = balance;
    console.log(`💾 Saldo atualizado no servidor: ${balance}`);
  }

  endGame("🏆 Você sacou " + win + "!");
}

// --- Sistema de fim de jogo ---
function endGame(message){
  document.getElementById("status").innerText = message;
  gameOver = true;
  board = Array(gridSize * gridSize).fill("diamond");
  revealed = Array(gridSize * gridSize).fill(false);
  renderBoard();
  console.log("🏁 Jogo finalizado: " + message);
}

// --- Exemplo de configuração da grade ---
// configureBoard(6, 150);
