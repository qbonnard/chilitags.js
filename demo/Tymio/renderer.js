var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var localMediaStream = null;

//カメラ使えるかチェック
var hasGetUserMedia = function() {
	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia || navigator.msGetUserMedia);
}
//エラー
var onFailSoHard = function(e) {
	console.log('エラー!', e);
};

if (hasGetUserMedia()) {
	console.log("カメラ OK");
} else {
	alert("未対応ブラウザです。");
}



window.URL = window.URL || window.webkitURL;
navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia || navigator.msGetUserMedia;

navigator.getUserMedia({video: true}, function(stream) {
	video.src = window.URL.createObjectURL(stream);
	localMediaStream = stream;
}, onFailSoHard);

//three.js

var renderer;
function initThree() {
  width = document.getElementById('canvas-frame').clientWidth;
  height = document.getElementById('canvas-frame').clientHeight;
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(width, height );
  document.getElementById('canvas-frame').appendChild(renderer.domElement);
  renderer.setClearColor(new THREE.Color(0x000000), 1.0);
}

var camera;
function initCamera() {
  camera = new THREE.PerspectiveCamera( 60 , width / height , 1 , 1000 );
  camera.position.x = 0;
  camera.position.y = -100;
  camera.position.z = 160;
  camera.up.x = 0;
  camera.up.y = 0;
  camera.up.z = 1;
  camera.lookAt( {x:0, y:0, z:0 } );
}
var scene;
function initScene() {
  scene = new THREE.Scene();
}
var light;
var light_ambient;
function initLight() {
  light = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0);
  light.position.set( 10, 10, 20 );
  scene.add(light);

  light_ambient = new THREE.AmbientLight(0x444444);
  scene.add(light_ambient);
}

var ballMesh;
function initObjects(){
  initPlane();
  initWalls();
  initRackets();
  initBall();
  initRobot();
}
var xNumberOfPlane = 15;
var yNumberOfPlane = 10;
var widthOfPlane = 5;
var videoImage, videoImageContext, videoTexture;
function initPlane(){
  // for (var i= -xNumberOfPlane; i<=xNumberOfPlane; i++) {
  //   for (var j= -yNumberOfPlane; j<=yNumberOfPlane ; j++) {
  //     if ((i+j)%2==0){
  //       var plane = new THREE.Mesh(new THREE.PlaneGeometry(widthOfPlane, widthOfPlane, 1, 1), new THREE.MeshLambertMaterial({color: 0x999999}));
  //     }
  //     else {
  //       var plane = new THREE.Mesh(new THREE.PlaneGeometry(widthOfPlane, widthOfPlane, 1, 1), new THREE.MeshLambertMaterial({color: 0x4d4d4d}));
  //     }
  //     plane.position.x = i * widthOfPlane;
  //     plane.position.y = j * widthOfPlane;
  //     plane.receiveShadow = true;
  //     scene.add(plane);
  //   }
  // }
  videoImage = document.getElementById('videoImage');
  videoImageContext = videoImage.getContext('2d');
  videoImageContext.fillStyle = '#FFFFFF';
  videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);
  videoTexture = new THREE.Texture(videoImage);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(widthOfPlane*31, widthOfPlane*21, 1, 1), movieMaterial);
  plane.position.x = 0;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);
}

function initWalls(){
  for(var j= -yNumberOfPlane; j<=yNumberOfPlane; j++){
    var block_left = new THREE.Mesh(new THREE.CubeGeometry(widthOfPlane/2, widthOfPlane, 5), new THREE.MeshLambertMaterial({color: 0x333333}));
    var block_right = new THREE.Mesh(new THREE.CubeGeometry(widthOfPlane/2, widthOfPlane, 5), new THREE.MeshLambertMaterial({color: 0x333333}));
    block_left.position.x = -(xNumberOfPlane + 0.75) * widthOfPlane;
    block_left.position.y = j * widthOfPlane;
    block_left.position.z = 2.5;
    block_right.position.x = (xNumberOfPlane + 0.75) * widthOfPlane;
    block_right.position.y = j * widthOfPlane;
    block_right.position.z = 2.5;
    scene.add(block_left);
    scene.add(block_right);
  }
}

var Ball = function(x, y, vx, vy){
  this.x = x; this.y = y; this.vx = vx; this.vy = vy;
}

var racketRadius = 3;
var Racket = function(x, y){
  this.x = x; this.y = y;
}

