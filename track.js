// track.js — FULL FINGERPRINT ENGINE
async function initTracking(gameId, targetDuration = 180) {
  const sessionId = crypto.randomUUID();
  const startTime = Date.now();

  // 1. DEVICE ID
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }

  // 2. BROWSER & DEVICE
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua);
  const browser = (() => {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other';
  })();
  const os = (() => {
    if (ua.includes('Android')) return `Android ${ua.match(/Android (\d+)/)?.[1]}`;
    if (ua.includes('iPhone')) return `iOS ${ua.match(/OS (\d+)/)?.[1]}`;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    return 'Unknown';
  })();
  const resolution = `${screen.width}x${screen.height}`;

  // 3. GEO (ipapi.co — free 1K/day)
  let geo = { ip: 'unknown', country_name: 'Unknown', city: 'Unknown' };
  try {
    const res = await fetch('https://ipapi.co/json/');
    geo = await res.json();
  } catch (e) {}

  // 4. REFERRER
  const referrer = document.referrer || 'direct';
  const urlParams = new URLSearchParams(window.location.search);
  const refUser = urlParams.get('ref');

  // 5. REPEAT PLAY?
  const { data: history } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('game_id', gameId)
    .eq('device_id', deviceId);
  const playNumber = (history?.length || 0) + 1;
  const isRepeat = playNumber > 1;

  // 6. LOG SESSION START
  await supabase.from('game_sessions').insert({
    user_id: deviceId,
    game_id: gameId,
    session_id: sessionId,
    device_type: isMobile ? 'mobile' : 'desktop',
    browser, os, resolution,
    ip_address: geo.ip,
    country: geo.country_name,
    city: geo.city,
    referrer,
    ref_user_id: refUser,
    is_repeat_play: isRepeat,
    play_number_for_user: playNumber,
    start_time: new Date().toISOString()
  });

  // 7. HEARTBEAT
  const heartbeat = setInterval(() => {
    supabase.from('game_sessions').update({
      duration_sec: Math.floor((Date.now() - startTime) / 1000)
    }).eq('session_id', sessionId);
  }, 10000);

  // 8. END TRACKING
  const endTracking = async (exitReason = 'close') => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    await supabase.from('game_sessions').update({
      end_time: new Date().toISOString(),
      duration_sec: duration,
      completed: duration >= targetDuration,
      exit_reason: exitReason
    }).eq('session_id', sessionId);
    clearInterval(heartbeat);
  };

  window.addEventListener('beforeunload', () => endTracking('tab_close'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) endTracking('tab_switch');
  });
}