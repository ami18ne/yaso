import appStoreIcon from '@/assets/app-store.svg'
import googlePlayIcon from '@/assets/google-play.svg'
import ThemeToggleButton from '@/components/ThemeToggleButton'
import InfoModal from '@/components/ui/InfoModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/lib/supabase'
import { translations } from '@/lib/translations'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowDown, Loader2 } from 'lucide-react'
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import logo from '../../public/tinar_logo.svg'

// Icons
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
)
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

// Floating Label Input Component
const FloatingLabelInput = ({
  type,
  placeholder,
  icon,
  value,
  onChange,
}: {
  type: string
  placeholder: string
  icon: ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const id = `input-${placeholder.toLowerCase().replace(/\s/g, '-')}`

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {icon}
      </div>
      <Input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full bg-transparent text-foreground p-3 pl-10 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder-transparent"
        placeholder={placeholder}
      />
      <label
        htmlFor={id}
        className={cn(
          'absolute left-10 text-muted-foreground transition-all duration-200 bg-background px-1',
          isFocused || value ? ' -top-2.5 text-sm text-primary' : 'top-3 text-base'
        )}
      >
        {placeholder}
      </label>
    </div>
  )
}

// Modal Content
const AboutContent = () => (
  <div className="space-y-4">
    <p className="text-lg text-foreground/90">
      TINAR is a revolutionary social media platform built on the core principles of privacy,
      community empowerment, and technological innovation.
    </p>
    <p className="text-muted-foreground">
      Our mission is to provide a secure, transparent, and engaging environment where users can
      connect, share, and build meaningful communities without compromising their personal data. We
      believe in a better way to do social media, and we are building it.
    </p>
  </div>
)

const FaqContent = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-primary">
        How is TINAR different from other social media platforms?
      </h3>
      <p className="text-muted-foreground">
        We put privacy first. All direct messages are end-to-end encrypted, and we give users
        granular control over their data and what they share. Our focus is on building healthy,
        community-driven spaces.
      </p>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-primary">Is TINAR free to use?</h3>
      <p className="text-muted-foreground">
        Yes, the core features of TINAR are completely free. We plan to introduce optional premium
        features for power users and businesses in the future to support the platform.
      </p>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-primary">How can I delete my account?</h3>
      <p className="text-muted-foreground">
        You can permanently delete your account and all associated data at any time from your
        account settings page. We believe in data freedom, which includes the freedom to leave.
      </p>
    </div>
  </div>
)

const ContactContent = () => (
  <div className="space-y-4 text-center">
    <p className="text-lg text-foreground/90">We'd love to hear from you!</p>
    <p className="text-muted-foreground">
      For support, press inquiries, or general questions, please email us at:
    </p>
    <a
      href="mailto:support@tinar.com"
      className="text-primary font-semibold text-xl hover:text-primary/90 transition-colors"
    >
      support@tinar.com
    </a>
  </div>
)

const AuthHeader = ({
  onOpenModal,
}: { onOpenModal: (title: string, content: ReactNode) => void }) => {
  const { language, setLanguage } = useLanguage()
  const t = translations[language]

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg py-2 px-6 flex items-center justify-between z-50 border-b border-border/50">
      <div className="flex-1 flex items-center justify-start">
        <img src={logo} alt="TINAR Logo" className="h-48 w-48 mr-4 -my-16" />
      </div>
      <nav className="flex-1 flex justify-center items-center space-x-6">
        <button
          onClick={() => onOpenModal(t.about, <AboutContent />)}
          className="text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          {t.about}
        </button>
        <button
          onClick={() => onOpenModal(t.faq, <FaqContent />)}
          className="text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          {t.faq}
        </button>
        <button
          onClick={() => onOpenModal(t.contact, <ContactContent />)}
          className="text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          {t.contact}
        </button>
      </nav>
      <div className="flex-1 flex items-center justify-end space-x-4">
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
            className="bg-transparent text-foreground border-none focus:outline-none appearance-none pr-6 cursor-pointer"
          >
            <option value="en" className="bg-background text-foreground">
              English
            </option>
            <option value="ar" className="bg-background text-foreground">
              العربية
            </option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 fill-current text-muted-foreground" viewBox="0 0 20 20">
              <path d="M5.516 7.548c.436-.446 1.043-.481 1.576 0L10 10.405l2.908-2.857c.533-.481 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S5.11 9.581 5.11 9.163c0-.418.408-1.17.406-1.615z" />
            </svg>
          </div>
        </div>
        <ThemeToggleButton />
      </div>
    </header>
  )
}

const HeroSection = () => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative pt-24 overflow-hidden">
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background dark:bg-black">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary/20 opacity-50 blur-[80px]"></div>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-6xl md:text-8xl font-extrabold leading-tight mb-4 text-foreground"
      >
        {t.heroTitle}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8"
        dangerouslySetInnerHTML={{ __html: t.heroSubtitle }}
      ></motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <a href="#auth">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30 hover:shadow-primary/40"
          >
            {t.getStarted}
          </Button>
        </a>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-10"
      >
        <a href="#auth" aria-label="Scroll to sign up">
          <ArrowDown className="w-8 h-8 text-muted-foreground animate-bounce" />
        </a>
      </motion.div>
    </section>
  )
}