var player = new Racket(0, -yNumberOfPlane*widthOfPlane);
var enemy = new Racket(0, yNumberOfPlane*widthOfPlane);
var playerMesh;
var enemyMesh;
function initRackets(){
  playerMesh = new THREE.Mesh(new THREE.CylinderGeometry(racketRadius, racketRadius, 2, 16), new THREE.MeshLambertMaterial({color: 0x0000FF}));
  enemyMesh = new THREE.Mesh(new THREE.CylinderGeometry(racketRadius, racketRadius, 2, 16), new THREE.MeshLambertMaterial({color: 0x00FF00}));
  playerMesh.position.x = player.x;
  playerMesh.position.y = player.y;
  playerMesh.position.z = 1;
  playerMesh.rotation.x = Math.PI / 2;
  enemyMesh.position.x = enemy.x;
  enemyMesh.position.y = enemy.y;
  enemyMesh.position.z = 1;
  enemyMesh.rotation.x = Math.PI / 2;
  scene.add(playerMesh);
  scene.add(enemyMesh);
}

function drawPlayer(){
  playerMesh.position.x = player.x;
}

function enemyMove(){
  enemy.x = ball.x;
}

function drawEnemy(){
  enemyMesh.position.x = enemy.x;
}

var ball;
var ballRaduis = 3;
function initBall(){
  ball = new Ball(0, 0, 0.8, 0.8);
  ballMesh = new THREE.Mesh(new THREE.CylinderGeometry(ballRaduis, ballRaduis, 2, 16), new THREE.MeshLambertMaterial({color: 0xFF0000}));
  ballMesh.position.x = ball.x;
  ballMesh.position.y = ball.y;
  ballMesh.position.z = 1;
  ballMesh.rotation.x = Math.PI / 2;
  scene.add(ballMesh);
}

function drawBall(){
  ballMesh.position.x = ball.x;
  ballMesh.position.y = ball.y;
}

Ball.prototype.move = function() {
  this.x += this.vx;
  this.y += this.vy;
//wall
if(this.x < -((xNumberOfPlane+0.5)*widthOfPlane - ballRaduis) || this.x > (xNumberOfPlane+0.5)*widthOfPlane - ballRaduis){
  this.vx *= -1;
}

//goal
if(this.y > -yNumberOfPlane * widthOfPlane && this.y < yNumberOfPlane * widthOfPlane){
  var distanceToPlayer = Math.sqrt(Math.pow((this.x-player.x), 2) + Math.pow((this.y-player.y), 2));
  var distanceToEnemy = Math.sqrt(Math.pow((this.x-enemy.x), 2) + Math.pow((this.y-enemy.y), 2));
  if(distanceToPlayer < ballRaduis+racketRadius || distanceToEnemy < ballRaduis+racketRadius){
    this.vy *= -1;
  }
}else{
  scene.remove(ballMesh);
  delete ballMesh;
  delete ball;
}
}

function initRobot(){
	var loader = new THREE.ColladaLoader();
	loader.load( './thymio.dae', function colladaReady( collada ) { //colladaファイルの読み込み
	var object = collada.scene.getChildByName( 'Thymio', true ); //colladaシーン内のメッシュを取得
	object.flipSided = false; //メッシュの設定
	object.material.transparent = true; //マテリアルへのアクセス
	scene.add(collada.scene ); //シーンへ追加
} );
}

var down = false;
var sx = 0, sy = 0;
window.onmousedown = function (ev){    //マウスダウン
  if (ev.target == renderer.domElement) {
    down = true;
    sx = ev.clientX; sy = ev.clientY;
  }
};
window.onmouseup = function(){        //マウスアップ
  down = false; 
};
window.onmousemove = function(ev) {   //マウスムーブ
  var speed = 0.2;
  if (down) {
      if (ev.target == renderer.domElement) {
      var dx = -(ev.clientX - sx);
      var dy = -(ev.clientY - sy);
      camera.position.x += dx*speed;
      camera.position.y -= dy*speed;
      sx -= dx;
      sy -= dy;
    }
  }else{
  	var rect = ev.target.getBoundingClientRect();
  	if(ev.target == renderer.domElement){
    	player.x = ev.screenX - 300;
  	}
  }
}

function threeStart() {
  initThree();
  initCamera();
  initScene();
  initLight();
  initObjects();
  loop();
}

window.onload = function(){
	console.log("onload");
	threeStart();
};

function loop(){
//animation
enemyMove();
ball.move();

//render
drawPlayer();
drawEnemy();
drawBall();
renderer.clear();
videoImageContext.scale(-1,1);
videoImageContext.drawImage(video, 0, 0, videoImage.width, videoImage.height);
videoTexture.needsUpdate = true;
camera.lookAt({x:0, y:0, z:0 });
renderer.render(scene, camera);
window.requestAnimationFrame(loop);
}
