import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from "./GlobalContext";
import './../assets/scss/main.scss';
import Dial from './Dial.jsx';
import Ray from './Ray.jsx';

const MainScreen = (props) => {
  const { escapp, appSettings, Utils, I18n } = useContext(GlobalContext);
  const [processingSolution, setProcessingSolution] = useState(false);
  const [light, setLight] = useState("off");
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerMarginTop, setContainerMarginTop] = useState(0);
  const [containerMarginLeft, setContainerMarginLeft] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [boxHeight, setBoxHeight] = useState(0);
  const [lightWidth, setLightWidth] = useState(0); 
  const [lightHeight, setLightHeight] = useState(0); 
  const [lightLeft, setLightLeft] = useState(0);
  const [lightTop, setLightTop] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [phase, setPhase] = useState(0);
  const [amplitude, setAmplitude] = useState(0);

  const [paused, setPaused] = useState(false);
  const [powerOn, setPowerOn] = useState(false);
  const [animation, setAnimation] = useState('');
 

  const mapRange = (value, min1, max1, min2, max2) => {
    return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1);
  };
  
  //Maximo de cada dial
  const frecuencyMaxSteps = 50; 
  const phaseMaxSteps = 24; // Fase de 0 a 360 grados
  const amplitudeMaxSteps = 25; 
 
  const angleToStep = (angle, maxSteps) => {
    return Math.round(angle / (360/maxSteps));

  };
  const frequencyMapped = mapRange(angleToStep(frequency, frecuencyMaxSteps), 0, frecuencyMaxSteps - 1, appSettings.minFrequency, appSettings.maxFrequency);
  const phaseMapped = mapRange(angleToStep(phase, phaseMaxSteps), 0, phaseMaxSteps - 1, 0, 360); // Mapea a grados (0-360)
  const amplitudeMapped = mapRange(angleToStep(amplitude, amplitudeMaxSteps), 0, amplitudeMaxSteps - 1, appSettings.minAmplitude, appSettings.maxAmplitude);
  const [waveType, setWaveType] = useState("sine"); // Tipo de onda, por defecto es "sine"; "square", "triangle", "sawtooth"

  const [isReseting, setIsReseting] = useState(false); // Estado para saber si se está reiniciando el lock
  const [audioAmplitude, setAudioAmplitude] = useState(amplitude);

  useEffect(() => {
    handleResize();
  }, [props.appWidth, props.appHeight]);

  function handleResize(){
    if((props.appHeight === 0)||(props.appWidth === 0)){
      return;
    }

    let aspectRatio = 4 / 3;
    let _keypadWidth = Math.min(props.appHeight * aspectRatio, props.appWidth);
    let _keypadHeight = _keypadWidth / aspectRatio;

    let _lockWidth = Math.min(props.appHeight * aspectRatio, props.appWidth) ;
    let _lockHeight = _lockWidth / aspectRatio;

    let _containerWidth = _lockWidth *0.8;
    let _containerHeight = _lockHeight *0.8;


    let _containerMarginLeft=0.03 * _lockWidth;
    let _containerMarginTop=0.68 * _lockHeight;

    let _boxWidth = _lockWidth * 0.7;
    let _boxHeight = _lockHeight * 0.7;


    let _lightWidth;
    let _lightHeight;
    let _lightLeft;
    let _lightTop;

    switch(appSettings.skin){
      case "RETRO":
        break;
      case "FUTURISTIC":
        break;
      default:
        _lightWidth = _lockWidth * 0.08;
        _lightHeight = _lockHeight * 0.08;
        _lightLeft =  _lockWidth  * 0.61;
        _lightTop =  _lockHeight  * 0.03
    }

    setContainerWidth(_containerWidth);
    setContainerHeight(_containerHeight);
    setContainerMarginTop(_containerMarginTop);
    setContainerMarginLeft(_containerMarginLeft);

    setBoxWidth(_boxWidth);
    setBoxHeight(_boxHeight);

    setLightWidth(_lightWidth);
    setLightHeight(_lightHeight);
    setLightLeft(_lightLeft);
    setLightTop(_lightTop);
  }

  const checkSolution = () => {
    if (processingSolution || !powerOn)  {
      return;
    }

    let audio = document.getElementById("audio_beep");
    audio.onended = null;
    audio.currentTime = 0; 
    audio.play();

    

    setProcessingSolution(true);
    Utils.log("Check solution", [ angleToStep(frequency, frecuencyMaxSteps), angleToStep(amplitude, amplitudeMaxSteps), angleToStep(phase, phaseMaxSteps)*15]);
    let solution = "";
    if(appSettings.viewAngle === "FALSE"){ //Esto no se si quitarlo
      solution = [waveType, angleToStep(frequency, frecuencyMaxSteps), angleToStep(amplitude, amplitudeMaxSteps), angleToStep(phase, phaseMaxSteps)*15].join(';');
    }else{
      solution = [waveType, frequencyMapped.toFixed(3), amplitudeMapped.toFixed(3), phaseMapped.toFixed(0)].join(';');
    }
    //console.log("Check solution", solution);
    escapp.checkNextPuzzle(solution, {}, (success, erState) => {
          Utils.log("Check solution Escapp response", success, erState);
          try {
            setTimeout(() => {
              changeBoxLight(success, solution);
            }, 700);
          } catch(e){
            Utils.log("Error in checkNextPuzzle",e);
          }
        });
  }

  const changeBoxLight = (success, solution) => {
    let audio;
    let afterChangeBoxLightDelay = 2500;

    if (success) {
      audio = document.getElementById("audio_success");
      setLight("ok");
      setAudioAmplitude(amplitudeMapped); // Actualiza la amplitud del audio para la visualización
    } else {
      audio = document.getElementById("audio_failure");
      setLight("nok");
      reset(); //
    }

    setTimeout(() => {
      if(!success){
        setLight("off");
        setProcessingSolution(false);
      }else{
        
        if(appSettings.actionAfterSolve === "PLAY_SOUND"){
          audio = document.getElementById("audio_post_success");          
          audio.play();
          visualizeAudio(audio);
          audio.onended = () => {
            props.onKeypadSolved(solution);
          }          
        }else{
          props.onKeypadSolved(solution); //Cambiar          
        }
      }
    }, afterChangeBoxLightDelay);    
    audio.play();
  }

  /* Funcion para modificar la onda según el audio que se esta reproduciendo*/
  const visualizeAudio = (audio) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    function update() {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setAudioAmplitude(amplitudeMapped + rms * appSettings.maxAmplitude); 
      if (!audio.paused && !audio.ended) {
        requestAnimationFrame(update);
      } else {
        setAudioAmplitude(amplitudeMapped); 
        audioContext.close();
      }
    }
    update();
  };

  //Pone la imagen del fondo
  let backgroundImage = 'url("' + appSettings.background + '")';
  if(appSettings.background && appSettings.background !== "NONE"){
    backgroundImage += ', url("' + appSettings.background + '")';
  }

  const  reset = () =>{
    setIsReseting(true);
    setAmplitude(0); 
    setFrequency(0); 
    setPhase(0); 
    setTimeout(() => {      
      setIsReseting(false);
    }, 2500);
  }

  /** Funcion para reproducir una frecuencia, segun la amplitud de la onda */
  const playFrequency = (frequency) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = waveType; // "sine", "square", "triangle", "sawtooth"
    oscillator.frequency.value = frequency * 1000; // Ajustar según la escala
    oscillator.connect(audioContext.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 1000);
  };

