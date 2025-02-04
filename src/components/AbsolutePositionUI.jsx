import React, { useEffect, useRef, useState } from "react";
import Magnet from "./Magnet";
import FallingText from "./FallingText";

const frasesNo = [
  "Piénsalo de nuevo",
  "Sé que quieres decir que sí",
  "Si dices que no, voy a llorar 😢",
  "💔",
  "¡No puedes rechazarme, es ilegal! 🚔",
  "Eso dolió más que un Lego en el pie 😭",
  "Voy a contárselo a mi mamá 😠",
  "¿Segura? Última oportunidad... 👀",
  "No pasa nada... (mentira, sí pasa) 🥺",
  "Te perdonaré... pero nunca lo olvidaré 👁️👄👁️",
  "Esto es el inicio de mi historia de villano🦹",
  "Estadísticamente hablando, deberías reconsiderarlo 📊",
  "Alexa, pon música triste 🎶💔",
  "😡",
];

const frasesSi = [
  "Sabía que dirías que sí 💖",
  // "❤❤",
  "🥰🥰",
  "💖💖💖💖",
  // "🥵🥵",
  // "😎😎",
  "¡Buena elección! 🎉",
  "Te acabas de ganar un premio: mi amor 💘",
  "Eres oficialmente increíble 🏆",
  "Cupido estará orgulloso de nosotros 🏹",
  "Ahora somos un dúo dinámico 🦸‍♂️🦸‍♀️",
  "Nos vemos en la boda 💍😏",
  "¡Felicidades, acabas de tomar la mejor decisión de tu vida! 🥳",
  "Contrato de San Valentín firmado con éxito ✅",
  "¡Ahora formamos equipo para conquistar el mundo! 🌎💞",
  "Te elegí a ti, Pikachu! ⚡😍",
  "Mi corazoncito está feliz gracias a ti ❤️😊",
  "¡Alerta de pareja épica! 🚨😍",
];

const noPhrases = [
  "NO",
  "¿Estas segura?",
  "¿Realmente segura?",
  "Piensalo de nuevo",
  "Tienes otra oportunidad",
  "Ultimo intento",
  "No debi poner este boton",
  "Ya rindete y di que si",
  "Piensa en los bonitos momentos",
  ":("
];

const AbsolutePositionUI = () => {
  const [phrases, setPhrases] = useState([]);
  const [isMagnetOn, setIsMagnetOn] = useState(false);
  const [Acepted, setAcepted] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({
    top: "69%",
    left: "53%",
  });
  const clickCounter = useRef(0);
  const noButtonRef = useRef(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [buttonScale, setButtonScale] = useState(1);

  useEffect(() => {
    const checkTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    setIsTouchDevice(checkTouchDevice());
  }, []);

  const updateButtonPosition = () => {
    const button = noButtonRef.current;
    if (!button) return;

    // Obtener una nueva posición aleatoria
    const newLeft = Math.random() * 92;
    const newTop = Math.random() * 92;

    // Actualizar la posición del botón "NO"
    setNoButtonPosition({ top: `${newTop}%`, left: `${newLeft}%` });
  };

  const addNewPhrase = () => {
    console.log("Dijo que no :c", clickCounter.current);
    updateButtonPosition();
    if (isTouchDevice ) {
      setButtonScale((prev) => prev + 1);
    }
    if (clickCounter.current > 8) return;
    if (clickCounter.current > 3) setIsMagnetOn(true);


    let n = 0;
    if (clickCounter.current < 2) {
      n = clickCounter.current + 1;
    } else if (clickCounter.current === 2) {
      n = 5;
    } else {
      n = 10;
    }
    clickCounter.current++;

    // const newPhrases = [];
    // for (let i = 0; i < n; i++) {
    //   newPhrases.push(frasesNo[Math.floor(Math.random() * frasesNo.length)]);
    // }
    // setPhrases(newPhrases);
  };

  const handleAcepted = () => {
    console.log("Dijo que sí");
    setAcepted(true);
    const newPhrases = [];
    let n;
    if (window.innerWidth < 768) {
      n = 30;
    } else {
      n = 40;
    }
    for (let i = 0; i < n; i++) {
      newPhrases.push(frasesSi[Math.floor(Math.random() * frasesSi.length)]);
    }
    setPhrases(newPhrases);
  };

  return (
    <div className="bg-gradient-to-r pointer-events-auto from-violet-200 to-pink-200 fixed h-full w-full">
      <FallingText
        phrases={phrases}
        resetKey={Acepted}
        rotationRange={[-10, 10]}
        trigger="auto"
        gravity={0.6}
        fontSize="1.4vw"
      />

      <div className=" flex flex-col items-center p-4">
        {Acepted ? (
          <>
            <p className="text-4xl sm:text-5xl text-center flex flex-col items-center sm:mt-24 font-kavoon drop-shadow-[0_2.2px_1.2px_rgba(255,255,255,1)]  text-red-500">
              Sabia que dirias que sí
              <img
                src="capibaras-juntos.webp"
                alt="Imagen"
                className="mb-2 w-80"
              />
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl sm:text-5xl text-center  flex flex-col items-center sm:mt-24 font-kavoon drop-shadow-[0_2.2px_1.2px_rgba(0,0,0,1)]  text-red-500 mb-4">
              ¿Quieres ser mi San valentin?
            <img
              src="capibara.webp"
              alt="Imagen"
              className="mb-2 w-80 sm:mb-8"
              />
              </p>

            <div className="flex flex-wrap justify-around min-w-80 gap-y-2 ">
              {isTouchDevice ? (
                <>
                <button
                  onClick={handleAcepted}
                  className="bg-green-600 border-4  z-10 font-kavoon border-black px-4 py-2 rounded"
                  style={{
                    width: `${100 * buttonScale}px`,
                    height: `${50 * buttonScale}px`,
                    // transform: `scale(${buttonScale})`,
                    transition: 'transform 0.3s ease',
                  }}
                >
                  SI
                </button>
                <button
                onClick={addNewPhrase}
                className="bg-red-400 border-4 min-w-24 max-h-[50px] z-10 font-kavoon border-black px-4 py-2 rounded"
              >
                {noPhrases[clickCounter.current]}
              </button>
              </>
        ) : (
          <>
          <Magnet
                padding={800}
                disabled={isMagnetOn ? false : true}
                magnetStrength={1}
              >
                <button
                  onClick={handleAcepted}
                  className="bg-green-600 border-4 w-24 font-kavoon border-black px-4 py-2 rounded"
                >
                  SI
                </button>
              </Magnet>
               <button
                  onMouseEnter={addNewPhrase}
                  className={`bg-red-400 border-4 w-24 max-h-[50px] z-10 font-kavoon border-black px-4 py-2 rounded ${(clickCounter.current) && "invisible"}`}
                >
                  NO
                </button>
              
                <button
                  ref={noButtonRef}
                  onClick={addNewPhrase}
                  onMouseEnter={addNewPhrase}
                  className={`bg-red-400 border-4 w-24 font-kavoon border-black px-4 py-2 rounded absolute transition-all duration-300 ${(!clickCounter.current) && "invisible"}`}
                  style={{
                    top: noButtonPosition.top,
                    left: noButtonPosition.left,
                  }}
                >
                  NO
                </button>
                </>
        )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AbsolutePositionUI;
