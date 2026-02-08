import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { ErrorLogger } from '@/lib/errorHandler'
import {
  BadgeCheck,
  Bell,
  Check,
  ChevronRight,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  Palette,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'

const SETTINGS_STORAGE_KEY = 'buzly_user_settings'

interface UserSettings {
  notifications: {
    likes: boolean
    comments: boolean
    follows: boolean
    messages: boolean
  }
  privacy: {
    privateAccount: boolean
    hideActivity: boolean
    allowTags: boolean
  }
}

const defaultSettings: UserSettings = {
  notifications: {
    likes: true,
    comments: true,
    follows: true,
    messages: true,
  },
  privacy: {
    privateAccount: false,
    hideActivity: false,
    allowTags: true,
  },
}

function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    ErrorLogger.log('Failed to load settings:', e)
  }
  return defaultSettings
}

function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    ErrorLogger.log('Failed to save settings:', e)
  }
}

export default function Settings() {
  const { signOut } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const { language, setLanguage, isRTL, t } = useLanguage()

  const [settings, setSettings] = useState<UserSettings>(loadSettings)
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
    toast({
      title: t('settings.updated'),
      description: isRTL
        ? `${value ? t('common.enabled') : t('common.disabled')} إشعارات ${key}`
        : `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${value ? t('common.enabled') : t('common.disabled')}`,
    })
  }

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }))
    toast({
      title: t('settings.updated'),
      description: t('settings.privacyUpdated'),
    })
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setLocation('/auth')
    } catch (error) {
      ErrorLogger.log('Failed to sign out', error)
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="h-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <ScrollArea className="h-full">
        <div className="w-full max-w-2xl mx-auto p-4 pb-24 md:pb-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
            <p className="text-muted-foreground">{t('settings.subtitle')}</p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t('settings.notifications')}</CardTitle>
                  <CardDescription>{t('settings.notifications.desc')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              <SettingRow
                label={t('settings.likes')}
                description={t('settings.likes.desc')}
                checked={settings.notifications.likes}
                onCheckedChange={(checked) => updateNotificationSetting('likes', checked)}
              />
              <SettingRow
                label={t('settings.comments')}
                description={t('settings.comments.desc')}
                checked={settings.notifications.comments}
                onCheckedChange={(checked) => updateNotificationSetting('comments', checked)}
              />
              <SettingRow
                label={t('settings.followers')}
                description={t('settings.followers.desc')}
                checked={settings.notifications.follows}
                onCheckedChange={(checked) => updateNotificationSetting('follows', checked)}
              />
              <SettingRow
                label={t('settings.messages')}
                description={t('settings.messages.desc')}
                checked={settings.notifications.messages}
                onCheckedChange={(checked) => updateNotificationSetting('messages', checked)}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t('settings.privacy')}</CardTitle>
                  <CardDescription>{t('settings.privacy.desc')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              <SettingRow
                label={t('settings.private')}
                description={t('settings.private.desc')}
                checked={settings.privacy.privateAccount}
                onCheckedChange={(checked) => updatePrivacySetting('privateAccount', checked)}
              />
              <SettingRow
                label={t('settings.hideActivity')}
                description={t('settings.hideActivity.desc')}
                checked={settings.privacy.hideActivity}
                onCheckedChange={(checked) => updatePrivacySetting('hideActivity', checked)}
              />
              <SettingRow
                label={t('settings.allowTags')}
                description={t('settings.allowTags.desc')}
                checked={settings.privacy.allowTags}
                onCheckedChange={(checked) => updatePrivacySetting('allowTags', checked)}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
            <CardContent className="p-2">
              <MenuButton
                icon={<BadgeCheck className="h-5 w-5 text-blue-500" />}
                label={isRTL ? 'طلب التوثيق' : 'Verification Request'}
                onClick={() => setLocation('/verify')}
              />
              <MenuButton
                icon={<MapPin className="h-5 w-5 text-emerald-500" />}
                label={isRTL ? 'اكتشف القريبين' : 'Nearby Discovery'}
                onClick={() => setLocation('/nearby')}
              />
              <MenuButton
                icon={<Palette className="h-5 w-5" />}
                label={t('settings.appearance')}
                onClick={() => toast({ title: t('settings.comingSoon') })}
              />
              <MenuButton
                icon={<Globe className="h-5 w-5" />}
                label={t('settings.language')}
                value={language === 'ar' ? 'العربية' : 'English'}
                onClick={() => setLanguageDialogOpen(true)}
              />
              <MenuButton
                icon={<ShieldCheck className="h-5 w-5" />}
                label={t('settings.blocked')}
                onClick={() => toast({ title: t('settings.comingSoon') })}
              />
              <MenuButton
                icon={<HelpCircle className="h-5 w-5" />}
                label={t('settings.help')}
                onClick={() => toast({ title: t('settings.comingSoon') })}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-destructive/30 rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <Button
                variant="destructive"
                className="w-full h-11 gap-2 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                {t('settings.signout')}
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground pb-4">Buzly v1.0.0</p>
        </div>
      </ScrollArea>

      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-md border-primary/30">
          <DialogHeader>
            <DialogTitle>{t('settings.selectLanguage')}</DialogTitle>
            <DialogDescription>{t('settings.selectLanguage.desc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <button
              onClick={() => {
                setLanguage('en')
                setLanguageDialogOpen(false)
                toast({ title: 'Language changed to English' })
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                language === 'en' ? 'bg-primary/20 border border-primary' : 'hover:bg-muted/30'
              }`}
            >
              <span className="font-medium">English</span>
              {language === 'en' && <Check className="h-5 w-5 text-primary" />}
            </button>
            <button
              onClick={() => {
                setLanguage('ar')
                setLanguageDialogOpen(false)
                toast({ title: 'تم تغيير اللغة إلى العربية' })
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                language === 'ar' ? 'bg-primary/20 border border-primary' : 'hover:bg-muted/30'
              }`}
            >
              <span className="font-medium">العربية</span>
              {language === 'ar' && <Check className="h-5 w-5 text-primary" />}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SettingRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
      <div className="space-y-0.5 flex-1">
        <Label className="text-sm font-medium cursor-pointer">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function MenuButton({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  )
}
