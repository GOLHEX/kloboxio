import React, { Component } from "react"
import * as THREE from "three";

import { MapControls, OrbitControls } from "./controls/OrbitControls";
import { KeyDisplay } from './utils';
import CharacterControls from './characterControls';
import { CameraHelper } from 'three';

import { GLTFLoader } from './GLTFLoader';
import * as SkeletonUtils from './SkeletonUtils';
import FBXLoader from 'three-fbx-loader'

import ModelLoader from './ModelLoader';
import HealpixSphere from './HealpixSphere.jsx';

import W from "../wrapper/W"



class Tetra extends Component {
    constructor(props) {
        super(props);
        const scene = new THREE.Scene();

        const camera =  new THREE.PerspectiveCamera( 20, 240 / 135, 0.01, 2000 ) ;
        camera.position.y = 5;
        camera.position.z = 5;
        camera.position.x = 0;
        //camera.layers.enable( 2 );
        const renderer = new THREE.WebGLRenderer({alpha: false, antialias: true });

        const controls = new OrbitControls( camera, renderer.domElement );
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        //controls.dampingFactor = 0.25;
        //controls.screenSpacePanning = false;
        controls.minDistance = 5;
        controls.maxDistance = 15;


        controls.enablePan = false;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controls.update();
        this.userPos=this.props.userPos;
        this.lastPosition;
        this.socket = this.props.io;

///////Models Load


        let mixers = [];

        // let loader = new GLTFLoader();
        // loader.load('models/gltf/Soldier.glb', function (gltf) {
        //     const model = gltf.scene;
        //     model.traverse(function (object) {
        //         if (object.isMesh) object.castShadow = true;
        //     });
        //     //scene.add(model);

        //     const gltfAnimations = gltf.animations;

        //     const mixer = new THREE.AnimationMixer(model);

        //     const animationsMap = new Map();

        //     gltfAnimations.filter(function (a) { return a.name != 'TPose'; }).forEach(function (a) {
        //         animationsMap.set(a.name, mixer.clipAction(a));
        //         //console.log(animationsMap);
        //     });

        //     mixers.push( mixer );

        //     loadCharacter.push( model, mixer, animationsMap);

        // });








        // loader.load( 'models/gltf/Flamingo.glb', function ( gltf ) {
        //      var mesh = gltf.scene.children[ 0 ];
        //      var s = 0.35;
        //      mesh.scale.set( s, s, s );
        //      mesh.position.y = 35;
        //      mesh.rotation.y = - 1;
        //     mesh.castShadow = true;
        //     mesh.receiveShadow = true;
        //      scene.add( mesh );
        //      var mixer = new THREE.AnimationMixer( mesh );
        //      mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
        //      mixers.push( mixer );
        //  } );




        this.mixers = mixers;

////END Models Load





        this.state = {
            scene: scene,
            renderer: renderer,
            lastPosition: {},
            clientWidth: 256,
            clientHeight: 256,
            mouse: {
                x:0,
                y:0
            },
            position: {
                x:0,
                y:0
            },
            hexSize: 8,
            hexOrigin: {
                x: 0,
                y:0
            },
            round: 5,

            cd: 0x3498db
        };
        this.camera = camera;
        this.controls = controls;
        this.characterControls;

        this.clock = new THREE.Clock();

        this.state.scene.background = new THREE.Color().set('#795548');
        this.state.scene.fog = new THREE.Fog( this.state.scene.background, 200, 500 );

        this.state.height = this.state.hexSize*2;
        this.state.vert = this.state.height * 3/4;
        this.state.width = Math.sqrt(3)/2 * this.state.height;
        this.state.horiz = this.state.width;



        this.GeometryCell = new THREE.CylinderBufferGeometry(
            this.state.hexSize*0.95,
            this.state.hexSize*0.95,
            1.618,
            6
        );


        this.GeometryCell.dynamic = true;

        this.MeshPhongMaterial = new THREE.MeshPhongMaterial( {
            color: this.state.cd,
            emissive: 0x001200,
            flatShading: true
        } );

        this.BufferGeometry = new THREE.BufferGeometry();



        this.draw = 0;
        this.add = 0;




        this.modelLoaderState = 0;
        this.userModel;
        // console.log(characterControls);
        // console.log(this.state.characterControls);
        // console.log(this.characterControls);
        this.HealpixSphere = new HealpixSphere(200,30);
        

    }

