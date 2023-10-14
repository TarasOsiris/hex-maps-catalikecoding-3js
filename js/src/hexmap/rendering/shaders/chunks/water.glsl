float Foam(float shore, vec2 worldXZ, sampler2D noiseTex) {
    shore = sqrt(shore);

    vec2 noiseUV = worldXZ + time * 0.25;
    vec4 noise = texture2D(noiseTex, noiseUV * 0.015);

    float distortion1 = noise.x * (1. - shore);
    float foam1 = sin((shore + distortion1) * 10.0 - time);
    foam1 *= foam1;

    float distortion2 = noise.y * (1. - shore);
    float foam2 = sin((shore + distortion2) * 10. + time + 2.);
    foam2 *= foam2 * 0.7;

    return max(foam1, foam2) * shore;
}

float Waves(vec2 worldXZ, sampler2D noiseTex) {
    vec2 uv1 = worldXZ;
    uv1.y = -uv1.y;
    uv1.y += time;
    vec4 noise1 = texture2D(noiseTexture, uv1 * 0.025);

    vec2 uv2 = worldXZ;
    uv2.y = -uv2.y;
    uv2.x += time;
    vec4 noise2 = texture2D(noiseTexture, uv2 * 0.025);

    float blendWave = sin((worldXZ.x + (-worldXZ.y)) * 0.1 + (noise1.y + noise2.z) + time);
    blendWave *= blendWave;

    float waves = mix(noise1.z, noise1.w, blendWave) + mix(noise2.x, noise2.y, blendWave);
    return smoothstep(0.75, 2.0, waves);
}
