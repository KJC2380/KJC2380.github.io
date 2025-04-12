document.addEventListener('DOMContentLoaded', () => {
    const ROWS = 9;
    const COLS = 9;
    const MINES = 10;

    const gameDiv = document.getElementById('game');
    const historyDiv = document.getElementById('history');
    const board = [];
    let gameOver = false;
    let startTime;
    let timerInterval;
    let gameResult = '';

    // 初始化游戏板
    function initBoard() {
        gameDiv.innerHTML = '';
        gameDiv.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;
        gameDiv.style.gridTemplateRows = `repeat(${ROWS}, 30px)`;

        for (let r = 0; r < ROWS; r++) {
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
                board.push({ element: cell, hasMine: false, isRevealed: false, adjacentMines: 0, flagged: false });
            }
        }

        // 随机放置地雷
        placeMines();
        // 计算每个单元格周围的地雷数量
        calculateNumbers();

        // 初始化计时器
        startTime = Date.now();
        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);
        document.getElementById('timer').textContent = '时间: 0 秒';
    }

    // 显示计时器
    function updateTimer() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer').textContent = `时间: ${elapsedTime} 秒`;
    }

    // 在页面添加一个计时器显示
    const timerDiv = document.createElement('div');
    timerDiv.id = 'timer';
    gameDiv.parentNode.insertBefore(timerDiv, gameDiv);

    // 随机放置地雷
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < MINES) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            if (!board[r * COLS + c].hasMine) {
                board[r * COLS + c].hasMine = true;
                minesPlaced++;
            }
        }
    }

    // 计算每个单元格周围的地雷数量
    function calculateNumbers() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!board[r * COLS + c].hasMine) {
                    board[r * COLS + c].adjacentMines = countAdjacentMines(r, c);
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
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr * COLS + nc].hasMine) {
                    count++;
                }
            }
        }
        return count;
    }

    // 揭示单元格
    function revealCell(r, c) {
        if (gameOver || board[r * COLS + c].isRevealed || board[r * COLS + c].flagged) return;

        const cell = board[r * COLS + c];
        cell.element.classList.add('revealed');
        cell.isRevealed = true;

        if (cell.hasMine) {
            cell.element.classList.add('mine');
            gameOver = true;
            gameResult = '失败';
            clearInterval(timerInterval);
            showResult();
            return;
        }

        if (cell.adjacentMines > 0) {
            cell.element.textContent = cell.adjacentMines;
            cell.element.classList.add('number');
        } else {
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
        if (gameOver || board[r * COLS + c].isRevealed) return;

        const cell = board[r * COLS + c];
        if (cell.flagged) {
            cell.element.classList.remove('flagged');
            cell.element.textContent = '';
            cell.flagged = false;
        } else {
            cell.element.classList.add('flagged');
            cell.element.textContent = '🚩';
            cell.flagged = true;
        }
    }

    // 检查是否胜利
    function checkWin() {
        let revealedCount = 0;
        for (let i = 0; i < board.length; i++) {
            if (board[i].isRevealed) revealedCount++;
        }
        if (revealedCount === ROWS * COLS - MINES) {
            gameOver = true;
            gameResult = '胜利';
            clearInterval(timerInterval);
            showResult();
        }
    }

    // 显示游戏结果并记录数据
    function showResult() {
        alert(`游戏结束！你${gameResult}了！`);
        saveGameRecord(gameResult, Math.floor((Date.now() - startTime) / 1000));
        updateHistory();
        // 重置游戏
        setTimeout(initBoard, 2000);
    }

    // 保存游戏记录
    const gameRecords = JSON.parse(localStorage.getItem('gameRecords')) || [];
    function saveGameRecord(result, duration) {
        gameRecords.push({
            result,
            duration,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('gameRecords', JSON.stringify(gameRecords));
    }

    // 更新历史记录显示
    function updateHistory() {
        historyDiv.innerHTML = '<h2>历史记录</h2>';
        const records = JSON.parse(localStorage.getItem('gameRecords')) || [];
        if (records.length === 0) {
            historyDiv.innerHTML += '<p>暂无记录。</p>';
            return;
        }
        records.forEach((record, index) => {
            const recordItem = document.createElement('div');
            recordItem.classList.add('history-item');
            recordItem.innerHTML = `
                <span>${record.result} - ${record.duration} 秒 (${record.date})</span>
                <button onclick="deleteRecord(${index})">删除</button>
            `;
            historyDiv.appendChild(recordItem);
        });
    }

    // 删除指定记录
    window.deleteRecord = function(index) {
        let records = JSON.parse(localStorage.getItem('gameRecords')) || [];
        records.splice(index, 1);
        localStorage.setItem('gameRecords', JSON.stringify(records));
        updateHistory();
    }

    // 初始化游戏
    updateHistory(); // 页面加载时显示历史记录
    initBoard();
});
