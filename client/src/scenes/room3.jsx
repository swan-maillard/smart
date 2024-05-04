/* eslint-disable */
import {PointerEventTypes, Engine, Scene, FreeCamera, Vector3, HemisphericLight, DynamicTexture, StandardMaterial, MeshBuilder, Color3} from "@babylonjs/core";
import {ref} from "@vue/runtime-core";
import {getPorte,  getSalle, getCoffreGemmes, getCodeCoffre, getButtonValdier} from "./roomsElements";

//Salle 3 : 
// position possible : centre, trappe, image, coffre
const position = ref("centre");

const createScene = (canvas, verif) => {
    //base pour creer la scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);
    const drag = ref(null);

    //On ajoute une caméra et une lumière
    const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
    camera.setTarget(new Vector3(0, 2, 5));
    camera.attachControl(canvas, false); ///TODO : blocker pour diminuer l'amplitude de mvt
    console.log(camera.position)

    new HemisphericLight("light", Vector3.Up(), scene);

    var mursSalle = getSalle(scene, 3);
    getPorte(scene);

    getCoffreGemmes(scene);

    // Creation code coffre
    const code = ref([0,0,0,0]); // valeur de la combinaison du coffre

    var texture = new Array();
    for(var i=0; i<4; i++){
        texture.push(getCodeCoffre(scene,i,3.5-i*0.3));
    }
    getButtonValdier();

    engine.runRenderLoop(() => {
        scene.render();
    });

    var currentMesh;

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        if(position.value === "centre"){
            if(currentMesh.name.startsWith("wooden_crate")){
                var coffre = scene.getMeshByName("wooden_crate_01_lid")
                if(coffre.isVisible){
                    moveCamera(camera, 0.5,1.6,3, 1 );
                }else{
                    moveCamera(camera, 3,1.6,3, 1 );
                }
                
            }
        }
        else if(position.value === "coffre"){
            if(currentMesh.name.startsWith("add")){
                addNumberCode();
            }
            else if(currentMesh.name.startsWith("sub")){
                subNumberCode();
            }
            else if(currentMesh.name === "buttonValider"){
                verif(currentMesh.name,code)
                .then(() => {
                    //TODO: ouvrir le coffre avec les gemmes
                    console.log("Vous avez ouvert le coffre !")
                    openCoffre();
                    moveCamera(camera, 3,1.6,3, 1 );
                },()=>{
                    console.log("Mauvais code ...");
                    reinitCode();
                });
            }else if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }
        }
        
    }

    var openCoffre = function(){
        var cordeCoffre = scene.getMeshByName("wooden_crate_01_latch");
        cordeCoffre.isVisible = false;
        var hautCoffre = scene.getMeshByName("wooden_crate_01_lid")
        console.log(hautCoffre);
        hautCoffre.isVisible = false;
    }

    var reinitCode = function(){
        for(var i=0; i<4; i++){
            code.value[i] = 0;
            texture[i].drawText(code.value[i], 35,70,"bold 50px Arial", "white", "black", true)
        }
    }

    var subNumberCode = function(){
        console.log("Boite cliqué Add!");
        var index = currentMesh.name.split(':')[1];
        if(code.value[index]>0)
            code.value[index]--;
        else
            code.value[index] = 9;
        texture[index].drawText(code.value[index], 35,70,"bold 50px Arial", "white", "black", true);
        texture[index].update();
    }

    var addNumberCode = function(){
        console.log("Boite cliqué Add!");
        var index = currentMesh.name.split(':')[1];
        if(code.value[index]<9)
            code.value[index]++;
        else
            code.value[index] = 0;
        texture[index].drawText(code.value[index], 35,70,"bold 50px Arial", "white", "black", true);
        texture[index].update();
    }
    

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                if (pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
            
        }
    });

    return scene;
}

function moveCamera(camera, x, y, z, pos){
    if(pos === -1)
        position.value = "coffre";
    else
        position.value = "coffre";

    var target = new Vector3(x,y,z);
    camera.position = target;
    camera.setTarget(new Vector3(x+pos,y,z));
    camera.lockedTarget = new Vector3(5.3,0,3);
}

function moveCameraInit(camera){
    position.value = "centre";

    camera.position = new Vector3(0, 1.6, -3);
    camera.setTarget(new Vector3(0,1.6,0))
    camera.lockedTarget = null;
}
export {createScene};