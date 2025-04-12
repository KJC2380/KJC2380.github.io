document.addEventListener('DOMContentLoaded', () => {
    const ROWS = 9;
    const COLS = 9;
    const MINES = 10;

    const gameDiv = document.getElementById('game');
    const board = [];
    let gameOver = false;

    // 初始化游戏板
    function initBoard() {
        gameDiv.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            const row = [];
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', () => revealCell(r, c));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    toggleFlag(r, c);
                });
                gameDiv.appendChild(cell);
                row.push(cell);
            }
            board.push(row);
        }

        // 随机放置地雷
        placeMines();
        // 计算每个单元格周围的地雷数量
        calculateNumbers();
    }

    // 随机放置地雷
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < MINES) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            if (!board[r][c].hasMine) {
                board[r][c].hasMine = true;
                minesPlaced++;
            }
        }
    }

    // 计算每个单元格周围的地雷数量
    function calculateNumbers() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!board[r][c].hasMine) {
                    board[r][c].adjacentMines = countAdjacentMines(r, c);
                }
            }
        }
    }

    // 计算相邻地雷数量
    function countAdjacentMines(r, c) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].hasMine) {
                    count++;
                }
            }
        }
        return count;
    }

    // 揭示单元格
    function revealCell(r, c) {
        if (gameOver || board[r][c].isRevealed || board[r][c].flagged) return;

        board[r][c].isRevealed = true;
        const cell = board[r][c];

        if (cell.hasMine) {
            cell.classList.add('revealed', 'mine');
            gameOver = true;
            alert('游戏结束！你踩到了地雷！');
            return;
        }

        if (cell.adjacentMines > 0) {
            cell.classList.add('revealed', 'number');
            cell.textContent = cell.adjacentMines;
        } else {
            cell.classList.add('revealed');
            // 递归揭示空白单元格
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                        revealCell(nr, nc);
                    }
                }
            }
        }

        // 检查是否胜利
        checkWin();
    }

    // 切换标记
    function toggleFlag(r, c) {
        if (gameOver || board[r][c].isRevealed) return;

        const cell = board[r][c];
        if (cell.flagged) {
            cell.classList.remove('flagged');
            cell.textContent = '';
        } else {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        }
    }

    // 检查是否胜利
    function checkWin() {
        let revealedCount = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c].isRevealed) revealedCount++;
            }
        }
        if (revealedCount === ROWS * COLS - MINES) {
            gameOver = true;
            alert('恭喜你，你赢了！');
        }
    }

    // 初始化游戏
    initBoard();
});