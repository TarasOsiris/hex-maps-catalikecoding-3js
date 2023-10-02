varying vec2 vUv;

uniform sampler2D noiseTexture;
uniform vec3 roadColor;
varying vec3 worldPosition;

void main() {
    vec4 noise = texture2D(noiseTexture, worldPosition.xz * 0.025);
    vec2 uv = vUv;
    float blend = uv.x;
    blend *= noise.x + 0.5;
    blend = smoothstep(0.4, 0.7, blend);
    vec3 color = roadColor * (noise.y * 0.75 + 0.25);

    gl_FragColor = vec4(color, blend);
}
