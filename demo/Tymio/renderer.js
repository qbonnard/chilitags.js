//three.js

var renderer;
function initThree() {
  width = document.getElementById('canvas-frame').clientWidth;
  height = document.getElementById('canvas-frame').clientHeight;
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(width, height );
  document.getElementById('canvas-frame').appendChild(renderer.domElement);
  renderer.setClearColor(new THREE.Color(0x444444), 1.0);
}

var camera;
function initCamera() {
  camera = new THREE.PerspectiveCamera( 45 , width / height , 1 , 1000 );
  camera.position.x = 0;
  camera.position.y = -20;
  camera.position.z = 50;
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
  light.position.set( 0, 0, 50 );
  scene.add(light);

  light_ambient = new THREE.AmbientLight(0xFFFFFF);
  scene.add(light_ambient);
}

var ballMesh;
function initObjects(){
  initPlane();
  initRobot();
}
var xNumberOfPlane = 15;
var yNumberOfPlane = 10;
var widthOfPlane = 5;
var videoImage, videoImageContext, videoTexture;
function initPlane(){
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(widthOfPlane*31, widthOfPlane*21, 1, 1), new THREE.MeshLambertMaterial({color: 0xf5f5dc}));
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

  //render
  renderer.clear();
  camera.lookAt({x:0, y:0, z:0 });
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
}
