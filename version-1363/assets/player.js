(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var video = document.querySelector("video[data-src]");
        var startButton = document.querySelector("[data-player-start]");
        var overlay = document.querySelector("[data-player-overlay]");

        if (!video) {
            return;
        }

        var url = video.getAttribute("data-src");
        var attached = false;

        function attach() {
            if (attached || !url) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = url;
            }
        }

        function begin() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        if (startButton) {
            startButton.addEventListener("click", begin);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
    });
})();
