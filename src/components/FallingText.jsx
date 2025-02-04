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
  rotationRange = [-20, 20], // Rango de rotación en grados
  onClick,
}) => {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [addedPhrases, setAddedPhrases] = useState([]);
  const [effectStarted, setEffectStarted] = useState(false);
  const engineRef = useRef(null);
  const renderRef = useRef(null);

  // Función para eliminar cuerpos de Matter.js y limpiar el estado
  const clearPhrases = () => {
    if (!engineRef.current) return;
    const { World } = Matter;
    addedPhrases.forEach(({ body }) => {
      World.remove(engineRef.current.world, body);
    });
    setAddedPhrases([]);
  };

  // Reinicia las frases cuando cambia el resetKey
  useEffect(() => {
    clearPhrases();
    phrases.forEach((phrase) => addPhraseToPhysics(phrase));
  }, [resetKey]);

  // Inicializa el motor, render y límites
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
        Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions),         // Pared izquierda
        Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions),    // Pared derecha
        // Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions),             // Techo
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

  // Maneja el trigger de activación
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

  // Agrega cada frase al mundo de Matter.js
  const addPhraseToPhysics = (phrase) => {
    if (!effectStarted || !engineRef.current) return;

    const { Bodies, World, Body } = Matter;
    const containerRect = containerRef.current.getBoundingClientRect();

    // Crea un elemento temporal para medir la frase
    const phraseElement = document.createElement("span");
    phraseElement.innerText = phrase;
    phraseElement.style.position = "absolute";
    phraseElement.style.padding = "1px 0px";
    phraseElement.style.border = "0px solid";
    phraseElement.style.whiteSpace = "nowrap";
    // Puedes descomentar la siguiente línea para ver el fondo del span mientras se calcula el tamaño
    // phraseElement.style.background = "black";
    document.body.appendChild(phraseElement);
    const rect = phraseElement.getBoundingClientRect();
    document.body.removeChild(phraseElement);

    // Posición inicial aleatoria en x y en y (puedes ajustar y si deseas otro efecto)
    const x = Math.random() * (containerRect.width - rect.width) + rect.width / 2;
    const y = 0; // Comienza en la parte superior

    // Rotación inicial aleatoria (convertida a radianes)
    const randomRotation =
      (Math.random() * (rotationRange[1] - rotationRange[0]) + rotationRange[0]) *
      (Math.PI / 180);

    // Crea el cuerpo físico
    const body = Bodies.rectangle(x, y, rect.width, rect.height, {
      render: { fillStyle: "transparent" },
      restitution: 0.8,
      frictionAir: 0.01,
      friction: 0.2,
    });
    Body.setAngle(body, randomRotation);

    // **Mejora en las físicas:** Asigna velocidad y velocidad angular inicial aleatoria
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 2 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

    const color = colors[Math.floor(Math.random() * colors.length)];

    World.add(engineRef.current.world, body);
    setAddedPhrases((prev) => [...prev, { phrase, body, color }]);
  };

  // Agrega las frases según el arreglo recibido (se puede ajustar el timing si se desea)
  useEffect(() => {
    phrases.forEach((phrase) => {
      setTimeout(() => {
        addPhraseToPhysics(phrase);
      }, 1000);
    });
  }, [phrases]);

  // Bucle de actualización para mover los elementos en pantalla
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
      className="absolute w-full h-full top-0 text-center overflow-hidden"
      onClick={trigger === "click" ? () => setEffectStarted(true) : undefined}
      onMouseOver={trigger === "hover" ? () => setEffectStarted(true) : undefined}
    >
      {addedPhrases.map(({ phrase, body, color }) => (
        <span
          key={body.id}
          data-phrase={body.id}
          className="absolute select-none text-[4vw] sm:text-[2vw] md:text-[2vw] lg:text-[1.5vw]"
          style={{ color }}
        >
          {phrase}
        </span>
      ))}
      <div className="absolute top-0 left-0 z-0" ref={canvasContainerRef} />
    </div>
  );
};

export default FallingText;
