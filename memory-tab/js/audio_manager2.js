/**
 * 무음모드에서도 사운드 재생 가능
 * 그러나, 오디오 표시가 뜸
 */

const SOUNDS = {
  bgm: {
    file: "media/fast-2d-bgm.mp3",
    volume: 0.3,
  },
  start: {
    file: "media/go.m4a",
  },
  correct: {
    file: "media/touch22.m4a",
  },
  wrong: {
    file: "media/fails.m4a",
  },
};

class AudioManager {
  constructor() {
    // HTML5 Audio 요소들을 사용
    this.soundEnabled = false;
    this.audioElements = {};

    // 모든 사운드에 대해 Audio 요소 미리 생성
    this.loadSounds();
  }

  loadSounds() {
    for (const [key, value] of Object.entries(SOUNDS)) {
      const audio = new Audio(value.file);
      // iOS에서 무음 모드에서도 재생되도록 하는 설정
      audio.playsInline = true;
      audio.preload = "auto";
      // WebKit에서 무음 모드 무시 설정
      audio.webkitPlaysinline = true;

      // BGM은 루프 설정
      if (key === 'bgm') {
        audio.loop = true;
      }

      if (value.volume !== undefined) {
        audio.volume = value.volume;
      }

      this.audioElements[key] = audio;
    }
  }

  async play(sound) {
    if (!this.soundEnabled || !this.audioElements[sound]) return;

    try {
      const audioElement = this.audioElements[sound];

      // 재생 중이면 처음부터 다시 재생
      audioElement.currentTime = 0;

      // 무음 모드에서도 재생되도록 하는 설정
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Playback failed:", error);
        });
      }

      // Telegram 햅틱 피드백
      const tg = window.Telegram.WebApp;
      if (tg && tg.initData && tg.initData?.length > 0) {
        tg.HapticFeedback.impactOccurred("soft");
      }
    } catch (error) {
      console.warn("Sound playback failed:", error);
    }
  }

  stop(sound) {
    if (this.audioElements[sound]) {
      try {
        this.audioElements[sound].pause();
        this.audioElements[sound].currentTime = 0;
      } catch (error) {
        console.warn("Sound stop failed:", error);
      }
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;

    // BGM 특별 처리
    if (this.audioElements['bgm']) {
      if (this.soundEnabled) {
        this.play('bgm');
      } else {
        this.stop('bgm');
      }
    }

    return this.soundEnabled;
  }
}
