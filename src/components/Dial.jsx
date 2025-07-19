import './../assets/scss/main.scss';
import React, { useContext,useState, useEffect } from 'react';
import { GlobalContext } from "./GlobalContext";

const  Dial = ( props ) => {
  const {  appSettings } = useContext(GlobalContext);
    const [initialRotation, setInitialRotation] = useState(0); // Ángulo inicial del lock
    const [isMouseDown, setIsMouseDown] = useState(false); // Estado para saber si el mouse está presionado
    const [startAngle, setStartAngle] = useState(0); // Ángulo inicial del ratón
    const [rotationDirection, setRotationDirection] = useState(false); // Dirección de rotación (horario o antihorario)

    const handleMouseMove = (event) => {
        if (!isMouseDown || props.checking || props.isReseting) return ;   
        let audio  = document.getElementById("audio_wheel");
        let rounded = calculateAngle(event); 
        const angleDifference = normalizeAngleDifference(rounded - startAngle);
        const newRotation = normalizeAngle(initialRotation + angleDifference);
        const rotationDir = getRotationDirection(props.rotationAngle/6, newRotation/6);
        if(props.rotationAngle === newRotation) return; // No actualiza si el ángulo no ha cambiado
        if(props.rotationAngle/3===119 && rotationDir) return; 
        if(props.rotationAngle/3===0 && !rotationDir) return;

        props.setRotationAngle(newRotation);     
        audio.play();
    };

    const handleMouseUp = () => {
        if (props.checking || props.isReseting) return ;
        setIsMouseDown(false); 
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
        return Math.round(angle / 3) * 3; 
      }

    function getRotationDirection(prev, curr) {
        const diff = (curr - prev + 60) % 60;
        if (diff === 0) return '';
        return diff < 30 ;
    }

    const normalizeAngleDifference = (angle) => {
        return ((angle + 180) % 360) - 180;
    };    
    const normalizeAngle = (angle) => {
        return ((angle % 360) + 360) % 360; // Asegura que el ángulo esté entre 0 y 360
    };

    const reset = () => {
        setStartAngle(0);
        setRotationDirection("");
    }

    useEffect(() => {    
        if (props.isReseting) { 
            reset(); 
        }}, [props.isReseting]); 

    return(
        <div className='dialContainer' style={{  
            width: Math.min(props.boxWidth, props.boxHeight) * 0.24, 
            height: Math.min(props.boxWidth, props.boxHeight) * 0.24,
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
              <p id="rotationNum" className='rotationNum' onDragStart={(event) => event.preventDefault()} >{props.name}</p></div>
              <audio id="audio_wheel" src="sounds/spin.wav" autostart="false" preload="auto" />    
        </div>
    );
}

export default Dial;