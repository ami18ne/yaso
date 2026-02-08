import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

type Language = 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isRTL: boolean
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account preferences',
    'settings.notifications': 'Notifications',
    'settings.notifications.desc': 'Manage your notification preferences',
    'settings.likes': 'Likes',
    'settings.likes.desc': 'Get notified when someone likes your post',
    'settings.comments': 'Comments',
    'settings.comments.desc': 'Get notified when someone comments',
    'settings.followers': 'New Followers',
    'settings.followers.desc': 'Get notified when someone follows you',
    'settings.messages': 'Direct Messages',
    'settings.messages.desc': 'Get notified for new messages',
    'settings.privacy': 'Privacy & Security',
    'settings.privacy.desc': 'Control who can see your content',
    'settings.private': 'Private Account',
    'settings.private.desc': 'Only approved followers can see your posts',
    'settings.hideActivity': 'Hide Activity Status',
    'settings.hideActivity.desc': "Don't show when you're online",
    'settings.allowTags': 'Allow People to Tag You',
    'settings.allowTags.desc': 'Let others tag you in posts and stories',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.blocked': 'Blocked Users',
    'settings.help': 'Help & Support',
    'settings.signout': 'Sign Out',
    'settings.updated': 'Setting updated',
    'settings.privacyUpdated': 'Your privacy settings have been updated',
    'settings.comingSoon': 'Coming soon!',
    'settings.selectLanguage': 'Select Language',
    'settings.selectLanguage.desc': 'Choose your preferred language',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'common.enabled': 'enabled',
    'common.disabled': 'disabled',
  },
  ar: {
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'إدارة تفضيلات حسابك',
    'settings.notifications': 'الإشعارات',
    'settings.notifications.desc': 'إدارة تفضيلات الإشعارات',
    'settings.likes': 'الإعجابات',
    'settings.likes.desc': 'احصل على إشعار عندما يعجب شخص ما بمنشورك',
    'settings.comments': 'التعليقات',
    'settings.comments.desc': 'احصل على إشعار عندما يعلق شخص ما',
    'settings.followers': 'المتابعين الجدد',
    'settings.followers.desc': 'احصل على إشعار عندما يتابعك شخص ما',
    'settings.messages': 'الرسائل المباشرة',
    'settings.messages.desc': 'احصل على إشعار للرسائل الجديدة',
    'settings.privacy': 'الخصوصية والأمان',
    'settings.privacy.desc': 'تحكم في من يمكنه رؤية محتواك',
    'settings.private': 'حساب خاص',
    'settings.private.desc': 'فقط المتابعين المعتمدين يمكنهم رؤية منشوراتك',
    'settings.hideActivity': 'إخفاء حالة النشاط',
    'settings.hideActivity.desc': 'لا تظهر متى تكون متصلاً',
    'settings.allowTags': 'السماح للأشخاص بالإشارة إليك',
    'settings.allowTags.desc': 'دع الآخرين يشيرون إليك في المنشورات والستوري',
    'settings.appearance': 'المظهر',
    'settings.language': 'اللغة',
    'settings.blocked': 'المستخدمين المحظورين',
    'settings.help': 'المساعدة والدعم',
    'settings.signout': 'تسجيل الخروج',
    'settings.updated': 'تم تحديث الإعداد',
    'settings.privacyUpdated': 'تم تحديث إعدادات الخصوصية الخاصة بك',
    'settings.comingSoon': 'قريباً!',
    'settings.selectLanguage': 'اختر اللغة',
    'settings.selectLanguage.desc': 'اختر لغتك المفضلة',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'common.enabled': 'مفعّل',
    'common.disabled': 'معطّل',
  },
}

const LANGUAGE_STORAGE_KEY = 'buzly_language'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored === 'ar' || stored === 'en') {
        return stored
      }
    }
    return 'en'
  })

  const isRTL = language === 'ar'

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language, isRTL])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
