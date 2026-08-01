import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { alphabet } from '../../data/alphabet';
import { GLOBE_RADIUS, buildAlphabetGlobeLayout } from './alphabetGlobeLayout';
import styles from './AlphabetGlobe.module.css';

const DRAG_SENSITIVITY = 0.006;
const CLICK_DISTANCE_PX = 8;
const AUTO_ROTATE_SPEED = (Math.PI * 2) / 45; // one full turn per ~45s
const IDLE_RESUME_MS = 2000;
const INERTIA_DAMPING = 0.94;
const MAX_ANGULAR_SPEED = 4; // rad/s, caps a fast flick
const MIN_INERTIA_SPEED = 0.01;
const PITCH_LIMIT = Math.PI * 0.47; // stop just short of a full flip

interface DragState {
  active: boolean;
  moved: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastDx: number;
  lastDy: number;
  pointerDownLetter: string | null;
}

/** three.js materials need a resolved color, not a live CSS var() — read the
 * design tokens once from the computed root style instead of duplicating
 * hex values here. */
function useTokenColors() {
  return useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      letter: cs.getPropertyValue('--color-text').trim() || '#1f2937',
      learned: cs.getPropertyValue('--color-primary').trim() || '#2563eb',
    };
  }, []);
}

function AlphabetGlobeGroup({
  learnedLetters,
  onSelect,
}: {
  learnedLetters: string[];
  onSelect: (letter: string) => void;
}) {
  const tokenColors = useTokenColors();
  const groupRef = useRef<THREE.Group>(null);
  const letterMeshes = useRef(new Map<string, THREE.Object3D>());
  const points = useMemo(() => buildAlphabetGlobeLayout(alphabet.map((e) => e.letter)), []);

  const drag = useRef<DragState>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastDx: 0,
    lastDy: 0,
    pointerDownLetter: null,
  });
  const angularVelocity = useRef(new THREE.Vector2(0, 0));
  const inertiaActive = useRef(false);
  const selectedRef = useRef<string | null>(null);
  const resumeAutoRotateAt = useRef(0);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;

  const focusLetter = useCallback(
    (letter: string) => {
      const point = points.find((p) => p.letter === letter);
      const group = groupRef.current;
      if (!point || !group) return;
      selectedRef.current = letter;
      inertiaActive.current = false;
      angularVelocity.current.set(0, 0);
      const [nx, ny, nz] = point.normal;
      const targetY = -Math.atan2(nx, nz);
      const targetX = Math.asin(Math.min(1, Math.max(-1, ny)));
      gsap.to(group.rotation, {
        y: nearestEquivalentAngle(group.rotation.y, targetY),
        x: targetX,
        duration: reducedMotion ? 0.15 : 0.7,
        ease: 'power2.inOut',
        onComplete: () => onSelect(letter),
      });
    },
    [onSelect, points, reducedMotion],
  );

  const stopDragTracking = useRef<(() => void) | null>(null);

  const beginDrag = useCallback(
    (clientX: number, clientY: number, pointerDownLetter: string | null) => {
      if (selectedRef.current) return;
      drag.current = {
        active: true,
        moved: false,
        startX: clientX,
        startY: clientY,
        lastX: clientX,
        lastY: clientY,
        lastDx: 0,
        lastDy: 0,
        pointerDownLetter,
      };
      inertiaActive.current = false;
      angularVelocity.current.set(0, 0);

      const handleMove = (e: PointerEvent) => {
        const d = drag.current;
        if (!d.active) return;
        const dx = e.clientX - d.lastX;
        const dy = e.clientY - d.lastY;
        d.lastX = e.clientX;
        d.lastY = e.clientY;
        d.lastDx = dx;
        d.lastDy = dy;
        const totalDist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
        if (totalDist > CLICK_DISTANCE_PX) d.moved = true;
        if (d.moved && groupRef.current) {
          groupRef.current.rotation.y += dx * DRAG_SENSITIVITY;
          groupRef.current.rotation.x = clamp(
            groupRef.current.rotation.x + dy * DRAG_SENSITIVITY,
            -PITCH_LIMIT,
            PITCH_LIMIT,
          );
        }
      };

      const handleUp = () => {
        const d = drag.current;
        d.active = false;
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
        stopDragTracking.current = null;

        if (!d.moved && d.pointerDownLetter) {
          focusLetter(d.pointerDownLetter);
          return;
        }
        if (d.moved && !reducedMotion) {
          angularVelocity.current.set(
            clamp(d.lastDx * DRAG_SENSITIVITY * 60, -MAX_ANGULAR_SPEED, MAX_ANGULAR_SPEED),
            clamp(d.lastDy * DRAG_SENSITIVITY * 60, -MAX_ANGULAR_SPEED, MAX_ANGULAR_SPEED),
          );
          inertiaActive.current = angularVelocity.current.length() > MIN_INERTIA_SPEED;
        }
        resumeAutoRotateAt.current = performance.now() + IDLE_RESUME_MS;
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
      stopDragTracking.current = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
      };
    },
    [focusLetter, reducedMotion],
  );

  useEffect(() => stopDragTracking.current?.(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (inertiaActive.current) {
      group.rotation.y += angularVelocity.current.x * delta;
      group.rotation.x = clamp(
        group.rotation.x + angularVelocity.current.y * delta,
        -PITCH_LIMIT,
        PITCH_LIMIT,
      );
      angularVelocity.current.multiplyScalar(INERTIA_DAMPING);
      if (angularVelocity.current.length() < MIN_INERTIA_SPEED) inertiaActive.current = false;
    } else if (
      !drag.current.active &&
      !selectedRef.current &&
      !reducedMotion &&
      !document.hidden &&
      performance.now() >= resumeAutoRotateAt.current
    ) {
      group.rotation.y += AUTO_ROTATE_SPEED * delta;
    }

    // Billboard each letter to face the camera, and scale/fade it by how
    // much it currently faces forward (front of the globe = big & clear,
    // back = small & faint) — position stays purely a child of the group.
    //
    // Each letter's `.quaternion` is LOCAL to the rotating parent `group`,
    // not world space — copying camera.quaternion straight in only looks
    // right at rotation.y=0. The moment the group spins (which is
    // constantly, via auto-rotate), the letters tumble with it because
    // their local orientation no longer cancels the parent's. Pre-multiply
    // by the group's inverse so the letter's *world* orientation, not its
    // local one, ends up matching the camera.
    const groupQuatInverse = group.quaternion.clone().invert();
    const billboardLocalQuat = groupQuatInverse.multiply(state.camera.quaternion);
    const cameraDir = new THREE.Vector3(0, 0, 1);
    for (const point of points) {
      const obj = letterMeshes.current.get(point.letter);
      if (!obj) continue;
      obj.quaternion.copy(billboardLocalQuat);
      const worldNormal = new THREE.Vector3(...point.normal).applyQuaternion(group.quaternion);
      const facing = (worldNormal.dot(cameraDir) + 1) / 2; // 0 back, 1 front
      const isSelected = selectedRef.current === point.letter;
      const scale = isSelected ? 1.6 : 0.55 + facing * 0.65;
      obj.scale.setScalar(scale);
      const material = (obj as unknown as { material?: THREE.Material & { opacity: number } })
        .material;
      if (material) {
        material.transparent = true;
        material.opacity = isSelected ? 1 : 0.35 + facing * 0.65;
      }
    }
  });

  return (
    <group ref={groupRef} rotation-order="YXZ">
      {/* Transparent full-globe interaction layer — dragging starts here
          just as readily as on a letter, per the "grab anywhere" rule. */}
      {/* Radius is deliberately *smaller* than GLOBE_RADIUS: letters sit on
          the sphere surface at GLOBE_RADIUS, so on the near hemisphere they
          are closer to the camera than this layer. If this sphere were
          larger (i.e. in front of the letters), it would win every raycast
          on the near side and letters would never receive their own
          pointerdown — this only needs to catch clicks that miss every
          letter (the gaps), not sit in front of them. */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.target as Element).setPointerCapture?.(e.pointerId);
          beginDrag(e.nativeEvent.clientX, e.nativeEvent.clientY, null);
        }}
      >
        <sphereGeometry args={[GLOBE_RADIUS - 0.5, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {points.map((point) => {
        const learned = learnedLetters.includes(point.letter);
        return (
          <Text
            key={point.letter}
            ref={(obj) => {
              if (obj) letterMeshes.current.set(point.letter, obj);
              else letterMeshes.current.delete(point.letter);
            }}
            position={point.position}
            fontSize={0.5}
            color={learned ? tokenColors.learned : tokenColors.letter}
            anchorX="center"
            anchorY="middle"
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.target as Element).setPointerCapture?.(e.pointerId);
              beginDrag(e.nativeEvent.clientX, e.nativeEvent.clientY, point.letter);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = '';
            }}
          >
            {point.letter}
          </Text>
        );
      })}
    </group>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Picks the target angle equivalent (target + k*2pi) nearest to `current`,
 * so GSAP always animates the short way round instead of spinning back
 * through a full turn. */
function nearestEquivalentAngle(current: number, target: number): number {
  const twoPi = Math.PI * 2;
  const delta = ((target - current + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
  return current + delta;
}

interface AlphabetGlobeProps {
  learnedLetters: string[];
}

export function AlphabetGlobe({ learnedLetters }: AlphabetGlobeProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => navigate(`/alphabet/${selected}`), 350);
    return () => clearTimeout(t);
  }, [selected, navigate]);

  return (
    <div className={styles.stage}>
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
        <ambientLight intensity={1.3} />
        <AlphabetGlobeGroup learnedLetters={learnedLetters} onSelect={setSelected} />
      </Canvas>
    </div>
  );
}
