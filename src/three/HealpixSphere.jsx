import * as THREE from 'three';
import { Face3 } from 'three';


class HealpixSphere {
  constructor(radius, detail) {
    this.geometry = this.createGeometry(radius, detail);
  }

  createGeometry(radius, detail) {
    const theta = Math.acos(1 / Math.sqrt(3));
    const phi = Math.PI / 4.0;
    const a = Math.sin(theta) * Math.cos(phi);
    const b = Math.sin(theta) * Math.sin(phi);
    const c = Math.cos(theta);

    // const vertices = [
    //   [0, 1, 0],
    //   [-a, b, c], [a, b, c], [a, b, -c], [-a, b, -c],
    //   [0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0],
    //   [-a, -b, c], [a, -b, c], [a, -b, -c], [-a, -b, -c],
    //   [0, -1, 0]
    // ];
    const vertices = new Float32Array( [
      [0, 1, 0],
      [-a, b, c], [a, b, c], [a, b, -c], [-a, b, -c],
      [0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0],
      [-a, -b, c], [a, -b, c], [a, -b, -c], [-a, -b, -c],
      [0, -1, 0]
    ] );

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

    const geometry = new THREE.BufferGeometry();


   
    

    const positions = [];
    const normals = [];
    const uvsFlat = [];

    function project(v) {
      const normalizedV = v.normalize().clone();
      positions.push(normalizedV.x, normalizedV.y, normalizedV.z);
      normals.push(normalizedV.x, normalizedV.y, normalizedV.z);
      //why i trow error here?  uvsFlat.push(...uvs[positions.length / 3 - 1]); 

      uvsFlat.push(...uvs[parseInt(positions.length / 3) - 1]);
    }

    function makeFace(v1, v2, v3) {
      const index = positions.length / 3;
      project(v1);
      project(v2);
      project(v3);
      geometry.setIndex([index, index + 1, index + 2]);
    }

    for (let i = 0, l = vertices.length; i < l; i++) {
      const v = vertices[i];
      project(new THREE.Vector3(v[0], v[1], v[2]));
    }

    for (let i = 0; i < faces.length; i++) {
      const f = faces[i];
      makeFace(
        new THREE.Vector3().fromArray(positions, f[0] * 3),
        new THREE.Vector3().fromArray(positions, f[1] * 3),
        new THREE.Vector3().fromArray(positions, f[2] * 3)
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvsFlat, 2));


    return geometry;
  }
}
export default HealpixSphere;