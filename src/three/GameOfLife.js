import React, { Component, useState } from 'react';

import * as THREE from 'three';
import W from "../wrapper/W"
//import { GLTFLoader } from './GLTFLoader';
//import { FBXLoader } from './FBXLoader';
import { MapControls, OrbitControls } from "./controls/OrbitControls";
import Stats from 'stats.js';
// import Play from "../components/Play"
// import Genocide from "../components/Genocide"
import * as GeometryUtils from './three.js/examples/jsm/utils/GeometryUtils.js';
import { FontLoader } from './three.js/examples/jsm/loaders/FontLoader.js';



// Generated code -- CC0 -- No Rights Reserved -- http://www.redblobgames.com/grids/hexagons/
export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class Hex {
    constructor(q, r, s) {
        this.q = q;
        this.r = r;
        this.s = s;
        if (Math.round(q + r + s) !== 0)
            throw "q + r + s must be 0";
    }
    add(b) {
        return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
    }
    subtract(b) {
        return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
    }
    scale(k) {
        return new Hex(this.q * k, this.r * k, this.s * k);
    }
    rotateLeft() {
        return new Hex(-this.s, -this.q, -this.r);
    }
    rotateRight() {
        return new Hex(-this.r, -this.s, -this.q);
    }
    static direction(direction) {
        return Hex.directions[direction];
    }
    neighbor(direction) {
        return this.add(Hex.direction(direction));
    }
    diagonalNeighbor(direction) {
        return this.add(Hex.diagonals[direction]);
    }
    len() {
        return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
    }
    distance(b) {
        return this.subtract(b).len();
    }
    round() {
        var qi = Math.round(this.q);
        var ri = Math.round(this.r);
        var si = Math.round(this.s);
        var q_diff = Math.abs(qi - this.q);
        var r_diff = Math.abs(ri - this.r);
        var s_diff = Math.abs(si - this.s);
        if (q_diff > r_diff && q_diff > s_diff) {
            qi = -ri - si;
        }
        else if (r_diff > s_diff) {
            ri = -qi - si;
        }
        else {
            si = -qi - ri;
        }
        return new Hex(qi, ri, si);
    }
    lerp(b, t) {
        return new Hex(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
    }
    linedraw(b) {
        var N = this.distance(b);
        var a_nudge = new Hex(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
        var b_nudge = new Hex(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
        var results = [];
        var step = 1.0 / Math.max(N, 1);
        for (var i = 0; i <= N; i++) {
            results.push(a_nudge.lerp(b_nudge, step * i).round());
        }
        return results;
    }
}
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];
export class OffsetCoord {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    static qoffsetFromCube(offset, h) {
        var col = h.q;
        var row = h.r + (h.q + offset * (h.q & 1)) / 2;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new OffsetCoord(col, row);
    }
    static qoffsetToCube(offset, h) {
        var q = h.col;
        var r = h.row - (h.col + offset * (h.col & 1)) / 2;
        var s = -q - r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new Hex(q, r, s);
    }
    static roffsetFromCube(offset, h) {
        var col = h.q + (h.r + offset * (h.r & 1)) / 2;
        var row = h.r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new OffsetCoord(col, row);
    }
    static roffsetToCube(offset, h) {
        var q = h.col - (h.row + offset * (h.row & 1)) / 2;
        var r = h.row;
        var s = -q - r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new Hex(q, r, s);
    }
}
OffsetCoord.EVEN = 1;
OffsetCoord.ODD = -1;
export class DoubledCoord {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    static qdoubledFromCube(h) {
        var col = h.q;
        var row = 2 * h.r + h.q;
        return new DoubledCoord(col, row);
    }
    qdoubledToCube() {
        var q = this.col;
        var r = (this.row - this.col) / 2;
        var s = -q - r;
        return new Hex(q, r, s);
    }
    static rdoubledFromCube(h) {
        var col = 2 * h.q + h.r;
        var row = h.r;
        return new DoubledCoord(col, row);
    }
    rdoubledToCube() {
        var q = (this.col - this.row) / 2;
        var r = this.row;
        var s = -q - r;
        return new Hex(q, r, s);
    }
}
export class Orientation {
    constructor(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
        this.f0 = f0;
        this.f1 = f1;
        this.f2 = f2;
        this.f3 = f3;
        this.b0 = b0;
        this.b1 = b1;
        this.b2 = b2;
        this.b3 = b3;
        this.start_angle = start_angle;
    }
}
export class Layout {
    constructor(orientation, size, origin) {
        this.orientation = orientation;
        this.size = size;
        this.origin = origin;
    }
    hexToPixel(h) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
        var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
        return new Point(x + origin.x, y + origin.y);
    }
    pixelToHex(p) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var pt = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
        var q = M.b0 * pt.x + M.b1 * pt.y;
        var r = M.b2 * pt.x + M.b3 * pt.y;
        return new Hex(q, r, -q - r);
    }
    hexCornerOffset(corner) {
        var M = this.orientation;
        var size = this.size;
        var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6.0;
        return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    }
    polygonCorners(h) {
        var corners = [];
        var center = this.hexToPixel(h);
        for (var i = 0; i < 6; i++) {
            var offset = this.hexCornerOffset(i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }
}
Layout.pointy = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
Layout.flat = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
class Tests {
    constructor() { }
    static equalHex(name, a, b) {
        if (!(a.q === b.q && a.s === b.s && a.r === b.r)) {
            complain(name);
        }
    }
    static equalOffsetcoord(name, a, b) {
        if (!(a.col === b.col && a.row === b.row)) {
            complain(name);
        }
    }
    static equalDoubledcoord(name, a, b) {
        if (!(a.col === b.col && a.row === b.row)) {
            complain(name);
        }
    }
    static equalInt(name, a, b) {
        if (!(a === b)) {
            complain(name);
        }
    }
    static equalHexArray(name, a, b) {
        Tests.equalInt(name, a.length, b.length);
        for (var i = 0; i < a.length; i++) {
            Tests.equalHex(name, a[i], b[i]);
        }
    }
    static testHexArithmetic() {
        Tests.equalHex("hex_add", new Hex(4, -10, 6), new Hex(1, -3, 2).add(new Hex(3, -7, 4)));
        Tests.equalHex("hex_subtract", new Hex(-2, 4, -2), new Hex(1, -3, 2).subtract(new Hex(3, -7, 4)));
    }
    static testHexDirection() {
        Tests.equalHex("hex_direction", new Hex(0, -1, 1), Hex.direction(2));
    }
    static testHexNeighbor() {
        Tests.equalHex("hex_neighbor", new Hex(1, -3, 2), new Hex(1, -2, 1).neighbor(2));
    }
    static testHexDiagonal() {
        Tests.equalHex("hex_diagonal", new Hex(-1, -1, 2), new Hex(1, -2, 1).diagonalNeighbor(3));
    }
    static testHexDistance() {
        Tests.equalInt("hex_distance", 7, new Hex(3, -7, 4).distance(new Hex(0, 0, 0)));
    }
    static testHexRotateRight() {
        Tests.equalHex("hex_rotate_right", new Hex(1, -3, 2).rotateRight(), new Hex(3, -2, -1));
    }
    static testHexRotateLeft() {
        Tests.equalHex("hex_rotate_left", new Hex(1, -3, 2).rotateLeft(), new Hex(-2, -1, 3));
    }
    static testHexRound() {
        var a = new Hex(0.0, 0.0, 0.0);
        var b = new Hex(1.0, -1.0, 0.0);
        var c = new Hex(0.0, -1.0, 1.0);
        Tests.equalHex("hex_round 1", new Hex(5, -10, 5), new Hex(0.0, 0.0, 0.0).lerp(new Hex(10.0, -20.0, 10.0), 0.5).round());
        Tests.equalHex("hex_round 2", a.round(), a.lerp(b, 0.499).round());
        Tests.equalHex("hex_round 3", b.round(), a.lerp(b, 0.501).round());
        Tests.equalHex("hex_round 4", a.round(), new Hex(a.q * 0.4 + b.q * 0.3 + c.q * 0.3, a.r * 0.4 + b.r * 0.3 + c.r * 0.3, a.s * 0.4 + b.s * 0.3 + c.s * 0.3).round());
        Tests.equalHex("hex_round 5", c.round(), new Hex(a.q * 0.3 + b.q * 0.3 + c.q * 0.4, a.r * 0.3 + b.r * 0.3 + c.r * 0.4, a.s * 0.3 + b.s * 0.3 + c.s * 0.4).round());
    }
    static testHexLinedraw() {
        Tests.equalHexArray("hex_linedraw", [new Hex(0, 0, 0), new Hex(0, -1, 1), new Hex(0, -2, 2), new Hex(1, -3, 2), new Hex(1, -4, 3), new Hex(1, -5, 4)], new Hex(0, 0, 0).linedraw(new Hex(1, -5, 4)));
    }
    static testLayout() {
        var h = new Hex(3, 4, -7);
        var flat = new Layout(Layout.flat, new Point(10.0, 15.0), new Point(35.0, 71.0));
        Tests.equalHex("layout", h, flat.pixelToHex(flat.hexToPixel(h)).round());
        var pointy = new Layout(Layout.pointy, new Point(10.0, 15.0), new Point(35.0, 71.0));
        Tests.equalHex("layout", h, pointy.pixelToHex(pointy.hexToPixel(h)).round());
    }
    static testOffsetRoundtrip() {
        var a = new Hex(3, 4, -7);
        var b = new OffsetCoord(1, -3);
        Tests.equalHex("conversion_roundtrip even-q", a, OffsetCoord.qoffsetToCube(OffsetCoord.EVEN, OffsetCoord.qoffsetFromCube(OffsetCoord.EVEN, a)));
        Tests.equalOffsetcoord("conversion_roundtrip even-q", b, OffsetCoord.qoffsetFromCube(OffsetCoord.EVEN, OffsetCoord.qoffsetToCube(OffsetCoord.EVEN, b)));
        Tests.equalHex("conversion_roundtrip odd-q", a, OffsetCoord.qoffsetToCube(OffsetCoord.ODD, OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, a)));
        Tests.equalOffsetcoord("conversion_roundtrip odd-q", b, OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, OffsetCoord.qoffsetToCube(OffsetCoord.ODD, b)));
        Tests.equalHex("conversion_roundtrip even-r", a, OffsetCoord.roffsetToCube(OffsetCoord.EVEN, OffsetCoord.roffsetFromCube(OffsetCoord.EVEN, a)));
        Tests.equalOffsetcoord("conversion_roundtrip even-r", b, OffsetCoord.roffsetFromCube(OffsetCoord.EVEN, OffsetCoord.roffsetToCube(OffsetCoord.EVEN, b)));
        Tests.equalHex("conversion_roundtrip odd-r", a, OffsetCoord.roffsetToCube(OffsetCoord.ODD, OffsetCoord.roffsetFromCube(OffsetCoord.ODD, a)));
        Tests.equalOffsetcoord("conversion_roundtrip odd-r", b, OffsetCoord.roffsetFromCube(OffsetCoord.ODD, OffsetCoord.roffsetToCube(OffsetCoord.ODD, b)));
    }
    static testOffsetFromCube() {
        Tests.equalOffsetcoord("offset_from_cube even-q", new OffsetCoord(1, 3), OffsetCoord.qoffsetFromCube(OffsetCoord.EVEN, new Hex(1, 2, -3)));
        Tests.equalOffsetcoord("offset_from_cube odd-q", new OffsetCoord(1, 2), OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, new Hex(1, 2, -3)));
    }
    static testOffsetToCube() {
        Tests.equalHex("offset_to_cube even-", new Hex(1, 2, -3), OffsetCoord.qoffsetToCube(OffsetCoord.EVEN, new OffsetCoord(1, 3)));
        Tests.equalHex("offset_to_cube odd-q", new Hex(1, 2, -3), OffsetCoord.qoffsetToCube(OffsetCoord.ODD, new OffsetCoord(1, 2)));
    }
    static testDoubledRoundtrip() {
        var a = new Hex(3, 4, -7);
        var b = new DoubledCoord(1, -3);
        Tests.equalHex("conversion_roundtrip doubled-q", a, DoubledCoord.qdoubledFromCube(a).qdoubledToCube());
        Tests.equalDoubledcoord("conversion_roundtrip doubled-q", b, DoubledCoord.qdoubledFromCube(b.qdoubledToCube()));
        Tests.equalHex("conversion_roundtrip doubled-r", a, DoubledCoord.rdoubledFromCube(a).rdoubledToCube());
        Tests.equalDoubledcoord("conversion_roundtrip doubled-r", b, DoubledCoord.rdoubledFromCube(b.rdoubledToCube()));
    }
    static testDoubledFromCube() {
        Tests.equalDoubledcoord("doubled_from_cube doubled-q", new DoubledCoord(1, 5), DoubledCoord.qdoubledFromCube(new Hex(1, 2, -3)));
        Tests.equalDoubledcoord("doubled_from_cube doubled-r", new DoubledCoord(4, 2), DoubledCoord.rdoubledFromCube(new Hex(1, 2, -3)));
    }
    static testDoubledToCube() {
        Tests.equalHex("doubled_to_cube doubled-q", new Hex(1, 2, -3), new DoubledCoord(1, 5).qdoubledToCube());
        Tests.equalHex("doubled_to_cube doubled-r", new Hex(1, 2, -3), new DoubledCoord(4, 2).rdoubledToCube());
    }
    static testAll() {
        Tests.testHexArithmetic();
        Tests.testHexDirection();
        Tests.testHexNeighbor();
        Tests.testHexDiagonal();
        Tests.testHexDistance();
        Tests.testHexRotateRight();
        Tests.testHexRotateLeft();
        Tests.testHexRound();
        Tests.testHexLinedraw();
        Tests.testLayout();
        Tests.testOffsetRoundtrip();
        Tests.testOffsetFromCube();
        Tests.testOffsetToCube();
        Tests.testDoubledRoundtrip();
        Tests.testDoubledFromCube();
        Tests.testDoubledToCube();
    }
}
// Tests
function complain(name) { console.log("FAIL", name); }
Tests.testAll();



