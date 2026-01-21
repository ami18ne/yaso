import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Sparkles, Users, MessageCircle, Heart, Zap, Shield, Globe, TrendingUp, Award, Rocket } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'wouter'
import { logger } from '@/lib/logger'
import tinarLogo from "@assets/tinar_logo.png"

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password, username)
      } else {
        await signIn(email, password)
        setLocation('/')
      }
    } catch (error) {
      logger.error(error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Connect with Friends",
      description: "Build meaningful relationships with people who share your interests"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Real-time Chat",
      description: "Instant messaging with communities and direct conversations"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Express Yourself",
      description: "Share your thoughts, photos, and moments with emoji reactions"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Experience blazing-fast performance with our modern tech stack"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Community",
      description: "Join millions of users worldwide in the Buzly ecosystem"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src={tinarLogo}
            alt="Tinar"
            className="w-10 h-10 object-contain"
          />
          <span className="text-2xl font-black bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Tinar
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setIsSignUp(false)}
            className="text-foreground hover:text-primary transition-colors"
          >
            Sign In
          </Button>
          <Button
            onClick={() => setIsSignUp(true)}
            className="gradient-primary hover:opacity-90 transition-all"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-48 xl:py-56 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow opacity-50" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative mx-auto max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Visual Elements */}
            <div className="hidden lg:flex items-center justify-center relative h-full">
              <div className="relative w-full max-w-md h-96 lg:h-[500px]">
                {/* Main Gradient Blob */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/10 rounded-3xl blur-3xl animate-blob" />
                
                {/* Floating Cards */}
                <div className="absolute top-0 left-0 w-32 h-40 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl border border-blue-400/30 backdrop-blur-xl p-4 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-xs text-white/70 font-semibold">Real-time Chat</p>
                </div>

                <div className="absolute top-32 right-0 w-36 h-44 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl border border-purple-400/30 backdrop-blur-xl p-4 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="text-3xl mb-2">🎨</div>
                  <p className="text-xs text-white/70 font-semibold">Express Yourself</p>
                </div>

                <div className="absolute bottom-0 left-12 w-40 h-36 bg-gradient-to-br from-pink-500/20 to-pink-500/5 rounded-2xl border border-pink-400/30 backdrop-blur-xl p-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="text-3xl mb-2">🤝</div>
                  <p className="text-xs text-white/70 font-semibold">Build Communities</p>
                </div>

                {/* Center Circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-20 blur-2xl animate-pulse-slow" />
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-foreground leading-tight">
                  The Space to <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Be You.</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-muted-foreground/80 leading-relaxed font-light max-w-xl">
                  Don't just scroll — belong. Connect with the creators, the thinkers, and the community you've been looking for.
                </p>
              </div>

              {/* Auth Form - Premium */}
              <div className="w-full max-w-md animate-fade-in-up">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                
                <Card className="relative border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-pink-500/10 pointer-events-none" />

                  <CardHeader className="relative text-center space-y-4 pb-6">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                        {isSignUp ? 'Join Buzly Today' : 'Welcome Back'}
                      </CardTitle>
                      <CardDescription className="text-sm text-white/60">
                        {isSignUp ? 'Create your account and start connecting' : 'Sign in to continue your journey'}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-5 pt-2 pb-6">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 group"
                      onClick={() => signInWithGoogle()}
                      type="button"
                    >
                      <svg className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="font-medium">Continue with Google</span>
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-3 py-1 text-white/80 rounded-full text-xs font-semibold">Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {isSignUp && (
                        <div className="space-y-2 animate-slide-up">
                          <Label htmlFor="username" className="text-sm font-semibold text-white/80">Username</Label>
                          <Input
                            id="username"
                            type="text"
                            placeholder="your_username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required={isSignUp}
                            autoComplete="username"
                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all rounded-lg"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-white/80">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all rounded-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-white/80">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all rounded-lg pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors p-1"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:shadow-2xl hover:shadow-purple-500/50 text-white transition-all duration-300 border-0 rounded-lg mt-6"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Please wait...</span>
                          </div>
                        ) : isSignUp ? (
                          'Create Account'
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>

                    <div className="text-center text-sm space-y-3 pt-4">
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => setLocation('/forgot-password')}
                          className="text-purple-400 hover:text-purple-300 hover:underline underline-offset-4 transition-colors block w-full"
                        >
                          Forgot your password?
                        </button>
                      )}
                      <div className="text-white/60">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                          type="button"
                          onClick={() => setIsSignUp(!isSignUp)}
                          className="text-purple-400 font-semibold hover:text-purple-300 hover:underline underline-offset-4 transition-colors"
                        >
                          {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium 2026 Style */}
      <section className="py-28 lg:py-40 xl:py-48 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white">
              Built for Real <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Connections</span>
            </h2>
            <p className="text-xl lg:text-2xl xl:text-3xl text-white/60 max-w-3xl mx-auto">
              Everything you need to connect, express yourself, and build your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-purple-400/50 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-2xl transition-all duration-500" />
                <div className="relative">
                  <div className="text-4xl mb-6 group-hover:scale-125 transition-transform duration-300 inline-block text-white/80">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-lg text-white/60 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 xl:py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center space-y-8 xl:space-y-10">
          <div className="space-y-4 xl:space-y-6">
            <h2 className="text-3xl lg:text-5xl xl:text-7xl font-bold tracking-tight">
              Ready to Find Your Community?
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Join millions of users creating, connecting, and inspiring each other.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => setIsSignUp(true)}
              className="gradient-primary hover:opacity-90 transition-all duration-300 text-base lg:text-lg px-8 lg:px-10 xl:px-12 py-3 lg:py-4 xl:py-5"
            >
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsSignUp(false)}
              className="text-base lg:text-lg px-8 lg:px-10 xl:px-12 py-3 lg:py-4 xl:py-5 border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Section - Premium */}
      <section className="py-16 lg:py-24 xl:py-32 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 xl:space-y-6 mb-12 xl:mb-20">
            <h2 className="text-2xl lg:text-4xl xl:text-6xl font-bold tracking-tight">
              Growing Every Day
            </h2>
            <p className="text-base lg:text-lg xl:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Join a rapidly expanding community of creators and thinkers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: <Users className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />, stat: '2M+', label: 'Active Users' },
              { icon: <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />, stat: '100M+', label: 'Posts Daily' },
              { icon: <Heart className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />, stat: '50K+', label: 'Communities' }
            ].map((item, index) => (
              <div
                key={index}
                className="text-center p-6 lg:p-8 xl:p-10 rounded-lg bg-card/40 border border-border/30 hover:border-primary/50 transition-all"
              >
                <div className="flex justify-center mb-4 lg:mb-6 text-primary">
                  {item.icon}
                </div>
                <div className="text-3xl lg:text-5xl xl:text-6xl font-bold mb-2 xl:mb-3">
                  {item.stat}
                </div>
                <p className="text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Premium */}
      <section className="py-16 lg:py-24 xl:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 xl:space-y-6 mb-12 xl:mb-20">
            <h2 className="text-2xl lg:text-4xl xl:text-6xl font-bold tracking-tight">
              Trusted by Creators & Communities
            </h2>
            <p className="text-base lg:text-lg xl:text-2xl text-muted-foreground max-w-3xl mx-auto">
              See what real users are saying about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Content Creator',
                avatar: '👩‍🎨',
                quote: 'Tinar changed how I connect with my audience. The features are amazing!'
              },
              {
                name: 'Ahmed Hassan',
                role: 'Community Manager',
                avatar: '👨‍💼',
                quote: 'The community tools are incredible. Built a thriving community of 50K members!'
              },
              {
                name: 'Maria Garcia',
                role: 'Social Media Manager',
                avatar: '👩‍💻',
                quote: 'Best platform for real-time engagement. Our metrics improved 300%!'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 lg:p-8 xl:p-10 rounded-lg bg-card/40 border border-border/30 hover:border-primary/50 transition-all space-y-4 lg:space-y-5"
              >
                <div className="flex items-center gap-3 lg:gap-4 pb-4 lg:pb-5 border-b border-border/20">
                  <div className="text-3xl lg:text-4xl xl:text-5xl flex-shrink-0">{testimonial.avatar}</div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm lg:text-base xl:text-lg">{testimonial.name}</h4>
                    <p className="text-xs lg:text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 xl:py-36 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow opacity-50" />
          <div className="absolute -top-40 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow opacity-50" style={{ animationDelay: '2s' }} />
        </div>

        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center space-y-8 xl:space-y-12 relative z-10">
          <div className="space-y-4 xl:space-y-6">
            <h2 className="text-3xl lg:text-5xl xl:text-7xl font-bold tracking-tight">
              Join <span className="text-primary">Millions</span> Creating & Connecting
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Your space to be yourself starts here. Get started in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => setIsSignUp(true)}
              className="gradient-primary hover:opacity-90 transition-all duration-300 text-base lg:text-lg px-8 lg:px-10 xl:px-12 py-3 lg:py-4 xl:py-5"
            >
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsSignUp(false)}
              className="text-base lg:text-lg px-8 lg:px-10 xl:px-12 py-3 lg:py-4 xl:py-5 border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Premium */}
      <footer className="border-t border-border/30 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 xl:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10 xl:gap-12 mb-8 lg:mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4 lg:mb-5">
                <img
                  src={tinarLogo}
                  alt="Tinar"
                  className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
                />
                <span className="font-bold text-primary text-lg lg:text-xl">
                  Tinar
                </span>
              </div>
              <p className="text-sm lg:text-base text-muted-foreground">
                Your space to be you.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 lg:mb-5 text-sm lg:text-base">Product</h4>
              <ul className="space-y-2 text-sm lg:text-base text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Communities</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 lg:mb-5 text-sm lg:text-base">Company</h4>
              <ul className="space-y-2 text-sm lg:text-base text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 lg:mb-5 text-sm lg:text-base">Legal</h4>
              <ul className="space-y-2 text-sm lg:text-base text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-6 lg:pt-8 text-center text-sm lg:text-base text-muted-foreground">
            © 2026 Tinar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