    componentDidMount() {

        // LIGHTS
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
        this.hemiLight.color.setHSL( 0.6, 1, 0.6 );
        this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        this.hemiLight.position.set( 0, 50, 0 );
        this.state.scene.add( this.hemiLight );
        this.hemiLightHelper = new THREE.HemisphereLightHelper( this.hemiLight, 10 );
        this.state.scene.add( this.hemiLightHelper );

        this.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        this.dirLight.color.setHSL( 0.1, 1, 0.95 );
        this.dirLight.position.set( -2, 1.75, -1 );
        this.dirLight.position.multiplyScalar( 30 );
        this.state.scene.add( this.dirLight );
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 4096;
        this.dirLight.shadow.mapSize.height = 4096;
        this.shadowDistance = 200;
        this.dirLight.shadow.camera.left = -this.shadowDistance;
        this.dirLight.shadow.camera.right = this.shadowDistance;
        this.dirLight.shadow.camera.top = this.shadowDistance;
        this.dirLight.shadow.camera.bottom = -this.shadowDistance;
        this.dirLight.shadow.camera.far = 3500;
        this.dirLight.shadow.bias = -0.00001;
        this.dirLightHeper = new THREE.DirectionalLightHelper( this.dirLight, 10 );
        this.state.scene.add( this.dirLightHeper );

        // SKYDOME
        this.vertexShader = document.getElementById( 'vertexShader' ).textContent;
        this.fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
        this.uniforms = {
            topColor:    { value: new THREE.Color( 0x0077ff ) },
            bottomColor: { value: new THREE.Color( 0xE1F5FE ) },
            offset:      { value: -20 },
            exponent:    { value: 0.8 }
        };
        this.uniforms.topColor.value.copy( this.hemiLight.color );
        this.state.scene.fog.color.copy( this.uniforms.bottomColor.value );
        this.skyGeo = new THREE.SphereBufferGeometry( 1000, 32, 15 );
        this.skyMat = new THREE.ShaderMaterial( { vertexShader: this.vertexShader, fragmentShader: this.fragmentShader, uniforms: this.uniforms, side: THREE.BackSide } );
        this.sky = new THREE.Mesh( this.skyGeo, this.skyMat );
        this.sky.name = 'SKYDOME';
        this.state.scene.add( this.sky );

        // Helpers
        // const gridHelper = new THREE.GridHelper( 1000, 20 );
        // this.state.scene.add( gridHelper );



        const axesHelper = new THREE.AxesHelper( 5 );
        this.state.scene.add( axesHelper );
        this.state.scene.add(this.HealpixSphere);

        // GROUND
        this.geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );

        const textureLoader = new THREE.TextureLoader();




        const diffuse = textureLoader.load( 'textures/Ground037_1K-JPG/Ground037_1K_Color.jpg' );
        const displacementMap = textureLoader.load( 'textures/Ground054_4K-JPG/Ground054_4K_Displacement.jpg' );
        //const aoMap = textureLoader.load( 'textures/Ground054_4K-JPG/Ground054_4K_AmbientOcclusion.jpg' );
        const normalMap = textureLoader.load( 'textures/Ground037_1K-JPG/Ground037_1K_NormalDX.jpg' );

        diffuse.wrapS = THREE.RepeatWrapping;
        diffuse.wrapT = THREE.RepeatWrapping;
        diffuse.repeat.set( 300, 300 );

    displacementMap.wrapS = THREE.RepeatWrapping;
        displacementMap.wrapT = THREE.RepeatWrapping;
        displacementMap.repeat.set( 300, 300 );
/*  
        aoMap.wrapS = THREE.RepeatWrapping;
        aoMap.wrapT = THREE.RepeatWrapping;
        aoMap.repeat.set( 10, 10 );*/

        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set( 300, 300 );

        this.materialStandard = new THREE.MeshStandardMaterial( {
            color: 0xffffff,
            map: diffuse,


            //displacementMap: displacementMap,
            displacementScale: 1,
            displacementBias: -1,

            //aoMap: aoMap,

            normalMap: normalMap,
            normalScale: new THREE.Vector2( 1, - 1 ),

            //flatShading: true,

            side: THREE.DoubleSide
        } );


        //this.material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture1 } );
        //this.material = new THREE.MeshPhongMaterial( { color: 0x03A9F4, specular: 0x050505 } );
        //this.material.color.set('#795548');
        this.ground = new THREE.Mesh( this.geometry, this.materialStandard );
        this.ground.name = 'GROUND';
        this.ground.rotation.x = -Math.PI/2;
        this.ground.position.y = 0;
        this.ground.receiveShadow = true;
        this.state.scene.add( this.ground );

        // Icosahedron
        // this.geometry = new THREE.IcosahedronBufferGeometry( 5, 0 );
        // this.material = new THREE.MeshPhongMaterial( { color: 0xffffff, emissive: 0x333333, flatShading: true } );
        // this.tetraGeo = new THREE.Mesh( this.geometry, this.material );
        // this.tetraGeo.name = 'Icosahedron';
        // this.tetraGeo.castShadow = true;
        // this.state.scene.add( this.tetraGeo )


