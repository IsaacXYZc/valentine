import { useRef, useState, useEffect } from "react";
import Matter from "matter-js";

const colors = ["#4e3664", "#ee4b7c", "#102C57", "#be6bb1"];

const FallingText = ({
  phrases = [],
  resetKey,
  highlightWords = [],
  trigger = "auto",
  backgroundColor = "transparent",
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = "1rem",
  rotationRange = [-20, 20], // ⬅ Nuevo parámetro para definir el rango de rotación
  onClick,
}) => {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [addedPhrases, setAddedPhrases] = useState([]);
  const [effectStarted, setEffectStarted] = useState(false);
  const engineRef = useRef(null);
  const renderRef = useRef(null);

  const clearPhrases = () => {
    if (!engineRef.current) return;
    const { World } = Matter;

    // Elimina los cuerpos físicos de Matter.js
    addedPhrases.forEach(({ body }) => {
      World.remove(engineRef.current.world, body);
    });

    // Resetear el estado
    setAddedPhrases([]);
  };

  useEffect(() => {
    clearPhrases(); // Limpiar frases cuando resetKey cambie
    phrases.forEach((phrase) => addPhraseToPhysics(phrase)); // Agregar nuevas frases
  }, [resetKey]);

  useEffect(() => {
    if (!effectStarted) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

    if (!engineRef.current) {
      engineRef.current = Engine.create();
      engineRef.current.world.gravity.y = gravity;
    }
    const engine = engineRef.current;

    if (!renderRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;

      renderRef.current = Render.create({
        element: canvasContainerRef.current,
        engine,
        options: { width, height, background: backgroundColor, wireframes },
      });

      const boundaryOptions = { isStatic: true, render: { fillStyle: "transparent" } };
      World.add(engine.world, [
        Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions), // Piso
        Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions), // Pared izquierda
        Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions), // Pared derecha
        // Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions), // Techo
      ]);

      const mouse = Mouse.create(containerRef.current);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: mouseConstraintStiffness, render: { visible: false } },
      });

      World.add(engine.world, mouseConstraint);
      renderRef.current.mouse = mouse;

      const runner = Runner.create();
      Runner.run(runner, engine);
      Render.run(renderRef.current);
    }
  }, [effectStarted, gravity, wireframes, backgroundColor, mouseConstraintStiffness]);

  useEffect(() => {
    if (trigger === "auto") {
      setEffectStarted(true);
    } else if (trigger === "scroll" && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setEffectStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [trigger]);

  const addPhraseToPhysics = (phrase) => {
    if (!effectStarted || !engineRef.current) return;

    const { Bodies, World, Body } = Matter;
    const containerRect = containerRef.current.getBoundingClientRect();

    const phraseElement = document.createElement("span");
    phraseElement.innerText = phrase;
    phraseElement.style.position = "absolute";
    phraseElement.style.padding = "4px 4px";
    phraseElement.style.border = "0px solid";
    // phraseElement.style.background = "black";

    // phraseElement.style.fontSize = fontSize;
    phraseElement.style.whiteSpace = "nowrap";
    document.body.appendChild(phraseElement);

    const rect = phraseElement.getBoundingClientRect();
    document.body.removeChild(phraseElement);

    const x = Math.random() * (containerRect.width - rect.width)+10;
    const y = 0;

    // 🎯 Rotación aleatoria dentro del rango especificado
    const randomRotation =
      (Math.random() * (rotationRange[1] - rotationRange[0]) + rotationRange[0]) *
      (Math.PI / 180); // Convertir a radianes

    const body = Bodies.rectangle(x, y, rect.width, rect.height, {
      render: { fillStyle: "transparent" },
      restitution: 0.8,
      frictionAir: 0.01,
      friction: 0.2,
    });

    // Aplicar rotación inicial aleatoria
    Body.setAngle(body, randomRotation);

    const color = colors[Math.floor(Math.random() * colors.length)];


    // setTimeout(() => {
      World.add(engineRef.current.world, body);
      setAddedPhrases((prev) => [...prev, { phrase, body, color }]);
      // }, Math.random() * 2000 + 1000);
  };

  useEffect(() => {
    phrases.forEach((phrase) => {
    addPhraseToPhysics(phrase);

    });
  }, [phrases]);

  useEffect(() => {
    if (!effectStarted || !engineRef.current) return;

    const updateLoop = () => {
      addedPhrases.forEach(({ body }) => {
        if (!body) return;
        const { x, y } = body.position;
        const w = body.bounds.max.x - body.bounds.min.x;
        const h = body.bounds.max.y - body.bounds.min.y;

        const elem = document.querySelector(`[data-phrase="${body.id}"]`);
        if (elem) {
          elem.style.left = `${x - w / 2}px`;
          elem.style.top = `${y - h / 2}px`;
          elem.style.transform = `rotate(${body.angle}rad)`;
        }
      });

      Matter.Engine.update(engineRef.current);
      requestAnimationFrame(updateLoop);
    };
    updateLoop();
  }, [addedPhrases, effectStarted]);

  return (
    <div
      ref={containerRef}
      className="absolute w-full h-full top-0 cursor-pointer text-center overflow-hidden"
      onClick={trigger === "click" ? () => setEffectStarted(true) : undefined}
      onMouseOver={trigger === "hover" ? () => setEffectStarted(true) : undefined}
    >
      {addedPhrases.map(({ phrase, body, color }) => (
        <span
          key={body.id}
          data-phrase={body.id}
          className={`absolute select-none text-[5vw] sm:text-[2vw] md:text-[2vw] lg:text-[1.5vw]`} 
          style={{  color }}
        >
          {phrase}
        </span>
      ))}
      <div className="absolute top-0 left-0 z-0" ref={canvasContainerRef} />
    </div>
  );
};

export default FallingText;
