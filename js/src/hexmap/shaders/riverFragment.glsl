varying vec2 vUv;
uniform float time;
uniform sampler2D noiseTexture;

void main() {
    vec2 uv = vUv;
    uv.y -= time * 0.25;
    vec4 noise = texture2D(noiseTexture, uv);
    vec3 c = vec3(1.0, 1.0, 1.0) * noise.r;

    uv.y = fract(uv.y);
    gl_FragColor = vec4(uv.r, uv.g, 1.0, 1.0);
}
