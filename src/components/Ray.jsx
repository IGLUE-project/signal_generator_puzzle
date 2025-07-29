import React, { useContext, useRef, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";
const Ray = (props) => {
    const { appSettings } = useContext(GlobalContext);
    const canvasRef = useRef();
    const animationRef = useRef();
    const offsetRef = useRef(0);
    const propsRef = useRef(props);
    propsRef.current = props;

    const drawLine = (ctx, width, height, lineWidth, color) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        const centerX = width / 2;

        const maxAmplitude = propsRef.current.amplitude * (height / 200);
        const fixedWavelength = 10 * (width / 500); // Wavelength fijado 
        const maxFrequency = propsRef.current.frequency / 1;
        const phaseOffset = (propsRef.current.wavelength * Math.PI) / 180; // Conviert fase de grados a radianes

        for (let x = 0; x < width; x++) {
            const distanceFromCenter = Math.abs(x - centerX) / centerX;
            const scale = Math.sin((1 - distanceFromCenter) * Math.PI / 2);

            const scaledAmplitude = maxAmplitude * scale;
            const scaledWavelength = fixedWavelength * scale;
            const scaledFrequency = maxFrequency * scale;

            const phase = (2 * Math.PI * scaledFrequency * (x + offsetRef.current)) / scaledWavelength + phaseOffset;

            let waveValue = 0;
            if (propsRef.current.waveType === "square") {
                waveValue = Math.sign(Math.sin(phase));
            } else if (propsRef.current.waveType === "triangle") {
                waveValue = 2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1;
            } else if (propsRef.current.waveType === "sawtooth") {
                waveValue = 2 * ((phase / (2 * Math.PI)) % 1) - 1;
            } else {
                waveValue = Math.sin(phase);
            }

            const y = height / 2 + scaledAmplitude * waveValue;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.closePath();
    };

    const drawWave = (ctx, width, height) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "rgb(209, 248, 209)");
        gradient.addColorStop(0.5, "rgb(21, 255, 0)");
        gradient.addColorStop(1, "rgb(209, 248, 209)");
        drawLine(ctx, width, height, 6, gradient);
        drawLine(ctx, width, height, 3, "rgba(255, 255, 255, 0.52)");
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const width = propsRef.current.boxWidth * appSettings.rayWidth;
        const height = propsRef.current.boxHeight * appSettings.rayHeight;
        canvas.width = width; canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        drawWave(ctx, width, height);
        offsetRef.current += propsRef.current.paused ? 0 : 1;//1;
        animationRef.current = requestAnimationFrame(draw);
    };

    useEffect(() => {
        draw(); 
        animationRef.current = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(animationRef.current); };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = props.boxWidth * appSettings.rayWidth;
            canvas.height = props.boxHeight * appSettings.rayHeight;
        }
    }, [props.boxWidth, props.boxHeight]);

    return (
        <canvas ref={canvasRef} width={props.boxWidth} height={props.boxHeight}
            style={{ position: "absolute", top: "39%", transform: "translate(-50%, -50%)", left: "49.9%", zIndex: 1, pointerEvents: "none", }}>                
        </canvas>
    );
};
export default Ray;