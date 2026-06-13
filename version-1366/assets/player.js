import { H as Hls } from './hls.js';

export function initMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    var hls = null;
    var loaded = false;

    if (!video || !cover || !source) {
        return;
    }

    function attachSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            loaded = true;
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            loaded = true;
        }
    }

    function startPlayback() {
        attachSource();
        cover.classList.add('is-hidden');
        video.controls = true;

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                cover.classList.remove('is-hidden');
            });
        }
    }

    cover.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (!loaded) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
