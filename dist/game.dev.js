"use strict";

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var startButton = document.getElementById('startButton'); // Кнопка "Начать игру"

var title = document.getElementById('title'); // Заголовок "Flappy Mario"

var helpButton = document.getElementById('helpButton'); // Кнопка "Help"

var helpModal = document.getElementById('helpModal'); // Модальное окно

var closeHelpButton = document.getElementById('closeHelp'); // Кнопка "Закрыть" в модальном окне
// Звук проигрыша

var gameOverSound = new Audio('https://www.myinstants.com/media/sounds/roblox-death-sound-effect.mp3'); // Установка размера canvas на весь экран

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas); // Обновляем размеры канваса при изменении окна
// Загрузка изображений для верхней и нижней части труб

var pipeTop = new Image();
pipeTop.src = 'https://png.klev.club/uploads/posts/2024-04/png-klev-club-o9dc-p-truba-iz-mario-png-16.png'; // Путь к изображению верхней части трубы

var pipeBottom = new Image();
pipeBottom.src = 'https://png.klev.club/uploads/posts/2024-04/png-klev-club-o9dc-p-truba-iz-mario-png-16.png'; // Путь к изображению нижней части трубы
// Картинка для поражения (Потрачено)

var gameOverImage = new Image();
gameOverImage.src = 'https://png.klev.club/uploads/posts/2024-04/thumbs/png-klev-club-kn72-p-potracheno-png-8.png'; // Картинка для поражения
// Фон для первого уровня

var backgroundImage1 = new Image();
backgroundImage1.src = 'https://fotoblik.ru/wp-content/uploads/2023/09/stardew-valley-oboi-13.webp'; // Фон игры для первого уровня
// Фон для второго уровня

var backgroundImage2 = new Image();
backgroundImage2.src = 'https://kartinkin.net/uploads/posts/2021-03/1616042272_29-p-pikselnii-fon-dlya-igri-32.jpg'; // Фон для второго уровня

var bird = {
  x: 150,
  y: canvas.height / 2,
  width: 80,
  // Увеличиваем ширину птицы
  height: 80,
  // Увеличиваем высоту птицы
  gravity: 0.3,
  lift: -12,
  // Увеличиваем силу отталкивания, чтобы птица прыгала выше
  velocity: 0
};
var pipes = [];
var pipeWidth = 80; // Ширина трубы

var pipeGap = canvas.height / 3; // Зазор между колоннами (по умолчанию для первого уровня)

var frameCount = 0;
var score = 0;
var isGameOver = false; // Флаг для проверки поражения

var level = 1; // Переменная для уровня
// Загружаем лучший результат из localStorage

var bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0; // Управление

document.addEventListener('keydown', function (e) {
  if (e.key === ' ' || e.key === 'Spacebar') {
    // Для пробела
    if (isGameOver) {
      resetGame(); // Сбрасываем игру, если она окончена
    } else {
      bird.velocity = bird.lift;
      var beepSound = new Audio('https://zvukitop.com/wp-content/uploads/2021/01/pryjok-2.mp3');
      beepSound.volume = 0.1; // Уменьшаем громкость до 20%

      beepSound.play(); // Воспроизводим новый звук при нажатии на пробел
    }
  }
}); // Звук, который будет воспроизводиться при загрузке страницы

var helloSound = new Audio('https://www.myinstants.com/media/sounds/meme-okay-lets-go.mp3'); // Показываем кнопку "Начать игру" перед началом игры

startButton.addEventListener('click', function () {
  startButton.style.display = 'none'; // Скрываем кнопку после старта

  title.style.display = 'none'; // Скрываем заголовок

  helloSound.play(); // Воспроизводим звук при старте игры
  // Показываем канвас

  canvas.style.display = 'block'; // Показываем канвас только после старта игры
  // Запуск обратного отсчета

  startCountdown();
}); // Функция обратного отсчета

var countdown = 3;

function startCountdown() {
  var countdownInterval = setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистить canvas

    ctx.fillStyle = 'black';
    ctx.font = '100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2); // Пишем цифры на экране
    // Если отсчет закончился, начинаем игру

    if (countdown === 0) {
      clearInterval(countdownInterval); // Останавливаем отсчет

      gameLoop(); // Начинаем игру
    }

    countdown--; // Уменьшаем цифру на 1
  }, 500); // 0.5 секунды для каждого числа
} // Открытие модального окна Help


helpButton.addEventListener('click', function () {
  helpModal.style.display = 'flex';
}); // Закрытие модального окна Help

