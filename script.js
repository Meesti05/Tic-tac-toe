/**
 * Tic Tac Toe Game
 * Enhanced with better state management, event listeners, input validation,
 * debouncing for click events, and error handling for audio
 */

// Game state managed in a class for better organization
class TicTacToe {
  constructor() {
    this.board = ["", "", "", "", "", "", "", "", ""];
    this.currentPlayer = "X";
    this.gameActive = false;
    this.playerNames = { X: "Player 1", O: "Player 2" };
    this.lastClickTime = 0;
    this.clickDelay = 300; // Minimum time between clicks in milliseconds
    
    // Initialize event listeners
    this.initEventListeners();
    
    // Initialize video loading handler
    this.handleVideoLoading();
  }
  
  // Set up all event listeners
  initEventListeners() {
    // Replace inline onclick handlers with event listeners
    document.getElementById("startButton").addEventListener("click", () => this.startGame());
    document.getElementById("resetButton").addEventListener("click", () => this.resetGame());
    document.getElementById("closePopupButton").addEventListener("click", () => this.closePopup());
    
    // Add event listeners to all cells
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
      // Click event listener
      cell.addEventListener("click", () => {
        const index = parseInt(cell.getAttribute("data-index"));
        this.makeMove(index);
      });
      
      // Keyboard accessibility
      cell.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const index = parseInt(cell.getAttribute("data-index"));
          this.makeMove(index);
        }
      });
    });
    
    // Add form validation for player names
    const playerInputs = document.querySelectorAll("input[type='text']");
    playerInputs.forEach(input => {
      input.addEventListener("input", () => {
        // Basic validation - prevent special characters that could be used for XSS
        input.value = input.value.replace(/[<>]/g, '');
        
        // Limit name length to a reasonable value
        if (input.value.length > 20) {
          input.value = input.value.substring(0, 20);
        }
      });
    });
  }
  
  // Handle video loading indicator
  handleVideoLoading() {
    const video = document.getElementById("bgVideo");
    const loadingIndicator = document.getElementById("loadingIndicator");
    
    // Show loading indicator while video is loading
    if (video.readyState < 4) {
      loadingIndicator.classList.remove("hidden");
    }
    
    // Hide loading indicator when video is ready
    video.addEventListener("canplaythrough", () => {
      loadingIndicator.classList.add("hidden");
    });
    
    // Fallback to hide loading indicator after 5 seconds in case of issues
    setTimeout(() => {
      loadingIndicator.classList.add("hidden");
    }, 5000);
  }
  
  // Start the game with input validation
  startGame() {
    // Get and validate player names
    const playerXInput = document.getElementById("playerX");
    const playerOInput = document.getElementById("playerO");
    
    const playerX = this.validatePlayerName(playerXInput.value) || "Player 1";
    const playerO = this.validatePlayerName(playerOInput.value) || "Player 2";
    
    this.playerNames.X = playerX;
    this.playerNames.O = playerO;

    this.gameActive = true;
    this.board.fill("");
    this.updateBoard();
    this.currentPlayer = "X";

    document.getElementById("turn").textContent = `${this.playerNames.X}'s Turn (X)`;
    
    const gameStatus = document.getElementById("gameStatus");
    gameStatus.textContent = "The game is started";
    gameStatus.setAttribute("aria-label", "Game started. " + `${this.playerNames.X}'s Turn (X)`);
    
    // Update ARIA labels for empty cells
    this.updateAriaLabels();
  }
  
  // Validate player name to prevent XSS and ensure reasonable length
  validatePlayerName(name) {
    if (!name) return "";
    
    // Remove potential harmful characters
    name = name.replace(/[<>]/g, '');
    
    // Limit length
    if (name.length > 20) {
      name = name.substring(0, 20);
    }
    
    return name;
  }
  
  // Make a move with debounce to prevent rapid clicking
  makeMove(index) {
    // Return early if game is not active or cell is already filled
    if (!this.gameActive || this.board[index]) return;
    
    // Implement debouncing to prevent rapid clicks
    const currentTime = new Date().getTime();
    if (currentTime - this.lastClickTime < this.clickDelay) return;
    this.lastClickTime = currentTime;

    // Update the board
    this.board[index] = this.currentPlayer;
    
    // Play sound with error handling
    this.playSound("clickSound");
    
    // Update the UI
    this.updateBoard();
    this.updateAriaLabels();
    this.checkWinner();

    // Switch player if game is still active
    if (this.gameActive) {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
      const turnMessage = `${this.playerNames[this.currentPlayer]}'s Turn (${this.currentPlayer})`;
      document.getElementById("turn").textContent = turnMessage;
    }
  }
  
  // Play sound with error handling
  playSound(soundId) {
    try {
      const sound = document.getElementById(soundId);
      
      // If sound is still playing, reset it
      sound.pause();
      sound.currentTime = 0;
      
      // Create a promise to handle the play
      const playPromise = sound.play();
      
      // Handle potential rejection (e.g., browser policies requiring user interaction)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`Error playing sound: ${error}`);
          // Sound playback was prevented - not critical, so we can continue
        });
      }
    } catch (error) {
      console.error(`Error accessing sound: ${error}`);
    }
  }

  // Update the visual board
  updateBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, i) => {
      cell.textContent = this.board[i];
      cell.classList.remove("x", "o");
      if (this.board[i] === "X") cell.classList.add("x");
      if (this.board[i] === "O") cell.classList.add("o");
    });
  }
  
  // Update ARIA labels for accessibility
  updateAriaLabels() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, i) => {
      const position = i + 1;
      let status = "empty";
      if (this.board[i] === "X") status = "marked with X";
      if (this.board[i] === "O") status = "marked with O";
      
      cell.setAttribute("aria-label", `Cell ${position}, ${status}`);
    });
  }

  // Check for winner or tie
  checkWinner() {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (let condition of winConditions) {
      const [a, b, c] = condition;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.gameActive = false;

        const winner = this.playerNames[this.board[a]];
        const winnerMessage = `🎉 ${winner} has won the game! 🥳✨`;
        
        document.getElementById("winnerMessage").innerHTML = winnerMessage;
        document.getElementById("winnerPopup").classList.remove("hidden");
        document.getElementById("winnerPopup").setAttribute("aria-hidden", "false");

        // Add short delay to allow DOM update before playing sound
        setTimeout(() => {
          this.playSound("celebrationSound");
        }, 100);

        return;
      }
    }

    // Check for tie
    if (!this.board.includes("")) {
      this.gameActive = false;
      const tieMessage = "It's a Tie! 🤝";
      document.getElementById("turn").textContent = tieMessage;
      document.getElementById("turn").setAttribute("aria-label", tieMessage);
    }
  }
  
  // Reset the game
  resetGame() {
    this.board.fill("");
    this.gameActive = false;
    this.updateBoard();
    this.updateAriaLabels();
    this.currentPlayer = "X";
    document.getElementById("turn").textContent = `Click Start Game`;
    document.getElementById("gameStatus").textContent = "";
    
    // Clear player name input fields
    document.getElementById("playerX").value = "";
    document.getElementById("playerO").value = "";
    
    // Reset player names in the game state
    this.playerNames = { X: "Player 1", O: "Player 2" };
  }
  
  // Close winner popup
  closePopup() {
    document.getElementById("winnerPopup").classList.add("hidden");
    document.getElementById("winnerPopup").setAttribute("aria-hidden", "true");
  }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create game instance
  window.game = new TicTacToe();
});
