varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
}
