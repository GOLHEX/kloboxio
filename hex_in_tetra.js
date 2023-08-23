        roundDown = () => {
        // this.setState({
        //     round:2
        // })
        this.drawKnight()
    }

    roundUp = () => {
        // this.setState({
        //     round:8
        // })
        this.drawCell()
    }

	
	drawKnight = () => {

    }

    drawCell = () => {

        this.instancePosition = [];

        var cd = { r: 155/255, g: 89/255, b: 182/255}

        this.drawGrid(this.Point(0,0),1,cd);


    }


    Point = (x, y) => {
        return {x: x, y: y}
    }

    Hex = function(q, r){
        return {q: q, r: r}
    }

    Cube = function(x, y, z){
        return {x: x, y: y, z: z}
    }

    hex_corner =  function (center, i) {
        var angle_deg = 60*i+30;
        var angle_rad = Math.PI/180*angle_deg;
        var x = center.x + this.state.hexSize * Math.cos(angle_rad);
        var y = center.y + this.state.hexSize * Math.sin(angle_rad);
        return this.Point(x, y)
    }


    hexToPixel = function (h){
        //console.log(this.state.hexOrigin)
        var hexOrigin = this.state.hexOrigin;
        var x = this.state.hexSize * Math.sqrt(3) * (h.q + h.r/2) + hexOrigin.x;
        var y = this.state.hexSize * 3/2 * h.r + hexOrigin.y;
        return this.Point(x, y)
    };

    pixelToHex = function (p){
        var q = ((p.x - this.state.hexOrigin.x) * Math.sqrt(3)/3 - (p.y - this.state.hexOrigin.y)/ 3) / this.state.hexSize;
        var r = (p.y - this.state.hexOrigin.y) * 2/3 / this.state.hexSize;
        return this.hexRound(this.Hex(q, r))
    };


    cubeDir = function (dir){
        var cubeDir = [ this.Cube(-1, 1, 0), this.Cube(0, 1, -1), this.Cube(1, 0, -1), this.Cube(1, -1, 0), this.Cube(0, -1, 1), this.Cube(-1, 0, 1) ];
        return cubeDir[dir];
    }

    cubeAdd = function (a, b){
        return this.Cube(a.x + b.x, a.y + b.y, a.z + b.z)
    }

    cubeNeighbor = function (c, dir){
        return this.cubeAdd(c, this.cubeDir(dir))
    }

    cubeToAxial = function (c){
        var q = c.x;
        var r = c.z;
        //console.log(q, r);
        return this.Hex(q, r)
    };

    axialToCube = function (h){
        var x = h.q;
        var z = h.r;
        var y = -x-z;
        //console.log(x, y, z);
        return this.Cube(x, y, z)
    };

    cube_to_oddr = function (c){
        var q = c.x - (c.z - (c.z&1)) / 2;
        var r = c.z;
        //console.log(q, r);
        return this.Hex(q, r)
    };

    oddr_to_cube = function (h){
        var x = h.q + (h.r - (h.r&1)) / 2;
        var z = h.r;
        var y = -x-z;
        //console.log(x, y, z);
        return this.Cube(x, y, z)
    };

    hexRound = function (h){
        return this.cubeRound(this.axialToCube(h))
    };

    cubeRound = function (c){
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
    };

    cubeDir = function (dir){
        var cubeDir = [ this.Cube(-1, 1, 0), this.Cube(0, 1, -1), this.Cube(1, 0, -1), this.Cube(1, -1, 0), this.Cube(0, -1, 1), this.Cube(-1, 0, 1) ];
        return cubeDir[dir];
    }

    cubeAdd = function (a, b){
        return this.Cube(a.x + b.x, a.y + b.y, a.z + b.z)
    }

    cubeNeighbor = function (c, dir){
        return this.cubeAdd(c, this.cubeDir(dir))
    }

    findNeighbors = function(c){
        //console.log("Finding Neighbours:");
        for(var i=0; i<6; i++){
            var cube = this.cubeNeighbor(this.Cube(c.x, c.y, c.z), i)
            //console.log(cube);
            //draw neighbours start//
            var hex = this.cubeToAxial(cube);
            var center = this.hexToPixel(hex);
            //this.fillHex(center, "yellow");
            //this.drawHex(center);
            //draw neighbours end//
        }
    }

    cubeDistance = function (a, b){
        return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
    };

    lerp = function (a, b, t) {
        return a + (b - a) * t
    }

    lerpCube = function (a, b, t){
        return this.Cube(this.lerp(a.x, b.x, t), this.lerp(a.y, b.y, t), this.lerp(a.z, b.z, t))
    }

    drawLineCube = function(a, b){
        var N = this.cubeDistance(a, b);
        var results = [];
        for(var i =0; i<= N; i++){
            results.push(this.cubeRound(this.lerpCube(a, b, 1.0/N * i)));
        }
        return results
    }


    getHexParameters = function(){
        var hexHeight = this.state.hexSize * 2;
        var hexWidth = Math.sqrt(3)/2 * hexHeight;
        var vertDist = hexHeight * 3/4;
        var horizDist = hexWidth;
        return {hexWidth: hexWidth, hexHeight: hexHeight, vertDist: vertDist, horizDist: horizDist}

    };

    drawHexCoord = function (center,h){
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = "ccc";
        this.ctx.fillText("q:"+h.q, center.x - this.state.hexSize/2, center.y + this.state.hexSize/15);
        this.ctx.fillText("r:"+h.r, center.x + this.state.hexSize/4, center.y + this.state.hexSize/15);
    };

    drawCubeCoord = function (center,c){
        console.log('Cube coord: ')
        console.log(c)
        console.log('Center point: ')
        console.log(center)
        // this.ctx.globalAlpha = 0.5;
        // this.ctx.fillStyle = "red";
        // this.ctx.fillText("x:"+c.x, center.x - this.state.hexSize/1.4, center.y - this.state.hexSize/4);
        // this.ctx.fillStyle = "green";
        // this.ctx.fillText("y:"+c.y, center.x + this.state.hexSize/3, center.y - this.state.hexSize/4);
        // this.ctx.fillStyle = "blue";
        // this.ctx.fillText("z:"+c.z, center.x - this.state.hexSize/4, center.y + this.state.hexSize/1.4);
        // this.ctx.fillStyle = "black";
    };


    drawHex = (center) => {
        
        let cellPoints = []
        for(var i=0; i<=5; i++){
            var start = this.hex_corner(center, i);
            //var end = this.hex_corner(center, i + 1);
            cellPoints.push(new THREE.Vector2 (start.x, start.y));
        }
        
        return cellPoints
    }

    drawField = (center) => {
        for(var i=0; i<=5; i++){
            var start = this.hex_corner(center, i);
            start.x = start.x *15
            start.y = start.y *15
            console.log(start)
            this.drawGrid(start)
            //var end = this.hex_corner(center, i + 1);
        }
    }

    fillHex = function(center, fillColor){
        var c0 = this.hex_corner(center, 0);
        var c1 = this.hex_corner(center, 1);
        var c2 = this.hex_corner(center, 2);
        var c3 = this.hex_corner(center, 3);
        var c4 = this.hex_corner(center, 4);
        var c5 = this.hex_corner(center, 5);
        this.state.ctx.beginPath();
        this.state.ctx.fillStyle = fillColor;

        this.state.ctx.moveTo(c0.x, c0.y);
        this.state.ctx.lineTo(c1.x, c1.y);
        this.state.ctx.lineTo(c2.x, c2.y);
        this.state.ctx.lineTo(c3.x, c3.y);
        this.state.ctx.lineTo(c4.x, c4.y);
        this.state.ctx.lineTo(c5.x, c5.y);
        this.state.ctx.closePath();
        this.state.ctx.fill();
    };

    drawGrid = function(offset,type,cd){
        var slash = this.state.round;
        for(var r=-(slash); r<=(slash); r++){
            for(var q=-(slash); q<=(slash);q++){
                var cube = this.axialToCube(this.Hex(q, r));
                var hex = this.cube_to_oddr(cube);

                if(this.state.drawType == "cube"){
                    //cube = this.oddr_to_cube(hex);
                    //hex = this.cubeToAxial(cube);
                }
                //hex = this.hexRound(cube);
                //cube = this.oddr_to_cube(hex);
                // hex = this.cubeToAxial(cube)

                // cube = this.oddr_to_cube(hex);

                //hex = this.cube_to_oddr(cube);
                //cube = this.cubeRound(cube);

                ///Romb offset
                hex = this.cubeToAxial(cube)

                var center = this.hexToPixel(hex);

                center.x += offset.x
                center.y += offset.y


                var geoCell =   new THREE.CylinderBufferGeometry(
                                this.state.hexSize*0.95,
                                this.state.hexSize*0.95,
                                1.618,
                                6
                            );



                var cell = new THREE.Mesh(
                            geoCell,
                            new THREE.MeshPhongMaterial( {
                                color: this.state.cd,
                                emissive: 0.618 * 0x000000,
                                flatShading: true
                            } )
                    // new THREE.MeshLambertMaterial(
                    //     {
                    //         color: 0.618 * 0xffffff
                    //     }
                    // )
                );
                cell.position.x = center.x
                cell.position.y = Math.abs(cube.y)+Math.abs(cube.x)+Math.abs(cube.z)
                cell.position.z = center.y

                cell.rotation.x = 2 * Math.PI;
                cell.rotation.y = 2 * Math.PI;
                cell.rotation.z = 2 * Math.PI;

                cell.scale.x = 1;
                cell.scale.y = 1;
                cell.scale.z = 1;
                //scene.add( object );

                cell.layers.set(2)
                cell.cubeCoord = cube;
                cell.hexCoord = hex;

                cell.receiveShadow = true;
                cell.castShadow = true;

                cell.name = Math.random()*100;

                this.state.scene.add(cell)


                // var cd = { r: 231/255, g: 76/255, b: 60/255}

                // this.MeshPhongMaterial.color = cd



                // this.Mesh = new THREE.Mesh( this.GeometryCell, this.MeshPhongMaterial );
                // this.Mesh.receiveShadow = true;
                // this.Mesh.castShadow = true;


                // this.Mesh.position.x = (center.x)
                // this.Mesh.position.y = Math.abs(cube.y)+Math.abs(cube.x)+Math.abs(cube.z)
                // this.Mesh.position.z = (center.y)

                // this.Mesh.name = 'x: '+cube.x+' y: '+cube.y+' z: '+cube.z+'';
                // this.Mesh.layers.set(2)

                if(type){

                    //this.state.scene.add( this.Mesh )
                    this.cellGroup.add( this.Mesh )

                } else {
                    if((cube.x <= slash && cube.y <= slash && cube.z <= slash)){
                        if((cube.x >= -slash && cube.y >= -slash && cube.z >= -slash)){

                            //this.state.scene.add( this.Mesh )
                            this.cellGroup.add( this.Mesh )

                        }

                    }
                }
            }
        }


        //this.state.scene.cellGroup.update( );

    };