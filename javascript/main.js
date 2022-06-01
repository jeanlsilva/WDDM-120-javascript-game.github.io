document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const flagsArea = document.querySelector('#flags');
    const timerArea = document.querySelector('#timer');
    const faceArea = document.querySelector('#face');
    const faceButton = faceArea.querySelector('img');
    const explosionAudio = document.querySelector('#explosion');
    const winAudio = document.querySelector('#win');
    const easy = document.querySelector('#easy');
    const intermediate = document.querySelector('#intermediate');
    const hard = document.querySelector('#hard');
    const levels = document.querySelector('.levels');
    let width = 10;
    let bombAmount = 20;
    let squares = [];
    let isGameOver = true;
    let interval = 0;
    let flags = 0;

    easy.addEventListener('click', () => {
        levels.style.display = 'none';
        start(10);
    });

    intermediate.addEventListener('click', () => {
        levels.style.display = 'none';
        start(20);
    });

    hard.addEventListener('click', () => {
        levels.style.display = 'none';
        start(30);
    });

    faceButton.addEventListener('click', () => {
        faceButton.setAttribute('src', 'images/smiley-face.png')
        restart();
    });

    function createBoard(bombs) {
        bombAmount = bombs;
        const bombsArray = Array(bombs).fill('bomb');
        const emptyArray = Array(width*width - bombs).fill('valid')

        const gameArray = emptyArray.concat(bombsArray);

        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i);
            square.classList.add(shuffledArray[i]);
            grid.appendChild(square);
            squares.push(square);

            square.addEventListener('click', function(e) {
                click(square, false);
            })

            square.oncontextmenu = function(e) {
                e.preventDefault();
                addFlag(square);
            }
        }

        for (let i=0; i < squares.length; i++) {
            let total = 0;
            const isLeftEdge = (i % width === 0);
            const isRightEdge = (i % width === width - 1);

            if (squares[i].classList.contains('valid')) {
                if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++;
                if (i > 9 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++;
                if (i > 10 && squares[i - width].classList.contains('bomb')) total++;
                if (i > 11 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++;
                if (i < 98 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++;
                if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++;
                if (i < 88 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++;
                if (i < 89 && squares[i + width].classList.contains('bomb')) total++;

                squares[i].setAttribute('data', total);
            }
        }
    }

    createBoard(20);

    function start(bombs) {
        let timer = 180;
        isGameOver = false;
        timerArea.style.visibility = 'visible';
        flagsArea.style.visibility = 'visible';
        grid.innerHTML = '';
        createBoard(bombs);
        interval = setInterval(() => {
            const timerSpan = timerArea.querySelector('span');
            timerSpan.innerHTML = '';
            timer = timer - 1;
            const minutes = Math.floor(timer / 60);
            const seconds = ((timer - minutes * 60));
            timerSpan.innerHTML = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            if (timer == 0) {
                gameOver();
            }
        }, 1000);
    }

    function addFlag(square) {
        if (isGameOver) return;
        if (!square.classList.contains('checked') && (flags < bombAmount)) {
            if (!square.classList.contains('flag')) {
                square.classList.add('flag');
                square.innerHTML = '🚩';
                flags++;
                checkForWin()
                const flagCount = flagsArea.querySelector('span');
                flagCount.innerHTML = 20 - flags;
            } else {
                square.classList.remove('flag');
                square.innerHTML = '';
                flags--;
            }
        }
    }

    function click(square, neighbour) {
        let currentId = square.id;
        if (isGameOver) return;
        if (square.classList.contains('checked') || square.classList.contains('flag')) return;
        if (square.classList.contains('bomb') && neighbour === false) {
            gameOver(square);
        } else if (!square.classList.contains('bomb')) {
            let total = square.getAttribute('data');
            if (total != 0) {
                square.classList.add('checked');
                square.innerHTML = total;
                return;
            }
            checkSquare(square, currentId) 
        }
        if (!square.classList.contains('bomb')) {
            square.classList.add('checked');
        }
    }

    function checkSquare(square, currentId) {
        const isLeftEdge = (currentId % width === 0);
        const isRightEdge = (currentId % width === width - 1);
    
        setTimeout(() => {
            if (currentId > 0 && !isLeftEdge) {
                const newId = squares[parseInt(currentId) - 1].id;
                const newSquare = document.getElementById(newId);
                click(newSquare, true);
            }
            if (currentId > 9 && !isRightEdge) {
                const newId = squares[parseInt(currentId) + 1 - width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare, true);
            }
            if (currentId > 10) {
                const newId = squares[parseInt(currentId - width)].id;
                const newSquare = document.getElementById(newId);
                click(newSquare, true);
            }
            if (currentId > 11 && !isLeftEdge) {
                const newId = squares[parseInt(currentId - 1 - width)].id;
                const newSquare = document.getElementById(newId);
                click(newSquare, true);
            }
            if (currentId < 98 && !isRightEdge) {
                const newId = squares[parseInt(currentId) + 1].id;
                const newSquare = document.getElementById(newId);
                click(newSquare, true);
            }
            if (currentId < 90 && !isLeftEdge) {
                const newId = squares[parseInt(currentId) - 1 + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare, true);
            }
            if (currentId < 88 && !isRightEdge) {
                const newId = squares[parseInt(currentId) + 1 + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare, true);
            }
            if (currentId < 89) {
                const newId = squares[parseInt(currentId) + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare, true);
            }
        }, 10)
    }

    function gameOver(square) {
        console.log('BOOM! Game Over!');
        explosionAudio.pause();
        explosionAudio.currentTime = 0;
        explosionAudio.play();
        faceButton.setAttribute('src', 'images/dead-face.png')
        isGameOver = true;
        clearInterval(interval);

        squares.forEach(square => {
            if (square.classList.contains('bomb')) {
                square.innerHTML = '💣';
                square.classList.add('bomb-shown')
            }
        })
    }

    function checkForWin() {
        let matches = 0;
        console.log
        for (let i=0; i < squares.length; i++) {
            if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
                matches++;
            }
            if (matches === bombAmount) {
                console.log('WIN!');
                winAudio.pause();
                winAudio.currentTime = 0;
                winAudio.play();
                faceButton.setAttribute('src', 'images/winner-face.png')
                isGameOver = true;
                clearInterval(interval);
            }
        }
    }

    function restart() {
        squares.forEach(square => {
            square.innerHTML = '';
            square.style.backgroundColor = '#CCCCCC';
        })
        clearInterval(interval);
        flags = 0;
        const flagCount = flagsArea.querySelector('span');
        flagCount.innerHTML = 20;
        const timerSpan = timerArea.querySelector('span');
        timerSpan.innerHTML = '3:00';
        squares = [];
        levels.style.display = 'flex';
        timerArea.style.visibility = 'hidden';
        flagsArea.style.visibility = 'hidden';
    }
});