class GOL extends React.Component {
    constructor(props) {
        super(props);

        THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);
        const scene = new THREE.Scene();

        this.container = React.createRef();

        //const camera =  new THREE.PerspectiveCamera( 70, this.container.scrollWidth / this.container.scrollWidth, 0.01, 2000 ) ;
        const camera =  new THREE.PerspectiveCamera( 70, this.container.scrollWidth / this.container.scrollWidth, 0.01, 2000 ) ;
        camera.position.y = 0;
        camera.position.z = 3;
        camera.position.x = 0;
        camera.layers.enable( 2 );
        camera.up.set(0,0,1);
        camera.updateMatrix();
        camera.updateProjectionMatrix();
        //camera.updateMatrixWorld();
        const renderer = new THREE.WebGLRenderer({alpha: false, antialias: false });



        this.camera = camera;

        //this.container = React.createRef();
        this.clock = new THREE.Clock();




        const controls = new MapControls( this.camera, renderer.domElement );
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.25;
        //controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 150;


        controls.enablePan = true;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controls.update();

        this.controls = controls;


        //HEX FIELD  OPERATIONS//
        this.field3D = new THREE.Object3D();
        this.field3D.name = 'Field';
        this.field3D.matrixAutoUpdate = false;
        this.field3D.updateMatrix();
        scene.add( this.field3D );

