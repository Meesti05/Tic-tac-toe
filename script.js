let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = false;
let playerNames = { X: "Player 1", O: "Player 2" };

function startGame() {
  const playerX = document.getElementById("playerX").value || "Player 1";
  const playerO = document.getElementById("playerO").value || "Player 2";
  playerNames.X = playerX;
  playerNames.O = playerO;

  gameActive = true;
  board.fill("");
  updateBoard();
  currentPlayer = "X";

  document.getElementById("turn").textContent = `${playerNames.X}'s Turn (X)`;
  document.getElementById("gameStatus").textContent = "The game is started";
}

function makeMove(index) {
  if (!gameActive || board[index]) return;

  board[index] = currentPlayer;
  document.getElementById("clickSound").play();
  updateBoard();
  checkWinner();

  if (gameActive) {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    document.getElementById("turn").textContent = `${playerNames[currentPlayer]}'s Turn (${currentPlayer})`;
  }
}

function updateBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.textContent = board[i];
    cell.classList.remove("x", "o");
    if (board[i] === "X") cell.classList.add("x");
    if (board[i] === "O") cell.classList.add("o");
  });
}

function checkWinner() {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameActive = false;

      const winner = playerNames[board[a]];
      document.getElementById("winnerMessage").innerHTML = `🎉 ${winner} has won the game! 🥳✨`;
      document.getElementById("winnerPopup").classList.remove("hidden");

      // Add short delay to allow DOM update before playing sound
      setTimeout(() => {
        document.getElementById("celebrationSound").play();
      }, 100);

      return;
    }
  }

  if (!board.includes("")) {
    gameActive = false;
    document.getElementById("turn").textContent = "It's a Tie! 🤝";
  }
}

function resetGame() {
  board.fill("");
  gameActive = true;
  updateBoard();
  currentPlayer = "X";
  document.getElementById("turn").textContent = `Click Start Game`;
  document.getElementById("gameStatus").textContent = "";
}

function closePopup() {
  document.getElementById("winnerPopup").classList.add("hidden");
}
