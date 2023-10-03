varying vec2 vUv;
uniform float time;
uniform sampler2D noiseTexture;
uniform vec3 waterColor;

void main() {
    vec2 uv = vUv;
    vec4 noise = texture2D(noiseTexture, uv);

    gl_FragColor = vec4(waterColor, 0.4);
}
