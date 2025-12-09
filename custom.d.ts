// custom.d.ts
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

declare module '@react-three/fiber' {
  interface ThreeElements {
    // Declares the custom JSX elements in lowercase
    meshLineGeometry: React.PropsWithoutRef<JSX.IntrinsicElements['mesh']['geometry']> & { 
      attach: string; 
    };
    meshLineMaterial: React.PropsWithoutRef<JSX.IntrinsicElements['mesh']['material']> & { 
      attach: string; 
      color?: THREE.ColorRepresentation;
      lineWidth?: number;
      depthTest?: boolean;
      resolution?: [number, number];
    };
  }
}