closeHelpButton.addEventListener('click', function () {
  helpModal.style.display = 'none';
}); // Переход на второй уровень при достижении 20 очков

function levelUp() {
  alert("Поздравляю! Вы прошли первый уровень!");
  level = 2; // Устанавливаем второй уровень

  backgroundImage = backgroundImage2; // Меняем фон на второй уровень

  pipeGap = canvas.height / 4; // Уменьшаем зазор между трубами на втором уровне
} // Game loop


function update() {
  if (isGameOver) return; // Если игра окончена, не обновляем состояние игры
  // Bird physics

  bird.velocity += bird.gravity;
  bird.velocity *= 0.95;
  bird.y += bird.velocity; // Keep bird in bounds

  if (bird.y > canvas.height - bird.height) bird.y = canvas.height - bird.height;
  if (bird.y < 0) bird.y = 0; // Pipe generation

  if (frameCount % 200 === 0) {
    // Увеличен интервал появления колонн
    var pipeY = Math.random() * (canvas.height - pipeGap - 50) + 25;
    pipes.push({
      x: canvas.width,
      y: pipeY
    });
  } // Pipe movement


  pipes = pipes.filter(function (pipe) {
    return pipe.x + pipeWidth > 0;
  });
  pipes.forEach(function (pipe) {
    pipe.x -= 2; // Check for collision

    if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x && (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipeGap)) {
      isGameOver = true; // Устанавливаем флаг проигрыша

      if (score > bestScore) {
        bestScore = score; // Если текущий результат лучше, обновляем лучший результат

        localStorage.setItem('bestScore', bestScore); // Сохраняем лучший результат в localStorage
      } // Воспроизводим звук проигрыша


      gameOverSound.play();
    } // Score tracking


    if (pipe.x + pipeWidth === bird.x) {
      score++;
    }
  }); // Переход на второй уровень при достижении 20 очков

  if (score >= 2 && level === 1) {
    levelUp();
  } // Показать сообщение о победе при достижении 10 очков на втором уровне


  if (score >= 3 && level === 2) {
    // Сохраняем результат в localStorage перед переходом на страницу победы
    localStorage.setItem('finalScore', score);
    window.location.href = "win.html"; // Перенаправляем на страницу с поздравлением
  }

  frameCount++;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Draw background в зависимости от уровня

  if (level === 1) {
    ctx.drawImage(backgroundImage1, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(backgroundImage2, 0, 0, canvas.width, canvas.height);
  } // Draw bird (заменим желтый квадрат на изображение)


  var birdImage = new Image();
  birdImage.src = 'https://png.klev.club/uploads/posts/2024-03/png-klev-club-p-mario-png-33.png'; // Путь к изображению птицы

  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height); // Draw pipes with images

  pipes.forEach(function (pipe) {
    // Верхняя часть трубы (перевернутая)
    ctx.save(); // Сохраняем текущие настройки контекста

    ctx.translate(pipe.x, pipe.y); // Перемещаем начало координат

    ctx.scale(1, -1); // Переворачиваем по оси Y

    ctx.drawImage(pipeTop, 0, 0, pipeWidth, pipe.y); // Рисуем верхнюю трубу с правильными пропорциями

    ctx.restore(); // Восстанавливаем настройки контекста
    // Нижняя часть трубы

    ctx.drawImage(pipeBottom, pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap); // Рисуем нижнюю трубу
  }); // Draw score

  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText("Score: ".concat(score), 50, 40); // Располагаем "Score"
  // Draw best score

  ctx.fillText("Best: ".concat(bestScore), 50, 70); // Располагаем "Best"
  // Если игра окончена, показываем картинку

  if (isGameOver) {
    ctx.drawImage(gameOverImage, canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 4); // Отображаем картинку поражения
  }
}

function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  isGameOver = false; // Сбрасываем флаг проигрыша

  level = 1; // Возвращаем уровень на 1

  pipeGap = canvas.height / 3; // Возвращаем зазор между трубами на первый уровень

  backgroundImage = backgroundImage1; // Возвращаем фон на первый уровень
  // Удаляем лучший результат из localStorage при сбросе игры

  localStorage.removeItem('bestScore');
  startButton.style.display = 'none'; // Скрываем кнопку "Начать игру"

  title.style.display = 'none'; // Скрываем заголовок "Flappy Mario"
} // Main game loop


function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
//# sourceMappingURL=game.dev.js.map
