(function () {
  const video = document.querySelector('[data-player]');
  const button = document.querySelector('[data-play-button]');
  const message = document.querySelector('[data-player-message]');

  if (!video || !button) {
    return;
  }

  const stream = video.dataset.stream;
  let ready = false;
  let loading = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function attachStream() {
    if (ready || loading || !stream) {
      return Promise.resolve();
    }

    loading = true;

    return new Promise(function (resolve) {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          loading = false;
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放资源暂时不可用，请稍后重试。');
            loading = false;
            resolve();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          ready = true;
          loading = false;
          resolve();
        }, { once: true });
      } else {
        setMessage('播放资源暂时不可用，请稍后重试。');
        loading = false;
        resolve();
      }
    });
  }

  button.addEventListener('click', function () {
    setMessage('');
    attachStream().then(function () {
      const playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          setMessage('点击视频区域可继续播放。');
        });
      }
    });
  });

  video.addEventListener('play', function () {
    button.style.display = 'none';
  });

  video.addEventListener('pause', function () {
    button.style.display = 'grid';
  });
}());
