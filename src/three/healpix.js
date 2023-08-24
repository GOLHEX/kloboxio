import * as THREE from "three";

export default class HEALPiX {
    constructor(radius, detail) {
        this.radius = radius;
        this.detail = detail;
        this.theta = Math.acos(1 / Math.sqrt(3));
        this.phi = Math.PI / 4.0;
        this.a = Math.sin(this.theta) * Math.cos(this.phi);
        this.b = Math.sin(this.theta) * Math.sin(this.phi);
        this.c = Math.cos(this.theta);
        this.vertices = [
            [0, 1, 0],
            [-this.a, this.b, this.c], [this.a, this.b, this.c], [this.a, this.b, -this.c], [-this.a, this.b, -this.c],
            [0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0],
            [-this.a, -this.b, this.c], [this.a, -this.b, this.c], [this.a, -this.b, -this.c], [-this.a, -this.b, -this.c],
            [0, -1, 0]
            ];
        this.verticesSubdivided = []
        this.indices = [];
        this.uvs = [];
        this.uvw = [];
        this.positions = [];
        this.normals = [];
        this.uvsFlat = [];
        this.midpoints = [];
        this.positionAttribute = [];
        this.geometry = new THREE.BufferGeometry();
        this.geometry.vertices = [];
        //this.HEALPiX = new THREE.BufferGeometry();
        this.geometry.name = 'HEALPiX';
        this.uv = [];
        //console.log(JSON.stringify(this.geometry));
        
        this.materials = [
            new THREE.MeshBasicMaterial({ color: 0xF44336 }), 
            new THREE.MeshBasicMaterial({ color: 0xE91E63 }), 
            new THREE.MeshBasicMaterial({ color: 0x9C27B0 }), 
            new THREE.MeshBasicMaterial({ color: 0x673AB7 }), 

            new THREE.MeshBasicMaterial({ color: 0x03A9F4 }), 
            new THREE.MeshBasicMaterial({ color: 0x4CAF50 }), 
            new THREE.MeshBasicMaterial({ color: 0x8BC34A }),
            new THREE.MeshBasicMaterial({ color: 0xCDDC39 }),

            new THREE.MeshBasicMaterial({ color: 0x795548 }),
            new THREE.MeshBasicMaterial({ color: 0x9E9E9E }),
            new THREE.MeshBasicMaterial({ color: 0xF44336 }),
            new THREE.MeshBasicMaterial({ color: 0xF44336 })
        ];
        this.createGeometry();
    }


    project = (v) => {
        v = v.normalize().clone();
        v.index = this.geometry.vertices.push(v) - 1;
        this.positions.push(v.x, v.y, v.z);
        v = v.multiplyScalar(this.radius);
        this.positionAttribute.push(v.x, v.y, v.z);
       // this.geometry.index.push(v.index);
        return v;
    }

    midpointUV(uv1, uv2) {
        return new THREE.Vector2().addVectors(uv1, uv2).divideScalar(2);
    }

    midpoint(v1, v2) {
        if (!this.midpoints[v1.index]) this.midpoints[v1.index] = [];
        if (!this.midpoints[v2.index]) this.midpoints[v2.index] = [];
        let mid = this.midpoints[v1.index][v2.index];
        if (mid === undefined) {
            // generate mid point and project to surface
            mid = this.project(new THREE.Vector3().addVectors(v1, v2).divideScalar(2));
            this.midpoints[v1.index][v2.index] = this.midpoints[v2.index][v1.index] = mid;
        }
        //console.log(mid);
        return mid;
    }


