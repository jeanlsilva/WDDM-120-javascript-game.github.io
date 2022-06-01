document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const flagsArea = document.querySelector('#flags');
    const timerArea = document.querySelector('#timer');
    const faceArea = document.querySelector('#face');
    const faceButton = faceArea.querySelector('img');
    const explosionAudio = document.querySelector('#explosion');
    const winAudio = document.querySelector('#win');
    let width = 10;
    let bombAmount = 20;
    let squares = [];
    let isGameOver = false;
    let interval = 0;

    faceButton.addEventListener('click', () => {
        restart();
    });

    function createBoard() {
        let timer = 300;
        faceButton.setAttribute('src', 'images/smiley-face.png')
        const bombsArray = Array(bombAmount).fill('bomb');
        const emptyArray = Array(width*width - bombAmount).fill('valid')

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

        interval = setInterval(() => {
            const timerSpan = timerArea.querySelector('span');
            timer = timer - 1;
            const minutes = Math.floor(timer / 60);
            const seconds = ((timer - minutes * 60));
            timerSpan.innerHTML = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    createBoard();

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
        square.classList.add('checked');
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

        for (let i=0; i < squares.length; i++) {
            if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
                matches++;
            }
            if (matches === bombAmount) {
                console.log('WIN!');
                winAudio.pause();
                winAudio.currentTIme = 0;
                winAudio.play();
                faceButton.setAttribute('src', 'images/winner-face.png')
                isGameOver = true;
                clearInterval(interval);
            }
        }
    }

    function restart() {
        grid.innerHTML = '';
        isGameOver = false;
        clearInterval(interval);
        flags = 0;
        const flagCount = flagsArea.querySelector('span');
        flagCount.innerHTML = 20;
        createBoard();
    }
});

