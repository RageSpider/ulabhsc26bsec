import * as THREE from 'three';

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader: Memory Mist (Noise-based fluid)
const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simplex Noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    // FBM (Fractal Brownian Motion) for smoke detail
    float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 5; ++i) {
            v += a * snoise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 st = gl_FragCoord.xy/uResolution.xy;
        st.x *= uResolution.x/uResolution.y;

        float time = uTime * 0.1;
        
        vec2 q = vec2(0.);
        q.x = fbm( st + 0.00*time);
        q.y = fbm( st + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
        r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*time);

        float f = fbm(st+r);

        // Warm / Sepia Color Palette
        vec3 color1 = vec3(0.1, 0.08, 0.06); // Dark brown
        vec3 color2 = vec3(0.5, 0.4, 0.3);   // Sepia
        vec3 color3 = vec3(0.8, 0.7, 0.5);   // Light Gold/Cream highlight

        vec3 color = mix(color1, color2, clamp((f*f)*4.0,0.0,1.0));
        color = mix(color, color3, clamp(length(q),0.0,1.0));
        
        // Add subtle grain
        float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
        color += noise * 0.05;

        // Dark Vignette
        float dist = distance(vUv, vec2(0.5));
        color *= 1.0 - dist * 0.5;

        gl_FragColor = vec4(color * 1.2, 1.0);
    }
`;

export function initVisual() {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, // Allow CSS background to show through if needed
        antialias: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1); // Performance optimization for fluid shader

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        depthWrite: false,
        depthTest: false
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(plane);

    // Resize
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();
    
    const animate = () => {
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();
}