    makeFace = (v1, v2, v3, uv1, uv2, uv3, matIdx, detail) => {
        if (detail < 1) {
                    //let centroid = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);

                    // Вычисление нормали
                    let normal = new THREE.Vector3().crossVectors(v2.clone().sub(v1), v3.clone().sub(v1)).normalize();


                    // Добавление нормали
                    this.normals.push(normal.x, normal.y, normal.z);
                    this.normals.push(normal.x, normal.y, normal.z);
                    this.normals.push(normal.x, normal.y, normal.z);

                    // Добавление групп материалов
                    if (this.materials.length > 1) {
                        //console.log("index L: "+this.indices.length);
                        //let srt = this.indices.length.toString();
                        this.geometry.addGroup(this.indices.length - 3, +3, matIdx);
                    }


                    // Добавление вершин
                   // v1.index = this.vertices.length / 3;
                   // v2.index = this.vertices.length / 3 + 1;
                   // v3.index = this.vertices.length / 3 + 2;
            
                    this.verticesSubdivided.push(v1.x, v1.y, v1.z);
                    this.verticesSubdivided.push(v2.x, v2.y, v2.z);
                    this.verticesSubdivided.push(v3.x, v3.y, v3.z);
        
                    // Добавление индексов
                    this.indices.push(v1.index, v2.index, v3.index);
            
                    // Добавление UV-координат
                    this.uvs.push(uv1.x, uv1.y);
                    this.uvs.push(uv2.x, uv2.y);
                    this.uvs.push(uv3.x, uv3.y);


                    ///HEALPiX Geometry START
                    // this.HEALPiX.vertices.push(v1.x, v1.y, v1.z);
                    // this.HEALPiX.vertices.push(v2.x, v2.y, v2.z);
                    // this.HEALPiX.vertices.push(v3.x, v3.y, v3.z);
            
                    // Добавление индексов
                    // this.HEALPiX.indices.push(v1.index, v2.index, v3.index);
                    // Добавление нормали
                    // this.HEALPiX.normals.push(normal.x, normal.y, normal.z);
                    // this.HEALPiX.normals.push(normal.x, normal.y, normal.z);
                    // this.HEALPiX.normals.push(normal.x, normal.y, normal.z);
                    ///HEALPiX Geometry END

            // var face = new THREE.Face3(v1.index, v2.index, v3.index, [v1.clone(), v2.clone(), v3.clone()]);
            // face.centroid.add(v1).add(v2).add(v3).divideScalar(3);
            // face.normal = face.centroid.clone().normalize();
            // face.materialIndex = matIdx;
            // geometry.faces.push(face);
            // geometry.faceVertexUvs[0].push([uv1.clone(), uv2.clone(), uv3.clone()]);
        } else {
            console.log("vertx: "+v1, v2, v3, "uvs: "+uv1, uv2, uv3, "matindex: "+matIdx);
        //     // split face into 4 smaller faces
            detail -= 1;
            this.makeFace(v1, this.midpoint(v1, v2), this.midpoint(v1, v3), uv1, this.midpointUV(uv1, uv2), this.midpointUV(uv1, uv3), matIdx, detail); // top quadrant
            this.makeFace(this.midpoint(v1, v2), v2, this.midpoint(v2, v3), this.midpointUV(uv1, uv2), uv2, this.midpointUV(uv2, uv3), matIdx, detail); // left quadrant
            this.makeFace(this.midpoint(v1, v3), this.midpoint(v2, v3), v3, this.midpointUV(uv1, uv3), this.midpointUV(uv2, uv3), uv3, matIdx, detail); // right quadrant
            this.makeFace(this.midpoint(v1, v2), this.midpoint(v2, v3), this.midpoint(v1, v3), this.midpointUV(uv1, uv2), this.midpointUV(uv2, uv3), this.midpointUV(uv1, uv3), matIdx, detail); // center quadrant
        }
    }
  
    createGeometry = () => {
        const theta = Math.acos(1 / Math.sqrt(3));
        const phi = Math.PI / 4.0;
        const a = Math.sin(theta) * Math.cos(phi);
        const b = Math.sin(theta) * Math.sin(phi);
        const c = Math.cos(theta);
        const vertices = [
            [0, 1, 0],
            [-a, b, c], [a, b, c], [a, b, -c], [-a, b, -c],
            [0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0],
            [-a, -b, c], [a, -b, c], [a, -b, -c], [-a, -b, -c],
            [0, -1, 0]
        ];

        const faces = [
            [0, 1, 2], [1, 5, 2],
            [0, 2, 3], [2, 6, 3],
            [0, 3, 4], [3, 7, 4],
            [0, 4, 1], [4, 8, 1],
            [1, 8, 9], [1, 9, 5],
            [2, 5, 10], [2, 10, 6],
            [3, 6, 11], [3, 11, 7],
            [4, 7, 12], [4, 12, 8],
            [5, 9, 10], [9, 13, 10],
            [6, 10, 11], [10, 13, 11],
            [7, 11, 12], [11, 13, 12],
            [8, 12, 9], [12, 13, 9]
        ];
        
        const uvs = [
            [[1, 0], [0, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [0, 1]], [[1, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [0, 1]], [[1, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [0, 1]], [[1, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [0, 1]], [[1, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]],
            [[1, 0], [0, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]]
        ];

        // Инициализация вершин
        vertices.forEach((v, i) => {
            //console.log(v);
            this.project(new THREE.Vector3(v[0], v[1], v[2]));
        });

        // subdivided faces
        faces.forEach((f, i) => {
            this.uv = uvs[i];
            for (var j = 0; j < 3; j++) {
                this.uv[j] = new THREE.Vector2(this.uv[j][0], this.uv[j][1]);
            }
            this.makeFace(this.geometry.vertices[f[0]], this.geometry.vertices[f[1]], this.geometry.vertices[f[2]], this.uv[0], this.uv[1], this.uv[2], Math.floor(i/2), this.detail);
        });

        this.geometry.setIndex(this.indices);
        this.geometry.setAttribute('vertices', new THREE.Float32BufferAttribute(this.verticesSubdivided, 3));
        //this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positionAttribute, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));

        this.geometry.computeVertexNormals();
        this.geometry.computeBoundingSphere();

        //console.log(this.geometry);
    }
}