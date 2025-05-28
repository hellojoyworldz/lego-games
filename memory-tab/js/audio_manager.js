const SOUND = {
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
    // WebAudio Context 생성
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.soundEnabled = true;
    this.buffers = {};
    this.sources = {};

    // 오디오 파일 로드
    this.loadSounds();
  }

  async loadSounds() {
    try {
      // 오디오 파일을 fetch로 가져와서 ArrayBuffer로 변환
      for (const [key, value] of Object.entries(SOUND)) {
        const filePath = value.file;
        const sound = await fetch(filePath).then((res) => res.arrayBuffer());
        this.buffers[key] = await this.audioContext.decodeAudioData(sound);
      }
    } catch (error) {
      console.warn("Sound loading failed:", error);
    }
  }

  play(sound) {
    if (!this.soundEnabled || !this.buffers[sound]) return;

    try {
      // 이전 재생 중인 소스 정지
      if (this.sources[sound]) {
        this.sources[sound].stop();
      }

      // 새로운 소스 생성
      const source = this.audioContext.createBufferSource();
      source.buffer = this.buffers[sound];

      // 볼륨 조절 (SOUND[sound].volume 있으면 적용)
      const soundConfig = SOUND[sound];
      if (soundConfig && soundConfig.volume !== undefined) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = soundConfig.volume;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
      } else {
        source.connect(this.audioContext.destination);
      }

      // 소스 저장 및 재생
      this.sources[sound] = source;
      source.start(0);

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
    if (this.sources[sound]) {
      try {
        this.sources[sound].stop();
        delete this.sources[sound];
      } catch (error) {
        console.warn("Sound stop failed:", error);
      }
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }
}
