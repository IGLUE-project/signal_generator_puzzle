import React, { useContext } from 'react';
import { GlobalContext } from "./GlobalContext";

const BoxButton = (props) => {
  const {  appSettings } = useContext(GlobalContext);

  const renderContent = () => {
    switch (appSettings.keysType) {
      case "COLORS":
        return "";
      case "SYMBOLS":
        return <img className="symbol" src={appSettings.symbolsBackgroundKeys[props.position-1]}></img>;
      default:
        return <p>{props.value}</p>;
    }
  };

  return (
    /*<div
      className={"boxButton boxButton" + props.position}
      onClick={() => props.onClick(props.value)}
      style={{
        width: props.boxWidth,
        height: props.boxHeight,
        backgroundImage: 'url("' + appSettings.backgroundKeys[props.position-1] + '")',
      }}
    >
      <div>{renderContent()}</div>
    </div>*/
    <div className={"boxButton boxButton"} onClick={() => props.onClick()} 
        style={{ width: props.boxWidth *0.12 , height: props.boxHeight *0.12,
          backgroundImage: 'url("' + appSettings.backgroundKey + '")',
        position: "absolute",
        //left: props.appwidth / 2 + props.boxWidth / 2 *0.4,
        //bottom: props.appheight / 2 - props.boxHeight / 2 *0.8,
        cursor: "pointer",
        }}>
      {/*<li>
        <p>{props.value}</p>
      </li>*/}
    </div>
  );
};

export default BoxButton;