        ///HEXAGON
        this.cellGroup = new THREE.Object3D();
        this.cellGroup.name = 'Map'
        this.state.scene.add( this.cellGroup );


        this.state.renderer.setPixelRatio( window.devicePixelRatio );
        this.state.renderer.gammaInput = true;
        this.state.renderer.gammaOutput = true;
        this.state.renderer.shadowMap.enabled = true;



        //let ContainerSize = this.getContainerSize(this.container);

        this.updateScreenSize();

        this.container.appendChild(this.state.renderer.domElement);

        window.addEventListener("resize", this.updateScreenSize.bind(this));
        //window.addEventListener("onresize", this.updateScreenSize.bind(this));
        //window.addEventListener( 'mousemove', this.onMouseMove.bind(this), false);
        //this.updateScreenSize();



        this.keysPressed = {};
        //var keyDisplayQueue = new KeyDisplay();
        window.addEventListener('keydown', this.onMove.bind(this), false );
        window.addEventListener('keyup', this.onStay.bind(this), false);


        this.modelLoader;
        this.userModelAdd = 0;
        this.userCharacterControls;
        window.addEventListener("mousedown", this.onModelLoader.bind(this), false);


        // if(this.loadCharacter[ 0 ]){
        //     if(!this.add){
        //         this.state.scene.add(this.loadCharacter[ 0 ])
        //         this.add = 1;
        //     }
        //     if(!this.characterControls){
        //         this.characterControls = new CharacterControls( this.loadCharacter[ 0 ], this.loadCharacter[ 1 ], this.loadCharacter[ 2 ], this.controls, this.camera,  'Idle');
        //     }
        // }


        this.raycaster = new THREE.Raycaster();


        this.start()

    }

    onModelLoader ( event ) {

        if(!this.modelLoaderState){
            console.log('start loading user model')
            this.modelLoader = new ModelLoader(this.socket.id, 'This model path', this.userModel);
            //this.modelLoader = new ModelLoader("6smw7CQHifnUYE4BAAAC", 'This model path', this.userModel);
            this.modelLoader.onLoading();
            //console.log(loadContent)
            this.modelLoaderState = 1;
        } else {

            //console.log(this.modelLoader.userModel)
            if(!this.userModelAdd){
                this.state.scene.add(this.modelLoader.userModel[ 0 ])
                this.mixers.push(this.modelLoader.userModel[ 1 ])
                this.userCharacterControls = new CharacterControls( this.modelLoader.userModel[ 0 ], this.modelLoader.userModel[ 1 ], this.modelLoader.userModel[ 2 ], this.controls, this.camera, 'Idle', this.socket);
                this.userModelAdd = 1;
            }
        }

    }

    onMove( event ) {

        if(!this.add){
            //this.state.scene.add(this.loadCharacter[ 0 ])
            this.add = 1;
        }
        //console.log(this.add);

        // if(!this.characterControls){

        //     //this.characterControls = new CharacterControls( this.loadCharacter[ 0 ], this.loadCharacter[ 1 ], this.loadCharacter[ 2 ], this.controls, this.camera,  'Idle');

        // } else {

        //     //keyDisplayQueue.down(event.key);
        //     if (event.shiftKey && this.characterControls) {
        //         //console.log('shift key');
        //         this.characterControls.switchRunToggle();
        //     }
        //     else {
        //         this.keysPressed[event.key.toLowerCase()] = true;
        //     }
        // }

        if(!this.userCharacterControls){

            //this.characterControls = new CharacterControls( this.loadCharacter[ 0 ], this.loadCharacter[ 1 ], this.loadCharacter[ 2 ], this.controls, this.camera,  'Idle');

        } else {


            //keyDisplayQueue.down(event.key);
            if (event.shiftKey && this.userCharacterControls) {
                //console.log('shift key');
                this.userCharacterControls.switchRunToggle();
            }
            else {
                this.keysPressed[event.key.toLowerCase()] = true;
            }

            let pos =  this.controls.target
            this.userPos(pos.x, pos.z)

        }

    }

    onStay( event ) {
        //console.log(event.key);
        this.keysPressed[event.key.toLowerCase()] = false;

    }

    componentWillUnmount() {
        window.addEventListener("mousedown", this.onModelLoader.bind(this), false);
        window.addEventListener('keydown', this.onMove.bind(this), false );
        window.addEventListener('keyup', this.onStay.bind(this), false);
        window.removeEventListener("resize", this.updateScreenSize.bind(this));
       //window.addEventListener("onresize", this.updateScreenSize.bind(this));
        this.stop()
        this.container.removeChild(this.state.renderer.domElement)
    }

    onMouseMove( event ) {
        event.preventDefault();
        let off = this.findRelativeCanvasOffset()

        var mouse = new THREE.Vector2();

        mouse.x = ( (event.clientX-off.x )/ this.container.clientWidth ) * 2 - 1;
        mouse.y = - ( (event.clientY-off.y) /  this.container.clientHeight ) * 2 + 1;

        this.setState({mouse:mouse})
        //this.mouse =  mouse

        //console.log(this.state.mouse)
         //console.log(this.mouse)
    }

    findRelativeCanvasOffset = () => {
        var x = 0;
        var y = 0;
        var layoutEl = document.getElementById('screen');
        if (layoutEl.offsetParent) {
            do {
                x += layoutEl.offsetLeft;
                y += layoutEl.offsetTop;
            } while (layoutEl = layoutEl.offsetParent);
            return {x:x,y:y}
        }
    }



