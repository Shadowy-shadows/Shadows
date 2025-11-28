// Audio Manager shared across pages - stores playback state to localStorage
(function(global){
  const STORAGE_KEY = 'aa_audio_state_v1';
  class AudioManagerShared {
    constructor(){
      this.a = new Audio(); this.b = new Audio();
      [this.a,this.b].forEach(x=>{ x.preload='auto'; x.crossOrigin='anonymous'; x.volume=0; x.loop=false; });
      this.active = this.a; this.inactive = this.b; this.volume=1; this.fadeDuration = 0.8; this._fading=false; this.currentSrc='';
      this.onplay = ()=>{}; this.onpause = ()=>{}; this.onaudioload = ()=>{};
      this._saveInterval = setInterval(()=>this._persistState(), 800);
      // restore on init
      this._restored = false;
    }
    _persistState(){
      try{
        const state = { src: this.currentSrc||'', time: this.getCurrentTime()||0, playing: !this.active.paused, ts: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }catch(e){}
    }
    restoreState(){
      if (this._restored) return;
      this._restored = true;
      try{
        const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return;
        const s = JSON.parse(raw);
        if (!s || !s.src) return;
        // compute progressed time since last save
        const now = Date.now(); const elapsed = Math.max(0, (now - (s.ts||now))/1000);
        const resumeAt = (s.time||0) + (s.playing ? elapsed : 0);
        this.load(s.src, resumeAt, false, false);
        if (s.playing){
          // try to autoplay; may be blocked - user gesture required
          const p = this.play(); if (p && p.catch) p.catch(()=>{});
        }
      }catch(e){}
    }
    load(src, startTime=0, crossfade=true, autoplay=true){
      if (!src) return;
      const incoming = this.inactive;
      if (src === this.currentSrc){ try{ this.active.currentTime = startTime; }catch(e){} if (autoplay) return this.play(); return; }
      incoming.src = src; incoming.currentTime = startTime; incoming.volume = 0;
      const playPromise = incoming.play();
      const finalize = ()=>{ this.currentSrc = src; this.onaudioload(src); };
      if (playPromise && typeof playPromise.then === 'function'){
        playPromise.then(()=>{
          if (crossfade && !this.active.paused){ this._crossfade(incoming, this.active); }
          else { try{ this.active.pause(); }catch(e){} this._swapActive(incoming); if (!autoplay) this.pause(); else this.play(); }
          finalize();
        }).catch(()=>{ this._swapActive(incoming); finalize(); });
      } else { this._swapActive(incoming); finalize(); }
      return playPromise;
    }
    _swapActive(next){ const prev = this.active; this.active = next; this.inactive = prev; }
    _crossfade(incoming, outgoing){ if (this._fading) return; this._fading = true; const dur=this.fadeDuration*1000; const start=performance.now(); const step=(now)=>{ const t=Math.min(1,(now-start)/dur); incoming.volume = t*this.volume; outgoing.volume = (1-t)*this.volume; if (t<1) requestAnimationFrame(step); else { try{ outgoing.pause(); }catch(e){} outgoing.volume=0; incoming.volume=this.volume; this._swapActive(incoming); this._fading=false; } }; requestAnimationFrame(step); }
    play(){ try{ const p = this.active.play(); if (p && typeof p.then==='function') p.then(()=>this.onplay()).catch(()=>{}); else this.onplay(); return p;}catch(e){ try{ this.active.play(); this.onplay(); }catch(e){} } }
    pause(){ try{ this.active.pause(); }catch(e){} this.onpause(); }
    toggle(){ if (this.active.paused) { this.play(); return true; } else { this.pause(); return false; } }
    setVolume(v){ this.volume = Math.max(0, Math.min(1, v)); this.active.volume = this.volume; }
    getCurrentTime(){ try{ return this.active.currentTime; }catch(e){ return 0; } }
    setCurrentTime(t){ try{ this.active.currentTime = t; }catch(e){} }
    destroy(){ clearInterval(this._saveInterval); try{ this.a.pause(); this.b.pause(); }catch(e){} }
  }
  // expose singleton
  if (!global.__AA_AUDIO_MANAGER){ global.__AA_AUDIO_MANAGER = new AudioManagerShared(); }
  global.audioManager = global.__AA_AUDIO_MANAGER;
})(window);
