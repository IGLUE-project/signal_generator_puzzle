import './../assets/scss/main.scss';
import React, { useContext,useState, useEffect } from 'react';
import { GlobalContext } from "./GlobalContext";

const  Dial = ( props ) => {
  const {  appSettings } = useContext(GlobalContext);

    const maxSteps = props.maxSteps;
    const degreesPerStep = 360 / maxSteps;
    
    const [initialRotation, setInitialRotation] = useState(0); // Ángulo inicial del lock
    const [isMouseDown, setIsMouseDown] = useState(false); // Estado para saber si el mouse está presionado
    const [startAngle, setStartAngle] = useState(0); // Ángulo inicial del ratón
    const [lastMoveTime, setLastMoveTime] = useState(0); // Tiempo del último movimiento
    const [pendingDirection, setPendingDirection] = useState(null); // Dirección pendiente de movimiento
   // const [rotationDirection, setRotationDirection] = useState(false); // Dirección de rotación (horario o antihorario)

    const handleMouseMove = (event) => {
        if (!isMouseDown || props.checking || props.isReseting) return ;   
        
        let audio  = document.getElementById("audio_wheel");
        let rounded = calculateAngle(event); 
        const angleDifference = normalizeAngleDifference(rounded - startAngle);
        const newRotation = normalizeAngle(initialRotation + angleDifference);
        
        const currentStep = Math.round(props.rotationAngle / degreesPerStep);
        const newStep = Math.round(newRotation / degreesPerStep);

        const rotationDir = getRotationDirection(currentStep, newStep);

        if(currentStep >= maxSteps){
            props.setRotationAngle(maxSteps-1); // Si el paso actual es mayor que el máximo, reinicia a 0
            console.warn("Current step exceeds max steps, resetting to ", maxSteps - 1);
            return;
        }
        
        if(props.rotationAngle === newRotation) return; // No actualiza si el ángulo no ha cambiado
        if(currentStep === (maxSteps - 1) && rotationDir) return; // En el paso máximo y girando hacia adelante
        if(currentStep === 0 && !rotationDir) return; // En el paso 0 y girando hacia atrás
        
        const currentTime = Date.now();
        const timeSinceLastMove = currentTime - lastMoveTime;        
        if (timeSinceLastMove < appSettings.dialSpeed) {
            if (rotationDir !== null) {
                setPendingDirection(rotationDir);
            }
            return;
        }
        const directionToUse = pendingDirection !== null ? pendingDirection : rotationDir;        
        if (directionToUse === null) return;
        const nextStep = directionToUse ? currentStep + 1 : currentStep - 1;        
        if (nextStep < 0 || nextStep >= maxSteps) {
            setPendingDirection(null);
            return;
        }
        const nextRotation = nextStep * degreesPerStep;
        props.setRotationAngle(nextRotation);
        audio.play();
        setLastMoveTime(currentTime);
        setPendingDirection(null); // Limpiar dirección pendiente
    };

    const handleMouseUp = () => {
        if (props.checking || props.isReseting) return ;
        setIsMouseDown(false);
        setPendingDirection(null); // Limpiar dirección pendiente al soltar el mouse
    };

    const handleMouseDown = (event) => {
        if (props.checking || props.isReseting) return ;
        setIsMouseDown(true);  
        let rounded = calculateAngle(event); 
        setStartAngle(rounded);     
        setInitialRotation(props.rotationAngle);
      };

    const calculateAngle = (event) => {
        const lockElement = document.getElementById(props.id); 
        const rect = lockElement.getBoundingClientRect();  
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;  
        const radians = Math.atan2(event.clientY - centerY, event.clientX - centerX);
        let angle = radians * (180 / Math.PI);  
        if (angle < 0) {
          angle += 360;}
        return Math.round(angle / degreesPerStep) * degreesPerStep; 
      }

    function getRotationDirection(prevStep, newStep) {
        const diff = (newStep - prevStep + maxSteps) % maxSteps;
        if (diff === 0) return null;
        return diff < maxSteps / 2;
    }

    const normalizeAngleDifference = (angle) => {
        return ((angle + 180) % 360) - 180;
    };    
    const normalizeAngle = (angle) => {
        return ((angle % 360) + 360) % 360; 
    };

    const reset = () => {
        setStartAngle(0);
        setLastMoveTime(0);
        setPendingDirection(null);
        //setRotationDirection("");
    }

    useEffect(() => {    
        if (props.isReseting) { 
            reset(); 
        }}, [props.isReseting]); 

    return(
        <div className='dialContainer' style={{  
            width: Math.min(props.boxWidth, props.boxHeight) * 0.28, 
            height: Math.min(props.boxWidth, props.boxHeight) * 0.28,
            left: props.xPosition,
            cursor: "pointer",
            }}
            onDragStart={(event) => event.preventDefault()} 
            onMouseUp={handleMouseUp} 
            onMouseDown={handleMouseDown} 
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsMouseDown(false)} >
          
            <div className="dial" id={props.id} style={{ 
              width: "100%", 
              height: "100%", 
              
              backgroundImage: `url(${appSettings.backgroundDial})`, // Imagen del dial
              transform: `rotate(${props.rotationAngle}deg)`, 
              transition: props.isReseting ? "transform 2.5s ease" : "none", // Transición suavedurante el reset
            }}>
              <p id="rotationNum" className='rotationNum' onDragStart={(event) => event.preventDefault()} style={{fontSize: props.boxHeight * appSettings.dialTextSize * (props.id === "dial-phase" ? 0.9 : 1)}}>{props.name}</p></div>
              <audio id="audio_wheel" src="sounds/spin.wav" autostart="false" preload="auto" />    
        </div>
    );
}

export default Dial;