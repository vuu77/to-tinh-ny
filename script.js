const openLoveBtn=document.getElementById("openLoveBtn");
const loveMessage=document.getElementById("loveMessage");
const answer=document.getElementById("answer");
const loveButtons=document.querySelectorAll(".love-choice");

openLoveBtn.addEventListener("click",showLove);
loveButtons.forEach(function(button){button.addEventListener("click",yesLove)});

function showLove(){
  loveMessage.classList.add("show");
  setTimeout(function(){
    loveMessage.scrollIntoView({behavior:"smooth",block:"center"});
  },120);
  burstHearts(14);
  fireworksBurst(window.innerWidth/2,window.innerHeight*.34,4);
}

function yesLove(){
  answer.innerHTML="Anh bi\u1EBFt m\u00E0aaa \uD83E\uDD79\u2764\uFE0F<br>Anh c\u0169ng y\u00EAu em r\u1EA5t nhi\u1EC1u!";
  burstHearts(30);
  fireworksShow(6000);
}

function makeHeart(){
  const heart=document.createElement("div");
  heart.className="floating-heart";
  const heartIcons=["\u2764\uFE0F","\uD83D\uDC97","\uD83D\uDC95","\uD83D\uDC96"];
  heart.textContent=heartIcons[Math.floor(Math.random()*heartIcons.length)];
  heart.style.left=Math.random()*100+"vw";
  heart.style.fontSize=14+Math.random()*16+"px";
  heart.style.animationDuration=5+Math.random()*3+"s";
  document.body.appendChild(heart);
  setTimeout(function(){heart.remove()},8500);
}

function burstHearts(amount){
  for(let i=0;i<amount;i++)setTimeout(makeHeart,i*60);
}
setInterval(makeHeart,1100);

const canvas=document.getElementById("fireworks");
const ctx=canvas.getContext("2d");
let width=window.innerWidth;
let height=window.innerHeight;
let dpr=Math.min(window.devicePixelRatio||1,1.35);
let rockets=[];
let particles=[];
let showUntil=0;
const colors=["#ff1744","#ff9100","#ffea00","#00e676","#00e5ff","#2979ff","#7c4dff","#d500f9","#ff4081","#ffffff"];

function resizeCanvas(){
  width=window.innerWidth;
  height=window.innerHeight;
  dpr=Math.min(window.devicePixelRatio||1,1.35);
  canvas.width=Math.floor(width*dpr);
  canvas.height=Math.floor(height*dpr);
  canvas.style.width=width+"px";
  canvas.style.height=height+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize",resizeCanvas);
window.addEventListener("orientationchange",function(){setTimeout(resizeCanvas,250)});
resizeCanvas();

class Particle{
  constructor(x,y,color,angle,speed,size){
    this.x=x;this.y=y;
    this.vx=Math.cos(angle)*speed;
    this.vy=Math.sin(angle)*speed;
    this.color=color;this.alpha=1;
    this.gravity=.055+Math.random()*.022;
    this.drag=.985;
    this.decay=.014+Math.random()*.011;
    this.size=size||2;
    this.trail=[];
  }
  update(){
    this.trail.push({x:this.x,y:this.y});
    if(this.trail.length>4)this.trail.shift();
    this.vx*=this.drag;this.vy*=this.drag;
    this.vy+=this.gravity;
    this.x+=this.vx;this.y+=this.vy;
    this.alpha-=this.decay;
  }
  draw(){
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    for(let i=0;i<this.trail.length;i++){
      const point=this.trail[i];
      const opacity=(i+1)/this.trail.length*this.alpha*.22;
      ctx.beginPath();
      ctx.arc(point.x,point.y,this.size*.42,0,Math.PI*2);
      ctx.fillStyle=hexToRgba(this.color,opacity);
      ctx.fill();
    }
    ctx.shadowBlur=10;
    ctx.shadowColor=this.color;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fillStyle=hexToRgba(this.color,Math.max(this.alpha,0));
    ctx.fill();
    ctx.restore();
  }
}

class Rocket{
  constructor(targetX,targetY,color){
    this.x=width*(.15+Math.random()*.7);
    this.y=height+18;
    this.targetX=targetX;this.targetY=targetY;this.color=color;
    const dx=this.targetX-this.x;
    const dy=this.targetY-this.y;
    const distance=Math.hypot(dx,dy);
    const speed=8+Math.random()*1.7;
    this.vx=dx/distance*speed;
    this.vy=dy/distance*speed;
    this.done=false;
    this.trail=[];
  }
  update(){
    this.trail.push({x:this.x,y:this.y});
    if(this.trail.length>6)this.trail.shift();
    this.x+=this.vx;this.y+=this.vy;
    const distance=Math.hypot(this.targetX-this.x,this.targetY-this.y);
    if(distance<15||this.y<=this.targetY){
      this.done=true;
      explode(this.targetX,this.targetY,this.color);
    }
  }
  draw(){
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    for(let i=0;i<this.trail.length;i++){
      const point=this.trail[i];
      ctx.beginPath();
      ctx.arc(point.x,point.y,1.2,0,Math.PI*2);
      ctx.fillStyle="rgba(255,220,160,"+((i+1)/this.trail.length*.42)+")";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(this.x,this.y,2,0,Math.PI*2);
    ctx.fillStyle="#ffffff";
    ctx.fill();
    ctx.restore();
  }
}

function hexToRgba(hex,alpha){
  const value=hex.replace("#","");
  const number=parseInt(value,16);
  const red=(number>>16)&255;
  const green=(number>>8)&255;
  const blue=number&255;
  return "rgba("+red+","+green+","+blue+","+alpha+")";
}

function explode(x,y,mainColor){
  const mobile=width<768;
  const count=mobile?48+Math.floor(Math.random()*20):75+Math.floor(Math.random()*28);
  const secondColor=colors[Math.floor(Math.random()*colors.length)];
  for(let i=0;i<count;i++){
    const angle=Math.PI*2*(i/count)+(Math.random()-.5)*.08;
    const speed=2.3+Math.random()*5.6;
    const color=Math.random()>.45?mainColor:secondColor;
    particles.push(new Particle(x,y,color,angle,speed,1+Math.random()*1.35));
  }
}

function launchFirework(x,y){
  const color=colors[Math.floor(Math.random()*colors.length)];
  rockets.push(new Rocket(x,y,color));
}

function fireworksBurst(x,y,amount){
  amount=amount||4;
  for(let i=0;i<amount;i++){
    setTimeout(function(){
      launchFirework(
        Math.max(55,Math.min(width-55,x+(Math.random()-.5)*width*.52)),
        Math.max(75,Math.min(height*.56,y+(Math.random()-.5)*150))
      );
    },i*240);
  }
}

function fireworksShow(duration){
  showUntil=Date.now()+duration;
}

setTimeout(function(){fireworksShow(3200)},700);

function animateFireworks(){
  requestAnimationFrame(animateFireworks);
  ctx.clearRect(0,0,width,height);

  if(Date.now()<showUntil){
    const chance=width<768?.028:.045;
    if(Math.random()<chance){
      launchFirework(
        width*(.15+Math.random()*.7),
        height*(.12+Math.random()*.36)
      );
    }
  }

  for(let i=rockets.length-1;i>=0;i--){
    rockets[i].update();
    rockets[i].draw();
    if(rockets[i].done)rockets.splice(i,1);
  }

  for(let i=particles.length-1;i>=0;i--){
    particles[i].update();
    particles[i].draw();
    if(particles[i].alpha<=0)particles.splice(i,1);
  }
}
animateFireworks();
