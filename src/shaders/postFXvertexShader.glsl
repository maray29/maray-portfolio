varying vec2 vUv;

void main() {
        // Set the correct position of each plane vertex
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        // Pass in the correct UVs to the fragment shader
    vUv = uv;
}