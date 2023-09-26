varying vec2 vUv;
uniform float time;
uniform sampler2D noiseTexture;

void main() {
    vec2 uv = vUv;
    uv.x = uv.x * 0.0625 + time * 0.005;
    uv.y -= time * 0.25;
    vec4 noise = texture2D(noiseTexture, uv);

    vec2 uv2 = vUv;
    uv2.x = uv2.x * 0.0625 - time * 0.0052;
    uv2.y -= time * 0.23;
    vec4 noise2 = texture2D(noiseTexture, uv2);

    vec3 c = clamp(vec3(0.247, 0.411, 1.0) + noise.r * noise2.a, 0.0, 1.0);

    gl_FragColor = vec4(c.rgb, 0.4);
}
