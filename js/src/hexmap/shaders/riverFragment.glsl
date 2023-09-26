varying vec2 vUv;
uniform float time;

void main() {
    vec2 uv = vUv;
    uv.y -= time;
    uv.y = fract(uv.y);
    gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
}