        this.hexPolygonL = 0;
        this.hexPolygonD = 0;
        this.population = 0;

        this.initStartFied = [];
        this.gridInit = [];

        this.currGrid = [];
        this.prevGrid = [];


        this.delay = 0;
        this.active = 0;
        this.state = {
            scene: scene,
            renderer: renderer,
            isPlayOn: true,
            currentPopulation: 0,
            previousPopulation: 0,
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
            hexSize: 0.2,
            hexSize2D: 80,
            HexShapeCountRound: 6,
            hexOrigin: {
                x: 0,
                y:0
            },
            round: 5,
            cd: 0x3498db
        };



        let mixers = [];

        this.mixers = mixers;


        ///Raycaster
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();




        let stats = new Stats();
        this.stats = stats;
        this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );
////////
////////
////////
////////
////////
////////BINDS/////////////////////////////////////////////////////////////////////////
        // this._playClick = this._playClick.bind(this);


        this.state.scene.background = new THREE.Color().set('#795548');
        this.state.scene.fog = new THREE.Fog( this.state.scene.background, 200, 500 );
        // LIGHTS
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
        this.hemiLight.color.setHSL( 0.6, 0.6, 1 );
        this.hemiLight.groundColor.setHSL( 0.095, 0.75, 1 );
        //this.hemiLight.position.set( 0, 0, 5 );
        //this.state.scene.add( this.hemiLight );
        // this.hemiLightHelper = new THREE.HemisphereLightHelper( this.hemiLight, 1 );
        // this.state.scene.add( this.hemiLightHelper );

        this.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        this.dirLight.color.setHSL( 0.1, 1, 0.95 );
        this.dirLight.position.set( 3, 3, 3 );
        this.dirLight.position.multiplyScalar( 10 );
        this.state.scene.add( this.dirLight );
        this.dirLight.castShadow = false;
        this.dirLight.shadow.mapSize.width = 512;
        this.dirLight.shadow.mapSize.height = 512;
        this.shadowDistance = 20;
        this.dirLight.shadow.camera.left = -this.shadowDistance;
        this.dirLight.shadow.camera.right = this.shadowDistance;
        this.dirLight.shadow.camera.top = this.shadowDistance;
        this.dirLight.shadow.camera.bottom = -this.shadowDistance;
        this.dirLight.shadow.camera.far = 3500;
        this.dirLight.shadow.bias = -0.00001;
        // this.dirLightHeper = new THREE.DirectionalLightHelper( this.dirLight, 1 );
        // this.state.scene.add( this.dirLightHeper );

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
        //this.state.scene.fog.color.copy( this.uniforms.bottomColor.value );
        this.skyGeo = new THREE.SphereBufferGeometry( 1000, 32, 15 );
        this.skyGeo.rotateX(-Math.PI/2);

        this.skyMat = new THREE.ShaderMaterial( { vertexShader: this.vertexShader, fragmentShader: this.fragmentShader, uniforms: this.uniforms, side: THREE.BackSide } );
        this.sky = new THREE.Mesh( this.skyGeo, this.skyMat );
        this.sky.rotateX(-Math.PI/2);
        this.sky.name = 'SKYDOME';
        //this.state.scene.add( this.sky );

        // Helpers
        //const gridHelper = new THREE.GridHelper( 1000, 20 );
        //gridHelper.up.set(0,0,1);
        //this.state.scene.add( gridHelper );



        const axesHelper = new THREE.AxesHelper( 5 );
        axesHelper.position.set( 0.0001, 0.0001, 0.0001 );
        //this.state.scene.add( axesHelper );


        // GROUND
        this.geometry = new THREE.PlaneBufferGeometry( 100, 100 );
        this.materialStandard = new THREE.MeshStandardMaterial( {
            color: 0x483720
        } );
        this.ground = new THREE.Mesh( this.geometry, this.materialStandard );
        this.ground.name = 'GROUND';
        //this.ground.rotation.x = -Math.PI/2;
        this.ground.position.z = -0.1;
        this.ground.receiveShadow = true;
        //this.state.scene.add( this.ground );


    }



    setPopulation = (cnt, grid) => {
        this.setState({
            currentPopulation: cnt,
        })
        this.population = grid;
        console.log(grid)
    }

    Point = (x, y) => {
        return {x: x, y: y}
    }

    Hex = (q, r) => {
        return {q: q, r: r}
    }

    Cube = (x, y, z) => {
        return {x: x, y: y, z: z}
    }

    hex_corner = (center, i) => {
        var angle_deg = 60*i+30;
        var angle_rad = Math.PI/180*angle_deg;
        var x = center.x + this.state.hexSize * Math.cos(angle_rad);
        var y = center.y + this.state.hexSize * Math.sin(angle_rad);
        //console.log(this.Point(x, y))
        return this.Point(x, y)
    }

    drawHex = (center) => {
        let cellPoints = []
        for(var i=0; i<=5; i++){
            var start = this.hex_corner(center, i);
            //var end = this.hex_corner(center, i + 1);
            cellPoints.push(new THREE.Vector2 (start.x, start.y));
        }
        return cellPoints
    }


    drawHexV3 = (center) => {
        let cellPoints = []
        for(var i=0; i<=6; i++){
            var start = this.hex_corner(center, i);
            //var end = this.hex_corner(center, i + 1);
            cellPoints.push(new THREE.Vector3 (start.x, start.y, 0));
        }
        return cellPoints
    }

    hexToPixel = (h) => {
        //console.log(this.state.hexOrigin)
        var hexOrigin = this.state.hexOrigin;
        var x = this.state.hexSize * Math.sqrt(3) * (h.q + h.r/2) + hexOrigin.x;
        var y = this.state.hexSize * 3/2 * h.r + hexOrigin.y;
        return this.Point(x, y)
    }

    pixelToHex = (p) => {
        var q = ((p.x - this.state.hexOrigin.x) * Math.sqrt(3)/3 - (p.y - this.state.hexOrigin.y)/ 3) / this.state.hexSize;
        var r = (p.y - this.state.hexOrigin.y) * 2/3 / this.state.hexSize;
        return this.hexRound(this.Hex(q, r))
    }


    cubeDir = (dir) => {
        var cubeDir = [ this.Cube(-1, 1, 0), this.Cube(0, 1, -1), this.Cube(1, 0, -1), this.Cube(1, -1, 0), this.Cube(0, -1, 1), this.Cube(-1, 0, 1) ];
        return cubeDir[dir];
    }

    cubeAdd = (a, b) => {
        return this.Cube(a.x + b.x, a.y + b.y, a.z + b.z)
    }

    cubeNeighbor = (c, dir) => {
        return this.cubeAdd(c, this.cubeDir(dir))
    }

    cubeToAxial = (c) => {
        var q = c.x;
        var r = c.z;
        //console.log(q, r);
        return this.Hex(q, r)
    }

    axialToCube = (h) => {
        var x = h.q;
        var z = h.r;
        var y = -x-z;
        //console.log(x, y, z);
        return this.Cube(x, y, z)
    }

    cube_to_oddr = (c) => {
        var q = c.x - (c.z - (c.z&1)) / 2;
        var r = c.z;
        //console.log(q, r);
        return this.Hex(q, r)
    }

    oddr_to_cube = (h) => {
        var x = h.q + (h.r - (h.r&1)) / 2;
        var z = h.r;
        var y = -x-z;
        //console.log(x, y, z);
        return this.Cube(x, y, z)
    }

    hexRound = (h) => {
        return this.cubeRound(this.axialToCube(h));
    }

    cubeRound = (c) => {
        var rx = Math.round(c.x);
        var ry = Math.round(c.y);
        var rz = Math.round(c.z);

        var x_diff = Math.abs(rx - c.x);
        var y_diff = Math.abs(ry - c.y);
        var z_diff = Math.abs(rz - c.z);

        if (x_diff > y_diff && x_diff > z_diff){
            rx = -ry-rz;
        } else if (y_diff > z_diff){
            ry = -rx-rz;
        } else {
            rz = -rx-ry;
        }

        if(rx === -0){
            rx = 0;
        }
        if(ry === -0){
            ry = 0;
        }
        if(rz === -0){
            rz = 0;
        }
        return this.Cube(rx, ry, rz)
    }

    cubeDir = (dir) => {
        var cubeDir = [ this.Cube(-1, 1, 0), this.Cube(0, 1, -1), this.Cube(1, 0, -1), this.Cube(1, -1, 0), this.Cube(0, -1, 1), this.Cube(-1, 0, 1) ];
        return cubeDir[dir];
    }

    cubeAdd = (a, b) => {
        return this.Cube(a.x + b.x, a.y + b.y, a.z + b.z)
    }

    cubeNeighbor = (c, dir) => {
        return this.cubeAdd(c, this.cubeDir(dir))
    }

    findNeighbors = (c) => {
        //console.log("Finding Neighbours:");
        let neigbors = [];
        for(var i=0; i<6; i++){
            var cube = this.cubeNeighbor(this.Cube(c.x, c.y, c.z), i);
            cube.nameID = (""+cube.x+""+cube.y+""+cube.z+"");
            neigbors.push(cube)
            //draw neighbours start//
            //var hex = this.cubeToAxial(cube);
            //var center = this.hexToPixel(hex);
            //this.fillHex(center, "yellow");
            //this.drawHex(center);
            //draw neighbours end//
        }
        //console.log(neigbors);
        return neigbors;
    }

    cubeDistance = (a, b) =>{
        return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
    }

    lerp = (a, b, t) => {
        return a + (b - a) * t
    }

    lerpCube = (a, b, t) => {
        return this.Cube(this.lerp(a.x, b.x, t), this.lerp(a.y, b.y, t), this.lerp(a.z, b.z, t))
    }

    drawLineCube = (a, b) => {
        var N = this.cubeDistance(a, b);
        var results = [];
        for(var i =0; i<= N; i++){
            results.push(this.cubeRound(this.lerpCube(a, b, 1.0/N * i)));
        }
        return results
    }


    getHexParameters = () => {
        let hexHeight = this.state.hexSize * 2;
        let hexWidth = Math.sqrt(3)/2 * hexHeight;
        let vertDist = hexHeight * 3/4;
        let horizDist = hexWidth;
        return {hexWidth: hexWidth, hexHeight: hexHeight, vertDist: vertDist, horizDist: horizDist}

    }