/*     updateScreenSize() {
        console.log( this.container );
        let up_w = this.container.clientWidth;
        let up_h = this.container.clientHeight;
        this.camera.aspect = up_w / up_h;
        this.camera.updateProjectionMatrix();
        //this.setState({ clientWidth: up_w })
        //this.state.clientWidth.setSize({ clientWidth: up_w });
        //this.setState({ clientHeight: up_h })
        this.state.renderer.setSize( up_w, up_h );

    } */

    
    updateScreenSize() {
        let up_w = window.innerWidth;
        let up_h = window.innerHeight-100;
        this.camera.aspect = up_w / up_h;






        this.camera.updateProjectionMatrix();
        this.state.renderer.setSize( up_w, up_h );

    }



    getContainerSize = (container) => {
        return ({
            clientWidth: container.clientWidth,
            clientHeight: container.clientHeight
        })
    }

    setCameaAspect = (asp) => {
        this.setState({
            ...this.camera,
            aspect: asp,
        })
        console.log(asp)
    }

    setScreenSize = (ss) => {
        this.setState({
            clientWidth: ss.width,
            clientHeight: ss.height
        })
    }


    start = () => {
        if (!this.frameId) {
          this.frameId = requestAnimationFrame(this.animate)
        }
        //this.drawCell()
    }

    stop = () => {
        cancelAnimationFrame(this.frameId)
    }

    animate = () => {



        this.delta = this.clock.getDelta();
        this.timer = Date.now() * 0.01;


        for ( const mixer of this.mixers ) mixer.update( this.delta );


        let userMixerUpdateDelta = this.delta;
        if (this.userCharacterControls) {

            this.userCharacterControls.update(userMixerUpdateDelta, this.keysPressed);

            this.controls.update()

         }


            //requestAnimationFrame(animate);



        // this.fbx.forEach(({mixer}) => {mixer.update(this.clock.getDelta());});

        // if ( this.mixers.length > 0 ) {
        //     for ( var i = 0; i < this.mixers.length; i ++ ) {
        //         this.mixers[ i ].update( this.clock.getDelta() );
        //     }
        // }

        /*for ( var i = 0; i < this.mixers.length; i ++ ) {
            this.mixers[ i ].update( this.delta );
        }*/



        // this.tetraGeo.position.set(
        //     Math.cos( this.timer * 0.1 ) * 30,
        //     Math.abs( Math.cos( this.timer * 0.2 ) ) * 20 + 5,
        //     Math.sin( this.timer * 0.1 ) * 30
        // );

        // this.tetraGeo.rotation.y = ( Math.PI / 2 ) - this.timer * 0.1;
        // this.tetraGeo.rotation.z = this.timer * 0.8;
        //console.log(this.mixers)


        //this.state.stats.update();
        this.frameId = window.requestAnimationFrame(this.animate)
        this.renderScene(this.delta)


    }

    renderScene = () => {

        // this.raycaster.setFromCamera( this.state.mouse, this.state.camera );

        // this.intersects = this.raycaster.intersectObjects( this.state.scene.children );

        // if ( this.intersects.length > 0 ) {
        //     if(this.intersects[ 0 ].object.layers.mask == 4){
        //         if ( this.INTERSECTED != this.intersects[ 0 ].object ) {

        //                 if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );

        //                 this.INTERSECTED = this.intersects[ 0 ].object;
        //                 this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
        //                 this.INTERSECTED.material.emissive.setHex( 0x16a085 );
        //                 //console.log(this.INTERSECTED)
        //         }
        //     } else {
        //         if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );

        //         this.INTERSECTED = null;
        //     }

        // } else {
        //     if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );

        //     this.INTERSECTED = null;
        // }

        this.state.renderer.render(this.state.scene, this.camera)
    }




  render() {

    return (
            <div onClick={this.props.onClick}
                className="App-intro"
                ref={thisNode => this.container=thisNode}
            />
    )
  }

}


export default Tetra;