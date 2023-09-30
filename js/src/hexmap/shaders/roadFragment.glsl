varying vec2 vUv;
uniform float time;
uniform sampler2D noiseTexture;

void main() {
    vec2 uv = vUv;

    gl_FragColor = vec4(uv.rg, 1.0, 1.0);
}
