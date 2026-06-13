(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initPlayer(shell) {
        var video = shell.querySelector("video[data-src]");
        var button = shell.querySelector(".player-play");

        if (!video || !button) {
            return;
        }

        var source = video.getAttribute("data-src");
        var initialized = false;
        var hlsInstance = null;

        function bindSource() {
            if (initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function playVideo() {
            bindSource();

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            playVideo();
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
            shell.classList.remove("is-playing");
        });

        video.addEventListener("ended", function () {
            shell.classList.remove("is-playing");
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        var players = document.querySelectorAll("[data-player]");

        Array.prototype.forEach.call(players, initPlayer);
    });
})();