const FeatureCard = ({
  icon,
  title,
  description,
}: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.6 }}
    className="group relative p-8 rounded-2xl text-center flex flex-col items-center bg-card transition-all duration-300 hover:border-primary/50 border border-transparent hover:shadow-lg hover:shadow-primary/10"
  >
    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-6 text-primary">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-card-foreground">{title}</h3>
    <p className="text-muted-foreground min-h-[100px]">{description}</p>
  </motion.div>
)

const FeaturesSection = () => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">{t.whyTinar}</h2>
          <p className="text-lg text-muted-foreground mt-2">Discover the core of our platform.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            }
            title={t.privacyFirst}
            description={t.privacyFirstDescription}
          />
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            }
            title={t.communityDriven}
            description={t.communityDrivenDescription}
          />
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path>
                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path>
                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>
              </svg>
            }
            title={t.innovativeTools}
            description={t.innovativeToolsDescription}
          />
        </div>
      </div>
    </section>
  )
}

const AuthFormSection = () => {
  const { language } = useLanguage()
  const t = translations[language]
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAuthAction = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username, full_name: username } },
        })
        if (error) throw error
        if (data.user?.identities?.length === 0) {
          throw new Error('User already exists.')
        }
        setSuccess(t.signupSuccess)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/'
      }
    } catch (err: any) {
      setError(err.message || t.anErrorOccurred)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="auth" className="py-20 px-4 bg-background">
      <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md mx-auto shadow-primary/10">
        <div className="flex bg-muted rounded-lg p-1 mb-8">
          <button
            className={cn(
              'w-1/2 p-2 rounded-md font-bold transition-all duration-300',
              isSignUp ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            )}
            onClick={() => {
              setIsSignUp(true)
              setError(null)
              setSuccess(null)
            }}
          >
            {t.signUp}
          </button>
          <button
            className={cn(
              'w-1/2 p-2 rounded-md font-bold transition-all duration-300',
              !isSignUp ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            )}
            onClick={() => {
              setIsSignUp(false)
              setError(null)
              setSuccess(null)
            }}
          >
            {t.login}
          </button>
        </div>

        {error && (
          <p className="text-destructive bg-destructive/10 p-3 rounded-md mb-4 text-center text-sm">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 dark:text-green-500 bg-green-500/10 p-3 rounded-md mb-4 text-center text-sm">
            {success}
          </p>
        )}

        <form onSubmit={handleAuthAction} className="mt-8">
          {isSignUp && (
            <FloatingLabelInput
              type="text"
              placeholder={t.username}
              icon={<UserIcon />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <FloatingLabelInput
            type="email"
            placeholder={t.email}
            icon={<MailIcon />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FloatingLabelInput
            type="password"
            placeholder={t.password}
            icon={<LockIcon />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {!isSignUp && (
            <div className="text-right -mt-2 mb-4">
              <a
                href="/reset-password"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.forgotPassword}
              </a>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 mt-4 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : isSignUp ? (
              t.createAccount
            ) : (
              t.login
            )}
          </Button>
        </form>
      </div>
    </section>
  )
}

const Footer = () => {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <footer className="bg-muted/30 py-12 px-4 text-center text-muted-foreground border-t border-border/20">
      <div className="flex justify-center space-x-6 mb-8">
        <a
          href="#"
          className="transform hover:scale-105 transition-transform opacity-80 hover:opacity-100"
        >
          <img src={appStoreIcon} alt="Download on the App Store" className="h-14" />
        </a>
        <a
          href="#"
          className="transform hover:scale-105 transition-transform opacity-80 hover:opacity-100"
        >
          <img src={googlePlayIcon} alt="Get it on Google Play" className="h-14" />
        </a>
      </div>
      <div className="flex justify-center space-x-6 mb-8">
        <a href="/legal" className="hover:text-foreground transition-colors">
          {t.termsOfService}
        </a>
        <a href="/legal" className="hover:text-foreground transition-colors">
          {t.privacyPolicy}
        </a>
      </div>
      <p className="text-sm">
        &copy; {new Date().getFullYear()} TINAR. {t.allRightsReserved}
      </p>
    </footer>
  )
}

export default function Auth() {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null)
  const [modalTitle, setModalTitle] = useState<string>('')

  const openModal = (title: string, content: ReactNode) => {
    setModalTitle(title)
    setModalContent(content)
  }

  const closeModal = () => {
    setModalContent(null)
    setModalTitle('')
  }

  return (
    <div className="bg-background text-foreground font-sans h-screen overflow-y-auto antialiased">
      <AuthHeader onOpenModal={openModal} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AuthFormSection />
      </main>
      <Footer />
      <InfoModal isOpen={!!modalContent} onClose={closeModal} title={modalTitle}>
        {modalContent}
      </InfoModal>
    </div>
  )
}
