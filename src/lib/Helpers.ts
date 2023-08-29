export class Helpers {
    static addFullScreenToggle(canvas: HTMLCanvasElement) {
        window.addEventListener('dblclick', () => {
            // @ts-ignore
            const fullScreenElement = document.fullscreenElement || document.webkitFullscreenElement

            if (!fullScreenElement) {
                if (canvas.requestFullscreen) {
                    canvas.requestFullscreen()
                } else { // @ts-ignore
                    if (canvas.webkitRequestFullscreen) {
                        // @ts-ignore
                        canvas.webkitRequestFullscreen()
                    }
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                } else { // @ts-ignore
                    if (document.webkitExitFullscreen) {
                        // @ts-ignore
                        document.webkitExitFullscreen()
                    }
                }
            }
        })

    }
}