import React from 'react';

// Yardımcı: WebGL'in kullanılabilir olup olmadığını kontrol et
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, webglUnavailable: !isWebGLAvailable() };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[WebGL] 3D işleme başarısız oldu, yedek gösteriliyor:', error.message);
  }

  render() {
    if (this.state.hasError || this.state.webglUnavailable) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-8 border border-white/5 bg-black/60 max-w-sm cyber-panel">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-neon-cyan/20 rounded-full flex items-center justify-center">
              <span className="text-2xl opacity-40">📡</span>
            </div>
            <p className="text-sm font-bold text-neon-cyan uppercase tracking-[4px] mb-3">Donanım Hızlandırma Hatası</p>
            <p className="text-[10px] mono-info text-slate-500 leading-relaxed mb-6">
              Sistem 3D çekirdeği (WebGL) başlatılamıyor. Tarayıcınızda donanım hızlandırmayı etkin olduğundan emin olun veya sekmeyi yenileyin.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 text-[10px] font-black uppercase tracking-[3px] border border-neon-cyan/40 text-neon-cyan/70 hover:bg-neon-cyan/10 transition-all"
            >
              SİSTEMİ_SIFIRLA
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WebGLErrorBoundary;
