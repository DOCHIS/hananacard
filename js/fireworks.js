const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

const colors = [
  {r: 255, g: 0, b: 0}, 
  {r: 0, g: 0, b: 255}, 
  {r: 255, g: 255, b: 255},
  {r: 138,g: 43,b: 226 },
  {r:210,g: 105,b: 30},
  {r:100,g: 149,b: 237},  
];

class Firework {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.counter = 0;
        this.sparks = [];
        this.trail = [];
    }
    draw() {
        this.counter++;

        // Draw the rocket
        if (this.counter < 80) {
            ctx.beginPath();
            ctx.arc(this.x, canvas.height/window.devicePixelRatio - this.counter * 2, 0, 0, 2);
            ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
            ctx.fill();

            this.trail.push({x: this.x, y: canvas.height/window.devicePixelRatio - this.counter * 5});

            // Draw the trail
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.strokeStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }

            // Remove older parts of the trail
            if (this.trail.length > 8) {
                this.trail.shift();
            }
        }

        // Explode the firework
        else if (this.sparks.length === 0) {
            for (let i = 0; i < 70; i++) { // increase the number of sparks
                this.sparks.push(new Spark(this.x, canvas.height/window.devicePixelRatio - this.counter * 5, this.color));
            }
        }

        // Draw the explosion
        else {
            for (let i = 0; i < this.sparks.length; i++) {
                let spark = this.sparks[i];
                spark.draw();
                spark.update();
                if (spark.opacity <= 0) {
                    this.sparks.splice(i, 1);
                    i--;
                }
            }
        }
    }
}


class Spark {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.speed = Math.random() * 5 + 1;
        this.angle = Math.random() * Math.PI * 2;
        this.color = color;
        this.opacity = 1;
        this.lightRadius = 1;
        this.lightOpacity = 1;
    }

    draw() {
        // Draw the light effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.lightRadius, 0.03, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fill();
        this.lightRadius += 0.09; 
        this.lightOpacity *= 2; 

        // Update the opacity for flickering effect
        this.opacity = this.opacity <= 0.8 ? Math.random() * 0.8 : this.opacity - 0.5;

        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, 0.2, 0.2); 
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.008; 
    }
}

let fireworks = [];

function animate() {
    ctx.clearRect(0, 0, canvas.width/window.devicePixelRatio, canvas.height/window.devicePixelRatio);
    
    for (let i = 0; i < fireworks.length; i++) {
        fireworks[i].draw();
    }
    
    requestAnimationFrame(animate);
    
    //Add text in the middle of screen
    let fontSize = 55;
    ctx.font = `bold ${fontSize}px Open Sans`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.shadowColor = 'rgba(100, 100, 100, 0.5)'; // 그림자 색상을 밝게
    ctx.shadowBlur = 10; // 그림자 흐림 정도를 높임
    ctx.shadowOffsetX = 2; // 그림자의 X축 오프셋을 줄임
    ctx.shadowOffsetY = 2; // 그림자의 Y축 오프셋을 줄임
    ctx.fillText("카드 맞추기 성공!", canvas.width/2/window.devicePixelRatio, canvas.height/2/window.devicePixelRatio);

    // 다시하기 버튼
    ctx.beginPath();
    ctx.rect(canvas.width/2/window.devicePixelRatio - 100, canvas.height/2/window.devicePixelRatio + 50, 200, 50);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fillText("다시하기", canvas.width/2/window.devicePixelRatio, canvas.height/2/window.devicePixelRatio + 80);
    
    // 다시하기 버튼 클릭 이벤트
    canvas.addEventListener("click", (event) => {
      const clickTarget = event.target;
      if (clickTarget.classList.contains("canvas")) {
        fireworksEl.style.display = "none";
        window.location.reload();
      }
    });
    
}