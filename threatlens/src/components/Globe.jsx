import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, useTexture } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getLocationFromIP, latLongToVector3 } from "../utils/geo";

function Earth({ logs }) {
  const earthRef = useRef();
  const cloudRef = useRef();

  const earthTexture = useTexture(
    "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
  );
  const cloudTexture = useTexture(
    "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
  );

  const [arcs, setArcs] = useState([]);
  const [points, setPoints] = useState([]);

  useFrame(() => {
    earthRef.current.rotation.y += 0.002;
    cloudRef.current.rotation.y += 0.0025;
  });

  useEffect(() => {
    const generate = async () => {
      const newArcs = [];
      const newPoints = [];

      for (let log of logs.slice(0, 5)) {
        const loc = await getLocationFromIP(log.ip);
        if (!loc) continue;

        const end = latLongToVector3(loc.lat, loc.lon);
        const mid = [
          end[0] / 2,
          end[1] / 2 + 1.5,
          end[2] / 2,
        ];

        newArcs.push([[0, 0, 0], mid, end]);
        newPoints.push(end);
      }

      setArcs(newArcs);
      setPoints(newPoints);
    };

    generate();
  }, [logs]);

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={earthTexture} />
      </mesh>

      <mesh ref={cloudRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial map={cloudTexture} transparent opacity={0.4} />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {arcs.map((arc, i) => (
        <Line key={i} points={arc} color="red" />
      ))}

      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="red" emissive="red" />
        </mesh>
      ))}
    </>
  );
}

export default function Globe({ logs }) {
  return (
    <Canvas camera={{ position: [0, 0, 6] }}>
      <Earth logs={logs} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}