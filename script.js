document.addEventListener("DOMContentLoaded", () => {
  const chessBoard = document.getElementById("chess-board");

  // Unicode for chess pieces
  const initialPieces = {
      0: ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
      1: ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
      6: ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
      7: ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
  };

  let selectedPiece = null;
  let selectedSquare = null;
  let board = [];

  // Create board structure and initialize squares
  for (let row = 0; row < 8; row++) {
      board[row] = [];
      for (let col = 0; col < 8; col++) {
          const square = document.createElement("div");
          square.classList.add("square");
          square.dataset.row = row;
          square.dataset.col = col;

          // Alternate colors
          if ((row + col) % 2 === 0) {
              square.classList.add("white");
          } else {
              square.classList.add("black");
          }

          // Add pieces if in initial position
          if (initialPieces[row] && initialPieces[row][col]) {
              const piece = document.createElement("div");
              piece.classList.add("piece");
              piece.textContent = initialPieces[row][col];
              piece.dataset.color = row < 2 ? "black" : "white"; // Assign color to pieces
              piece.dataset.type = getPieceType(row, col);
              square.appendChild(piece);
              board[row][col] = piece; // Store the piece on the board array
          } else {
              board[row][col] = null; // Empty square
          }

          square.addEventListener("click", () => handleSquareClick(square));
          chessBoard.appendChild(square);
      }
  }

  // Get piece type based on its initial position
  function getPieceType(row, col) {
      if (row === 0 || row === 7) {
          switch (col) {
              case 0:
              case 7:
                  return "rook";
              case 1:
              case 6:
                  return "knight";
              case 2:
              case 5:
                  return "bishop";
              case 3:
                  return "queen";
              case 4:
                  return "king";
              default:
                  return "";
          }
      }
      if (row === 1 || row === 6) {
          return "pawn";
      }
      return "";
  }

  // Handle square click
  function handleSquareClick(square) {
      if (selectedPiece) {
          const targetPiece = square.querySelector(".piece");

          // Check if the move is valid for the selected piece
          if (isValidMove(selectedPiece, square, targetPiece)) {
              movePieceToSquare(square);
          } else {
              deselect();
          }
      } else {
          // Select a piece
          const piece = square.querySelector(".piece");
          if (piece) {
              selectedPiece = piece;
              selectedSquare = square;
              square.classList.add("selected");
          }
      }
  }

  // Validate if the move is allowed for the piece
  function isValidMove(piece, targetSquare, targetPiece) {
      const startRow = parseInt(selectedSquare.dataset.row);
      const startCol = parseInt(selectedSquare.dataset.col);
      const endRow = parseInt(targetSquare.dataset.row);
      const endCol = parseInt(targetSquare.dataset.col);
      const pieceType = piece.dataset.type;
      const pieceColor = piece.dataset.color;

      // For simplicity, validate moves based on piece type
      switch (pieceType) {
          case "pawn":
              return isValidPawnMove(startRow, startCol, endRow, endCol, pieceColor, targetPiece);
          case "rook":
              return isValidRookMove(startRow, startCol, endRow, endCol, targetPiece);
          case "knight":
              return isValidKnightMove(startRow, startCol, endRow, endCol, targetPiece);
          case "bishop":
              return isValidBishopMove(startRow, startCol, endRow, endCol, targetPiece);
          case "queen":
              return isValidQueenMove(startRow, startCol, endRow, endCol, targetPiece);
          case "king":
              return isValidKingMove(startRow, startCol, endRow, endCol, targetPiece);
          default:
              return false;
      }
  }

  // Specific validation for each piece type

  // Pawn Move
  function isValidPawnMove(startRow, startCol, endRow, endCol, color, targetPiece) {
      const direction = color === "white" ? -1 : 1;
      const startRowPawn = color === "white" ? 6 : 1;
      if (startCol === endCol && targetPiece === null) {
          if (endRow === startRow + direction) return true;
          if (endRow === startRow + direction * 2 && startRow === startRowPawn && !board[endRow][endCol]) return true;
      }
      if (Math.abs(startCol - endCol) === 1 && endRow === startRow + direction && targetPiece && targetPiece.dataset.color !== color) {
          return true;
      }
      return false;
  }

  // Rook Move
  function isValidRookMove(startRow, startCol, endRow, endCol, targetPiece) {
      if (startRow !== endRow && startCol !== endCol) return false;
      return !isBlocked(startRow, startCol, endRow, endCol);
  }

  // Knight Move
  function isValidKnightMove(startRow, startCol, endRow, endCol, targetPiece) {
      const rowDiff = Math.abs(startRow - endRow);
      const colDiff = Math.abs(startCol - endCol);
      if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
          if (targetPiece === null || targetPiece.dataset.color !== selectedPiece.dataset.color) {
              return true;
          }
      }
      return false;
  }

  // Bishop Move
  function isValidBishopMove(startRow, startCol, endRow, endCol, targetPiece) {
      if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) return false;
      return !isBlocked(startRow, startCol, endRow, endCol);
  }

  // Queen Move (combines Rook and Bishop logic)
  function isValidQueenMove(startRow, startCol, endRow, endCol, targetPiece) {
      return isValidRookMove(startRow, startCol, endRow, endCol, targetPiece) || isValidBishopMove(startRow, startCol, endRow, endCol, targetPiece);
  }

  // King Move
  function isValidKingMove(startRow, startCol, endRow, endCol, targetPiece) {
      const rowDiff = Math.abs(startRow - endRow);
      const colDiff = Math.abs(startCol - endCol);
      if (rowDiff <= 1 && colDiff <= 1) {
          if (targetPiece === null || targetPiece.dataset.color !== selectedPiece.dataset.color) {
              return true;
          }
      }
      return false;
  }

  // Check if a path is blocked by other pieces
  function isBlocked(startRow, startCol, endRow, endCol) {
      const rowDiff = endRow - startRow;
      const colDiff = endCol - startCol;
      const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
      const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

      let row = startRow + rowStep;
      let col = startCol + colStep;
      while (row !== endRow || col !== endCol) {
          if (board[row][col] !== null) return true; // Blocked
          row += rowStep;
          col += colStep;
      }
      return false;
  }

  // Move the piece to the target square
  function movePieceToSquare(square) {
      square.appendChild(selectedPiece);
      board[selectedSquare.dataset.row][selectedSquare.dataset.col] = null;
      board[square.dataset.row][square.dataset.col] = selectedPiece;
      deselect();
  }

  // Deselect the current selection
  function deselect() {
      if (selectedSquare) {
          selectedSquare.classList.remove("selected");
      }
      selectedPiece = null;
      selectedSquare = null;
  }
});