const changeWaveType = () => {
  
  let audio = document.getElementById("audio_beep");
  audio.currentTime = 0; 
  audio.play();
  if(!powerOn)return;
  const waveTypes = ["sine", "square", "triangle", "sawtooth"];
  const currentIndex = waveTypes.indexOf(waveType);
  const nextIndex = (currentIndex + 1) % waveTypes.length;
  setWaveType(waveTypes[nextIndex]);
  Utils.log("Wave type changed to", waveTypes[nextIndex]);
}

const powerClick = () => {
  if(processingSolution) return; 
  let audiobeep = document.getElementById("audio_beep");
  let audioTurn;
  
  audiobeep.currentTime = 0; 
  audiobeep.play();
  
  //paused ? setPaused(false) : setPaused(true);
  if(powerOn) {
    audioTurn = document.getElementById("audio_turn_off");
    setPowerOn(false); setAnimation('disappear');
    audiobeep.onended = () => {
      audioTurn.currentTime = 0;
      audioTurn.play();
    };
  }else{
    audioTurn = document.getElementById("audio_turn_on");
    setPowerOn(true); setAnimation('appear');
    audiobeep.onended = () => {
      audioTurn.currentTime = 0;
      audioTurn.play();
    };
  }

}

  return (
    <div id="screen_main" className={"screen_content"} style={{ backgroundImage: backgroundImage }}>
        <div className="oscilloscopeContainer" style={{backgroundImage: 'url('+appSettings.backgroundOscilloscope+')', width: containerWidth, height: containerHeight}}>
            <div style={{  display: "flex",position:'absolute',alignItems: "center",marginTop: containerMarginTop, marginLeft: containerMarginLeft}}>
                <Dial id={"dial-frequency"} boxWidth={boxWidth} boxHeight={boxHeight} checking={processingSolution} 
                  rotationAngle={frequency} setRotationAngle={setFrequency} isReseting={isReseting}
                  xPosition={boxWidth*appSettings.dialsGap*1} name={appSettings.dialsNames[0]} maxSteps={frecuencyMaxSteps}/>                  
                <Dial id={"dial-amplitude"}  boxWidth={boxWidth} boxHeight={boxHeight} checking={processingSolution} 
                  rotationAngle={amplitude} setRotationAngle={setAmplitude} isReseting={isReseting}
                  xPosition={boxWidth*appSettings.dialsGap*2} name={appSettings.dialsNames[1]} maxSteps={amplitudeMaxSteps}/> 
                <Dial id={"dial-phase"}  boxWidth={boxWidth} boxHeight={boxHeight} checking={processingSolution} 
                  rotationAngle={phase} setRotationAngle={setPhase} isReseting={isReseting} 
                  xPosition={boxWidth*appSettings.dialsGap*3 } name={appSettings.dialsNames[2]} maxSteps={phaseMaxSteps}/>             
            </div>    
            <Ray boxHeight={boxHeight} boxWidth={boxWidth} checking={processingSolution} waveType={waveType} paused={paused} powerOn={light !== "nok"?true:false} animation={animation} setAnimation={setAnimation}
                  frequency={frequencyMapped} amplitude={light === "ok" ? audioAmplitude : amplitudeMapped} wavelength={phaseMapped}/>
            <div className="boxLight boxLight_off" style={{ visibility: light === "off" ? "visible" : "hidden", opacity: light === "off" ? "1" : "0", width: lightWidth, height: lightHeight, backgroundImage: 'url("' + appSettings.imageLightOff + '")', left: lightLeft, top: lightTop }} ></div> 
            <div className="boxLight boxLight_nok" style={{ visibility: light === "nok" ? "visible" : "hidden", opacity: light === "nok" ? "1" : "0", width: lightWidth, height: lightHeight, backgroundImage: 'url("' + appSettings.imageLightNok + '")', left: lightLeft, top: lightTop }} ></div> 
            <div className="boxLight boxLight_ok" style={{ visibility: light === "ok" ? "visible" : "hidden", opacity: light === "ok" ? "1" : "0", width: lightWidth, height: lightHeight, backgroundImage: 'url("' + appSettings.imageLightOk + '")', left: lightLeft, top: lightTop }} ></div>

            <div className={"boxButton boxButton"} onClick={() => !processingSolution && checkSolution()} 
              style={{ width: boxWidth * appSettings.buttonWidth , height: boxHeight *appSettings.buttonHeight, top: boxHeight * appSettings.buttonMarginTop, left: boxWidth * appSettings.buttonMarginLeft,
              backgroundImage: 'url("' + appSettings.backgroundButton + '")',
            }}/>

            {appSettings.dialMode==="MULTI" && <div className={"boxButton boxButton"} onClick={() => !processingSolution && changeWaveType()} 
              style={{ width: boxWidth * appSettings.multiButtonWidth , height: boxHeight *appSettings.multiButtonHeight, top: boxHeight * appSettings.multiButtonMarginTop, left: boxWidth * appSettings.multiButtonMarginLeft, 
              backgroundImage: 'url("' + appSettings.modeButton + '")', 
            }}><p className='multi-button' style={{ marginTop: "12vmin", textAlign: "bottom", fontSize:"1.5vmin", color:appSettings.multiTextColor}}>TYPE</p></div>}
            {/* TEMPORAL PAUSA **/} 
            <div className={"boxButton boxButton"} onClick={() => !processingSolution && powerClick()} 
              style={{ width: boxWidth * appSettings.multiButtonWidth , height: boxHeight *appSettings.multiButtonHeight, top: boxHeight * appSettings.multiButtonMarginTop*0.07, left: boxWidth * appSettings.multiButtonMarginLeft, 
              backgroundImage: 'url("' + appSettings.backgroundPowerButton + '")', 
            }}><svg xmlns="http://www.w3.org/2000/svg" style={{marginLeft:"-0.2vmin"}} height={boxHeight*0.07} viewBox="0 -960 960 960" width={boxWidth*0.07} fill="#e6e5e5ff"><path d="M480-480q-17 0-28.5-11.5T440-520v-320q0-17 11.5-28.5T480-880q17 0 28.5 11.5T520-840v320q0 17-11.5 28.5T480-480Zm0 360q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-61 20-118.5T198-704q11-14 28-13.5t30 13.5q11 11 10 27t-11 30q-27 36-41 79t-14 88q0 117 81.5 198.5T480-200q117 0 198.5-81.5T760-480q0-46-13.5-89.5T704-649q-10-13-11-28.5t10-26.5q12-12 29-12.5t28 12.5q39 48 59.5 105T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Z"/></svg></div>

        </div>
        {light==="nok" && <div className="screenContainer" style={{backgroundImage: 'url('+appSettings.backgroundNok+')',  marginTop: boxHeight*appSettings.screenContainerMarginTop,
            width: containerWidth*appSettings.screenContainerWidth, height: containerHeight*appSettings.screenContainerHeight, }}>
            <svg xmlns="http://www.w3.org/2000/svg" height={appSettings.svgSize} viewBox="0 -960 960 960" width={appSettings.svgSize}
                  fill="#FFFFFF" style={{zIndex: 10, filter: "drop-shadow(0 0 0.2rem #ff2d55) drop-shadow(0 0 0.4rem #ff2d55)"}}>
                  <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
              </svg>
        </div>}
        <div className="screenContainer" style={{marginTop: boxHeight*appSettings.screenContainerMarginTop,
            width: containerWidth*appSettings.screenContainerWidth, height: containerHeight*appSettings.screenContainerHeight, }}/>
                
        {light==="ok" && <div className="screenContainer" style={{backgroundImage: 'url('+appSettings.backgroundOk+')',  marginTop: boxHeight*appSettings.screenContainerMarginTop,
            width: containerWidth*appSettings.screenContainerWidth, height: containerHeight*appSettings.screenContainerHeight, }}>
            <svg xmlns="http://www.w3.org/2000/svg" height={appSettings.svgSize} viewBox="0 -960 960 960" width={appSettings.svgSize}
                  fill="#FFFFFF" style={{zIndex: 10,filter: "drop-shadow(0 0 0.2rem rgb(69, 255, 45)) drop-shadow(0 0 0.4rem rgb(45, 255, 80))"}}>
                  <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
              </svg>
        </div>}

       {light==="off" &&
          <div className="data-show-container" style={{visibility: powerOn ? "visible" : "hidden", opacity: powerOn ? 1 : 0, marginTop: boxHeight * appSettings.dataContainerMarginTop,  height: boxHeight, width: boxWidth, gap: boxWidth*appSettings.textGap}}>
                <p className='data-show'style={{fontSize: boxHeight * appSettings.screenTextSize, transform: "rotate(8deg)",maxWidth:"7vmin", minWidth: '7vmin'}}>{appSettings.dialsNames[0]}:{appSettings.viewAngle==="FALSE" ? angleToStep(frequency, frecuencyMaxSteps) : frequencyMapped.toFixed(3)}</p>              
                <p className='data-show' style={{fontSize: boxHeight * appSettings.screenTextSize, marginTop: "6%",maxWidth:"7vmin", minWidth: '7vmin'}}>{appSettings.dialsNames[1]}:{appSettings.viewAngle==="FALSE" ? angleToStep(amplitude, amplitudeMaxSteps) : amplitudeMapped.toFixed(3)}</p>
                <p className='data-show' style={{fontSize: boxHeight * appSettings.screenTextSize, transform: "rotate(-8deg)", maxWidth:"7vmin"}}>{appSettings.dialsNames[2]}:{appSettings.viewAngle==="FALSE" ? angleToStep(phase, phaseMaxSteps)*15 : phaseMapped.toFixed(0)}°</p>
          </div>
      }
      <div className="screenContainer" style={{visibility: !powerOn ? "visible" : "hidden", opacity: !powerOn ? 1 : 0, backgroundImage: 'url('+appSettings.backgroundOff+')',  marginTop: boxHeight*appSettings.screenContainerMarginTop,
            width: containerWidth*appSettings.screenContainerWidth, height: containerHeight*appSettings.screenContainerHeight, transition: "opacity 2.5s ease, visibility ease 2.5s"}}/>


      <audio id="audio_beep" src={appSettings.soundBeep} autostart="false" preload="auto" />
      <audio id="audio_failure" src={appSettings.soundNok} autostart="false" preload="auto" />
      <audio id="audio_success" src={appSettings.soundOk} autostart="false" preload="auto" />
      <audio id="audio_turn_on" src={appSettings.soundTurnOn} autostart="false" preload="auto" />
      <audio id="audio_turn_off" src={appSettings.soundTurnOff} autostart="false" preload="auto" />
      {appSettings.actionAfterSolve === "PLAY_SOUND" && <audio id="audio_post_success" src={I18n.getTrans("i.sound")} autostart="false" preload="auto" />}

 
    </div>);
};

export default MainScreen;