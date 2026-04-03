import { Canvas } from "@react-three/fiber";

export default function Test3D() {
  return (
    <div style={{ height: "300px" }}>
      <Canvas>
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
}