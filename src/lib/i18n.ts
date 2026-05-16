/**
 * OWNER: P1 (Frontend)
 * Turkish UI string table. Single source of truth so we never hardcode UI text in components.
 * Key naming convention: <area>.<action_or_label>
 */
export const tr = {
  // App / brand
  'app.name': 'Kürsü',
  'app.tagline': 'Derse kulak veren AI öğretim asistanı',
  'app.role.teacher': 'Öğretmen',
  'app.role.student': 'Öğrenci',
  'app.theme.light': 'Aydınlık',
  'app.theme.dark': 'Karanlık',

  // Landing
  'landing.cta.teacher': 'Öğretmen olarak giriş yap',
  'landing.cta.student': 'Öğrenci olarak katıl',
  'landing.feature.live': 'Canlı transkript ve anında soru-cevap',
  'landing.feature.feedback': 'Pedagojik geri bildirim raporu',
  'landing.feature.post': 'Ders bittikten sonra da AI öğretmen',

  // Teacher dashboard
  'teacher.dashboard.title': 'Derslerim',
  'teacher.dashboard.empty': 'Henüz bir ders oluşturmadın.',
  'teacher.dashboard.new': 'Yeni ders',

  // New lecture
  'teacher.new.title': 'Yeni Ders',
  'teacher.new.field.title': 'Başlık',
  'teacher.new.field.subject': 'Konu',
  'teacher.new.field.description': 'Kısa açıklama',
  'teacher.new.submit': 'Oluştur',

  // Lecture detail (pre-live)
  'teacher.detail.upload': 'Notları yükle',
  'teacher.detail.upload.paste': 'Metin yapıştır',
  'teacher.detail.upload.pdf': 'PDF yükle',
  'teacher.detail.start': 'Canlı oturumu başlat',

  // Live session
  'live.code.label': 'Oturum kodu',
  'live.transcript.empty': 'Transkript henüz başlamadı.',
  'live.questions.empty': 'Henüz soru yok.',
  'live.end': 'Oturumu sonlandır',
  'live.mic.permission': 'Mikrofon izni gerekli',

  // Student
  'student.join.title': 'Derse katıl',
  'student.join.code': 'Oturum kodu',
  'student.join.name': 'Adın',
  'student.join.submit': 'Katıl',
  'student.consent':
    'Bu derste söyledikleriniz öğretmen ve sınıf tarafından görülebilir. Sesiniz sunucuya yüklenmez; yalnızca tarayıcı transkripti gönderilir.',

  // Question chat
  'chat.placeholder': 'Bir soru sor...',
  'chat.send': 'Gönder',
  'chat.flagged': 'Bu soru öğretmeninize iletildi.',

  // Feedback
  'feedback.title': 'Ders sonu raporu',
  'feedback.generating': 'Rapor oluşturuluyor...',
  'feedback.scores.clarity': 'Anlaşılırlık',
  'feedback.scores.pacing': 'Tempo',
  'feedback.scores.engagement': 'Etkileşim',
  'feedback.rushed': 'Hızlı geçilen kavramlar',
  'feedback.unanswered': 'Cevapsız kalan sorular',
  'feedback.examples': 'Eksik örnekler',
  'feedback.pacing': 'Tempo analizi',
  'feedback.suggestions': 'Öneriler',
  'feedback.confusion': 'En çok karışan konular',
} as const;

export type I18nKey = keyof typeof tr;
export function t(key: I18nKey): string {
  return tr[key];
}
