import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced particle field with many more particles
const ParticleField = () => {
  const points = useRef();

  const { particlesPosition, particlesData } = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const data = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 150;
      const y = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 150;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      data.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        originalPosition: new THREE.Vector3(x, y, z)
      });
    }

    return { particlesPosition: positions, particlesData: data };
  }, []);

  useFrame((state) => {
    if (points.current) {
      const positions = points.current.geometry.attributes.position.array;

      for (let i = 0; i < particlesData.length; i++) {
        const i3 = i * 3;

        // Add floating motion
        positions[i3] += particlesData[i].velocity.x;
        positions[i3 + 1] += particlesData[i].velocity.y;
        positions[i3 + 2] += particlesData[i].velocity.z;

        // Add wave motion
        positions[i3] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.01) * 0.01;
        positions[i3 + 1] += Math.cos(state.clock.elapsedTime * 0.3 + i * 0.01) * 0.01;

        // Boundary check and reset
        if (Math.abs(positions[i3]) > 75) particlesData[i].velocity.x *= -1;
        if (Math.abs(positions[i3 + 1]) > 75) particlesData[i].velocity.y *= -1;
        if (Math.abs(positions[i3 + 2]) > 75) particlesData[i].velocity.z *= -1;
      }

      points.current.geometry.attributes.position.needsUpdate = true;

      // Slow rotation
      points.current.rotation.x = state.clock.elapsedTime * 0.02;
      points.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#4a90e2"
        size={0.004}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
};

// Connection lines between shapes and particles
const ConnectionLines = ({ shapes }) => {
  const linesRef = useRef();

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(shapes.length * 6); // 2 points per line, 3 coords per point
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [shapes.length]);

  useFrame((state) => {
    if (linesRef.current && shapes.length > 0) {
      const positions = linesRef.current.geometry.attributes.position.array;

      shapes.forEach((shape, index) => {
        if (shape.current) {
          const shapePos = shape.current.position;
          const i6 = index * 6;

          // Start point (shape position)
          positions[i6] = shapePos.x;
          positions[i6 + 1] = shapePos.y;
          positions[i6 + 2] = shapePos.z;

          // End point (moving target)
          const time = state.clock.elapsedTime;
          positions[i6 + 3] = shapePos.x + Math.sin(time * 0.5 + index) * 15;
          positions[i6 + 4] = shapePos.y + Math.cos(time * 0.3 + index) * 15;
          positions[i6 + 5] = shapePos.z + Math.sin(time * 0.4 + index) * 10;
        }
      });

      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <line ref={linesRef}>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial
        attach="material"
        color="#2a4a6b"
        transparent
        opacity={0.3}
        linewidth={1}
      />
    </line>
  );
};

// Enhanced floating geometric shapes with dynamic movement
const FloatingGeometry = React.forwardRef(({ position, geometry, color, index = 0 }, ref) => {
  const mesh = useRef();
  const basePosition = useMemo(() => new THREE.Vector3(...position), [position]);

  // Expose the mesh ref to parent
  React.useImperativeHandle(ref, () => mesh.current);

  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.elapsedTime;

      // Complex orbital movement
      const radius = 8 + Math.sin(time * 0.2 + index) * 3;
      const speed = 0.1 + index * 0.02;

      mesh.current.position.x = basePosition.x + Math.sin(time * speed + index) * radius;
      mesh.current.position.y = basePosition.y + Math.cos(time * speed * 0.7 + index) * radius * 0.5;
      mesh.current.position.z = basePosition.z + Math.sin(time * speed * 0.5 + index) * radius * 0.8;

      // Rotation
      mesh.current.rotation.x = time * (0.1 + index * 0.02);
      mesh.current.rotation.y = time * (0.05 + index * 0.01);
      mesh.current.rotation.z = time * (0.03 + index * 0.005);
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      {geometry}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.4}
        wireframe
        emissive={color}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
});

// Main 3D Scene
const Scene3D = () => {
  const shapeRefs = useMemo(() => Array(6).fill().map(() => React.createRef()), []);

  return (
    <>
      {/* Subtle Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#4a90e2" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#6b73ff" />
      <pointLight position={[0, 15, 5]} intensity={0.3} color="#5a9fd4" />
      <directionalLight position={[5, 5, 5]} intensity={0.2} color="#ffffff" />

      {/* Enhanced particle field */}
      <ParticleField />

      {/* Connection lines */}
      <ConnectionLines shapes={shapeRefs} />

      {/* Floating geometric shapes with subtle colors */}
      <FloatingGeometry
        ref={shapeRefs[0]}
        position={[-5, 2, -5]}
        geometry={<boxGeometry args={[0.8, 0.8, 0.8]} />}
        color="#4a90e2"
        index={0}
      />
      <FloatingGeometry
        ref={shapeRefs[1]}
        position={[5, -2, -3]}
        geometry={<octahedronGeometry args={[0.7]} />}
        color="#6b73ff"
        index={1}
      />
      <FloatingGeometry
        ref={shapeRefs[2]}
        position={[0, 3, -8]}
        geometry={<tetrahedronGeometry args={[0.6]} />}
        color="#5a9fd4"
        index={2}
      />
      <FloatingGeometry
        ref={shapeRefs[3]}
        position={[-3, -1, -6]}
        geometry={<icosahedronGeometry args={[0.5]} />}
        color="#7b8794"
        index={3}
      />
      <FloatingGeometry
        ref={shapeRefs[4]}
        position={[6, 4, -7]}
        geometry={<dodecahedronGeometry args={[0.5]} />}
        color="#8e9aaf"
        index={4}
      />
      <FloatingGeometry
        ref={shapeRefs[5]}
        position={[-6, -3, -4]}
        geometry={<sphereGeometry args={[0.4, 8, 6]} />}
        color="#9bb5d1"
        index={5}
      />
    </>
  );
};

export default Scene3D;