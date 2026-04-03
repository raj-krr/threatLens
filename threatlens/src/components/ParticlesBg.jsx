import Particles from "react-tsparticles";

export default function ParticlesBg() {
  return (
    <Particles
      options={{
        particles: {
          number: { value: 50 },
          size: { value: 2 },
          move: { speed: 1 },
          color: { value: "#00ffff" },
        },
        background: { color: "transparent" },
      }}
    />
  );
}