///DROW Section
///
///
/// // drawGrid = () => {
    //     var results = [];
    //     var slash = this.state.round;
    //     for(var r=-(slash); r<=(slash); r++){
    //         for(var q=-(slash); q<=(slash);q++){
    //             var cube = this.axialToCube(this.Hex(q, r));
    //             results.push(cube);
    //         }
    //     }
    //     return results
    // }
    //
    drawHexPolygon = (center) => {
        let hexPolygon = this.hexPolygon.clone();
        hexPolygon.position.x = center.x;
        hexPolygon.position.y = center.y;
        hexPolygon.scale.x = 1;
        hexPolygon.scale.y = 1;
        this.state.scene.add( hexPolygon );
    }



    initGrid = (grid) => {
        let hex;
        let coord;
        let cube;
        const oldGrid = [];
        for(let g in grid) {
            hex = this.cubeToAxial(grid[g]);
            cube = this.axialToCube(hex);
            cube.neigbors = 0;
            cube.nameID = (""+cube.x+""+cube.y+""+cube.z+"");
            cube.state = (Math.random() < 0.05);
            //cube.state = (cube.nameID == "000" || cube.nameID == "01-1" || cube.nameID == "1-10");
            oldGrid.push(cube);
        }

        const newGrid = JSON.parse(JSON.stringify(oldGrid));


        for(let i in oldGrid) {
                let n = this.findNeighbors(oldGrid[i]);
                let count = 0;
                for(let j in n) {
                    let item = oldGrid.find(item => item.nameID == n[j].nameID);
                    if(item && item.state === true){
                        count += 1;
                    };
                    item = 0;
                }
                newGrid[i].neigbors = count;
        }



        for(let i in newGrid){
            hex = this.cubeToAxial(newGrid[i]);
            coord = this.hexToPixel(hex)
           if(newGrid[i].state){
                const hexPolygon = this.hexPolygonL.clone();
                hexPolygon.position.x = coord.x;
                hexPolygon.position.y = coord.y;
                hexPolygon.rotation.z = -Math.PI/2;
                hexPolygon.scale.x = 0.95;
                hexPolygon.scale.y = 0.95;
                hexPolygon.name = newGrid[i].nameID;
                hexPolygon.state = newGrid[i].state;
                hexPolygon.neigbors = newGrid[i].neigbors;
                hexPolygon.matrixAutoUpdate = false;
                hexPolygon.updateMatrix();
                this.field3D.add( hexPolygon );
           } else {
                const hexPolygon = this.hexPolygonD.clone();
                hexPolygon.position.x = coord.x;
                hexPolygon.position.y = coord.y;
                hexPolygon.rotation.z = -Math.PI/2;
                hexPolygon.scale.x = 0.95;
                hexPolygon.scale.y = 0.95;
                hexPolygon.name = newGrid[i].nameID;
                hexPolygon.state = newGrid[i].state;
                hexPolygon.neigbors = newGrid[i].neigbors;
                hexPolygon.matrixAutoUpdate = false;
                hexPolygon.updateMatrix();
                this.field3D.add( hexPolygon );
           }

        }
        this.state.currentPopulation = 1;
        //newGrid.id = 1;
        console.log("oldGrid")
        console.log(oldGrid)
        console.log("newGrid")
        console.log(newGrid)
        return newGrid;
    }


    initGridClear = (grid) => {
        let hex;
        let coord;
        let cube;
        const oldGrid = [];
        for(let g in grid) {
            hex = this.cubeToAxial(grid[g]);
            cube = this.axialToCube(hex);
            cube.neigbors = 0;
            cube.nameID = (""+cube.x+""+cube.y+""+cube.z+"");
            cube.state = false;
            //cube.state = (Math.random() < 0.05);
            //cube.state = (cube.nameID == "000" || cube.nameID == "01-1" || cube.nameID == "1-10");
            oldGrid.push(cube);
        }

        const newGrid = JSON.parse(JSON.stringify(oldGrid));


        for(let i in oldGrid) {
                let n = this.findNeighbors(oldGrid[i]);
                let count = 0;
                for(let j in n) {
                    let item = oldGrid.find(item => item.nameID == n[j].nameID);
                    if(item && item.state === true){
                        count += 1;
                    };
                    item = 0;
                }
                newGrid[i].neigbors = count;
        }


        for(let i in newGrid){
            hex = this.cubeToAxial(newGrid[i]);
            coord = this.hexToPixel(hex)
           if(newGrid[i].state){
                const hexPolygon = this.hexPolygonL.clone();
                hexPolygon.position.x = coord.x;
                hexPolygon.position.y = coord.y;
                hexPolygon.rotation.z = -Math.PI/2;
                hexPolygon.scale.x = 0.95;
                hexPolygon.scale.y = 0.95;
                hexPolygon.name = newGrid[i].nameID;
                hexPolygon.state = newGrid[i].state;
                hexPolygon.neigbors = newGrid[i].neigbors;
                hexPolygon.matrixAutoUpdate = false;
                hexPolygon.updateMatrix();
                this.field3D.add( hexPolygon );
           } else {
                const hexPolygon = this.hexPolygonD.clone();
                hexPolygon.position.x = coord.x;
                hexPolygon.position.y = coord.y;
                hexPolygon.rotation.z = -Math.PI/2;
                hexPolygon.scale.x = 0.95;
                hexPolygon.scale.y = 0.95;
                hexPolygon.name = newGrid[i].nameID;
                hexPolygon.state = newGrid[i].state;
                hexPolygon.neigbors = newGrid[i].neigbors;
                hexPolygon.matrixAutoUpdate = false;
                hexPolygon.updateMatrix();
                this.field3D.add( hexPolygon );
           }

        }
        this.state.currentPopulation = 1;
        this.state.previousPopulation = 0;
        //newGrid.id = 1;
        // console.log("oldGrid")
        // console.log(oldGrid)
        // console.log("newGridClear")
        // console.log(newGrid)
        return newGrid;
    }

    redrawGrid = (grid) => {
        let hex;
        let coord;
        let oldGridD = [];
        oldGridD = JSON.parse(JSON.stringify(grid));
        //const newGridD = JSON.parse(JSON.stringify(grid));
        for(let i in oldGridD){
            hex = this.cubeToAxial(oldGridD[i]);
            //cube = this.axialToCube(hex);
            coord = this.hexToPixel(hex)

           if(oldGridD[i].state === true){
                let obj = this.field3D.getObjectByName(oldGridD[i].nameID);
                this.field3D.remove( obj );
                obj.geometry.dispose();
                obj.material.dispose();
                const hexPolygon = this.hexPolygonL.clone();
                hexPolygon.position.x = coord.x;
                hexPolygon.position.y = coord.y;
                hexPolygon.rotation.z = -Math.PI/2;
                hexPolygon.scale.x = 0.95;
                hexPolygon.scale.y = 0.95;
                hexPolygon.name = oldGridD[i].nameID;
                hexPolygon.state = oldGridD[i].state;
                hexPolygon.neigbors = oldGridD[i].neigbors;
                hexPolygon.matrixAutoUpdate = false;
                hexPolygon.updateMatrix();
                this.field3D.add( hexPolygon );
           } else if (oldGridD[i].state === false) {
                let obj = this.field3D.getObjectByName(oldGridD[i].nameID);
                this.field3D.remove( obj );
                obj.geometry.dispose();
                obj.material.dispose();
                const hexPolygon = this.hexPolygonD.clone();
                hexPolygon.position.x = coord.x;
                hexPolygon.position.y = coord.y;
                hexPolygon.rotation.z = -Math.PI/2;
                hexPolygon.scale.x = 0.95;
                hexPolygon.scale.y = 0.95;
                hexPolygon.name = oldGridD[i].nameID;
                hexPolygon.state = oldGridD[i].state;
                hexPolygon.neigbors = oldGridD[i].neigbors;
                hexPolygon.matrixAutoUpdate = false;
                hexPolygon.updateMatrix();
                this.field3D.add( hexPolygon );
           }

        }

        console.log("it: "+this.state.currentPopulation)


        //this.gridInit = oldGridD

        this.state.currentPopulation += 1;
        return oldGridD;

    }

    makeHexagonalShape = (N) => {
        let results = [];
        for (let q = -N; q <= N; q++) {
            for (let r = -N; r <= N; r++) {
                let hex = new Hex(q, r, -q-r);
                if (hex.len() <= N) {
                    var cube = this.Cube(hex.q, hex.r, hex.s);
                    cube.state = (Math.random() >0.1);
                    results.push(cube);
                }
            }
        }
        return results;
    }



    stepLife = (grid) => {
        this.active = 0;
        this.state.previousPopulation = this.state.currentPopulation;

        let hex;
        let coord;
        let cube;
        const oldGridS = [];
        for(let g in grid) {
            hex = this.cubeToAxial(grid[g]);
            cube = this.axialToCube(hex);
            cube.neigbors = 0;
            cube.nameID = (""+cube.x+""+cube.y+""+cube.z+"");
            //cube.state = (Math.random() < 0.1);
            cube.state = grid[g].state;
            oldGridS.push(cube);
        }

        const newGridS = JSON.parse(JSON.stringify(oldGridS));


        for(let i in oldGridS) {
            let n = this.findNeighbors(oldGridS[i]);
            let count = 0;
            for(let j in n) {
                let item = oldGridS.find(item => item.nameID == n[j].nameID);
                if(item && item.state === true){
                    count += 1;
                };
                item = 0;
            }
            newGridS[i].neigbors = count;

        }

        for(let i in oldGridS) {
            if(oldGridS[i].state === true){
                if(newGridS[i].neigbors>2 || newGridS[i].neigbors<2){
                    newGridS[i].state = false;
                    //console.log(""+grid[i].nameID+": умер");
                    this.active = 1;
                } else {
                    //newGridS[i].state = true;
                }
            }

            if(oldGridS[i].state === false){
                if(newGridS[i].neigbors==2){
                    newGridS[i].state = true;
                    //console.log(""+grid[i].nameID+": ожил");
                    this.active = 1;
                } else {
                    //newGridS[i].state = false;
                }
            }
        }





        //newGridS.id = this.state.currentPopulation+1;


        //this.gridInit = JSON.parse(JSON.stringify(newGridS));
        //this.gridInit.id = newGridS.id;


        if(this.active == 0){
            console.log("Симуляция завершена");
            console.log("Текущая популяция: "+this.state.currentPopulation)
            return newGridS
        } else {
            //console.log("Шаг завершен");
            return newGridS;
        }



    }

    nextStep = () => {
            if(this.active && this.state.previousPopulation != this.state.currentPopulation){
                if( this.state.currentPopulation < 64000){
                    //console.log("grid ID: "+this.gridInit.id)
                    if(this.state.currentPopulation == 1){
                        this.currGrid = this.stepLife(this.gridInit);
                    } else {
                        this.currGrid = this.stepLife(this.prevGrid);
                    }
                    this.prevGrid = this.redrawGrid(this.currGrid)
                } else {
                    console.log("Максимальная популяция "+ this.state.currentPopulation)
                }

            }
            this.animate()
    }

    keyup = (e) => {
      if (e.key == " " ||
          e.code == "Space" ||
          e.keyCode == 32
      ) {
            this.active = !this.active;
            this.nextStep;
            //console.log("Press spacebar")
      }
    }



    statistics = () => {
        console.log("Scene polycount:", this.state.renderer.info.render.triangles)
        console.log("Active Drawcalls:", this.state.renderer.info.render.calls)
        console.log("Textures in Memory", this.state.renderer.info.memory.textures)
        console.log("Geometries in Memory", this.state.renderer.info.memory.geometries)
    }

    componentDidMount() {




        ///HEXAGON
        // this.cellGroup = new THREE.Object3D();
        // this.cellGroup.name = 'Map'
        // this.state.scene.add( this.cellGroup );


        this.state.renderer.setPixelRatio( window.devicePixelRatio );
        this.state.renderer.gammaInput = true;
        this.state.renderer.gammaOutput = true;
        //this.state.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.state.renderer.domElement);


        if(this.container){
            this.updateScreenSize();
        }
        window.addEventListener("resize", this.updateScreenSize.bind(this));
        ///window.addEventListener("mousedown", this.nextStep.bind(this), false);
        window.addEventListener("keyup", this.keyup.bind(this), false);

        //window.addEventListener( 'mousedown', this.onMouseDown.bind(this), false);
        //window.addEventListener( 'mousemove', this.onMouseMove.bind(this), false);


        //HEX FIELD CREATION//
        //const hexCurve = new THREE.SplineCurve(this.drawHex(this.Point(0,0)));

        //let shape = new THREE.Shape(hexCurve.getSpacedPoints(5));
        //let geometry = new THREE.ShapeGeometry( shape );
        //let mesh = new THREE.Mesh( geometry );
        //
        //

        //Circle OBJECT
        const circleGeo = new THREE.CircleGeometry( 0.2, 6 );



        const materialL = new THREE.MeshBasicMaterial( { color: 0xDD9045 } );
        const materialD = new THREE.MeshBasicMaterial( { color: 0x5C4D2F } );

        const circleL = new THREE.Mesh( circleGeo, materialL );
        const circleD = new THREE.Mesh( circleGeo, materialD );

        this.hexPolygonL = circleL;

        this.hexPolygonD = circleD;

        //INIT FIEELD MAP ARRAY GRID
        this.initStartFied = this.makeHexagonalShape(this.state.HexShapeCountRound);
        //console.log(this.initStartFied)

        //ADD 3D Obj on Grid coord (grid coord - cube formst - x,y,z)
        //this.gridInit = this.initGrid(this.initStartFied);
        //this.gridInit.id =1;
        //console.log("gridInit")
        //console.log(this.gridInit)

        //this.step = this.stepLife(this.gridInit);
        this.active = 0;




        // const ctx = document.createElement('canvas').getContext('2d');
        // ctx.canvas.width = 2048;
        // ctx.canvas.height = 2048;
        // ctx.fillStyle = '#DD9045';
        // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // ctx.strokeStyle = '#CEC5B9';
        // ctx.lineWidth = 1;

        // let points = this.drawHex(this.Point(0,0));

        // let center = ctx.canvas.width/2;

        // ctx.font = '24px serif';
        // ctx.textAlign = "center";
        // ctx.textBaseline = "middle";

        // for(var i=0; i<=this.initStartFied.length-1; i++){
        //     let hex = this.cubeToAxial(this.initStartFied[ i ]);

        //     let coord = this.hexToPixel(hex);

        //    if(this.initStartFied[ i ].state){
        //         points = this.drawHex(this.Point(coord.x,coord.y));
        //         ctx.beginPath();
        //         ctx.moveTo(center+points[0].x, center+points[0].y);
        //         ctx.lineTo(center+points[1].x, center+points[1].y);
        //         ctx.lineTo(center+points[2].x, center+points[2].y);
        //         ctx.lineTo(center+points[3].x, center+points[3].y);
        //         ctx.lineTo(center+points[4].x, center+points[4].y);
        //         ctx.lineTo(center+points[5].x, center+points[5].y);
        //         ctx.fillStyle = '#254B51';
        //         ctx.fill()
        //         ctx.closePath();
        //         ctx.stroke();
        //         ctx.fillStyle = '#D45A6A';
        //         ctx.fillText(''+this.initStartFied[ i ].x+'', center+coord.x-40, center+coord.y);
        //         ctx.fillStyle = '#95DB2A';
        //         ctx.fillText(''+this.initStartFied[ i ].y+'', center+coord.x+20, center+coord.y+40);
        //         ctx.fillStyle = '#2ED1F5';
        //         ctx.fillText(''+this.initStartFied[ i ].z+'', center+coord.x+20, center+coord.y-40);

        //         //addToField.push(hexPolygon);
        //    } else {
        //         points = this.drawHex(this.Point(coord.x,coord.y));
        //         ctx.beginPath();
        //         ctx.moveTo(center+points[0].x, center+points[0].y);
        //         ctx.lineTo(center+points[1].x, center+points[1].y);
        //         ctx.lineTo(center+points[2].x, center+points[2].y);
        //         ctx.lineTo(center+points[3].x, center+points[3].y);
        //         ctx.lineTo(center+points[4].x, center+points[4].y);
        //         ctx.lineTo(center+points[5].x, center+points[5].y);
        //         ctx.closePath();
        //         ctx.stroke();
        //         ctx.fillStyle = '#D45A6A';
        //         ctx.fillText(''+this.initStartFied[ i ].x+'', center+coord.x-40, center+coord.y);
        //         ctx.fillStyle = '#95DB2A';
        //         ctx.fillText(''+this.initStartFied[ i ].y+'', center+coord.x+20, center+coord.y+40);
        //         ctx.fillStyle = '#2ED1F5';
        //         ctx.fillText(''+this.initStartFied[ i ].z+'', center+coord.x+20, center+coord.y-40);

        //    }

        // }


        // const n = this.findNeighbors(this.initStartFied[ 50 ]);

        // ctx.strokeStyle = '#95DB2A';

        // for(var i=0; i<=n.length-1; i++){
        //     let hex = this.cubeToAxial(n[ i ]);
        //     let coord = this.hexToPixel(hex);

        //     points = this.drawHex(this.Point(coord.x,coord.y));
        //     ctx.beginPath();
        //     ctx.moveTo(center+points[0].x, center+points[0].y);
        //     ctx.lineTo(center+points[1].x, center+points[1].y);
        //     ctx.lineTo(center+points[2].x, center+points[2].y);
        //     ctx.lineTo(center+points[3].x, center+points[3].y);
        //     ctx.lineTo(center+points[4].x, center+points[4].y);
        //     ctx.lineTo(center+points[5].x, center+points[5].y);
        //     ctx.closePath();
        //     ctx.stroke();
        // }



        // let plane = new THREE.PlaneBufferGeometry( 10, 10 );
        // let texture = new THREE.CanvasTexture(ctx.canvas);
        // texture.needsUpdate = true;
        // let ctxMat = new THREE.MeshBasicMaterial({
        //     map: texture
        // });
        // plane.receiveShadow = false;
        // let planeMesh = new THREE.Mesh(plane, ctxMat );
        // this.state.scene.add( planeMesh);

/////NEW SELECTABLE GRID
        this.hex3D = new THREE.CircleGeometry( 0.2, 6 );




        for (let i in this.initStartFied) {

            //console.log(this.initStartFied[i])
            let cdhex = 0x000000;
            if(this.initStartFied[i].state == true){
                    cdhex  = 0xDD9045;
                } else {
                    cdhex  = 0x483720;
                }
            const object = new THREE.Mesh( this.hex3D, new THREE.MeshLambertMaterial( { color: cdhex } ) );
            let hex = this.cubeToAxial(this.initStartFied[ i ]);
            let coord = this.hexToPixel(hex);
            object.state = this.initStartFied[i].state;
            object.position.x = coord.x;
            object.position.y = coord.y;
            object.scale.x = 0.95;
            object.scale.y = 0.95;
            object.rotation.z = -Math.PI/2;
            object.matrixAutoUpdate = false;
            object.updateMatrix();
            this.state.scene.add( object );

        }







        this.start()

    }

    _genocide = () => {

        for(i in this.initStartFied){
            this.initStartFied[i].state = false;
        }
    }


    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize.bind(this));
        window.removeEventListener("keyup", this.keyup.bind(this), false);
        //window.removeEventListener( 'mousedown', this.onMouseDown.bind(this), false);
        //window.removeEventListener( 'mouseup', this.onMouseUp.bind(this));
        //window.removeEventListener( 'mousemove', this.onMouseMove.bind(this));
        this.container.removeChild(this.state.renderer.domElement)
        this.stop()
    }


    updateScreenSize() {
        let up_w = window.innerWidth;
        let up_h = window.innerHeight-100;
        this.camera.aspect = up_w / up_h;






        this.camera.updateProjectionMatrix();
        this.state.renderer.setSize( up_w, up_h );

    }




    start = () => {
        if (!this.frameId) {
          this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId)
    }

    animate = () => {
        this.stats.begin();

        this.delta = this.clock.getDelta();
        this.timer = Date.now() * 0.01;

        // this.delay += this.delta;
        // if(this.delay>3){
        //     //console.log(this.delay)
        //     this.delay = 0;
        //     if(this.active && this.state.previousPopulation != this.state.currentPopulation){
        //         if( this.state.currentPopulation < 3){
        //             this.field3D.updateMatrix();
        //             console.log("grid ID: "+this.gridInit.id)
        //              this.stepLife(this.gridInit);
        //         }

        //     }
        // }
        //
        this.delay += this.delta;
        if(this.delay>0.1 && this.active == 1){
             //console.log(this.delay)
            this.delay = 0;
            this.nextStep();
        }




        this.renderScene(this.delta);

        this.stats.end();
        this.frameId = window.requestAnimationFrame(this.animate)
    }

    onMouseDown ( event ) {
        this.onMouseDownState = true;
        const raycaster = this.raycaster;
            let mouse = { x:0, y:0 };
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -((event.clientY-50) / (window.innerHeight-100)) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            //console.log(mouse);
            const intersectingGridPoints = raycaster.intersectObjects(this.state.scene.children, false);

            if(this.selectedGridPoint !== null) {

                //this.selectedGridPoint.material = this.gridPointMaterials[0];
                this.selectedGridPoint = null;

            }

            if(intersectingGridPoints.length > 0) {


                this.selectedGridPoint = intersectingGridPoints[0].object;
                const qr = this.pixelToHex(intersectingGridPoints[0].point)
                const st = this.selectedGridPoint.state;
                //console.log(qr)
                //console.log(this.selectedGridPoint.state)


                    if(st == true){
                        console.log("true", intersectingGridPoints)
                        this.selectedGridPoint.material.color.setHex( 0x483720  );
                        this.selectedGridPoint.state = false;
                        this.selectedGridPoint.updateMatrix();

                    } else if(st == false) {
                        console.log("false", intersectingGridPoints)
                        this.selectedGridPoint.material.color.setHex( 0xDD9045 );
                        this.selectedGridPoint.state = true;
                        this.selectedGridPoint.updateMatrix();
                    }

            }

    }







    _onClick = (e) => {
        e.preventDefault();
        console.log('You clicked on  canvas.');

        const raycaster = this.raycaster;
        let mouse = { x:0, y:0 };
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -((event.clientY-50) / (window.innerHeight-100)) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);
        //console.log(mouse);
        const intersectingGridPoints = raycaster.intersectObjects(this.state.scene.children, false);

        if(this.selectedGridPoint !== null) {
            this.selectedGridPoint = null;
        }

        if(intersectingGridPoints.length > 0) {
            this.selectedGridPoint = intersectingGridPoints[0].object;
            const qr = this.pixelToHex(intersectingGridPoints[0].point)
            const st = this.selectedGridPoint.state;
                if(st == true){
                    //console.log("true", intersectingGridPoints)
                    this.selectedGridPoint.material.color.setHex( 0x483720  );
                    this.selectedGridPoint.state = false;
                } else if(st == false) {
                    //console.log("false", intersectingGridPoints)
                    this.selectedGridPoint.material.color.setHex( 0xDD9045 );
                    this.selectedGridPoint.state = true;
                }
            this.selectedGridPoint.updateMatrix();
        }
    }

    onMouseUp (event) {
        this.onMouseDownState = false;
    }

    onMouseMove ( event ) {
        if(this.onMouseDownState){
            const raycaster = this.raycaster;
                let mouse = { x:0, y:0 };
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -((event.clientY-50) / (window.innerHeight-100)) * 2 + 1;

                raycaster.setFromCamera(mouse, this.camera);
                //console.log(mouse);
                const intersectingGridPoints = raycaster.intersectObjects(this.state.scene.children, false);

                if(this.selectedGridPoint !== null) {

                    //this.selectedGridPoint.material = this.gridPointMaterials[0];
                    this.selectedGridPoint = null;

                }

                if(intersectingGridPoints.length > 0) {


                    this.selectedGridPoint = intersectingGridPoints[0].object;
                    const qr = this.pixelToHex(intersectingGridPoints[0].point)
                    const st = this.selectedGridPoint.state;
                    //console.log(qr)
                    //console.log(this.selectedGridPoint.state)


                        if(st == true){
                            console.log("true", intersectingGridPoints)
                            this.selectedGridPoint.material.color.setHex( 0x483720  );
                            this.selectedGridPoint.state = false;
                            this.selectedGridPoint.updateMatrix();

                        } else if(st == false) {
                            console.log("false", intersectingGridPoints)
                            this.selectedGridPoint.material.color.setHex( 0xDD9045 );
                            this.selectedGridPoint.state = true;
                            this.selectedGridPoint.updateMatrix();
                        }

                }
            }
    }
    renderScene = () => {


        this.state.renderer.render(this.state.scene, this.camera)

    }


  render() {

    return (
        <W>
            <div
                onClick={this._onClick}
                ref={thisNode => this.container=thisNode}
                onKeyDown={this.start}
                onKeyUp={this.stop}
            />
        </W>
    )
  }

}

export default GOL;